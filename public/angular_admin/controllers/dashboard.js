define(['app', 'ngProgress', 'paymentService', 'highcharts', 'highcharts-funnel', 'highcharts-ng', 'formatCurrency', 'secTotime', 'formatPercentage', 'dashboardService', 'customerService'], function(app) {
    app.register.controller('DashboardCtrl', ['$scope', '$window', '$resource', 'ngProgress', 'PaymentService', 'dashboardService', 'CustomerService', function($scope, $window, $resource, ngProgress, PaymentService, dashboardService, CustomerService) {
        ngProgress.start();

        dashboardService.checkToken(function(data) {
            if (data) {

                $scope.activeTab = 'activity';

                var client = new Keen({
                    projectId: "54528c1380a7bd6a92e17d29",
                    writeKey: "c36124b0ccbbfd0a5e50e6d8c7e80a870472af9bf6e74bd11685d30323096486a19961ebf98d57ee642d4b83e33bd3929c77540fa479f46e68a0cdd0ab57747a96bff23c4d558b3424ea58019066869fd98d04b2df4c8de473d0eb66cc6164f03530f8ab7459be65d3bf2e8e8a21c34a",
                    readKey: "bc102d9d256d3110db7ccc89a2c7efeb6ac37f1ff07b0a1f421516162522a972443b3b58ff6120ea6bd4d9dd469acc83b1a7d8a51cbb82caa89e590492e0579c8b7c65853ec1c6d6ce6f76535480f8c2f17fcb66dca14e699486efb02b83084744c68859b89f71f37ad846f7088ff96b",
                    protocol: "https",
                    host: "api.keen.io/3.0",
                    requestType: "jsonp"
                });

                CustomerService.getCustomers(function(customers) {
                    var find = _.where($scope.customers, {_id: 1598});
                    $scope.customers = customers;

                    CustomerService.getAllCustomerActivities(function(activites) {
                        for (var i = 0; i < activites.length; i++) {
                            var customer = _.where(customers, {_id: activites[i].contactId});
                            activites[i]['customer'] = customer[0];
                            activites[i]['activityType'] = activites[i]['activityType'];
                        };
                        $scope.activities = _.sortBy(activites, function(o) { return o.start; }).reverse();

                    });
                });


                Keen.ready(function() {
                    gapi.analytics.ready(function() {

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
                                dashboardService.queryGoogleAnalytics(params, function(data) {
                                    resolve(data);
                                });
                            });

                        };

                        $scope.toUTC = function(str) {
                            return Date.UTC(str.substring(0, 4), str.substring(4, 6) - 1, str.substring(6, 8));
                        };


                        var visitorLocations = $scope.query({
                            ids: 'ga:82461709',
                            metrics: 'ga:users',
                            dimensions: 'ga:region',
                            'start-date': '30daysAgo',
                            'end-date': 'yesterday'
                        });

                        var deviceReport = $scope.query({
                            ids: 'ga:82461709',
                            metrics: 'ga:sessions',
                            dimensions: 'ga:deviceCategory',
                            'start-date': '30daysAgo',
                            'end-date': 'yesterday'
                        });

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

                        var pageviewsReport = $scope.query({
                            ids: 'ga:82461709',
                            metrics: 'ga:pageviews',
                            dimensions: 'ga:date',
                            'start-date': '30daysAgo',
                            'end-date': 'yesterday'
                        });

                        var pageviewsPreviousReport = $scope.query({
                            ids: 'ga:82461709',
                            metrics: 'ga:pageviews',
                            dimensions: 'ga:date',
                            'start-date': '60daysAgo',
                            'end-date': '30daysAgo'
                        });

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

                        Promise.all([visitorLocations, deviceReport, userReport, userReportPreviousMonth, pageviewsReport, pageviewsPreviousReport, sessionDurationQuery, sessionDurationPreviousQuery, bouncesReport, bouncesPreviousReport]).then(function(results) {

                            // ======================================
                            // Visitor Location Popularity
                            // ======================================

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

                            // // ----------------------------------------
                            // // Device
                            // // ----------------------------------------

                            for (var i = 0; i < results[1].rows.length; i++) {
                                var category = results[1].rows[i][0];
                                if (category === 'desktop') {
                                    $scope.desktop = results[1].rows[i][1]
                                }
                                if (category === 'mobile') {
                                    $scope.mobile = results[1].rows[i][1]
                                }
                            };

                            // // ----------------------------------------
                            // // Visitors
                            // // ----------------------------------------

                            $scope.visitors = results[2].totalsForAllResults['ga:users'];
                            var visitorsData = [];
                            for (var i = 0; i < results[2].rows.length; i++) {
                                var subArr = [];
                                subArr.push($scope.toUTC(results[2].rows[i][0]));
                                subArr.push(parseInt(results[2].rows[i][1]));
                                visitorsData.push(subArr);
                            };
                            var previous = results[3].totalsForAllResults['ga:users'];
                            $scope.visitorsPercent = $scope.calculatePercentage(previous, $scope.visitors);

                            // // ----------------------------------------
                            // // Pageviews Metric
                            // // ----------------------------------------

                            var pageviewsData = [];
                            for (var i = 0; i < results[4].rows.length; i++) {
                                var subArr = [];
                                subArr.push($scope.toUTC(results[4].rows[i][0]));
                                subArr.push(parseInt(results[4].rows[i][1]));
                                pageviewsData.push(subArr);
                            };
                            $scope.pageviews = results[4].totalsForAllResults['ga:pageviews'];
                            $scope.pageviewsPercent = $scope.calculatePercentage(results[5].totalsForAllResults['ga:pageviews'], results[4].totalsForAllResults['ga:pageviews']);


                            // // ----------------------------------------
                            // // Average Visit Duration
                            // // ----------------------------------------

                            var sessionDuration = parseInt(results[6].totalsForAllResults['ga:sessionDuration']);
                            var sessions = parseInt(results[6].totalsForAllResults['ga:sessions']);
                            var sessionsData = [];
                            var timeOnSiteData = [];
                            for (var i = 0; i < results[6].rows.length; i++) {
                                var subArr = [];
                                subArr.push($scope.toUTC(results[6].rows[i][0]));
                                subArr.push(parseInt(results[6].rows[i][1]));
                                sessionsData.push(subArr);

                                var subArr2 = [];
                                subArr2.push($scope.toUTC(results[6].rows[i][0]));
                                subArr2.push(parseInt(results[6].rows[i][1]));
                                timeOnSiteData.push(subArr2);
                            };
                            $scope.visits = sessions;
                            var averageDuration = (sessionDuration / sessions);
                            $scope.visitDuration = $scope.secToTime(averageDuration);

                            var previousSessionDuration = parseInt(results[7].totalsForAllResults['ga:sessionDuration']);
                            var previousSessions = parseInt(results[7].totalsForAllResults['ga:sessions']);
                            var averageDurationPrevious = (previousSessionDuration / previousSessions);
                            $scope.visitDurationPercent = $scope.calculatePercentage(averageDurationPrevious, averageDuration);

                            // // ======================================
                            // // Bounces
                            // // ======================================

                            var bouncesData = [];
                            for (var i = 0; i < results[8].rows.length; i++) {
                                var subArr = [];
                                subArr.push($scope.toUTC(results[8].rows[i][0]));
                                subArr.push(parseInt(results[8].rows[i][1]));
                                bouncesData.push(subArr);
                            };

                            $scope.bounces = results[8].totalsForAllResults['ga:bounces'];
                            $scope.bouncesPercent = $scope.calculatePercentage(results[9].totalsForAllResults['ga:bounces'], results[8].totalsForAllResults['ga:bounces']);

                            // // ======================================
                            // // Overview
                            // // Pageviews, Visits, Vistors
                            // // ======================================

                            $scope.analyticsOverviewConfig = {
                                options: {
                                    chart: {
                                        height: 400,
                                        spacing: [25, 25, 25, 25],
                                        width: 300
                                    },
                                    colors: ['#41b0c7', '#fcb252', '#309cb2', '#f8cc49', '#f8d949'],
                                    title: {
                                        text: ''
                                    },
                                    subtitle: {
                                        text: ''
                                    },
                                    tooltip: {
                                        headerFormat: '<b>{point.x:%b %d}</b><br>',
                                        pointFormat: '<b class="text-center">{point.y}</b>',
                                    },
                                    legend: {
                                        enabled: true
                                    },
                                    exporting: {
                                        enabled: false
                                    },
                                    plotOptions: {
                                        series: {
                                            marker: {
                                                enabled: false
                                            }
                                        }
                                    }
                                },
                                xAxis: {
                                    type: 'datetime',
                                    labels: {
                                        format: "{value:%b %d}"
                                    }
                                },
                                yAxis: {
                                    // min: 0,
                                    // max: Math.max.apply(Math, lineData) + 100,
                                    title: {
                                        text: ''
                                    }
                                },
                                series: [{
                                    name: 'Pageviews',
                                    data: pageviewsData
                                }, {
                                    name: 'Visits',
                                    data: sessionsData
                                }, {
                                    name: 'Visitors',
                                    data: visitorsData
                                }],
                                credits: {
                                    enabled: false
                                },
                                func: function(chart) {
                                    $scope.analyticsOverviewConfig.options.chart.width = (document.getElementById('main-viewport').offsetWidth) - 60;
                                    chart.reflow();

                                    $scope.$on('resize', function() {
                                        $scope.analyticsOverviewConfig.options.chart.width = (document.getElementById('main-viewport').offsetWidth) - 60;
                                        chart.reflow();
                                    });
                                }
                            };


                            // // ======================================
                            // // Content
                            // // Time on Site, Bounces
                            // // ======================================

                            $scope.do = function($event) {
                                $event.preventDefault();
                            };

                            $scope.timeonSiteConfig = {
                                options: {
                                    chart: {
                                        height: 465,
                                        spacing: [25, 25, 25, 25]
                                    },
                                    colors: ['#41b0c7', '#fcb252', '#309cb2', '#f8cc49', '#f8d949'],
                                    title: {
                                        text: ''
                                    },
                                    subtitle: {
                                        text: ''
                                    },
                                    tooltip: {
                                        headerFormat: '<b>{point.x:%b %d}</b><br>',
                                        pointFormat: '<b class="text-center">{point.y}</b>',
                                    },
                                    legend: {
                                        enabled: true
                                    },
                                    exporting: {
                                        enabled: false
                                    },
                                    plotOptions: {
                                        series: {
                                            marker: {
                                                enabled: false
                                            }
                                        }
                                    }
                                },
                                xAxis: {
                                    type: 'datetime',
                                    labels: {
                                        format: "{value:%b %d}"
                                    }
                                },
                                yAxis: {
                                    // min: 0,
                                    // max: Math.max.apply(Math, lineData) + 100,
                                    title: {
                                        text: ''
                                    }
                                },
                                series: [{
                                    name: 'Time on Site',
                                    data: timeOnSiteData
                                }, {
                                    name: 'Bounces',
                                    data: bouncesData
                                }],
                                credits: {
                                    enabled: false
                                }
                            };

                            $scope.secondGACall();
                        });

                        $scope.secondGACall = function() {

                            setTimeout(function() {

                                var newVsReturningChart = $scope.query({
                                    ids: 'ga:82461709',
                                    metrics: 'ga:sessions',
                                    dimensions: 'ga:userType',
                                    'start-date': '30daysAgo',
                                    'end-date': 'yesterday'
                                });

                                var topPageViews = $scope.query({
                                    ids: 'ga:82461709',
                                    metrics: 'ga:pageviews,ga:uniquePageviews,ga:avgTimeOnPage,ga:entrances,ga:bounceRate,ga:exitRate',
                                    dimensions: 'ga:pagePath',
                                    'start-date': '30daysAgo',
                                    'end-date': 'yesterday'
                                });

                                //ga:pageviews,ga:timeOnPage,ga:exits,ga:avgTimeOnPage,ga:entranceRate,ga:entrances,ga:exitRate,ga:uniquePageviews

                                var trafficSources = $scope.query({
                                    ids: 'ga:82461709',
                                    metrics: 'ga:sessions',
                                    dimensions: 'ga:trafficType',
                                    'start-date': '30daysAgo',
                                    'end-date': 'yesterday'
                                });

                                Promise.all([newVsReturningChart, topPageViews, trafficSources]).then(function(results) {

                                    // ======================================
                                    // New vs. Returning Customers
                                    // ======================================

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
                                                type: 'column',
                                                spacing: [25, 25, 25, 25]
                                            },
                                            colors: ['#41b0c7', '#fcb252', '#309cb2', '#f8cc49', '#f8d949'],
                                            title: {
                                                text: ''
                                            },
                                            exporting: {
                                                enabled: false
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

                                    setTimeout(function() {
                                        $scope.newVsReturningConfig.options.chart.width = (document.getElementById('main-viewport').offsetWidth / 3) - 30;
                                    }, 500);


                                    ngProgress.complete();

                                    // ----------------------------------------
                                    // Top Pageviews
                                    // ----------------------------------------

                                    $scope.topPages = results[1].rows;

                                    var output = [];

                                    for (var i = 0; i < $scope.topPages.length; i++) {
                                        var singleRow = $scope.topPages[i];
                                        var subObj = {};
                                        for (var k = 0; k < singleRow.length; k++) {
                                            if (k == 0) {
                                                subObj.page = singleRow[k]
                                            }
                                            if (k == 1) {
                                                subObj.pageviews = parseInt(singleRow[k])
                                            }
                                            if (k == 2) {
                                                subObj.uniquePageviews = parseInt(singleRow[k])
                                            }
                                            if (k == 3) {
                                                subObj.avgTime = parseInt(singleRow[k])
                                            }
                                            if (k == 4) {
                                                subObj.entrances = parseInt(singleRow[k])
                                            }
                                            if (k == 5) {
                                                subObj.bounceRate = parseInt(singleRow[k])
                                            }
                                            if (k == 6) {
                                                subObj.exitRate = parseInt(singleRow[k])
                                            }
                                        };
                                        if (subObj) {
                                            output.push(subObj);
                                        }
                                    };


                                    $scope.formattedTopPages = output;
                                    $scope.pagedformattedTopPages = $scope.formattedTopPages.slice(0, $scope.pageLimit);

                                    // ======================================
                                    // Traffic Sources
                                    // ======================================

                                    var dataObjArr = [];

                                    for (var i = 0; i < results[2].rows.length; i++) {
                                        results[2].rows[i][1] = parseInt(results[2].rows[i][1]);
                                        results[2].rows[i][0] = results[2].rows[i][0].charAt(0).toUpperCase() + results[2].rows[i][0].slice(1);
                                    };

                                    $scope.trafficSourcesConfig = {
                                        options: {
                                            chart: {
                                                plotBackgroundColor: null,
                                                plotBorderWidth: 0,
                                                plotShadow: false,
                                                spacing: [25, 25, 25, 25]
                                            },
                                            title: {
                                                text: ''
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
                                                    colors: ['#41b0c7', '#fcb252', '#309cb2', '#f8cc49', '#f8d949']
                                                }
                                            },
                                            exporting: {
                                                enabled: false
                                            }
                                        },
                                        series: [{
                                            type: 'pie',
                                            name: 'Traffic Source',
                                            innerSize: '40%',
                                            data: results[2].rows
                                        }],
                                        credits: {
                                            enabled: false
                                        }
                                    };

                                    setTimeout(function() {
                                        $scope.trafficSourcesConfig.options.chart.width = (document.getElementById('main-viewport').offsetWidth / 3) - 30;
                                    }, 500);
                                });

                            }, 1000);
                        };


                        PaymentService.getCustomers(function(data) {
                            $scope.customers = data;

                            // ======================================
                            // Total Customer Metric
                            // ======================================

                            $scope.totalCustomers = $scope.customers.length;

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

                            var activeSubscriptions = new Keen.Query("count", {
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

                            var canceledSubscriptions = new Keen.Query("count", {
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

                            var payingCustomersSeries = new Keen.Query('count_unique', {
                                eventCollection: 'Stripe_Events',
                                timeframe: 'last_30_days',
                                targetProperty: 'data.object.customer',
                                interval: 'daily',
                                filters: [{
                                    'property_name':'type',
                                    'operator':'eq',
                                    'property_value':'invoice.payment_succeeded'
                                },
                                {
                                    'property_name':'data.object.total',
                                    'operator':'gt',
                                    'property_value': 0
                                }]
                            });


                            client.run([monthlyRecurringRevenue, activeSubscriptions, canceledSubscriptions, payingCustomersSeries], function(response) {
                                var totalRevenue = this.data[0].result;
                                var numOfCustomers = $scope.customers.length;
                                var avgRevenue = totalRevenue / numOfCustomers;
                                var result = avgRevenue * numOfCustomers;
                                $scope.monthlyRecurringRevenue = result / 100;

                                // ======================================
                                // Average Revenue Per Customer Metric
                                // ======================================

                                $scope.avgRevenue = avgRevenue;

                                // ======================================
                                // Annual Run Rate Metric
                                // MRR * 12
                                // ======================================

                                $scope.annualRunRate = $scope.monthlyRecurringRevenue * 12;

                                // ======================================
                                // Average monthly Recurring Revenue Per User (ARPU)
                                // ARPU = MRR / Active Subscriptions.
                                // ======================================

                                $scope.activeSubscriptions = this.data[1].result;

                                $scope.arpu = $scope.monthlyRecurringRevenue / $scope.activeSubscriptions;

                                // ======================================
                                // User Churn
                                // Churn = canceled subscriptions / (canceled subscriptions + active subscriptions)
                                // ======================================

                                var cancelSubscriptionData = [];
                                $scope.totalCanceledSubscriptions = 0;
                                for (var i = 0; i < this.data[2].result.length; i++) {
                                    cancelSubscriptionData.push(this.data[2].result[i].value);
                                    $scope.totalCanceledSubscriptions += parseInt(this.data[2].result[i].value);
                                };
                                $scope.canceledSubscriptions = cancelSubscriptionData;

                                var userChurnCalc = this.data[2].result / (this.data[2].result + this.data[1].result) * 100;
                                $scope.userChurn = userChurnCalc.toFixed(1) * -1;

                                // ======================================
                                // Lifetime Value (LTV)
                                // LTV =  ARPU / Churn
                                // ======================================
                                $scope.lifetimeValue = $scope.arpu / $scope.userChurn;


                                var totalCustomerData = [];
                                $scope.totalPayingCustomers = 0;
                                for (var i = 0; i < this.data[3].result.length; i++) {
                                    totalCustomerData.push(this.data[3].result[i].value);
                                    $scope.totalPayingCustomers += this.data[3].result[i].value;
                                };

                                $scope.customerOverviewConfig = {
                                    options: {
                                        chart: {
                                            height: 250,
                                        },
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
                                        pointStart: Date.parse(this.data[3].result[0].timeframe.start),
                                        color: '#ef9f22',
                                        data: totalCustomerData
                                    },
                                    {
                                        type: 'area',
                                        name: 'Cancellations',
                                        pointInterval: 24 * 3600 * 1000,
                                        pointStart: Date.parse(this.data[2].result[0].timeframe.start),
                                        data: cancelSubscriptionData
                                    }],
                                    credits: {
                                        enabled: false
                                    }
                                };
                            });


                        }); //end PaymentService.getCustomers

                        // ======================================
                        // Fees Metric
                        // ======================================

                        var feesThisMonth = new Keen.Query("sum", {
                            eventCollection: "Stripe_Events",
                            targetProperty: "data.object.fee",
                            timeframe: 'last_30_days',
                        });
                        var feesPreviousMonth = new Keen.Query("sum", {
                            eventCollection: "Stripe_Events",
                            targetProperty: "data.object.fee",
                            timeframe: 'previous_30_days',
                        });
                        client.run([feesThisMonth, feesPreviousMonth], function(response) {
                            $scope.totalFees = this.data[0].result / 100;
                            $scope.totalFeesPrevious = this.data[1].result / 100;
                            var result = (($scope.totalFees - $scope.totalFeesPrevious) / $scope.totalFees) * 100;
                            var format = Math.round(result * 100) / 100;
                            if (format == 0) {
                                format = null
                            }
                            $scope.totalFeesPercent = format;
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

                        client.run([netRevenueThisMonth, feesThisMonth, netRevenuePreviousMonth], function(response) {
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
                            $scope.totalRevenue = this.data.result;
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

                    }); //gapi ready

                }); //keen ready

                $scope.purchaseFunnelConfig = {
                    options: {
                        chart: {
                            marginRight: 100
                        },
                        title: {
                            text: ''
                        },
                        exporting: {
                            enabled: false
                        },
                        plotOptions: {
                            series: {
                                dataLabels: {
                                    enabled: true,
                                    format: '<b>{point.name}</b> ({point.y:,.0f})',
                                    color: 'black',
                                    softConnector: true
                                },
                                neckWidth: '30%',
                                neckHeight: '25%',
                                colors: ['#41b0c7', '#fcb252', '#309cb2', '#f8cc49', '#f8d949']
                                    //-- Other available options
                                    // height: pixels or percent
                                    // width: pixels or percent
                            }
                        }
                    },
                    series: [{
                        name: 'Unique users',
                        type: 'funnel',
                        data: [
                            ['Website visits', 15654],
                            ['Downloads', 4064],
                            ['Requested price list', 1987],
                            ['Invoice sent', 976],
                            ['Finalized', 846]
                        ]
                    }],
                    credits: {
                        enabled: false
                    }
                };

                $scope.genderConfig = {
                    options: {
                        chart: {
                            plotBackgroundColor: null,
                            plotBorderWidth: 0,
                            plotShadow: false,
                            spacing: [25, 25, 25, 25]
                        },
                        title: {
                            text: ''
                        },
                        tooltip: {
                            pointFormat: '{point.x}: <b>{point.percentage:.1f}%</b>'
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
                                colors: ['#41b0c7', '#fcb252', '#309cb2', '#f8cc49', '#f8d949']
                            }
                        },
                        exporting: {
                            enabled: false
                        }
                    },
                    series: [{
                        type: 'pie',
                        name: 'Gender',
                        innerSize: '40%',
                        data: [
                            ['Male', 44.3],
                            ['Female', 55.7]
                        ]
                    }],
                    credits: {
                        enabled: false
                    }
                };

                $scope.sort = {
                    column: '',
                    descending: false
                };

                $scope.changeSorting = function(column) {

                    var sort = $scope.sort;
                    if (sort.column == column) {
                        sort.descending = !sort.descending;
                    } else {
                        sort.column = column;
                        sort.descending = false;
                    }
                };

                $scope.conversationsConfig = {
                    options: {
                        chart: {
                            height: 465,
                            spacing: [25, 25, 25, 25],
                            type: 'column'
                        },
                        colors: ['#41b0c7', '#fcb252', '#309cb2', '#f8cc49', '#f8d949'],
                        title: {
                            text: ''
                        },
                        subtitle: {
                            text: ''
                        },
                        tooltip: {
                            headerFormat: '<b>{point.x:%b %d}</b><br>',
                            pointFormat: '<b class="text-center">{point.y}</b>',
                        },
                        legend: {
                            enabled: true
                        },
                        exporting: {
                            enabled: false
                        },
                        plotOptions: {
                            series: {
                                marker: {
                                    enabled: false
                                }
                            }
                        }
                    },
                    xAxis: {
                        type: 'datetime',
                        labels: {
                            format: "{value:%b %d}"
                        }
                    },
                    yAxis: {
                        // min: 0,
                        // max: Math.max.apply(Math, lineData) + 100,
                        title: {
                            text: ''
                        }
                    },
                    series: [{
                        name: 'Conversations',
                        data: [
                            [1412985600000, 220],
                            [1413072000000, 118],
                            [1413158400000, 362],
                            [1413244800000, 459],
                            [1413331200000, 366],
                            [1413417600000, 210],
                            [1413504000000, 77],
                            [1413590400000, 25],
                            [1413676800000, 12],
                            [1413763200000, 28],
                            [1413849600000, 18],
                            [1413936000000, 46],
                            [1414022400000, 25],
                            [1414108800000, 32],
                            [1414195200000, 7],
                            [1414281600000, 11],
                            [1414368000000, 27],
                            [1414454400000, 50],
                            [1414540800000, 30],
                            [1414627200000, 15],
                            [1414713600000, 12],
                            [1414800000000, 6],
                            [1414886400000, 26],
                            [1414972800000, 378],
                            [1415059200000, 558],
                            [1415145600000, 873],
                            [1415232000000, 591],
                            [1415318400000, 626],
                            [1415404800000, 531],
                            [1415491200000, 595]
                        ]
                    }, {
                        name: 'Customers',
                        data: [
                            [1412985600000, 4],
                            [1413072000000, 8],
                            [1413158400000, 18],
                            [1413244800000, 16],
                            [1413331200000, 8],
                            [1413417600000, 15],
                            [1413504000000, 12],
                            [1413590400000, 3],
                            [1413676800000, 3],
                            [1413763200000, 6],
                            [1413849600000, 8],
                            [1413936000000, 10],
                            [1414022400000, 14],
                            [1414108800000, 9],
                            [1414195200000, 4],
                            [1414281600000, 7],
                            [1414368000000, 13],
                            [1414454400000, 8],
                            [1414540800000, 27],
                            [1414627200000, 7],
                            [1414713600000, 8],
                            [1414800000000, 6],
                            [1414886400000, 9],
                            [1414972800000, 12],
                            [1415059200000, 13],
                            [1415145600000, 8],
                            [1415232000000, 14],
                            [1415318400000, 11],
                            [1415404800000, 13],
                            [1415491200000, 11]
                        ]
                    }],
                    credits: {
                        enabled: false
                    }
                };

                $scope.responseTimeConfig = {
                    options: {
                        chart: {
                            plotBackgroundColor: null,
                            plotBorderWidth: 0,
                            plotShadow: false,
                            spacing: [25, 25, 25, 25]
                        },
                        title: {
                            text: ''
                        },
                        tooltip: {
                            pointFormat: '{point.x}: <b>{point.percentage:.1f}%</b>'
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
                                colors: ['#41b0c7', '#fcb252', '#309cb2', '#f8cc49', '#f8d949']
                            }
                        },
                        exporting: {
                            enabled: false
                        }
                    },
                    series: [{
                        type: 'pie',
                        name: 'Response Time',
                        innerSize: '40%',
                        data: [
                            ['15 min', 17],
                            ['15-30 min', 33],
                            ['30-60 min', 35],
                            ['1-2 hrs', 15]
                        ]
                    }],
                    credits: {
                        enabled: false
                    }
                };

                $scope.pageLimit = 15;

                $scope.pageChangeFn = function(currentPage, totalPages) {
                    var begin = ((currentPage - 1) * $scope.pageLimit);
                    var end = begin + $scope.pageLimit;
                    $scope.pagedformattedTopPages = $scope.formattedTopPages.slice(begin, end);
                };

            }
        });

    }]);
});
