define(['app', 'paymentService', 'keenService'], function(app) {
    app.register.service('ChartCommerceService', ['PaymentService', 'keenService', function(PaymentService, keenService) {

        //local variables
        var customers, totalCustomers;


    	this.queryReports = function() {
            var queryData = {};
                            // ======================================
                // Monthly Recurring Revenue Metric
                // Monthly Recurring = Avg Revenue Per Customer * # of Customers
                // ======================================

                queryData.monthlyRecurringRevenue = new Keen.Query("sum", {
                    eventCollection: "Stripe_Events",
                    targetProperty: 'data.object.total',
                    timeframe: 'last_30_days',
                    filters: [{
                        "property_name": "data.object.subscription",
                        "operator": "exists",
                        "property_value": true
                    }, {
                        "property_name": "type",
                        "operator": "eq",
                        "property_value": "invoice.payment_succeeded"
                    }]
                });

                queryData.activeSubscriptions = new Keen.Query("count", {
                    eventCollection: "Stripe_Events",
                    timeframe: "last_30_days",
                    filters: [{
                        "property_name": "type",
                        "operator": "eq",
                        "property_value": "customer.subscription.created"
                    }, {
                        "property_name": "data.object.status",
                        "operator": "eq",
                        "property_value": "active"
                    }]
                });

                queryData.canceledSubscriptions = new Keen.Query("count", {
                    eventCollection: "Stripe_Events",
                    timeframe: "last_30_days",
                    interval: 'daily',
                    filters: [{
                        "property_name": "type",
                        "operator": "eq",
                        "property_value": "customer.subscription.deleted"
                    }]
                });

                // =========================================
                // Create Unique Paying Customers Line Chart
                // =========================================

                queryData.payingCustomersSeries = new Keen.Query('count_unique', {
                    eventCollection: 'Stripe_Events',
                    timeframe: 'last_30_days',
                    targetProperty: 'data.object.customer',
                    interval: 'daily',
                    filters: [{
                        'property_name': 'type',
                        'operator': 'eq',
                        'property_value': 'invoice.payment_succeeded'
                    }, {
                        'property_name': 'data.object.total',
                        'operator': 'gt',
                        'property_value': 0
                    }]
                });

                // ======================================
                // Fees Metric
                // ======================================

                queryData.feesThisMonth = new Keen.Query("sum", {
                    eventCollection: "Stripe_Events",
                    targetProperty: "data.object.fee",
                    timeframe: 'last_30_days',
                });

                queryData.feesPreviousMonth = new Keen.Query("sum", {
                    eventCollection: "Stripe_Events",
                    targetProperty: "data.object.fee",
                    timeframe: 'previous_30_days',
                });

                // ======================================
            // Net Revenue Metric
            // Net revenue = gross revenue – damages/coupons/returns
            // ======================================

            queryData.netRevenueThisMonth = new Keen.Query("sum", {
                eventCollection: "Stripe_Events",
                targetProperty: 'data.object.amount',
                timeframe: 'last_30_days',
                filters: [{
                    'property_name': 'type',
                    'operator': 'eq',
                    'property_value': 'charge.succeeded'
                }]
            });

            queryData.netRevenuePreviousMonth = new Keen.Query("sum", {
                eventCollection: "Stripe_Events",
                targetProperty: 'data.object.amount',
                timeframe: 'previous_month',
                filters: [{
                    'property_name': 'type',
                    'operator': 'eq',
                    'property_value': 'charge.succeeded'
                }]
            });

            return queryData;
        };

        this.runReports = function(fn) {
            var self = this;

            var reportData = {};

            PaymentService.getCustomers(function(data) {
                customers = data;

                // ======================================
                // Total Customer Metric
                // ======================================

                totalCustomers = data.length;

                keenService.keenClient(function(client) {
                    var queryData = self.queryReports();

                    client.run([
                    	queryData.monthlyRecurringRevenue,
                    	queryData.activeSubscriptions,
                    	queryData.canceledSubscriptions,
                    	queryData.payingCustomersSeries,
                        queryData.feesThisMonth,
                        queryData.feesPreviousMonth,
                        queryData.netRevenueThisMonth,
                        queryData.netRevenuePreviousMonth
                    ], function(response) {
                        var totalRevenue = this.data[0].result;
                        var numOfCustomers = totalCustomers;
                        var avgRevenue = totalRevenue / numOfCustomers;
                        var result = avgRevenue * numOfCustomers;
                        var monthlyRecurringRevenue = result / 100;

                        // ======================================
                        // Average Revenue Per Customer Metric
                        // ======================================

                        var avgRevenue = avgRevenue;

                        // ======================================
                        // Annual Run Rate Metric
                        // MRR * 12
                        // ======================================

                        var annualRunRate = monthlyRecurringRevenue * 12;

                        // ======================================
                        // Average monthly Recurring Revenue Per User (ARPU)
                        // ARPU = MRR / Active Subscriptions.
                        // ======================================

                        var activeSubscriptions = this.data[1].result;

                        var arpu = monthlyRecurringRevenue / activeSubscriptions;

                        // ======================================
                        // User Churn
                        // Churn = canceled subscriptions / (canceled subscriptions + active subscriptions)
                        // ======================================

                        var cancelSubscriptionData = [];
                        var totalCanceledSubscriptions = 0;
                        for (var i = 0; i < this.data[2].result.length; i++) {
                            cancelSubscriptionData.push(this.data[2].result[i].value);
                            totalCanceledSubscriptions += parseInt(this.data[2].result[i].value);
                        };
                        var cancelStart = this.data[2].result[0].timeframe.start;
                        //TODO: get average of monthly subscription price instead of $97
                        var potentialMRRLoss = cancelSubscriptionData.length * 97;

                        var userChurnCalc = this.data[2].result / (this.data[2].result + this.data[1].result) * 100;
                        var userChurn = userChurnCalc.toFixed(1) * -1;

                        // ======================================
                        // Lifetime Value (LTV)
                        // LTV =  ARPU / Churn
                        // ======================================
                        var lifetimeValue = arpu / userChurn;


                        var totalCustomerData = [];
                        var totalPayingCustomers = 0;
                        for (var i = 0; i < this.data[3].result.length; i++) {
                            totalCustomerData.push(this.data[3].result[i].value);
                            totalPayingCustomers += this.data[3].result[i].value;
                        };

                        var customerStart = this.data[3].result[0].timeframe.start;

                        var totalFees = this.data[4].result / 100;
                        var totalFeesPrevious = this.data[5].result / 100;
                        var result = ((totalFees - totalFeesPrevious) / totalFees) * 100;
                        var format = Math.round(result * 100) / 100;
                        if (format == 0) {
                            format = null
                        }
                        var totalFeesPercent = format;

                        var netRevenue = this.data[6].result;
                        var totalRevenuePrevious = this.data[7].result;
                        var result = ((netRevenue - totalRevenuePrevious) / netRevenue) * 100;
                        var totalRevenuePercent = Math.round(result * 100) / 100;
                        //TODO: Subtract damages/coupons/returns

                        //put all data is reportData
                        reportData.monthlyRecurringRevenue = monthlyRecurringRevenue;
                        reportData.avgRevenue = avgRevenue;
                        reportData.annualRunRate = annualRunRate;
                        reportData.arpu = arpu;
                        reportData.totalCanceledSubscriptions = totalCanceledSubscriptions;
                        reportData.cancelSubscriptionData = cancelSubscriptionData;
                        reportData.cancelStart = cancelStart;
                        reportData.potentialMRRLoss = potentialMRRLoss;
                        reportData.userChurn = userChurn;
                        reportData.lifetimeValue = lifetimeValue;
                        reportData.totalRevenue = totalRevenue / 100;
                        reportData.totalFees = totalFees;
                        reportData.totalFeesPrevious = totalFeesPrevious;
                        reportData.totalFeesPercent = totalFeesPercent;
                        reportData.netRevenue = netRevenue / 100;
                        reportData.totalRevenuePrevious = totalRevenuePrevious / 100;
                        reportData.totalRevenuePercent = totalRevenuePercent;
                        reportData.totalCustomerData = totalCustomerData;
                        reportData.customerStart = customerStart;

                        fn(reportData);

                    });
                });
            }); //end PaymentService.getCustomers

            // // ======================================
            // // Other Revenue Metric
            // // ======================================

            // var otherRevenue = new Keen.Query("sum", {
            //     eventCollection: "Stripe_Events",
            //     targetProperty: 'data.object.total',
            //     timeframe: 'this_day',
            //     filters: [{
            //         "property_name": "data.object.subscription",
            //         "operator": "exists",
            //         "property_value": false
            //     }, {
            //         "property_name": "type",
            //         "operator": "eq",
            //         "property_value": "invoice.payment_succeeded"
            //     }]
            // });
            // client.run(otherRevenue, function(response) {
            //     $scope.totalRevenue = this.data.result;
            // });

            // // ======================================
            // // Upgrades Metric
            // // ======================================

            // var otherRevenueQuery = new Keen.Query("extraction", {
            //     eventCollection: "Stripe_Events",
            //     timeframe: 'this_day',
            //     filters: [{
            //         "property_name": "type",
            //         "operator": "eq",
            //         "property_value": "customer.subscription.updated"
            //     }, {
            //         "property_name": "data.object.customer",
            //         "operator": "eq",
            //         "property_value": "cus_5Fcng8oztqf8aD"
            //     }]
            // });
            // client.run(otherRevenueQuery, function(response) {

            //     var updatedSubscriptions = [];

            //     var result = this.data.result;

            //     console.log('result >>> ', result);

            //     for (var x in result) {
            //         //result[x].data.previous_attributes.plan.amount >= 
            //         if (result[x].data.object.plan.amount) {
            //             updatedSubscriptions.push(result[x]);
            //         }
            //     }

            //     var result = updatedSubscriptions.length;

            //     var data = {
            //         result: result
            //     };

            //     window.chart = new Keen.Visualization(data, document.getElementById('upgrades'), {
            //         chartType: "metric",
            //         title: "Upgrades",
            //         width: 345,
            //         colors: ["#49c5b1"]
            //     });
            // });

            fn(reportData);
        };

        this.customerOverview = function(totalCustomerData, customerStart, cancelSubscriptionData, cancelstart, fn) {
        	var customerOverviewConfig = {
                options: {
                    chart: {
                        height: 250,
                        spacing: [25, 25, 25, 25]
                    },
                    colors: ['#41b0c7', '#fcb252', '#309cb2', '#f8cc49'],
                    title: {
                        text: ''
                    },
                    tooltip: {
                        pointFormat: '<b>{point.y}</b>'
                    },
                    exporting: {
                        enabled: false
                    }
                },
                xAxis: {
                    type: 'datetime',
                    labels: {
                        format: "{value:%b %d}"
                    },
                    minRange: 30 * 24 * 3600000 // fourteen days
                },
                yAxis: {
                    min: 0,
                    max: Math.max.apply(Math, totalCustomerData) + 100,
                    title: {
                        text: ''
                    }
                },
                series: [{
                    type: 'area',
                    name: 'Customers',
                    pointInterval: 24 * 3600 * 1000,
                    pointStart: Date.parse(customerStart),
                    data: totalCustomerData
                }, {
                    type: 'area',
                    name: 'Cancellations',
                    pointInterval: 24 * 3600 * 1000,
                    pointStart: Date.parse(cancelstart),
                    data: cancelSubscriptionData
                }],
                credits: {
                    enabled: false
                }
            };

            fn(customerOverviewConfig);
        };
    }]);
});
