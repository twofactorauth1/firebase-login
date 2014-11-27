define(['app', 'ngProgress', 'paymentService', 'highcharts', 'highcharts-funnel', 'highcharts-standalone', 'highmaps-data', 'highmaps-us', 'highcharts-ng','formatCurrency', 'secTotime', 'formatPercentage', 'dashboardService', 'customerService', 'angular-daterangepicker', 'daterangepicker', 'count-to', 'keenService'], function(app) {
    app.register.controller('DashboardCtrl', ['$scope', '$window', '$resource', 'ngProgress', 'PaymentService', 'dashboardService', 'CustomerService', 'keenService', function($scope, $window, $resource, ngProgress, PaymentService, dashboardService, CustomerService, keenService) {
        ngProgress.start();

                $scope.activeTab = 'analytics';

                $scope.date = {startDate: null, endDate: null};
                $scope.pickerOptions = {
                  // ranges: {
                  //    'Today': [moment(), moment()],
                  //    'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
                  //    'Last 7 Days': [moment().subtract('days', 6), moment()],
                  //    'Last 30 Days': [moment().subtract('days', 29), moment()],
                  //    'This Month': [moment().startOf('month'), moment().endOf('month')],
                  //    'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
                  // }
                };

                var client = new Keen({
                    projectId: "54528c1380a7bd6a92e17d29",
                    writeKey: "c36124b0ccbbfd0a5e50e6d8c7e80a870472af9bf6e74bd11685d30323096486a19961ebf98d57ee642d4b83e33bd3929c77540fa479f46e68a0cdd0ab57747a96bff23c4d558b3424ea58019066869fd98d04b2df4c8de473d0eb66cc6164f03530f8ab7459be65d3bf2e8e8a21c34a",
                    readKey: "bc102d9d256d3110db7ccc89a2c7efeb6ac37f1ff07b0a1f421516162522a972443b3b58ff6120ea6bd4d9dd469acc83b1a7d8a51cbb82caa89e590492e0579c8b7c65853ec1c6d6ce6f76535480f8c2f17fcb66dca14e699486efb02b83084744c68859b89f71f37ad846f7088ff96b",
                    protocol: "https",
                    host: "api.keen.io/3.0",
                    requestType: "jsonp"
                });
                var timeframeStart = '2014-11-01T23:05:20.075Z';
                var timeframeEnd = '2014-11-30T23:05:20.075Z';
                var timeframePreviousStart = '2014-10-02T23:05:20.075Z';
                var timeframePreviousEnd = '2014-10-31T23:05:20.075Z';
                var interval = "daily";

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

                // var params = {
                //     "event_collection": 'sessions',
                //     "timeframe": 'this_month',
                //     "analyses": {
                //         "total_sessions":{
                //             "analysis_type":"count_unique",
                //             "target_property":"session_id"
                //         },
                //         "average_session":{
                //             "analysis_type":"average",
                //             "target_property":"session_length"
                //         }
                //     }
                // };

                // keenService.multiAnalysis(params, function(data){
                //     console.log('keen data >>> ', data);
                // });

                var params2 = {
                    "event_collection": 'page_data',
                    "timeframe": 'this_month',
                    "group_by": 'url.path',
                    "analyses": {
                        "pageviews":{
                            "analysis_type":"count_unique",
                            "target_property":"session_id"
                        },
                        "timeOnPage":{
                            "analysis_type":"sum",
                            "target_property":"session_length"
                        },
                        "avgTimeOnPage":{
                            "analysis_type":"average",
                            "target_property":"session_length"
                        },
                        "avgTimeOnPage":{
                            "analysis_type":"average",
                            "target_property":"session_length"
                        }
                    }
                };

                //ga:pageviews,ga:timeOnPage,ga:exits,ga:avgTimeOnPage,ga:entranceRate,ga:entrances,ga:exitRate,ga:uniquePageviews

                keenService.multiAnalysis(params2, function(data){
                    console.log('keen data >>> ', data);
                });


                Keen.ready(function() {


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
                            if(oldval == 0 && newval == 0) {
                                return 0;
                            }
                            var result = ((oldval - newval) / oldval) * 100;
                            if (newval < oldval) {
                                result = result;
                            }
                            return Math.round(result * 100) / 100;
                        };


                        $scope.query = function(params) {
                            return new Promise(function(resolve, reject) {
                                // dashboardService.queryGoogleAnalytics(params, function(data) {
                                //     resolve(data);
                                // });
                            });

                        };

                        $scope.stateToAbbr = function(strInput) {
                            if(strInput) {
                                var strOutput;
                                var arrStates = [
                                        {
                                            "name": "Alabama",
                                            "abbreviation": "AL"
                                        },
                                        {
                                            "name": "Alaska",
                                            "abbreviation": "AK"
                                        },
                                        {
                                            "name": "American Samoa",
                                            "abbreviation": "AS"
                                        },
                                        {
                                            "name": "Arizona",
                                            "abbreviation": "AZ"
                                        },
                                        {
                                            "name": "Arkansas",
                                            "abbreviation": "AR"
                                        },
                                        {
                                            "name": "California",
                                            "abbreviation": "CA"
                                        },
                                        {
                                            "name": "Colorado",
                                            "abbreviation": "CO"
                                        },
                                        {
                                            "name": "Connecticut",
                                            "abbreviation": "CT"
                                        },
                                        {
                                            "name": "Delaware",
                                            "abbreviation": "DE"
                                        },
                                        {
                                            "name": "District Of Columbia",
                                            "abbreviation": "DC"
                                        },
                                        {
                                            "name": "Federated States Of Micronesia",
                                            "abbreviation": "FM"
                                        },
                                        {
                                            "name": "Florida",
                                            "abbreviation": "FL"
                                        },
                                        {
                                            "name": "Georgia",
                                            "abbreviation": "GA"
                                        },
                                        {
                                            "name": "Guam",
                                            "abbreviation": "GU"
                                        },
                                        {
                                            "name": "Hawaii",
                                            "abbreviation": "HI"
                                        },
                                        {
                                            "name": "Idaho",
                                            "abbreviation": "ID"
                                        },
                                        {
                                            "name": "Illinois",
                                            "abbreviation": "IL"
                                        },
                                        {
                                            "name": "Indiana",
                                            "abbreviation": "IN"
                                        },
                                        {
                                            "name": "Iowa",
                                            "abbreviation": "IA"
                                        },
                                        {
                                            "name": "Kansas",
                                            "abbreviation": "KS"
                                        },
                                        {
                                            "name": "Kentucky",
                                            "abbreviation": "KY"
                                        },
                                        {
                                            "name": "Louisiana",
                                            "abbreviation": "LA"
                                        },
                                        {
                                            "name": "Maine",
                                            "abbreviation": "ME"
                                        },
                                        {
                                            "name": "Marshall Islands",
                                            "abbreviation": "MH"
                                        },
                                        {
                                            "name": "Maryland",
                                            "abbreviation": "MD"
                                        },
                                        {
                                            "name": "Massachusetts",
                                            "abbreviation": "MA"
                                        },
                                        {
                                            "name": "Michigan",
                                            "abbreviation": "MI"
                                        },
                                        {
                                            "name": "Minnesota",
                                            "abbreviation": "MN"
                                        },
                                        {
                                            "name": "Mississippi",
                                            "abbreviation": "MS"
                                        },
                                        {
                                            "name": "Missouri",
                                            "abbreviation": "MO"
                                        },
                                        {
                                            "name": "Montana",
                                            "abbreviation": "MT"
                                        },
                                        {
                                            "name": "Nebraska",
                                            "abbreviation": "NE"
                                        },
                                        {
                                            "name": "Nevada",
                                            "abbreviation": "NV"
                                        },
                                        {
                                            "name": "New Hampshire",
                                            "abbreviation": "NH"
                                        },
                                        {
                                            "name": "New Jersey",
                                            "abbreviation": "NJ"
                                        },
                                        {
                                            "name": "New Mexico",
                                            "abbreviation": "NM"
                                        },
                                        {
                                            "name": "New York",
                                            "abbreviation": "NY"
                                        },
                                        {
                                            "name": "North Carolina",
                                            "abbreviation": "NC"
                                        },
                                        {
                                            "name": "North Dakota",
                                            "abbreviation": "ND"
                                        },
                                        {
                                            "name": "Northern Mariana Islands",
                                            "abbreviation": "MP"
                                        },
                                        {
                                            "name": "Ohio",
                                            "abbreviation": "OH"
                                        },
                                        {
                                            "name": "Oklahoma",
                                            "abbreviation": "OK"
                                        },
                                        {
                                            "name": "Oregon",
                                            "abbreviation": "OR"
                                        },
                                        {
                                            "name": "Palau",
                                            "abbreviation": "PW"
                                        },
                                        {
                                            "name": "Pennsylvania",
                                            "abbreviation": "PA"
                                        },
                                        {
                                            "name": "Puerto Rico",
                                            "abbreviation": "PR"
                                        },
                                        {
                                            "name": "Rhode Island",
                                            "abbreviation": "RI"
                                        },
                                        {
                                            "name": "South Carolina",
                                            "abbreviation": "SC"
                                        },
                                        {
                                            "name": "South Dakota",
                                            "abbreviation": "SD"
                                        },
                                        {
                                            "name": "Tennessee",
                                            "abbreviation": "TN"
                                        },
                                        {
                                            "name": "Texas",
                                            "abbreviation": "TX"
                                        },
                                        {
                                            "name": "Utah",
                                            "abbreviation": "UT"
                                        },
                                        {
                                            "name": "Vermont",
                                            "abbreviation": "VT"
                                        },
                                        {
                                            "name": "Virgin Islands",
                                            "abbreviation": "VI"
                                        },
                                        {
                                            "name": "Virginia",
                                            "abbreviation": "VA"
                                        },
                                        {
                                            "name": "Washington",
                                            "abbreviation": "WA"
                                        },
                                        {
                                            "name": "West Virginia",
                                            "abbreviation": "WV"
                                        },
                                        {
                                            "name": "Wisconsin",
                                            "abbreviation": "WI"
                                        },
                                        {
                                            "name": "Wyoming",
                                            "abbreviation": "WY"
                                        }
                                    ];

                                for (var i = 0; i < arrStates.length; i++) {
                                    if ((arrStates[i]['name']).toLowerCase() == (strInput).toLowerCase()) {
                                                strOutput = arrStates[i]['abbreviation'];
                                            break;
                                        }
                                };
                            }

                                return strOutput || false;
                        };

                        $scope.toUTC = function(str) {
                            return Date.UTC(str.substring(0, 4), str.substring(4, 6) - 1, str.substring(6, 8));
                        };

                        var visitorLocations = new Keen.Query("count", {
                            eventCollection: "pageviews",
                            timeframe: {
                                "start" : timeframeStart,
                                "end" : timeframeEnd
                            },
                            interval: interval,
                            groupBy: "ip_geo_info.city"
                        });

                        console.log('window.location.host ', window.location.hostname);

                        var deviceReportByCategory = new Keen.Query("count", {
                            eventCollection: "session_data",
                            timeframe: {
                                "start" : timeframeStart,
                                "end" : timeframeEnd
                            },
                            groupBy: "user_agent.device",
                            filters: [{"property_name":"entrance","operator":"eq","property_value": window.location.hostname}]
                        });

                        var userReport = new Keen.Query("count_unique", {
                            eventCollection: "session_data",
                            targetProperty: "fingerprint",
                            timeframe: {
                                "start" : timeframeStart,
                                "end" : timeframeEnd
                            },
                            interval: interval,
                            filters: [{"property_name":"entrance","operator":"eq","property_value": window.location.hostname}]
                        });

                        var userReportPreviousMonth = new Keen.Query("count_unique", {
                            eventCollection: "session_data",
                            targetProperty: "fingerprint",
                            timeframe: {
                                "start" : timeframePreviousStart,
                                "end" : timeframePreviousEnd
                            },
                            interval: interval,
                            filters: [{"property_name":"entrance","operator":"eq","property_value": window.location.hostname}]
                        });

                        var pageviewsReport = new Keen.Query("count", {
                            eventCollection: "page_data",
                            timeframe: {
                                "start" : timeframeStart,
                                "end" : timeframeEnd
                            },
                            interval: interval,
                            filters: [{"property_name":"url.domain","operator":"eq","property_value": window.location.hostname}]
                        });

                        var pageviewsPreviousReport = new Keen.Query("count", {
                            eventCollection: "page_data",
                            timeframe: {
                                "start" : timeframePreviousStart,
                                "end" : timeframePreviousEnd
                            },
                            interval: interval,
                            filters: [{"property_name":"url.domain","operator":"eq","property_value": window.location.hostname}]
                        });

                        // var sessionDurationQuery = $scope.query({
                        //     ids: 'ga:82461709',
                        //     metrics: 'ga:sessions,ga:sessionDuration',
                        //     dimensions: 'ga:date',
                        //     'start-date': '30daysAgo',
                        //     'end-date': 'yesterday'
                        // });

                        // var sessionDurationPreviousQuery = $scope.query({
                        //     ids: 'ga:82461709',
                        //     metrics: 'ga:sessions,ga:sessionDuration',
                        //     dimensions: 'ga:date',
                        //     'start-date': '60daysAgo',
                        //     'end-date': '30daysAgo'
                        // });


                        var sessionsReport = new Keen.Query("count_unique", {
                            eventCollection: "session_data",
                            targetProperty: "session_id",
                            timeframe: {
                                "start" : timeframeStart,
                                "end" : timeframeEnd
                            },
                            interval: interval,
                            filters: [{"property_name":"entrance","operator":"eq","property_value": window.location.hostname}]
                        });

                        var sessionsPreviousReport = new Keen.Query("count_unique", {
                            eventCollection: "session_data",
                            targetProperty: "session_id",
                            timeframe: {
                                "start" : timeframePreviousStart,
                                "end" : timeframePreviousEnd
                            },
                            interval: interval,
                            filters: [{"property_name":"entrance","operator":"eq","property_value": window.location.hostname}]
                        });

                        var sessionLengthReport = new Keen.Query("count", {
                            eventCollection: "session_data",
                            targetProperty: "session_length",
                            timeframe: {
                                "start" : timeframeStart,
                                "end" : timeframeEnd
                            },
                            interval: interval,
                            filters: [{"property_name":"entrance","operator":"eq","property_value": window.location.hostname}]
                          });

                        var sessionAvgLengthReport = new Keen.Query("average", {
                            eventCollection: "session_data",
                            targetProperty: "session_length",
                            timeframe: {
                                "start" : timeframeStart,
                                "end" : timeframeEnd
                            },
                            filters: [{"property_name":"entrance","operator":"eq","property_value": window.location.hostname}]
                          });

                        var bouncesReport = new Keen.Query("count_unique", {
                            eventCollection: "session_data",
                            targetProperty: "session_id",
                            filters: [{"property_name":"page_length","operator":"eq","property_value":1}],
                            timeframe: {
                                "start" : timeframeStart,
                                "end" : timeframeEnd
                            },
                            interval: interval,
                            filters: [{"property_name":"entrance","operator":"eq","property_value": window.location.hostname}]
                        });

                        var bouncesPreviousReport = new Keen.Query("count_unique", {
                            eventCollection: "session_data",
                            targetProperty: "session_id",
                            filters: [{"property_name":"page_length","operator":"eq","property_value":1}],
                            timeframe: {
                                "start" : timeframeStart,
                                "end" : timeframeEnd
                            },
                            filters: [{"property_name":"entrance","operator":"eq","property_value": window.location.hostname}]
                        });

                        var trafficSources = new Keen.Query("count_unique", {
                            eventCollection: "session_data",
                            targetProperty: "session_id",
                            groupBy: "source_type",
                            timeframe: {
                                "start" : timeframeStart,
                                "end" : timeframeEnd
                            },
                            filters: [{"property_name":"entrance","operator":"eq","property_value": window.location.hostname}]
                        });

                        var returningVisitors = new Keen.Query("count_unique", {
                            eventCollection: "session_data",
                            targetProperty: "permanent_tracker",
                            timeframe: {
                                "start" : timeframeStart,
                                "end" : timeframeEnd
                            },
                            filters: [{"property_name":"entrance","operator":"eq","property_value": window.location.hostname}, {"property_name":"new_visitor","operator":"eq","property_value":false}]
                        });

                        var newVisitors = new Keen.Query("count_unique", {
                            eventCollection: "session_data",
                            targetProperty: "permanent_tracker",
                            timeframe: {
                                "start" : timeframeStart,
                                "end" : timeframeEnd
                            },
                            filters: [{"property_name":"entrance","operator":"eq","property_value": window.location.hostname}, {"property_name":"new_visitor","operator":"eq","property_value":true}]
                        });

                        // var topPageViews = $scope.query({
                        //     ids: 'ga:82461709',
                        //     metrics: 'ga:pageviews,ga:uniquePageviews,ga:avgTimeOnPage,ga:entrances,ga:bounceRate,ga:exitRate',
                        //     dimensions: 'ga:pagePath',
                        //     'start-date': '30daysAgo',
                        //     'end-date': 'yesterday'
                        // });

                        var visitorLocations = new Keen.Query("count", {
                            eventCollection: "session_data",
                            targetProperty: "permanent_tracker",
                            groupBy: "ip_geo_info.province",
                            timeframe: {
                                "start" : timeframeStart,
                                "end" : timeframeEnd
                            },
                            filters: [{"property_name":"entrance","operator":"eq","property_value": window.location.hostname},{"property_name":"ip_geo_info","operator":"ne","property_value":"null"}]
                        });

                        //ga:pageviews,ga:timeOnPage,ga:exits,ga:avgTimeOnPage,ga:entranceRate,ga:entrances,ga:exitRate,ga:uniquePageviews

                        $scope.newDesktop = false;

                        $scope.$watch('desktop', function() {
                            $scope.newDesktop = true;
                            setTimeout(function() {
                                $scope.newDesktop = false;
                            }, 100);
                        });

                        $scope.firstQuery = true;
                        var totalVisitors = 0;
                        var readyVisitorsData = [];
                        $scope.totalPageviews = 0;
                        $scope.readyPageviewsData = [];

                        $scope.sessions = 0;
                        $scope.sessionsData = [];

                        $scope.bounces = 0;
                        $scope.bouncesData = [];

                        $scope.totalTypes = 0;
                        $scope.trafficSourceData = [];

                        $scope.runReports = function() {
                            client.run([
                                visitorLocations,
                                deviceReportByCategory,
                                userReport,
                                userReportPreviousMonth,
                                pageviewsReport,
                                pageviewsPreviousReport,
                                sessionsReport,
                                sessionsPreviousReport,
                                sessionLengthReport,
                                sessionAvgLengthReport,
                                bouncesReport,
                                bouncesPreviousReport,
                                trafficSources,
                                returningVisitors,
                                newVisitors,
                                visitorLocations
                                ], function(results) {

                                // ======================================
                                // Visitor Location Popularity
                                // ======================================
                                // console.log('results >>> ', results);
                                // var response = results[0];
                                // var data = [
                                //     ['Country', 'Popularity']
                                // ];
                                // var subData = [];
                                // for (var i = 0; i < response.rows.length; i++) {
                                //     subData.push(response.rows[i][0], parseInt(response.rows[i][1]));
                                //     data.push(subData);
                                //     subData = [];
                                // };
                                // var data = google.visualization.arrayToDataTable(data);

                                // var options = {
                                //     region: 'US',
                                //     colorAxis: {
                                //         minValue: 0,
                                //         colors: ['#5ccae0', '#3c92a4']
                                //     },
                                //     resolution: "provinces",
                                //     width: '100%'
                                // };

                                // var chart = new google.visualization.GeoChart(document.getElementById('location'));

                                // chart.draw(data, options);

                                // // ----------------------------------------
                                // // Device
                                // // ----------------------------------------

                                $scope.desktop = 0;
                                $scope.mobile = 0;

                                for (var i = 0; i < results[1].result.length; i++) {
                                    var category = results[1].result[i]['user_agent.device'];
                                    if (category === 'desktop') {
                                        $scope.$apply(function(){
                                            $scope.desktop = results[1].result[i].result;
                                        });
                                    }
                                    if (category === 'mobile') {
                                        $scope.currentMobile = results[1].result[i].result;
                                    }
                                };

                                // ----------------------------------------
                                // Visitors
                                // ----------------------------------------

                                var visitorsData = [];
                                var currentTotalVisitors = 0;
                                for (var k = 0; k < results[2].result.length; k++) {
                                    var subArr = [];
                                    var value = results[2].result[k].value || 0;
                                    currentTotalVisitors += value;
                                    subArr.push(new Date(results[2].result[k].timeframe.start).getTime());
                                    subArr.push(value);
                                    visitorsData.push(subArr);
                                };

                                if (currentTotalVisitors > totalVisitors) {
                                    totalVisitors = currentTotalVisitors;
                                    $scope.visitors = totalVisitors;
                                    readyVisitorsData = visitorsData;
                                    if ($scope.firstQuery) {
                                        readyVisitorsData = visitorsData;
                                    } else {
                                        $scope.analyticsOverviewConfig.series[2].data = visitorsData;
                                    }
                                }

                                var vistorsPreviousData = 0;
                                for (var h = 0; h < results[3].result.length; h++) {
                                    var value = results[3].result[h].value || 0;
                                    vistorsPreviousData += value;
                                };

                                $scope.visitorsPercent = $scope.calculatePercentage($scope.visitors, vistorsPreviousData);

                                // ----------------------------------------
                                // Pageviews Metric
                                // ----------------------------------------

                                $scope.pageviewsData = [];
                                $scope.currentTotalPageviews = 0;
                                for (var j = 0; j < results[4].result.length; j++) {
                                    var subArr = [];
                                    var value = results[4].result[j].value || 0;
                                    $scope.currentTotalPageviews += value;
                                    subArr.push(new Date(results[4].result[j].timeframe.start).getTime());
                                    subArr.push(value);
                                    $scope.pageviewsData.push(subArr);
                                };

                                if ($scope.currentTotalPageviews > $scope.totalPageviews) {
                                    $scope.totalPageviews = $scope.currentTotalPageviews;
                                    $scope.pageviews = $scope.totalPageviews;
                                    if ($scope.firstQuery) {
                                        $scope.readyPageviewsData = $scope.pageviewsData;
                                    } else {
                                        $scope.analyticsOverviewConfig.series[0].data = $scope.pageviewsData;
                                    }
                                }

                                var pageviewsPreviousData = 0;
                                for (var r = 0; r < results[5].result.length; r++) {
                                    var value = results[5].result[r].value || 0;
                                    pageviewsPreviousData += value;
                                };

                                $scope.pageviewsPercent = $scope.calculatePercentage($scope.currentTotalPageviews, pageviewsPreviousData);

                                // ----------------------------------------
                                // Sessions
                                // ----------------------------------------

                                _sessionsData = [];
                                _totalSessions = 0;
                                for (var j = 0; j < results[6].result.length; j++) {
                                    var subArr = [];
                                    var value = results[6].result[j].value || 0;
                                    _totalSessions += value;
                                    subArr.push(new Date(results[6].result[j].timeframe.start).getTime());
                                    subArr.push(value);
                                    _sessionsData.push(subArr);
                                };

                                if (_totalSessions > $scope.sessions) {
                                    $scope.sessions = _totalSessions;
                                    if ($scope.firstQuery) {
                                        $scope.sessionsData = _sessionsData;
                                    } else {
                                        $scope.analyticsOverviewConfig.series[1].data = _sessionsData;
                                    }
                                }

                                $scope.visitDuration = $scope.secToTime(results[9].result / 1000);

                                // ----------------------------------------
                                // Average Visit Duration
                                // ----------------------------------------

                                // console.log('previous session >>> ', results[7]);
                                // console.log('avg session length >>> ', results[8]);

                                // ----------------------------------------
                                // Session Duration
                                // ----------------------------------------

                                _sessionsData = [];
                                _totalSessions = 0;
                                for (var j = 0; j < results[6].result.length; j++) {
                                    var subArr = [];
                                    var value = results[6].result[j].value || 0;
                                    _totalSessions += value;
                                    subArr.push(new Date(results[6].result[j].timeframe.start).getTime());
                                    subArr.push(value);
                                    _sessionsData.push(subArr);
                                };

                                if (_totalSessions > $scope.sessions) {
                                    $scope.sessions = _totalSessions;
                                    if ($scope.firstQuery) {
                                        $scope.sessionsData = _sessionsData;
                                    } else {
                                        $scope.analyticsOverviewConfig.series[1].data = _sessionsData;
                                    }
                                }

                                // ======================================
                                // Bounces
                                // ======================================

                                var _bouncesData = [];
                                var _totalBounces = 0;
                                for (var r = 0; r < results[10].result.length; r++) {
                                    var subArr = [];
                                    var value = results[10].result[r].value || 0;
                                    _totalBounces += value;
                                    subArr.push(new Date(results[10].result[r].timeframe.start).getTime());
                                    subArr.push(value);
                                    _bouncesData.push(subArr);
                                };

                                if (_totalBounces >= $scope.bounces) {
                                    $scope.bounces = _totalBounces;
                                    if ($scope.firstQuery) {
                                        $scope.bouncesData = _bouncesData;
                                    } else {
                                        $scope.timeonSiteConfig.series[1].data = _bouncesData;
                                    }
                                }

                                $scope.bouncesPercent = $scope.calculatePercentage(_totalBounces, results[11].result);

                                // ======================================
                                    // Traffic Sources
                                    // ======================================

                                    var _trafficSourceData = [];
                                    var _totalTypes = 0;
                                    console.log('result[12] >>> ', results[12].result);
                                    for (var i = 0; i < results[12].result.length; i++) {
                                        var subObj = [];
                                        if (results[12].result[i].source_type) {
                                            subObj.push(results[12].result[i].source_type.charAt(0).toUpperCase() + results[12].result[i].source_type.slice(1));
                                        } else {
                                            subObj.push('Other');
                                        }
                                        subObj.push(results[12].result[i].result);
                                        _totalTypes += results[12].result[i].result;
                                        _trafficSourceData.push(subObj);
                                    };

                                    if (_totalTypes >= $scope.totalTypes) {
                                        $scope.totalTypes = _totalTypes;
                                        if ($scope.firstQuery) {
                                            $scope.totalTypes = _totalTypes;
                                            $scope.trafficSourceData = _trafficSourceData;
                                        } else {
                                            $scope.trafficSourcesConfig.series[0].data = _trafficSourceData;
                                        }
                                    }

                                // ======================================
                                // New vs. Returning Customers
                                // ======================================

                                $scope.newVsReturning = [
                                    ['New', results[14].result],
                                    ['Returning', results[13].result]
                                ];


                                // ======================================
                                // Content
                                // Time on Site, Bounces
                                // ======================================

                                // $scope.do = function($event) {
                                //     $event.preventDefault();
                                // };

                                // ======================================
                                // Visitor Locations
                                // ======================================

                                console.log('results[15].result >>> ', results[15].result);

                                $scope.locationData = [];

                                for (var i = 0; i < results[15].result.length; i++) {
                                    var subObj = {};
                                    subObj.code = $scope.stateToAbbr( results[15].result[i]['ip_geo_info.province'] );
                                    subObj.value = results[15].result[i].result;
                                    $scope.locationData.push(subObj);
                                };

                                console.log('$scope.locationData >>> ', $scope.locationData);


                                if($scope.firstQuery) {
                                    ngProgress.complete();
                                    $scope.renderAnalyticsChart();
                                    $scope.firstQuery = false;
                                }
                            });
                        };

                        $scope.runReports();

                        window.setInterval(function(){
                            $scope.runReports();
                        }, 5000);

                        // ======================================
                        // Overview
                        // Pageviews, Visits, Vistors
                        // ======================================

                        $scope.renderAnalyticsChart = function() {

                                $scope.analyticsOverviewConfig = {
                                    options: {
                                        chart: {
                                            height: 300,
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
                                        data: $scope.readyPageviewsData
                                    }, {
                                        name: 'Visits',
                                        data: $scope.sessionsData
                                    }, {
                                        name: 'Visitors',
                                        data: readyVisitorsData
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
                                        data: $scope.bouncesData
                                    }, {
                                        name: 'Bounces',
                                        data: $scope.bouncesData
                                    }],
                                    credits: {
                                        enabled: false
                                    }
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
                                            data: $scope.trafficSourceData
                                        }],
                                        credits: {
                                            enabled: false
                                        }
                                };

                                $scope.newVsReturningConfig = {

                                    options: {
                                        chart: {
                                        },
                                        colors: ['#41b0c7', '#fcb252', '#309cb2', '#f8cc49', '#f8d949'],
                                        title: {
                                            text: ''
                                        },
                                        exporting: {
                                            enabled: false
                                        }
                                    },
                                    plotOptions: {
                                        pie: {
                                            allowPointSelect: true,
                                            cursor: 'pointer',
                                            dataLabels: {
                                                enabled: true,
                                                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                                                style: {
                                                    color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                                                }
                                            }
                                        }
                                    },
                                    series: [{
                                        type: 'pie',
                                        name: 'Browser share',
                                        data: $scope.newVsReturning
                                    }],
                                    yAxis: {
                                        title: {
                                            text: 'Visitors'
                                        }
                                    },
                                    credits: {
                                        enabled: false
                                    }
                                };

                                var data = [{"value":438,"code":"NJ"},{"value":387.35,"code":"RI"},{"value":312.68,"code":"MA"},{"value":271.4,"code":"CT"},{"value":209.23,"code":"MD"},{"value":195.18,"code":"NY"},{"value":154.87,"code":"DE"},{"value":114.43,"code":"FL"},{"value":107.05,"code":"OH"},{"value":105.8,"code":"PA"},{"value":86.27,"code":"IL"},{"value":83.85,"code":"CA"},{"value":72.83,"code":"HI"},{"value":69.03,"code":"VA"},{"value":67.55,"code":"MI"},{"value":65.46,"code":"IN"},{"value":63.8,"code":"NC"},{"value":54.59,"code":"GA"},{"value":53.29,"code":"TN"},{"value":53.2,"code":"NH"},{"value":51.45,"code":"SC"},{"value":39.61,"code":"LA"},{"value":39.28,"code":"KY"},{"value":38.13,"code":"WI"},{"value":34.2,"code":"WA"},{"value":33.84,"code":"AL"},{"value":31.36,"code":"MO"},{"value":30.75,"code":"TX"},{"value":29,"code":"WV"},{"value":25.41,"code":"VT"},{"value":23.86,"code":"MN"},{"value":23.42,"code":"MS"},{"value":20.22,"code":"IA"},{"value":19.82,"code":"AR"},{"value":19.4,"code":"OK"},{"value":17.43,"code":"AZ"},{"value":16.01,"code":"CO"},{"value":15.95,"code":"ME"},{"value":13.76,"code":"OR"},{"value":12.69,"code":"KS"},{"value":10.5,"code":"UT"},{"value":8.6,"code":"NE"},{"value":7.03,"code":"NV"},{"value":6.04,"code":"ID"},{"value":5.79,"code":"NM"},{"value":3.84,"code":"SD"},{"value":3.59,"code":"ND"},{"value":2.39,"code":"MT"},{"value":1.96,"code":"WY"},{"value":0.42,"code":"AK"}];

                                var chart1 = new Highcharts.Map({
                                     chart : {
                                            renderTo: 'visitor_locations'
                                        },

                                        title : {
                                            text : ''
                                        },

                                        legend: {
                                            layout: 'horizontal',
                                            borderWidth: 0,
                                            backgroundColor: 'rgba(255,255,255,0.85)',
                                            floating: true,
                                            verticalAlign: 'top',
                                            y: 25
                                        },

                                        exporting: {
                                            enabled: false
                                        },

                                        mapNavigation: {
                                            enabled: true
                                        },

                                        colorAxis: {
                                            min: 1,
                                            type: 'logarithmic',
                                            minColor: '#4cb0ca',
                                            maxColor: '#224f5b'
                                        },

                                        series : [{
                                            animation: {
                                                duration: 1000
                                            },
                                            data : $scope.locationData,
                                            mapData: Highcharts.maps['countries/us/us-all'],
                                            joinBy: ['postal-code', 'code'],
                                            dataLabels: {
                                                enabled: true,
                                                color: 'white',
                                                format: '{point.code}'
                                            },
                                            name: '# of Visitors',
                                            tooltip: {
                                                pointFormat: '{point.code}: {point.value}'
                                            }
                                        }],
                                        credits: {
                                            enabled: false
                                        }
                                });
                        };


                        // $scope.secondGACall = function() {

                        //     setTimeout(function() {

                        //         var topPageViews = $scope.query({
                        //             ids: 'ga:82461709',
                        //             metrics: 'ga:pageviews,ga:uniquePageviews,ga:avgTimeOnPage,ga:entrances,ga:bounceRate,ga:exitRate',
                        //             dimensions: 'ga:pagePath',
                        //             'start-date': '30daysAgo',
                        //             'end-date': 'yesterday'
                        //         });

                        //         //ga:pageviews,ga:timeOnPage,ga:exits,ga:avgTimeOnPage,ga:entranceRate,ga:entrances,ga:exitRate,ga:uniquePageviews

                        //         var trafficSources = $scope.query({
                        //             ids: 'ga:82461709',
                        //             metrics: 'ga:sessions',
                        //             dimensions: 'ga:trafficType',
                        //             'start-date': '30daysAgo',
                        //             'end-date': 'yesterday'
                        //         });

                        //         Promise.all([newVsReturningChart, topPageViews, trafficSources]).then(function(results) {



                        //             ngProgress.complete();

                        //             // ----------------------------------------
                        //             // Top Pageviews
                        //             // ----------------------------------------

                        //             $scope.topPages = results[1].rows;

                        //             var output = [];

                        //             for (var i = 0; i < $scope.topPages.length; i++) {
                        //                 var singleRow = $scope.topPages[i];
                        //                 var subObj = {};
                        //                 for (var k = 0; k < singleRow.length; k++) {
                        //                     if (k == 0) {
                        //                         subObj.page = singleRow[k]
                        //                     }
                        //                     if (k == 1) {
                        //                         subObj.pageviews = parseInt(singleRow[k])
                        //                     }
                        //                     if (k == 2) {
                        //                         subObj.uniquePageviews = parseInt(singleRow[k])
                        //                     }
                        //                     if (k == 3) {
                        //                         subObj.avgTime = parseInt(singleRow[k])
                        //                     }
                        //                     if (k == 4) {
                        //                         subObj.entrances = parseInt(singleRow[k])
                        //                     }
                        //                     if (k == 5) {
                        //                         subObj.bounceRate = parseInt(singleRow[k])
                        //                     }
                        //                     if (k == 6) {
                        //                         subObj.exitRate = parseInt(singleRow[k])
                        //                     }
                        //                 };
                        //                 if (subObj) {
                        //                     output.push(subObj);
                        //                 }
                        //             };


                        //             $scope.formattedTopPages = output;
                        //             $scope.pagedformattedTopPages = $scope.formattedTopPages.slice(0, $scope.pageLimit);

                        //             // ======================================
                        //             // Traffic Sources
                        //             // ======================================

                        //             var dataObjArr = [];

                        //             for (var i = 0; i < results[2].rows.length; i++) {
                        //                 results[2].rows[i][1] = parseInt(results[2].rows[i][1]);
                        //                 results[2].rows[i][0] = results[2].rows[i][0].charAt(0).toUpperCase() + results[2].rows[i][0].slice(1);
                        //             };

                        //             $scope.trafficSourcesConfig = {
                        //                 options: {
                        //                     chart: {
                        //                         plotBackgroundColor: null,
                        //                         plotBorderWidth: 0,
                        //                         plotShadow: false,
                        //                         spacing: [25, 25, 25, 25]
                        //                     },
                        //                     title: {
                        //                         text: ''
                        //                     },
                        //                     tooltip: {
                        //                         pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                        //                     },
                        //                     plotOptions: {
                        //                         pie: {
                        //                             dataLabels: {
                        //                                 enabled: true,
                        //                                 distance: -50,
                        //                                 style: {
                        //                                     fontWeight: 'bold',
                        //                                     color: 'white',
                        //                                     textShadow: '0px 1px 2px black'
                        //                                 }
                        //                             },
                        //                             colors: ['#41b0c7', '#fcb252', '#309cb2', '#f8cc49', '#f8d949']
                        //                         }
                        //                     },
                        //                     exporting: {
                        //                         enabled: false
                        //                     }
                        //                 },
                        //                 series: [{
                        //                     type: 'pie',
                        //                     name: 'Traffic Source',
                        //                     innerSize: '40%',
                        //                     data: results[2].rows
                        //                 }],
                        //                 credits: {
                        //                     enabled: false
                        //                 }
                        //             };

                        //             setTimeout(function() {
                        //                 $scope.trafficSourcesConfig.options.chart.width = (document.getElementById('main-viewport').offsetWidth / 3) - 30;
                        //             }, 500);
                        //         });

                        //     }, 1000);
                        // };




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

    }]);
});
