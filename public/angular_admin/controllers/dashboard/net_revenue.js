define(['app', 'ngProgress', 'formatCurrency', 'highcharts', 'highcharts-ng'], function(app) {
    app.register.controller('NetRevenueCtrl', ['$scope', 'ngProgress', 'ENV', function($scope, ngProgress, ENV) {
        ngProgress.start();
        $scope.$back = function() { window.history.back(); };

        $scope.calculatePercentage = function (oldval, newval) {
            oldval = parseInt(oldval);
            newval = parseInt(newval);
            var result = ((oldval - newval) / oldval) * 100;
            if (parseInt(newval) < parseInt(oldval)) {
                result = result * -1;
            }
            return Math.round(result * 100) / 100;
        };

        Keen.ready(function() {

            var client = new Keen({
                projectId: ENV.keenProjectId, // String (required)
                writeKey: ENV.keenWriteKey, // String (required for sending data)
                readKey: ENV.keenReadKey, // String (required for querying data)
                protocol: "https", // String (optional: https | http | auto)
                host: "api.keen.io/3.0", // String (optional)
                requestType: "jsonp" // String (optional: jsonp, xhr, beacon)
            });

            // ======================================
            // Net Revenue Metric
            // Net revenue = gross revenue – damages/coupons/returns
            // ======================================

            var netRevenueThisMonth = new Keen.Query("sum", {
                eventCollection: "Stripe_Events",
                targetProperty: 'data.object.amount',
                timeframe: 'last_30_days',
                filters: [{
                    'property_name':'type',
                    'operator':'eq',
                    'property_value':'charge.succeeded'
                }]
            });

            var netRevenueDayPreviousMonth = new Keen.Query("sum", {
                eventCollection: "Stripe_Events",
                targetProperty: 'data.object.amount',
                timeframe: 'previous_month',
                filters: [{
                    'property_name':'type',
                    'operator':'eq',
                    'property_value':'charge.succeeded'
                }]
            });

            var netRevenueLastSixty = new Keen.Query("sum", {
                eventCollection: "Stripe_Events",
                targetProperty: 'data.object.amount',
                timeframe: 'previous_60_days',
                filters: [{
                    'property_name':'type',
                    'operator':'eq',
                    'property_value':'charge.succeeded'
                }]
            });

            var netRevenuePreviousSixty = new Keen.Query("sum", {
                eventCollection: "Stripe_Events",
                targetProperty: 'data.object.amount',
                timeframe: 'previous_60_days',
                filters: [{
                    'property_name':'type',
                    'operator':'eq',
                    'property_value':'charge.succeeded'
                }]
            });

            var netRevenueLastNinety = new Keen.Query("sum", {
                eventCollection: "Stripe_Events",
                targetProperty: 'data.object.amount',
                timeframe: 'last_90_days',
                filters: [{
                    'property_name':'type',
                    'operator':'eq',
                    'property_value':'charge.succeeded'
                }]
            });

            var netRevenuePreviousNinety = new Keen.Query("sum", {
                eventCollection: "Stripe_Events",
                targetProperty: 'data.object.amount',
                timeframe: 'previous_90_days',
                filters: [{
                    'property_name':'type',
                    'operator':'eq',
                    'property_value':'charge.succeeded'
                }]
            });

            var netRevenueLastYear = new Keen.Query("sum", {
                eventCollection: "Stripe_Events",
                targetProperty: 'data.object.amount',
                timeframe: 'last_1_years',
                filters: [{
                    'property_name':'type',
                    'operator':'eq',
                    'property_value':'charge.succeeded'
                }]
            });

            var netRevenuePreviousYear = new Keen.Query("sum", {
                eventCollection: "Stripe_Events",
                targetProperty: 'data.object.amount',
                timeframe: 'previous_1_years',
                filters: [{
                    'property_name':'type',
                    'operator':'eq',
                    'property_value':'charge.succeeded'
                }]
            });

            client.run([ netRevenueThisMonth, netRevenueDayPreviousMonth, netRevenueLastSixty, netRevenuePreviousSixty, netRevenueLastNinety, netRevenuePreviousNinety, netRevenueLastYear, netRevenuePreviousYear ], function(response) {
                ngProgress.complete();
                $scope.thisMonth = this.data[0].result / 100;
                $scope.previousMonth = this.data[1].result / 100;
                $scope.thirtyDayGrowth = $scope.calculatePercentage($scope.thisMonth, $scope.previousMonth);

                $scope.lastSixty = this.data[2].result / 100;
                $scope.previousSixty = this.data[3].result / 100;
                $scope.sixtyDayGrowth = $scope.calculatePercentage($scope.lastSixty, $scope.previousSixty);

                $scope.lastNinety = this.data[4].result / 100;
                $scope.previousNinety = this.data[5].result / 100;
                $scope.ninetyDayGrowth = $scope.calculatePercentage($scope.lastNinety, $scope.previousNinety);

                $scope.lastYear = this.data[6].result / 100;
                $scope.previousYear = this.data[7].result / 100;
                $scope.yearlyGrowth = $scope.calculatePercentage($scope.lastYear, $scope.previousYear);
            });

            // ======================================
            // Create Revenue Over Time Line Chart
            // ======================================

            var revSeries = new Keen.Query('sum', {
                eventCollection: 'Stripe_Events',
                timeframe: 'previous_30_days',
                targetProperty: 'data.object.amount',
                interval: 'daily',
                filters: [{
                    'property_name':'type',
                    'operator':'eq',
                    'property_value':'charge.succeeded'
                }]
            });

            var resultsInDollars = {};

            client.run(revSeries, function(response){
                var result = this.data.result;
                var lineData = [];
                var startDate;
                $.each(result, function(index, object){
                    result[index].value = object.value/100;
                    lineData.push(result[index].value);
                });

                resultsInDollars = {
                    result: result
                };

                $scope.totalRevenueConfig = {
                    options: {
                        title: {
                            text: '',
                        },
                        subtitle: {
                            text: ''
                        },
                        tooltip: {
                            headerFormat: '<b>{point.x:%b %d}</b><br>',
                            pointFormat: '<b class="text-center">${point.y}</b>',
                        },
                        legend: {
                            enabled: false
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
                        max: Math.max.apply(Math, lineData) + 100,
                        title: {
                            text: ''
                        }
                    },
                    series: [{
                        type: 'area',
                        name: 'Revenue',
                        pointInterval: 24 * 3600 * 1000,
                        pointStart: Date.parse(result[0].timeframe.start),
                        data: lineData
                    }],
                    credits: {
                        enabled: false
                    }
                };
            });

            var revenueByPlans = new Keen.Query("sum", {
                eventCollection: "Stripe_Events",
                targetProperty: "data.object.amount",
                groupBy: "data.object.subscription.plan.name",
                timeframe: 'this_year'
            });

            var customerByPlans = new Keen.Query("count_unique", {
                eventCollection: "Stripe_Events",
                targetProperty: "data.object.subscription.customer",
                groupBy: "data.object.subscription.plan.name",
                timeframe: 'this_year'
            });

            client.run([revenueByPlans, customerByPlans], function(response){
                for (var i = 0; i < this.data[0].result.length; i++) {
                    this.data[0].result[i]['customers'] = this.data[1].result[i].result;
                };
                $scope.planRevenue = this.data[0].result;
                //$scope.planRevenue = this.data[1].result;
            });


        });

    }]);
});
