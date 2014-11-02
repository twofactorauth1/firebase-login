define(['app', 'ngProgress', 'd3', 'paymentService'], function(app) {
    app.register.controller('DashboardCtrl', ['$scope', '$window', 'ngProgress', 'PaymentService', function($scope, $window, ngProgress, PaymentService) {
        ngProgress.start();

        var d3 = window.d3;

        $scope.activeTab = 'analytics';

        var client = new Keen({
            projectId: "54528c1380a7bd6a92e17d29", // String (required)
            writeKey: "c36124b0ccbbfd0a5e50e6d8c7e80a870472af9bf6e74bd11685d30323096486a19961ebf98d57ee642d4b83e33bd3929c77540fa479f46e68a0cdd0ab57747a96bff23c4d558b3424ea58019066869fd98d04b2df4c8de473d0eb66cc6164f03530f8ab7459be65d3bf2e8e8a21c34a", // String (required for sending data)
            readKey: "bc102d9d256d3110db7ccc89a2c7efeb6ac37f1ff07b0a1f421516162522a972443b3b58ff6120ea6bd4d9dd469acc83b1a7d8a51cbb82caa89e590492e0579c8b7c65853ec1c6d6ce6f76535480f8c2f17fcb66dca14e699486efb02b83084744c68859b89f71f37ad846f7088ff96b", // String (required for querying data)
            protocol: "https", // String (optional: https | http | auto)
            host: "api.keen.io/3.0", // String (optional)
            requestType: "jsonp" // String (optional: jsonp, xhr, beacon)
        });

        PaymentService.getCustomers(function(data) {
            $scope.customers = data;

        gapi.analytics.ready(function() {

                    gapi.analytics.auth.authorize({
                        container: 'embed-api-auth-container',
                        clientid: '1026246177215-tqpcc51fjk3vm0mgjef2jg7jagcmtuba.apps.googleusercontent.com',
                    });

            Keen.ready(function() {



                // ----------------------------------------
                // Pageviews Metric
                // ----------------------------------------

                var count = new Keen.Query("count", {
                    eventCollection: "pageviews"
                });
                client.draw(count, document.getElementById("pageviews"), {
                    chartType: "metric",
                    title: "Page Views",
                    width: 345,
                    colors: ["#49c5b1"]
                });

                // ----------------------------------------
                // Average Visit Duration
                // ----------------------------------------

                // var averageDurationQuery = new Keen.Query("average", {
                //     eventCollection: "sessions",
                //     targetProperty: "session.session_length"
                // });
                // client.run(averageDurationQuery, function(response) {
                //     var minutes = Math.floor(this.data.result / 60000);
                //     var seconds = ((this.data.result % 60000) / 1000).toFixed(0);
                //     var durationTime = minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
                //     $scope.visitDuration = durationTime
                // });

                // ----------------------------------------
                // Top Pageviews
                // ----------------------------------------

                var pageNavCount = new Keen.Query('count', {
                    eventCollection: 'pageviews',
                    groupBy: 'page.href',
                    filters: [{
                        'property_name': 'page.href',
                        'operator': 'contains',
                        'property_value': 'main.test.indigenous.io'
                    }]
                });

                client.run(pageNavCount, function(response) {

                    new Keen.Visualization(this.data, document.getElementById('top-visited-pages'), {
                        chartType: 'table',
                        title: ' ',
                        height: 300,
                        width: 'auto'
                    });
                });

                // ----------------------------------------
                // Device
                // ----------------------------------------

                var visitorLocations = new Keen.Query("count", {
                    eventCollection: "pageviews",
                    groupBy: "visitor.tech.os.family"
                });

                client.run(visitorLocations, function(response) {
                    new Keen.Visualization(this.data, document.getElementById('device'), {
                        chartType: 'columnchart',
                        height: 300,
                        width: 'auto',
                        chartOptions: {
                            legend: {
                                position: "none"
                            }
                        }
                    });
                });

                // ======================================
                // Monthly Recurring Revenue Metric
                // Monthly Recurring = Avg Revenue Per Customer * # of Customers
                // ======================================

                var monthlyRecurringRevenue = new Keen.Query("sum", {
                    eventCollection: "Stripe_Events",
                    targetProperty: 'data.object.total',
                    timeframe: 'this_day',
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
                client.run(monthlyRecurringRevenue, function(response) {
                    var totalRevenue = this.data.result;
                    var numOfCustomers = $scope.customers.length;
                    var avgRevenue = totalRevenue / numOfCustomers;
                    var result = avgRevenue * numOfCustomers;

                    var data = {
                        result: result
                    };

                    window.chart = new Keen.Visualization(data, document.getElementById('monthly-recurring-revenue'), {
                        chartType: "metric",
                        title: "Monthly Recurring Revenue",
                        width: 345,
                        colors: ["#49c5b1"],
                        chartOptions: {
                            prefix: '$'
                        }
                    });
                });

                // ======================================
                // Average Revenue Per Customer Metric
                // ======================================

                client.run(monthlyRecurringRevenue, function(response) {
                    var totalRevenue = this.data.result;
                    var numOfCustomers = $scope.customers.length;
                    var avgRevenue = totalRevenue / numOfCustomers;
                    var result = avgRevenue;

                    var data = {
                        result: result
                    };

                    window.chart = new Keen.Visualization(data, document.getElementById('average-revenue-per-customer'), {
                        chartType: "metric",
                        title: "Average Revenue Per Customer",
                        width: 345,
                        colors: ["#49c5b1"],
                        chartOptions: {
                            prefix: '$'
                        }
                    });
                });

                // ======================================
                // Average Revenue Per Customer Metric
                // ======================================

                var numOfCustomers = $scope.customers.length;
                var result = numOfCustomers;

                var data = {
                    result: result
                };

                window.chart = new Keen.Visualization(data, document.getElementById('total-customer'), {
                    chartType: "metric",
                    title: "Customers",
                    width: 345,
                    colors: ["#49c5b1"]
                });

                // ======================================
                // Fees Metric
                // ======================================

                var feesQuery = new Keen.Query("sum", {
                    eventCollection: "Stripe_Events",
                    targetProperty: "data.object.fee"
                });
                client.run(feesQuery, function(response) {
                    var totalFees = this.data.result;
                    var result = totalFees;

                    var data = {
                        result: result
                    };

                    window.chart = new Keen.Visualization(data, document.getElementById('fees'), {
                        chartType: "metric",
                        title: "Fees",
                        width: 345,
                        colors: ["#49c5b1"],
                        chartOptions: {
                            prefix: '$'
                        }
                    });
                });

                // ======================================
                // Net Revenue Metric
                // Net revenue = gross revenue – damages/coupons/returns
                // ======================================

                var netRevenueQuery = new Keen.Query("sum", {
                    eventCollection: "Stripe_Events",
                    targetProperty: 'data.object.amount',
                    timeframe: 'this_day'
                });
                client.run([netRevenueQuery, feesQuery], function(response) {
                    var totalRevenue = this.data[0].result;
                    var totalFees = this.data[1].result;
                    //TODO: Subtract damages/coupons/returns
                    var result = totalRevenue - totalFees;

                    var data = {
                        result: result
                    };

                    window.chart = new Keen.Visualization(data, document.getElementById('net-revenue'), {
                        chartType: "metric",
                        title: "Net Revenue",
                        width: 345,
                        colors: ["#49c5b1"],
                        chartOptions: {
                            prefix: '$'
                        }
                    });
                });

                // ======================================
                // Other Revenue Metric
                // ======================================

                var otherRevenue = new Keen.Query("sum", {
                    eventCollection: "Stripe_Events",
                    targetProperty: 'data.object.total',
                    timeframe: 'this_day',
                    filters: [{
                        "property_name": "data.object.subscription",
                        "operator": "exists",
                        "property_value": false
                    }, {
                        "property_name": "type",
                        "operator": "eq",
                        "property_value": "invoice.payment_succeeded"
                    }]
                });
                client.run(otherRevenue, function(response) {
                    var totalRevenue = this.data.result;
                    var result = totalRevenue;

                    var data = {
                        result: result
                    };

                    window.chart = new Keen.Visualization(data, document.getElementById('other-revenue'), {
                        chartType: "metric",
                        title: "Other Revenue",
                        width: 345,
                        colors: ["#49c5b1"],
                        chartOptions: {
                            prefix: '$'
                        }
                    });
                });

                // ======================================
                // Upgrades Metric
                // ======================================

                var otherRevenueQuery = new Keen.Query("extraction", {
                    eventCollection: "Stripe_Events",
                    timeframe: 'this_day',
                    filters: [{
                        "property_name": "type",
                        "operator": "eq",
                        "property_value": "customer.subscription.updated"
                    }]
                });
                client.run(otherRevenueQuery, function(response) {

                    var updatedSubscriptions = [];

                    var result = this.data.result;

                    for (var x in result) {
                        if (result[x].data.previous_attributes.plan.amount >= result[x].data.object.plan.amount) {
                            updatedSubscriptions.push(result[x]);
                        }
                    }

                    var result = updatedSubscriptions.length;

                    var data = {
                        result: result
                    };

                    window.chart = new Keen.Visualization(data, document.getElementById('upgrades'), {
                        chartType: "metric",
                        title: "Upgrades",
                        width: 345,
                        colors: ["#49c5b1"]
                    });
                });

                    // var dataChart = new gapi.analytics.googleCharts.DataChart({
                    //     query: {
                    //         ids: 'ga:82461709',
                    //         metrics: 'ga:pageviews',
                    //         dimensions: 'ga:date',
                    //         'start-date': '30daysAgo',
                    //         'end-date': 'yesterday'
                    //     },
                    //     chart: {
                    //         container: 'chart-container',
                    //         type: 'LINE',
                    //         options: {
                    //             width: '100%'
                    //         }
                    //     }
                    // });

                    // dataChart.execute();

                    var report = new gapi.analytics.report.Data({
                        query: {
                            ids: 'ga:82461709',
                            metrics: 'ga:sessionDuration',
                            dimensions: 'ga:date',
                            'start-date': '30daysAgo',
                            'end-date': 'yesterday'
                        }
                    });

                    report.on('success', function(response) {
                        var totalDuration = response.totalsForAllResults['ga:sessionDuration'];
                        var totalResults = response.totalResults;
                        var averageDuration = parseInt(totalDuration) / parseInt(totalResults);
                        var minutes = Math.floor(averageDuration / 60000);
                        var seconds = ((averageDuration % 60000) / 1000).toFixed(0);
                        var durationTime = minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
                        $scope.visitDuration = durationTime;
                    });

                    report.execute();

                    var trafficSources = new gapi.analytics.report.Data({
                        query: {
                            ids: 'ga:82461709',
                            metrics: 'ga:sessions',
                            dimensions: 'ga:trafficType'
                        }
                    });

                    trafficSources.on('success', function(response) {
                        for (var i = 0; i < response.rows.length; i++) {
                          response.rows[i][1] = parseInt(response.rows[i][1]);
                        };
                        console.log('response >>> ', JSON.stringify(response.rows));
                        var data = google.visualization.arrayToDataTable([['Task', 'Hours per Day'], ["direct",44],["organic",5],["referral",51]] );

                        var options = {
                          title: 'My Daily Activities',
                          pieHole: 0.4,
                        };

                        var chart = new google.visualization.PieChart(document.getElementById('traffic-sources'));
                        chart.draw(data, options);
                    });

                    trafficSources.execute();

                    // ======================================
                    // New vs. Returning Customers
                    // ======================================

                        var newVsReturningChart = new gapi.analytics.googleCharts.DataChart({
                          query: {
                            metrics: 'ga:sessions',
                            dimensions: 'ga:userType',
                            'start-date': '30daysAgo',
                            'end-date': 'yesterday'
                          },
                          chart: {
                            container: 'new-vs-returning',
                            type: 'BAR',
                            options: {
                              width: '100%'
                            }
                          }
                        });

                        newVsReturningChart.execute();










                // ======================================
                // Total Revenue Metric
                // ======================================

                // var totalRevenue = new Keen.Query("count", {
                //     eventCollection: "Stripe_Events",
                //     targetProperty: 'data.object.amount'
                // });
                // client.run(totalRevenue, function(response){
                //     var result = this.data.result;
                //     $.each(result, function(index, object){
                //         result[index].value = object.value/100;
                //     });

                //     resultsInDollars = {
                //         result: result
                //     };

                //     window.chart = new Keen.Visualization(resultsInDollars, document.getElementById('total-revenue'), {
                //       chartType: "metric",
                //       title: "Total Revenue",
                //       width: 345,
                //       colors: ["#49c5b1"],
                //       chartOptions: {
                //           prefix: '$'
                //       }
                //     });
                // });

                // ======================================
                // Total Customer Metric
                // ======================================

                // ======================================
                // Create Revenue Over Time Line Chart
                // ======================================

                // var revSeries = new Keen.Query('sum', {
                //     eventCollection: 'Stripe_Events',
                //     timeframe: 'last_6_months',
                //     targetProperty: 'data.object.amount',
                //     interval: 'monthly',
                //     filters: [{
                //         'property_name':'type',
                //         'operator':'eq',
                //         'property_value':'charge.succeeded'
                //     }]
                // });

                // var resultsInDollars = {};

                // client.run(revSeries, function(response){
                //     var result = this.data.result;
                //     $.each(result, function(index, object){
                //         result[index].value = object.value/100;
                //     });

                //     resultsInDollars = {
                //         result: result
                //     };

                //     window.chart = new Keen.Visualization(resultsInDollars, document.getElementById('revenue'), {
                //         chartType: 'areachart',
                //         title: 'Revenue Over Time',
                //         height: 500,
                //         width: 'auto',
                //         chartOptions: {
                //             legend: { position: "none" },
                //             hAxis: { slantedText: true, slantedTextAngle: 45},
                //         }
                //     });
                // });

                // =========================================
                // Create Unique Paying Customers Line Chart
                // =========================================

                // var payingCustomersSeries = new Keen.Query('count_unique', {
                //     eventCollection: 'Stripe_Events',
                //     timeframe: 'last_6_months',
                //     targetProperty: 'data.object.customer',
                //     interval: 'monthly',
                //     filters: [{
                //         'property_name':'type',
                //         'operator':'eq',
                //         'property_value':'invoice.payment_succeeded'
                //     },
                //     {
                //         'property_name':'data.object.total',
                //         'operator':'gt',
                //         'property_value': 0
                //     }]
                // });
                // client.draw(payingCustomersSeries, document.getElementById('unique-customers'), {
                //     chartType: 'areachart',
                //     title: 'Total Unique Paying Customers',
                //     height: 500,
                //     width: 'auto',
                //     chartOptions: {
                //         legend: { position: "none" },
                //         hAxis: { slantedText: true, slantedTextAngle: 45},
                //     }
                // });

                // ========================================================
                // Create Line Chart of New Customers Paying for First Time
                // ========================================================

                // var timeframe = 'last_6_months';

                // var countNewPayingCustomers = new Keen.Query('count', {
                //     eventCollection: 'Stripe_Events',
                //     timeframe: timeframe,
                //     interval: 'monthly',
                //     filters: [{
                //         'property_name':'type',
                //         'operator':'eq',
                //         'property_value':'customer.subscription.updated'
                //     },
                //     {
                //         'property_name':'data.object.plan.amount',
                //         'operator':'gt',
                //         'property_value': 0
                //     },
                //     {
                //         'property_name':'data.previous_attributes.plan.amount',
                //         'operator':'eq',
                //         'property_value': 0
                //     }]
                // });

                // client.draw(countNewPayingCustomers, document.getElementById('new-customers'), {
                //     chartType: 'areachart',
                //     title: 'Count of New Customers Paying for the First Time (' + timeframe + ')',
                //     height: 500,
                //     width: 'auto',
                //     chartOptions: {
                //         legend: { position: "none" },
                //         hAxis: { slantedText: true, slantedTextAngle: 45},
                //     }
                // });

                // =============================
                // Upsell Minus Churn Line Chart
                // =============================

                // var interval = "monthly";
                // var timeframe = "last_6_months";

                // var upSellSeriesStarting = new Keen.Query("sum", {
                //     eventCollection: "Stripe_Events",
                //     timeframe: timeframe,
                //     targetProperty: "data.previous_attributes.plan.amount",
                //     interval: interval,
                //     filters: [{
                //         "property_name":"type",
                //         "operator":"eq",
                //         "property_value":"customer.subscription.updated"
                //     },
                //     {
                //         "property_name":"data.object.plan.amount",
                //         "operator":"gt",
                //         "property_value": 0
                //     },
                //     {
                //         "property_name":"data.previous_attributes.plan.amount",
                //         "operator":"gt",
                //         "property_value": 0
                //     }]
                // });

                // var upSellSeriesFinal = new Keen.Query("sum", {
                //     eventCollection: "Stripe_Events",
                //     timeframe: timeframe,
                //     targetProperty: "data.object.plan.amount",
                //     interval: interval,
                //     filters: [{
                //         "property_name":"type",
                //         "operator":"eq",
                //         "property_value":"customer.subscription.updated"
                //     },
                //     {
                //         "property_name":"data.previous_attributes.plan.amount",
                //         "operator":"gt",
                //         "property_value": 0
                //     }]
                // });

                // client.run([upSellSeriesStarting, upSellSeriesFinal], function (response) {
                //     var i = 0;
                //     var combinedResult = [];
                //     while (i < this.data[0].result.length) {
                //         combinedResult[i] = {
                //             timeframe: this.data[0].result[i].timeframe,
                //             value: this.data[1].result[i].value/100 - this.data[0].result[i].value/100
                //         };
                //         i++;
                //     }

                //     window.chart = new Keen.Visualization({result: combinedResult}, document.getElementById('upsell-minus-churn'), {
                //         chartType: 'areachart',
                //         title: 'Upsell Minus Churn',
                //         chartOptions: {
                //             legend: { position: "none" },
                //             hAxis: { slantedText: true, slantedTextAngle: 45},
                //         }
                //     });
                // });
            });

           });

        }); //end PaymentService.getCustomers

    }]);
});
