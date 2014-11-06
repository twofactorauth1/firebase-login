define(['app', 'ngProgress', 'paymentService', 'highcharts', 'highcharts-ng', 'formatCurrency', 'googleLogin'], function(app) {
    app.register.controller('DashboardCtrl', ['$scope', '$window', 'ngProgress', 'PaymentService', 'googleLogin', function($scope, $window, ngProgress, PaymentService, googleLogin) {
        ngProgress.start();

        $scope.activeTab = 'ecommerce';

        var client = new Keen({
            projectId: "54528c1380a7bd6a92e17d29",
            writeKey: "c36124b0ccbbfd0a5e50e6d8c7e80a870472af9bf6e74bd11685d30323096486a19961ebf98d57ee642d4b83e33bd3929c77540fa479f46e68a0cdd0ab57747a96bff23c4d558b3424ea58019066869fd98d04b2df4c8de473d0eb66cc6164f03530f8ab7459be65d3bf2e8e8a21c34a",
            readKey: "bc102d9d256d3110db7ccc89a2c7efeb6ac37f1ff07b0a1f421516162522a972443b3b58ff6120ea6bd4d9dd469acc83b1a7d8a51cbb82caa89e590492e0579c8b7c65853ec1c6d6ce6f76535480f8c2f17fcb66dca14e699486efb02b83084744c68859b89f71f37ad846f7088ff96b",
            protocol: "https",
            host: "api.keen.io/3.0",
            requestType: "jsonp"
        });

        Keen.ready(function() {

            var promise = googleLogin.handleClientLoad();
            promise.then(function(data) {
                console.log('auth data >>> ', data);
                ngProgress.complete();

                $scope.secToTime = function(duration) {
                    var minutes = parseInt(Math.floor(duration / 60));
                    var seconds = parseInt(duration - minutes * 60);

                    minutes = (minutes < 10) ? "0" + minutes : minutes;
                    seconds = (seconds < 10) ? "0" + seconds : seconds;

                    return minutes + ":" + seconds;
                };

                $scope.calculatePercentage = function(oldval, newval) {
                    oldval = parseInt(oldval);
                    newval = parseInt(newval);
                    var result = ((oldval - newval) / oldval) * 100;
                    if (parseInt(newval) < parseInt(oldval)) {
                        result = result * -1;
                    }
                    return Math.round(result * 100) / 100;
                };


                $scope.query = function(params) {
                    return new Promise(function(resolve, reject) {
                        gapi.client.analytics.data.ga.get(params).execute(function(data) {
                            resolve(data);
                        });
                    });
                };


                // ======================================
                // Visitor Location Popularity
                // ======================================

                var visitorLocations = $scope.query({
                    ids: 'ga:82461709',
                    metrics: 'ga:users',
                    dimensions: 'ga:region',
                    'start-date': '30daysAgo',
                    'end-date': 'yesterday'
                });

                Promise.all([visitorLocations]).then(function(results) {
                    var response = results[0];
                    var data = [
                        ['Country', 'Popularity']
                    ];
                    var subData = [];
                    for (var i = 0; i < response.rows.length; i++) {
                        subData.push(response.rows[i][0], parseInt(response.rows[i][1]));
                        data.push(subData);
                        subData = [];
                    };
                    var data = google.visualization.arrayToDataTable(data);

                    var options = {
                        region: 'US',
                        colorAxis: {
                            minValue: 0,
                            colors: ['#5ccae0', '#3c92a4']
                        },
                        resolution: "provinces",
                        width: '100%'
                    };

                    var chart = new google.visualization.GeoChart(document.getElementById('location'));

                    chart.draw(data, options);
                });

                // ----------------------------------------
                // Device
                // ----------------------------------------

                var deviceReport = $scope.query({
                    ids: 'ga:82461709',
                    metrics: 'ga:sessions',
                    dimensions: 'ga:deviceCategory',
                    'start-date': '30daysAgo',
                    'end-date': 'yesterday'
                });

                Promise.all([deviceReport]).then(function(results) {
                    for (var i = 0; i < results[0].rows.length; i++) {
                        var category = results[0].rows[i][0];
                        if (category === 'desktop') {
                            $scope.desktop = results[0].rows[i][1]
                        }
                        if (category === 'mobile') {
                            $scope.mobile = results[0].rows[i][1]
                        }
                    };
                });

                // ----------------------------------------
                // Visitors
                // ----------------------------------------

                var userReport = $scope.query({
                    ids: 'ga:82461709',
                    metrics: 'ga:users',
                    dimensions: 'ga:date',
                    'start-date': '30daysAgo',
                    'end-date': 'yesterday'
                });

                var userReportPreviousMonth = $scope.query({
                    ids: 'ga:82461709',
                    metrics: 'ga:users',
                    dimensions: 'ga:date',
                    'start-date': '60daysAgo',
                    'end-date': '30daysAgo'
                });

                Promise.all([userReport, userReportPreviousMonth]).then(function(results) {
                    $scope.visitors = results[0].totalsForAllResults['ga:users'];
                    var previous = results[1].totalsForAllResults['ga:users'];
                    $scope.visitorsPercent = $scope.calculatePercentage(previous, $scope.visitors);
                });

                // ======================================
                // New vs. Returning Customers
                // ======================================

                var newVsReturningChart = $scope.query({
                    ids: 'ga:82461709',
                    metrics: 'ga:sessions',
                    dimensions: 'ga:userType',
                    'start-date': '30daysAgo',
                    'end-date': 'yesterday'
                });

                Promise.all([newVsReturningChart]).then(function(results) {
                    //colors: ['#41b0c7', '#fcb252', '#309cb2', '#f8cc49', '#f8d949']

                    var dataObjArr = [];

                    for (var i = 0; i < results[0].rows.length; i++) {
                        var subObj = new Object();
                        subObj.name = results[0].rows[i][0];
                        subObj.data = [parseInt(results[0].rows[i][1])];
                        dataObjArr[i] = subObj;
                    };

                    $scope.newVsReturningConfig = {
                        options: {
                            chart: {
                                type: 'column'
                            },
                            title: {
                                text: 'New vs. Returning'
                            }
                        },
                        series: dataObjArr,
                        yAxis: {
                            title: {
                                text: 'Visitors'
                            }
                        },
                        credits: {
                            enabled: false
                        }
                    };
                });

                // ======================================
                // Traffic Sources
                // ======================================

                var trafficSources = $scope.query({
                    ids: 'ga:82461709',
                    metrics: 'ga:sessions',
                    dimensions: 'ga:trafficType',
                    'start-date': '30daysAgo',
                    'end-date': 'yesterday'
                });

                Promise.all([trafficSources]).then(function(results) {

                    var dataObjArr = [];

                    for (var i = 0; i < results[0].rows.length; i++) {
                        results[0].rows[i][1] = parseInt(results[0].rows[i][1]);
                        results[0].rows[i][0] = results[0].rows[i][0].charAt(0).toUpperCase() + results[0].rows[i][0].slice(1);
                    };

                    $scope.trafficSourcesConfig = {
                        options: {
                            chart: {
                                plotBackgroundColor: null,
                                plotBorderWidth: 0,
                                plotShadow: false
                            },
                            title: {
                                text: 'Traffic Sources'
                            },
                            tooltip: {
                                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                            },
                            plotOptions: {
                                pie: {
                                    dataLabels: {
                                        enabled: true,
                                        distance: -50,
                                        style: {
                                            fontWeight: 'bold',
                                            color: 'white',
                                            textShadow: '0px 1px 2px black'
                                        }
                                    },
                                    startAngle: -90,
                                    endAngle: 90,
                                    center: ['50%', '75%']
                                }
                            }
                        },
                        series: [{
                            type: 'pie',
                            name: 'Traffic Source',
                            innerSize: '40%',
                            data: results[0].rows
                        }],
                        credits: {
                            enabled: false
                        }
                    };
                });

                // ----------------------------------------
                // Average Visit Duration
                // ----------------------------------------

                var sessionDurationQuery = $scope.query({
                    ids: 'ga:82461709',
                    metrics: 'ga:sessions,ga:sessionDuration',
                    dimensions: 'ga:date',
                    'start-date': '30daysAgo',
                    'end-date': 'yesterday'
                });

                var sessionDurationPreviousQuery = $scope.query({
                    ids: 'ga:82461709',
                    metrics: 'ga:sessions,ga:sessionDuration',
                    dimensions: 'ga:date',
                    'start-date': '60daysAgo',
                    'end-date': '30daysAgo'
                });

                Promise.all([sessionDurationQuery, sessionDurationPreviousQuery]).then(function(results) {
                    var sessionDuration = parseInt(results[0].totalsForAllResults['ga:sessionDuration']);
                    var sessions = parseInt(results[0].totalsForAllResults['ga:sessions']);
                    var averageDuration = (sessionDuration / sessions);
                    $scope.visitDuration = $scope.secToTime(averageDuration);

                    var previousSessionDuration = parseInt(results[1].totalsForAllResults['ga:sessionDuration']);
                    var previousSessions = parseInt(results[1].totalsForAllResults['ga:sessions']);
                    var averageDurationPrevious = (previousSessionDuration / previousSessions);
                    $scope.visitDurationPercent = $scope.calculatePercentage(averageDurationPrevious, averageDuration);
                });

                // ======================================
                // Bounces
                // ======================================

                var bouncesReport = $scope.query({
                    ids: 'ga:82461709',
                    metrics: 'ga:bounces',
                    dimensions: 'ga:date',
                    'start-date': '30daysAgo',
                    'end-date': 'yesterday'
                });

                var bouncesPreviousReport = $scope.query({
                    ids: 'ga:82461709',
                    metrics: 'ga:bounces',
                    dimensions: 'ga:date',
                    'start-date': '60daysAgo',
                    'end-date': '30daysAgo'
                });

                Promise.all([bouncesReport, bouncesPreviousReport]).then(function(results) {
                    $scope.bounces = results[0].totalsForAllResults['ga:bounces'];
                    $scope.bouncesPercent = $scope.calculatePercentage(results[1].totalsForAllResults['ga:bounces'], results[0].totalsForAllResults['ga:bounces']);
                });

                // ----------------------------------------
                // Top Pageviews
                // ----------------------------------------

                // var topPageViews = $scope.query({
                //     ids: 'ga:82461709',
                //     metrics: 'ga:entrances',
                //     dimensions: 'ga:date',
                //     'start-date': '30daysAgo',
                //     'end-date': 'yesterday'
                // });

                // Promise.all([topPageViews]).then(function(results) {
                //     $scope.topPages = results[0].rows;
                // });

                // ----------------------------------------
                // Pageviews Metric
                // ----------------------------------------

                // var pageviewsReport = $scope.query({
                //     ids: 'ga:82461709',
                //     metrics: 'ga:pageviews',
                //     dimensions: 'ga:date',
                //     'start-date': '30daysAgo',
                //     'end-date': 'yesterday'
                // });

                // var pageviewsPreviousReport = $scope.query({
                //     ids: 'ga:82461709',
                //     metrics: 'ga:pageviews',
                //     dimensions: 'ga:date',
                //     'start-date': '60daysAgo',
                //     'end-date': '30daysAgo'
                // });

                // Promise.all([pageviewsReport, pageviewsPreviousReport]).then(function(results) {
                //     $scope.pageviews = results[0].totalsForAllResults['ga:pageviews'];
                //     $scope.pageviewsPercent = $scope.calculatePercentage(results[1].totalsForAllResults['ga:pageviews'], results[0].totalsForAllResults['ga:pageviews']);
                // });

                PaymentService.getCustomers(function(data) {
                    $scope.customers = data;

                    // ======================================
                    // Monthly Recurring Revenue Metric
                    // Monthly Recurring = Avg Revenue Per Customer * # of Customers
                    // ======================================

                    var monthlyRecurringRevenue = new Keen.Query("sum", {
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
                    client.run(monthlyRecurringRevenue, function(response) {
                        var totalRevenue = this.data.result;
                        var numOfCustomers = $scope.customers.length;
                        var avgRevenue = totalRevenue / numOfCustomers;
                        var result = avgRevenue * numOfCustomers;
                        $scope.monthlyRecurringRevenue = result / 100;
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

                }); //end PaymentService.getCustomers

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

                var netRevenueThisMonth = new Keen.Query("sum", {
                    eventCollection: "Stripe_Events",
                    targetProperty: 'data.object.amount',
                    timeframe: 'last_30_days',
                    filters: [{
                        'property_name': 'type',
                        'operator': 'eq',
                        'property_value': 'charge.succeeded'
                    }]
                });

                var netRevenuePreviousMonth = new Keen.Query("sum", {
                    eventCollection: "Stripe_Events",
                    targetProperty: 'data.object.amount',
                    timeframe: 'previous_month',
                    filters: [{
                        'property_name': 'type',
                        'operator': 'eq',
                        'property_value': 'charge.succeeded'
                    }]
                });

                client.run([netRevenueThisMonth, feesQuery, netRevenuePreviousMonth], function(response) {
                    var totalRevenue = this.data[0].result;
                    var totalFees = this.data[1].result;
                    var totalRevenuePrevious = this.data[2].result;
                    var result = ((totalRevenue - totalRevenuePrevious) / totalRevenue) * 100;
                    $scope.totalRevenuePercent = Math.round(result * 100) / 100;
                    //TODO: Subtract damages/coupons/returns
                    $scope.totalRevenue = this.data[0].result / 100;
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

            }, function(reason) {
                console.log('Failed: ' + reason);
            });

        }); //keen ready

    }]);
});