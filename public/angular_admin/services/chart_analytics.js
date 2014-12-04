define(['app', 'keenService'], function(app) {
    app.register.service('ChartAnalyticsService', ['keenService', function(keenService) {

        //common functions

        this.secToTime = function(duration) {
                var minutes = parseInt(Math.floor(duration / 60));
                var seconds = parseInt(duration - minutes * 60);

                minutes = (minutes < 10) ? "0" + minutes : minutes;
                seconds = (seconds < 10) ? "0" + seconds : seconds;

                return minutes + ":" + seconds;
        };

        this.calculatePercentage = function(oldval, newval) {
            console.log('Calculating Percentage >>>');
            var result;
            oldval = parseInt(oldval);
            newval = parseInt(newval);
            console.log('oldval >>> ', oldval);
            console.log('newval >>> ', newval);
            if(oldval == 0 && newval == 0) {
                return 0;
            }
            if (newval < oldval) {
                result = ((oldval - newval) / oldval) * 100;
            } else {
                result = ((newval - oldval) / newval) * 100;
            }

            if (newval === oldval) {
                result = 100;
            }
            console.log('result >>> ', result);
            console.log('formated >>> ', Math.round(result * 100) / 100);
            return Math.round(result * 100) / 100;
        };

        this.stateToAbbr = function(strInput) {
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

        // $scope.toUTC = function(str) {
        //     return Date.UTC(str.substring(0, 4), str.substring(4, 6) - 1, str.substring(6, 8));
        // };

        // $scope.countDuplicates = function(array_elements) {
        //     array_elements.sort();
        //     var duplicates = [];
        //     var current = null;
        //     var cnt = 0;
        //     for (var i = 0; i < array_elements.length; i++) {
        //         var subObj = {};
        //         if (array_elements[i] != current) {
        //             if (cnt > 0) {
        //                 subObj.depth = current;
        //                 subObj.count = cnt;
        //                 duplicates.push(subObj);
        //             }
        //             current = array_elements[i];
        //             cnt = 1;
        //         } else {
        //             cnt++;
        //         }
        //     }

        //     //fill in blank numbers and anything > 20 add together
        //     var over20count = 0;
        //     duplicates = _.sortBy( duplicates, 'depth' );

        //     for (var k = 0; k < 20; k++) {
        //         var subObj = {};

        //         if (duplicates[k]){


        //             // if(array_elements.indexOf(duplicates[k].depth) === -1 && duplicates[k].depth < 20) {
        //             //     subObj.depth = k+1;
        //             //     subObj.count = 0;
        //             //     duplicates.push(subObj);
        //             // } else if (duplicates[k].depth >= 20) {
        //             //     over20count += duplicates[k].count;
        //             //     duplicates.splice(k,1);
        //             // }
        //         }
        //     };

        //     if (over20count > 0) {
        //         var subObj = {};
        //         subObj.depth = 20;
        //         subObj.count = over20count;
        //         duplicates.push(subObj);
        //     }

        //     duplicates = _.sortBy( duplicates, 'depth' );

        //     return duplicates;
        // };

        //local variables
        var client;
        var timeframeStart = '2014-11-15T23:05:20.075Z';
        var timeframeEnd = '2014-12-14T23:05:20.075Z';
        var timeframePreviousStart = '2014-10-15T23:05:20.075Z';
        var timeframePreviousEnd = '2014-11-14T23:05:20.075Z';
        var interval = "daily";
        var firstQuery = true;
        var totalVisitors = 0;

        //reports

        this.queryReports = function() {
            var queryData = {};

            console.log('window.location.hostname >>> ', window.location.hostname);


                queryData.visitorLocations = new Keen.Query("count", {
                    eventCollection: "page_data",
                    timeframe: {
                        "start" : timeframeStart,
                        "end" : timeframeEnd
                    },
                    interval: interval,
                    groupBy: "ip_geo_info.city"
                });

                queryData.deviceReportByCategory = new Keen.Query("count", {
                    eventCollection: "session_data",
                    timeframe: {
                        "start" : timeframeStart,
                        "end" : timeframeEnd
                    },
                    groupBy: "user_agent.device",
                    filters: [{"property_name":"referrer.domain","operator":"eq","property_value": window.location.hostname}]
                });

                queryData.userReport = new Keen.Query("count_unique", {
                    eventCollection: "session_data",
                    targetProperty: "fingerprint",
                    timeframe: {
                        "start" : timeframeStart,
                        "end" : timeframeEnd
                    },
                    interval: interval,
                    filters: [{"property_name":"referrer.domain","operator":"eq","property_value": window.location.hostname}]
                });

                queryData.userReportPreviousMonth = new Keen.Query("count_unique", {
                    eventCollection: "session_data",
                    targetProperty: "fingerprint",
                    timeframe: {
                        "start" : timeframePreviousStart,
                        "end" : timeframePreviousEnd
                    },
                    interval: interval,
                    filters: [{"property_name":"referrer.domain","operator":"eq","property_value": window.location.hostname}]
                });

                queryData.pageviewsReport = new Keen.Query("count", {
                    eventCollection: "page_data",
                    timeframe: {
                        "start" : timeframeStart,
                        "end" : timeframeEnd
                    },
                    interval: interval,
                    filters: [{"property_name":"url.domain","operator":"eq","property_value": window.location.hostname}]
                });

                queryData.pageviewsPreviousReport = new Keen.Query("count", {
                    eventCollection: "page_data",
                    timeframe: {
                        "start" : timeframePreviousStart,
                        "end" : timeframePreviousEnd
                    },
                    interval: interval,
                    filters: [{"property_name":"url.domain","operator":"eq","property_value": window.location.hostname}]
                });

                queryData.sessionsReport = new Keen.Query("count_unique", {
                    eventCollection: "session_data",
                    targetProperty: "session_id",
                    timeframe: {
                        "start" : timeframeStart,
                        "end" : timeframeEnd
                    },
                    interval: interval,
                    filters: [{"property_name":"referrer.domain","operator":"eq","property_value": window.location.hostname}]
                });

                queryData.sessionsPreviousReport = new Keen.Query("count_unique", {
                    eventCollection: "session_data",
                    targetProperty: "session_id",
                    timeframe: {
                        "start" : timeframePreviousStart,
                        "end" : timeframePreviousEnd
                    },
                    interval: interval,
                    filters: [{"property_name":"referrer.domain","operator":"eq","property_value": window.location.hostname}]
                });

                queryData.sessionLengthReport = new Keen.Query("count", {
                    eventCollection: "session_data",
                    targetProperty: "session_length",
                    timeframe: {
                        "start" : timeframeStart,
                        "end" : timeframeEnd
                    },
                    interval: interval,
                    filters: [{"property_name":"referrer.domain","operator":"eq","property_value": window.location.hostname}]
                  });

                queryData.sessionAvgLengthReport = new Keen.Query("average", {
                    eventCollection: "session_data",
                    targetProperty: "session_length",
                    timeframe: {
                        "start" : timeframeStart,
                        "end" : timeframeEnd
                    },
                    filters: [{"property_name":"referrer.domain","operator":"eq","property_value": window.location.hostname}]
                  });

                queryData.bouncesReport = new Keen.Query("count_unique", {
                    eventCollection: "session_data",
                    targetProperty: "session_id",
                    filters: [{"property_name":"page_length","operator":"eq","property_value":1}],
                    timeframe: {
                        "start" : timeframeStart,
                        "end" : timeframeEnd
                    },
                    interval: interval,
                    filters: [{"property_name":"referrer.domain","operator":"eq","property_value": window.location.hostname}]
                });

                queryData.bouncesPreviousReport = new Keen.Query("count_unique", {
                    eventCollection: "session_data",
                    targetProperty: "session_id",
                    filters: [{"property_name":"page_length","operator":"eq","property_value":1}],
                    timeframe: {
                        "start" : timeframeStart,
                        "end" : timeframeEnd
                    },
                    filters: [{"property_name":"referrer.domain","operator":"eq","property_value": window.location.hostname}]
                });

                queryData.trafficSources = new Keen.Query("count_unique", {
                    eventCollection: "session_data",
                    targetProperty: "session_id",
                    groupBy: "source_type",
                    timeframe: {
                        "start" : timeframeStart,
                        "end" : timeframeEnd
                    },
                    filters: [{"property_name":"referrer.domain","operator":"eq","property_value": window.location.hostname}]
                });

                queryData.returningVisitors = new Keen.Query("count_unique", {
                    eventCollection: "session_data",
                    targetProperty: "permanent_tracker",
                    timeframe: {
                        "start" : timeframeStart,
                        "end" : timeframeEnd
                    },
                    filters: [{"property_name":"referrer.domain","operator":"eq","property_value": window.location.hostname}, {"property_name":"new_visitor","operator":"eq","property_value":false}]
                });

                queryData.newVisitors = new Keen.Query("count_unique", {
                    eventCollection: "session_data",
                    targetProperty: "permanent_tracker",
                    timeframe: {
                        "start" : timeframeStart,
                        "end" : timeframeEnd
                    },
                    filters: [{"property_name":"referrer.domain","operator":"eq","property_value": window.location.hostname}, {"property_name":"new_visitor","operator":"eq","property_value":true}]
                });

                queryData.visitorLocations = new Keen.Query("count", {
                    eventCollection: "session_data",
                    targetProperty: "permanent_tracker",
                    groupBy: "ip_geo_info.province",
                    timeframe: {
                        "start" : timeframeStart,
                        "end" : timeframeEnd
                    },
                    filters: [{"property_name":"referrer.domain","operator":"eq","property_value": window.location.hostname},{"property_name":"ip_geo_info","operator":"ne","property_value":"null"}]
                });

                queryData.pageDepth = new Keen.Query("count", {
                    eventCollection: "page_data",
                    groupBy: "session_id",
                    timeframe: {
                        "start" : timeframeStart,
                        "end" : timeframeEnd
                    },
                    filters: [{"property_name":"url.domain","operator":"eq","property_value": window.location.hostname}]
                });

            return queryData;
        };

        this.runReports = function(fn) {
            var self = this;

            var reportData = {};
            var params2 = {
                event_collection: 'page_data',
                analyses: {
                    "pageviews":{"analysis_type":"count"},
                    "uniquePageviews":{"analysis_type":"count_unique","target_property":"session_id"},
                    "timeOnPage":{"analysis_type":"sum","target_property":"timeOnPage"},
                    "avgTimeOnPage":{"analysis_type":"average","target_property":"timeOnPage"},
                    "entrances":{"analysis_type":"count","target_property":"entrance"},
                    "exits":{"analysis_type":"count","target_property":"exit"}
                },
                timeframe: {"start":timeframeStart,"end":timeframeEnd},
                group_by: 'url.path'
            };

            keenService.multiAnalysis(params2, function(multidata){
                var formattedTopPages = [];
                var pagedformattedTopPages;

                // ----------------------------------------
                // Top Pageviews
                // ----------------------------------------

                for (var i = 0; i < multidata.result.length; i++) {
                    var singleRow = multidata.result[i];
                    var subObj = {};

                    if (singleRow['url.path']) {
                        subObj.page = singleRow['url.path'];
                        subObj.pageviews = singleRow['pageviews'];
                        subObj.avgTime = Math.abs(singleRow['avgTimeOnPage'])/1000;
                        subObj.uniquePageviews = singleRow['uniquePageviews'];
                        //TODO
                        //subObj.entrances = singleRow['entrances'];
                        //subObj.bounceRate = singleRow['bounces']/singleRow['pageviews'];
                        //subObj.exitRate = self.calculatePercentage(singleRow['exits'], currentTotalPageviews);
                    }
                    if (subObj) {
                        formattedTopPages.push(subObj);
                    }
                };

                pagedformattedTopPages = formattedTopPages.slice(0, 15);

                reportData.formattedTopPages = formattedTopPages;
                reportData.pagedformattedTopPages = pagedformattedTopPages;
            });

            keenService.keenClient(function(client) {
                var queryData = self.queryReports();
                client.run([
                    queryData.visitorLocations,
                    queryData.deviceReportByCategory,
                    queryData.userReport,
                    queryData.userReportPreviousMonth,
                    queryData.pageviewsReport,
                    queryData.pageviewsPreviousReport,
                    queryData.sessionsReport,
                    queryData.sessionsPreviousReport,
                    queryData.sessionLengthReport,
                    queryData.sessionAvgLengthReport,
                    queryData.bouncesReport,
                    queryData.bouncesPreviousReport,
                    queryData.trafficSources,
                    queryData.returningVisitors,
                    queryData.newVisitors,
                    queryData.visitorLocations,
                    queryData.pageDepth
                ], function(results) {

                    // ----------------------------------------
                    // Device
                    // ----------------------------------------

                    var desktop, mobile;

                    for (var i = 0; i < results[1].result.length; i++) {
                        var category = results[1].result[i]['user_agent.device'];
                        if (category === 'desktop') {
                            desktop = results[1].result[i].result;
                        }
                        if (category === 'mobile') {
                            mobile = results[1].result[i].result;
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

                    // var readyVisitorsData = [];
                    // if (currentTotalVisitors > totalVisitors) {
                    //     totalVisitors = currentTotalVisitors;
                    //     readyVisitorsData = visitorsData;
                    //     if (firstQuery) {
                    //         readyVisitorsData = visitorsData;
                    //     } else {
                    //         $scope.analyticsOverviewConfig.series[2].data = visitorsData;
                    //     }
                    // }

                    var vistorsPreviousData = 0;
                    for (var h = 0; h < results[3].result.length; h++) {
                        var value = results[3].result[h].value || 0;
                        vistorsPreviousData += value;
                    };

                    console.log('currentTotalVisitors >>> ', currentTotalVisitors);

                    console.log('vistorsPreviousData >>> ', vistorsPreviousData);

                    var visitorsPercent = self.calculatePercentage(vistorsPreviousData, currentTotalVisitors);

                    // ----------------------------------------
                    // Pageviews Metric
                    // ----------------------------------------

                    var pageviewsData = [];
                    var currentTotalPageviews = 0;
                    for (var j = 0; j < results[4].result.length; j++) {
                        var subArr = [];
                        var value = results[4].result[j].value || 0;
                        currentTotalPageviews += value;
                        subArr.push(new Date(results[4].result[j].timeframe.start).getTime());
                        subArr.push(value);
                        pageviewsData.push(subArr);
                    };

                    // if ($scope.currentTotalPageviews > $scope.totalPageviews) {
                    //     $scope.totalPageviews = $scope.currentTotalPageviews;
                    //     $scope.pageviews = $scope.totalPageviews;
                    //     if ($scope.firstQuery) {
                    //         $scope.readyPageviewsData = $scope.pageviewsData;
                    //     } else {
                    //         $scope.analyticsOverviewConfig.series[0].data = $scope.pageviewsData;
                    //     }
                    // }

                    var pageviewsPreviousData = 0;
                    for (var r = 0; r < results[5].result.length; r++) {
                        var value = results[5].result[r].value || 0;
                        pageviewsPreviousData += value;
                    };

                    var pageviewsPercent = self.calculatePercentage(currentTotalPageviews, pageviewsPreviousData);

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

                    // if (_totalSessions > $scope.sessions) {
                    //     $scope.sessions = _totalSessions;
                    //     if ($scope.firstQuery) {
                    //         $scope.sessionsData = _sessionsData;
                    //     } else {
                    //         $scope.analyticsOverviewConfig.series[1].data = _sessionsData;
                    //     }
                    // }

                    var sessionsPreviousData = 0;
                    for (var w = 0; w < results[7].result.length; w++) {
                        var value = results[7].result[w].value || 0;
                        sessionsPreviousData += value;
                    };

                    var sessionsPercent = self.calculatePercentage(_totalSessions, sessionsPreviousData);

                    var visitDuration = self.secToTime(results[9].result / 1000);

                    // ----------------------------------------
                    // Average Visit Duration
                    // ----------------------------------------

                    console.log('previous session >>> ', results[7]);
                    console.log('avg session length >>> ', results[8]);

                    var avgSessionData = [];
                    for (var b = 0; b < results[8].result.length; b++) {
                        var subArr = [];
                        var value = results[8].result[b].value || 0;
                        subArr.push(new Date(results[8].result[b].timeframe.start).getTime());
                        subArr.push(value);
                        avgSessionData.push(subArr);
                    };


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

                    // if (_totalBounces >= $scope.bounces) {
                    //     $scope.bounces = _totalBounces;
                    //     if ($scope.firstQuery) {
                    //         $scope.bouncesData = _bouncesData;
                    //     } else {
                    //         $scope.timeonSiteConfig.series[1].data = _bouncesData;
                    //     }
                    // }

                    var bouncesPercent = self.calculatePercentage(_totalBounces, results[11].result);

                    // // ======================================
                    // // Traffic Sources
                    // // ======================================

                    var _trafficSourceData = [];
                    var _totalTypes = 0;
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

                    // if (_totalTypes >= $scope.totalTypes) {
                    //     $scope.totalTypes = _totalTypes;
                    //     if ($scope.firstQuery) {
                    //         $scope.totalTypes = _totalTypes;
                    //         $scope.trafficSourceData = _trafficSourceData;
                    //     } else {
                    //         $scope.trafficSourcesConfig.series[0].data = _trafficSourceData;
                    //     }
                    // }

                    // // ======================================
                    // // New vs. Returning Customers
                    // // ======================================

                    var newVsReturning = [
                        ['New', results[14].result],
                        ['Returning', results[13].result]
                    ];


                    // // ======================================
                    // // Content
                    // // Time on Site, Bounces
                    // // ======================================

                    //  //"filters": [{"property_name":"url.domain","operator":"eq","property_value":"main.indigenous.local"}],

                    //  // "entrances":{
                    //  //            "analysis_type":"count"
                    //  //        },
                    //  //        "exits":{
                    //  //            "analysis_type":"count"
                    //  //        },
                    //  //        "bounces":{
                    //  //            "analysis_type":"count"
                    //  //        }
                    //  //    }

                    // ======================================
                    // Visitor Locations
                    // ======================================

                    var locationData = [];

                    for (var i = 0; i < results[15].result.length; i++) {
                        var subObj = {};
                        subObj.code = self.stateToAbbr( results[15].result[i]['ip_geo_info.province'] );
                        subObj.value = results[15].result[i].result;
                        locationData.push(subObj);
                    };

                    // // ======================================
                    // // Page Depth
                    // // ======================================


                    // var _depthValues = [];
                    // for (var i = 0; i < results[16].result.length; i++) {
                    //     _depthValues.push( results[16].result[i].result );
                    // };

                    // var testing = $scope.countDuplicates(_depthValues);

                    // if($scope.firstQuery) {
                    //     ngProgress.complete();
                    //     $scope.renderAnalyticsChart();
                    //     $scope.firstQuery = false;
                    // }


                    //put all data is reportData
                    reportData.desktop = desktop;
                    reportData.mobile = mobile;
                    reportData.visitorsData = visitorsData;
                    reportData.currentTotalVisitors = currentTotalVisitors;
                    reportData.vistorsPreviousData = vistorsPreviousData;
                    reportData.visitorsPercent = visitorsPercent;
                    reportData.currentTotalPageviews = currentTotalPageviews;
                    reportData.pageviewsData = pageviewsData;
                    reportData.sessionData = _sessionsData;
                    reportData.sessionsPercent = sessionsPercent;
                    reportData.totalSessions = _totalSessions;
                    reportData.pageviewsPreviousData = pageviewsPreviousData;
                    reportData.pageviewsPercent = pageviewsPercent;
                    reportData.bouncesData = _bouncesData;
                    reportData.totalBounces = _totalBounces;
                    reportData.bouncesPercent = bouncesPercent;
                    reportData.trafficSourceData = _trafficSourceData;
                    reportData.totalTypes = _totalTypes;
                    reportData.newVsReturning = newVsReturning;
                    reportData.locationData = locationData;
                    reportData.visitDuration = visitDuration;
                    reportData.avgSessionData = avgSessionData;

                    fn(reportData);
                });
            });
        };

        //charts

        this.pageDepth = function() {
            var pageDepthConfig = {
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

            return pageDepthConfig;
        };

        this.analyticsOverview = function(readyPageviewsData, sessionsData, readyVisitorsData, fn) {
            var analyticsOverviewConfig = {
                options: {
                    chart: {
                        height: 300,
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
                    min: 0,
                    // max: Math.max.apply(Math, lineData) + 100,
                    title: {
                        text: ''
                    }
                },
                series: [{
                    name: 'Pageviews',
                    data: readyPageviewsData
                }, {
                    name: 'Visits',
                    data: sessionsData
                }, {
                    name: 'Visitors',
                    data: readyVisitorsData
                }],
                credits: {
                    enabled: false
                },
                func: function(chart) {

                }
            };
            fn(analyticsOverviewConfig);
        };

        this.timeOnSite = function(timeOnSiteData, bouncesData, fn) {
            var timeonSiteConfig = {
                options: {
                    chart: {
                        height: 265,
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
            fn(timeonSiteConfig);
        };

        this.trafficSources = function(trafficSourceData, fn) {
        	var trafficSourcesConfig = {
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
                    data: trafficSourceData
                }],
                credits: {
                    enabled: false
                }
        	};
        	fn(trafficSourcesConfig);
        };

        this.newVsReturning = function(newVsReturning, fn) {
        	var newVsReturningConfig = {
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
                    data: newVsReturning
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

            fn(newVsReturningConfig);
        };

        this.visitorLocations = function(locationData, highchartsData) {
        	var data = [{"value":438,"code":"NJ"},{"value":387.35,"code":"RI"},{"value":312.68,"code":"MA"},{"value":271.4,"code":"CT"},{"value":209.23,"code":"MD"},{"value":195.18,"code":"NY"},{"value":154.87,"code":"DE"},{"value":114.43,"code":"FL"},{"value":107.05,"code":"OH"},{"value":105.8,"code":"PA"},{"value":86.27,"code":"IL"},{"value":83.85,"code":"CA"},{"value":72.83,"code":"HI"},{"value":69.03,"code":"VA"},{"value":67.55,"code":"MI"},{"value":65.46,"code":"IN"},{"value":63.8,"code":"NC"},{"value":54.59,"code":"GA"},{"value":53.29,"code":"TN"},{"value":53.2,"code":"NH"},{"value":51.45,"code":"SC"},{"value":39.61,"code":"LA"},{"value":39.28,"code":"KY"},{"value":38.13,"code":"WI"},{"value":34.2,"code":"WA"},{"value":33.84,"code":"AL"},{"value":31.36,"code":"MO"},{"value":30.75,"code":"TX"},{"value":29,"code":"WV"},{"value":25.41,"code":"VT"},{"value":23.86,"code":"MN"},{"value":23.42,"code":"MS"},{"value":20.22,"code":"IA"},{"value":19.82,"code":"AR"},{"value":19.4,"code":"OK"},{"value":17.43,"code":"AZ"},{"value":16.01,"code":"CO"},{"value":15.95,"code":"ME"},{"value":13.76,"code":"OR"},{"value":12.69,"code":"KS"},{"value":10.5,"code":"UT"},{"value":8.6,"code":"NE"},{"value":7.03,"code":"NV"},{"value":6.04,"code":"ID"},{"value":5.79,"code":"NM"},{"value":3.84,"code":"SD"},{"value":3.59,"code":"ND"},{"value":2.39,"code":"MT"},{"value":1.96,"code":"WY"},{"value":0.42,"code":"AK"}];

            var chart1 = new Highcharts.Map({
                 chart : {
                        renderTo: 'visitor_locations',
                        height: 385
                    },

                    title : {
                        text : ''
                    },

                    exporting: {
                        enabled: false
                    },

                    legend: {
                        enabled: false
                    },

                    mapNavigation: {
                        buttonOptions: {
                            align: 'right',
                            verticalAlign: 'bottom'
                        },
                        enableButtons: true,
                        enableDoubleClickZoomTo: true,
                        enableDoubleClickZoom: true,
                        enableTouchZoom: false
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
                        data : locationData,
                        mapData: highchartsData,
                        joinBy: ['postal-code', 'code'],
                        dataLabels: {
                            enabled: false
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

    }]);
});
