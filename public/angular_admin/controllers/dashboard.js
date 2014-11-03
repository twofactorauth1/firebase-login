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

        function secToTime(duration) {
                var minutes = parseInt(Math.floor(duration / 60));
                var seconds = parseInt(duration - minutes * 60)

            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;

            return minutes + ":" + seconds;
        };

        function calculatePercentage(oldval, newval) {
            var result = ((newval - oldval) / newval) * 100;
            return Math.round(result*100/100);
        };

        PaymentService.getCustomers(function(data) {
            $scope.customers = data;

            gapi.analytics.ready(function() {

                gapi.analytics.auth.authorize({
                    container: 'embed-api-auth-container',
                    clientid: '1026246177215-tqpcc51fjk3vm0mgjef2jg7jagcmtuba.apps.googleusercontent.com',
                });

                window.onresize = function(event) {
                    drawVisualization();
                };

                Keen.ready(function() {
                    ngProgress.complete();

                    // ----------------------------------------
                    // Pageviews Metric
                    // ----------------------------------------

                    var pageviewsReport = new gapi.analytics.report.Data({
                        query: {
                            ids: 'ga:82461709',
                            metrics: 'ga:pageviews',
                            dimensions: 'ga:date',
                            'start-date': '30daysAgo',
                            'end-date': 'today'
                        }
                    });

                    pageviewsReport.on('success', function(response) {
                        $scope.pageviews = response.totalsForAllResults['ga:pageviews'];
                        var pageviewsPreviousReport = new gapi.analytics.report.Data({
                            query: {
                                ids: 'ga:82461709',
                                metrics: 'ga:pageviews',
                                dimensions: 'ga:date',
                                'start-date': '60daysAgo',
                                'end-date': '30daysAgo'
                            }
                        });

                        pageviewsPreviousReport.on('success', function(response2) {
                            var previous = response2.totalsForAllResults['ga:pageviews'];
                            console.log('previcous' , previous);
                            $scope.pageviewsPercent = calculatePercentage(previous, $scope.pageviews);
                        });
                        pageviewsPreviousReport.execute();
                    });

                    pageviewsReport.execute();

                    // ======================================
                    // Bounces
                    // ======================================

                    var bouncesReport = new gapi.analytics.report.Data({
                        query: {
                            ids: 'ga:82461709',
                            metrics: 'ga:bounces',
                            dimensions: 'ga:date',
                            'start-date': '30daysAgo',
                            'end-date': 'yesterday'
                        }
                    });

                    var bouncesPreviousReport = new gapi.analytics.report.Data({
                        query: {
                            ids: 'ga:82461709',
                            metrics: 'ga:bounces',
                            dimensions: 'ga:date',
                            'start-date': '60daysAgo',
                            'end-date': '30daysAgo'
                        }
                    });

                    bouncesReport.on('success', function(response) {
                        $scope.bounces = response.totalsForAllResults['ga:bounces'];
                            bouncesPreviousReport.on('success', function(response) {
                                var previous = response.totalsForAllResults['ga:bounces'];
                                $scope.bouncesPercent = calculatePercentage(previous, $scope.bounces);
                            });
                            bouncesPreviousReport.execute();
                    });

                    bouncesReport.execute();

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

                    var rawAvgDuration;

                    var report = new gapi.analytics.report.Data({
                        query: {
                            ids: 'ga:82461709',
                            metrics: 'ga:sessions,ga:sessionDuration',
                            dimensions: 'ga:date',
                            'start-date': '30daysAgo',
                            'end-date': 'yesterday'
                        }
                    });

                    var sessionDurationPreviousMonth = new gapi.analytics.report.Data({
                        query: {
                            ids: 'ga:82461709',
                            metrics: 'ga:sessions,ga:sessionDuration',
                            dimensions: 'ga:date',
                            'start-date': '60daysAgo',
                            'end-date': '30daysAgo'
                        }
                    });

                    report.on('success', function(response) {
                        var totalDuration = response.totalsForAllResults['ga:sessionDuration'];
                        var totalResults = response.totalsForAllResults['ga:sessions'];
                        var averageDuration = parseInt(totalDuration) / parseInt(totalResults);
                        rawAvgDuration = averageDuration;
                        $scope.visitDuration = secToTime(averageDuration);
                        sessionDurationPreviousMonth.on('success', function(response) {
                            var totalDuration2 = response.totalsForAllResults['ga:sessionDuration'];
                            var totalResults2 = response.totalsForAllResults['ga:sessions'];
                            var averageDuration2 = parseInt(totalDuration2) / parseInt(totalResults2);
                            $scope.visitDurationPercent = calculatePercentage(averageDuration2, rawAvgDuration);
                        });

                        sessionDurationPreviousMonth.execute();
                    });

                    report.execute();

                    // ----------------------------------------
                    // Top Pageviews
                    // ----------------------------------------

                    /*********** From Keen ***********/

                        // var pageNavCount = new Keen.Query('count', {
                        //     eventCollection: 'pageviews',
                        //     groupBy: 'page.href',
                        //     filters: [{
                        //         'property_name': 'page.href',
                        //         'operator': 'contains',
                        //         'property_value': 'main.test.indigenous.io'
                        //     }]
                        // });
                        // client.run(pageNavCount, function(response) {

                        //     new Keen.Visualization(this.data, document.getElementById('top-visited-pages'), {
                        //         chartType: 'table',
                        //         title: ' ',
                        //         height: 300,
                        //         width: 'auto'
                        //     });
                        // });

                    /*********** From Google Analytics ***********/

                    var topPageViews = new gapi.analytics.report.Data({
                        query: {
                            ids: 'ga:82461709',
                            metrics: 'ga:entrances',
                            dimensions: 'ga:landingPagePath'
                        }
                    });

                    topPageViews.on('success', function(response) {

                            var data = new google.visualization.DataTable();
                            // for (var i = 0; i < response.columnHeaders.length; i++) {
                            //     console.log(response.columnHeaders[i].name);
                            //     data.addColumn(response.columnHeaders[i].dataType, response.columnHeaders[i].name);
                            // };

                            data.addColumn('string', 'Path');
                            data.addColumn('number', 'Views');
                            data.addColumn('string', 'Duration');
                            data.addRows([
                              ['/page',  20, '0:23'],
                              ['/page',  20, '0:23'],
                              ['/page',  20, '0:23'],
                              ['/page',  20, '0:23']
                            ]);

                            var table = new google.visualization.Table(document.getElementById('top-visited-pages'));

                            table.draw(data, {showRowNumber: false});
                    });

                    topPageViews.execute();

                    // ----------------------------------------
                    // Device
                    // ----------------------------------------

                            // var visitorLocations = new Keen.Query("count", {
                            //     eventCollection: "pageviews",
                            //     groupBy: "visitor.tech.os.family"
                            // });

                            // client.run(visitorLocations, function(response) {
                            //     new Keen.Visualization(this.data, document.getElementById('device'), {
                            //         chartType: 'columnchart',
                            //         height: 300,
                            //         width: 'auto',
                            //         chartOptions: {
                            //             legend: {
                            //                 position: "none"
                            //             }
                            //         }
                            //     });
                            // });

                    var deviceReport = new gapi.analytics.report.Data({
                        query: {
                            ids: 'ga:82461709',
                            metrics: 'ga:sessions',
                            dimensions: 'ga:deviceCategory'
                        }
                    });

                    deviceReport.on('success', function(response) {
                        for (var i = 0; i < response.rows.length; i++) {
                            var category = response.rows[i][0];
                            if (category === 'desktop') {$scope.desktop = response.rows[i][1]}
                            if (category === 'mobile') {$scope.mobile = response.rows[i][1]}
                        };
                    });

                    deviceReport.execute();

                    // ======================================
                    // Visitor Location Popularity
                    // ======================================

                    var visitorLocations = new gapi.analytics.report.Data({
                        query: {
                            ids: 'ga:82461709',
                            metrics: 'ga:users',
                            dimensions: 'ga:region'
                        }
                    });

                    visitorLocations.on('success', function(response) {
                        var data = [
                          ['Country', 'Popularity']
                        ];
                        var subData = [];
                        for (var i = 0; i < response.rows.length; i++) {
                            subData.push(response.rows[i][0], parseInt(response.rows[i][1]));
                            data.push(subData);
                            subData = [];
                        };
                        var data = google.visualization.arrayToDataTable( data );

                        var options = {
                            region: 'US',
                            colorAxis:  {minValue: 0,  colors: ['#5ccae0', '#3c92a4']},
                            resolution: "provinces",
                            width: '100%'
                        };

                        var chart = new google.visualization.GeoChart(document.getElementById('location'));

                        chart.draw(data, options);
                    });

                    visitorLocations.execute();

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


                    // ======================================
                    // Traffic Sources
                    // ======================================

                    var trafficSources = new gapi.analytics.report.Data({
                        query: {
                            ids: 'ga:82461709',
                            metrics: 'ga:sessions',
                            dimensions: 'ga:trafficType'
                        }
                    });

                    trafficSources.on('success', function(response) {

                        var data = [
                          ['Source', 'Visits']
                        ];
                        var subData = [];
                        for (var i = 0; i < response.rows.length; i++) {
                            var sourceTitle = response.rows[i][0].charAt(0).toUpperCase() + response.rows[i][0].slice(1);
                            subData.push(sourceTitle, parseInt(response.rows[i][1]));
                            data.push(subData);
                            subData = [];
                        };

                        var data = google.visualization.arrayToDataTable(data);

                        var options = {
                            pieHole: 0.5,
                            width: 310,
                            height: 300,
                            colors: ['#41b0c7', '#fcb252', '#309cb2', '#f8cc49', '#f8d949'],
                            legend: {
                                position: 'bottom'
                            }
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
                            ids: 'ga:82461709',
                            metrics: 'ga:sessions',
                            dimensions: 'ga:userType'
                        },
                        chart: {
                            container: 'new-vs-returning',
                            type: 'COLUMN',
                            options: {
                                width: '100%',
                                legend: {
                                    position: 'bottom'
                                },
                                colors: ['#41b0c7', '#fcb252', '#309cb2', '#f8cc49', '#f8d949'],
                            }
                        }
                    });

                    newVsReturningChart.execute();


            });

        }); //end PaymentService.getCustomers

    }]);
});
