define(['app', 'ngProgress', 'formatCurrency', 'highcharts', 'highcharts-ng'], function(app) {
    app.register.controller('NetRevenueCtrl', ['$scope', 'ngProgress', function($scope, ngProgress) {
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
                projectId: "54528c1380a7bd6a92e17d29", // String (required)
                writeKey: "c36124b0ccbbfd0a5e50e6d8c7e80a870472af9bf6e74bd11685d30323096486a19961ebf98d57ee642d4b83e33bd3929c77540fa479f46e68a0cdd0ab57747a96bff23c4d558b3424ea58019066869fd98d04b2df4c8de473d0eb66cc6164f03530f8ab7459be65d3bf2e8e8a21c34a", // String (required for sending data)
                readKey: "bc102d9d256d3110db7ccc89a2c7efeb6ac37f1ff07b0a1f421516162522a972443b3b58ff6120ea6bd4d9dd469acc83b1a7d8a51cbb82caa89e590492e0579c8b7c65853ec1c6d6ce6f76535480f8c2f17fcb66dca14e699486efb02b83084744c68859b89f71f37ad846f7088ff96b", // String (required for querying data)
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
