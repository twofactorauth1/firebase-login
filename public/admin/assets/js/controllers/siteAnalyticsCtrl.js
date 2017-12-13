'use strict';
/*global app, moment, angular, Highcharts*/
/*jslint unparam:true*/
(function (angular) {
    app.controller('siteAnalyticsCtrl', ["$scope", "$modal", "UserService", "ChartAnalyticsService", "$timeout", "SiteAnalyticsService", "AnalyticsWidgetStateService", "$location", "$interval", "analyticsConstant", "$rootScope", function ($scope, $modal, UserService, ChartAnalyticsService, $timeout, SiteAnalyticsService, AnalyticsWidgetStateService, $location, $interval, analyticsConstant, $rootScope) {

        $scope.analyticsRefreshAfterTime = analyticsConstant.refreshAfterTime;
        $scope.analyticsOverviewConfig = {};
        $scope.timeonSiteConfig = {};
        $scope.trafficSourcesConfig = {};
        $scope.newVsReturningConfig = {};
        $scope.customerOverviewConfig = {};
        $scope.analyticsOverviewConfig.title = {
            text: ''
        };
        $scope.timeonSiteConfig.title = {
            text: ''
        };
        $scope.trafficSourcesConfig.loading = true;
        $scope.newVsReturningConfig.loading = true;
        $scope.customerOverviewConfig.loading = true;
        $scope.displayVisitors = true;
        $scope.visitors = null;
        var localTimezoneOffset = 0;
        //highchar datetime behaving diffent on differnetbrowser so nee to set this check
        if ((!!window.chrome && !!window.chrome.webstore) ||
            (/constructor/i.test(window.HTMLElement) || (function (p) {
                return p.toString() === "[object SafariRemoteNotification]";
            })(!window['safari'] || safari.pushNotification)
                )) {
            localTimezoneOffset = 0;
        } else {
            localTimezoneOffset = new Date().getTimezoneOffset() * -60000;
        }
        function setFilterDates() {
            if ($location.search().date_filter === 'today') {
                $scope.date = {
                    startDate: moment().startOf('day').format(),
                    endDate: moment().format()
                };
                $scope.selectedDate = {
                    startDate: moment().startOf('day').format(),
                    endDate: moment().format()
                };

                $scope.pickerOptions = {
                    startDate: moment().startOf('day').toDate(),
                    endDate: moment().toDate(),
                    format: 'YYYY-MM-DD',
                    opens: 'left',
                    ranges: {
                        'Today': [moment().startOf('day'), moment()],
                        'Yesterday': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
                        'Last 7 Days': [moment().subtract(6, 'days').startOf('day'), moment().endOf('day')],
                        'Last 30 Days': [moment().subtract(29, 'days').startOf('day'), moment().endOf('day')],
                        'This Month': [moment().startOf('month'), moment().endOf('month')],
                        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                    }
                };
            } else {
                var _startDate = moment().subtract(29, 'days');
                var _endDate = moment();
                // Today
                if ($scope.accountDayDiffrence < 1) {
                    _startDate = moment().startOf('day');
                }
                // Yesterday
                else if ($scope.accountDayDiffrence < 6) {
                    _startDate = moment().subtract(1, 'days').startOf('day');
                    _endDate = moment().subtract(1, 'days').endOf('day');
                }
                // Last 7 Days
                else if ($scope.accountDayDiffrence < 29) {
                    _startDate = moment().subtract(6, 'days').startOf('day');
                    _endDate = moment().endOf('day');
                }

                $scope.date = {
                    startDate: _startDate.format(),
                    endDate: _endDate.format()
                };
                $scope.selectedDate = {
                    startDate: _startDate.startOf('day'),
                    endDate: _endDate
                };

                $scope.pickerOptions = {
                    startDate: _startDate.toDate(),
                    endDate: _endDate.toDate(),
                    format: 'YYYY-MM-DD',
                    opens: 'left',
                    ranges: {
                        'Today': [moment().startOf('day'), moment()],
                        'Yesterday': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
                        'Last 7 Days': [moment().subtract(6, 'days').startOf('day'), moment().endOf('day')],
                        'Last 30 Days': [moment().subtract(29, 'days').startOf('day'), moment().endOf('day')],
                        'This Month': [moment().startOf('month'), moment().endOf('month')],
                        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                    }
                };
            }
        }

        $scope.Math = Math;

        var dateSwitch = false;
        $scope.$watch('selectedDate', function (_date) {
            if (angular.isDefined(_date)) {
                $scope.date.startDate = moment($scope.selectedDate.startDate).format();
                $scope.date.endDate = moment($scope.selectedDate.endDate).format();
                //update user preferences
                if (dateSwitch) {
                    $scope.analyticsOverviewConfig = {};
                    $scope.timeonSiteConfig = {};
                    $scope.trafficSourcesConfig = {};
                    $scope.newVsReturningConfig = {};
                    $scope.customerOverviewConfig = {};
                    $scope.analyticsOverviewConfig.title = {
                        text: ''
                    };
                    $scope.timeonSiteConfig.title = {
                        text: ''
                    };

                    $scope.locationData = null;
                    $scope.countryLocationData = null;
                    $scope.pagedformattedTopPages = null;

                    $scope.runAnalyticsReports($scope.analyticsAccount);
                }
                dateSwitch = true;
            }

        });


        UserService.getAccount(function (account) {
            $scope.analyticsAccount = account;
            if (account.created && account.created.date) {
                var _accountDate = moment(account.created.date);
                var _currentDate = moment();
                $scope.accountDayDiffrence = _currentDate.diff(_accountDate, 'days');
            }
            else {
                $scope.accountDayDiffrence = 30;
            }
            setFilterDates();
            $scope.runAnalyticsReports();
            $scope.siteTraffic();
        });


        $scope.siteTraffic = function () {
            ChartAnalyticsService.getSiteAnalyticsTraffic(function (data) {
                var trafficData = _.pluck(data, 'count');
                var liveTrafficConfig = ChartAnalyticsService.liveTraffic(trafficData);
                $scope.liveTraffic = data;
                $scope.liveTrafficConfig = liveTrafficConfig;

                $timeout($scope.updatesiteTraffic, 60000);
            });
        };

        $scope.updatesiteTraffic = function () {
            ChartAnalyticsService.getSiteAnalyticsTraffic(function (data) {
                var chart = $('#live-traffic-chart').highcharts();
                if (chart)
                    chart.series[0].setData(_.pluck(data, 'count'), true);

                $scope.liveTraffic = data;
                $timeout($scope.updatesiteTraffic, 60000);
            });
        };
        $scope.runAnalyticsReports = function () {

            ChartAnalyticsService.runIndividualMongoReports($scope.date, $scope.analyticsAccount, function(data){
                var formattedTopPages = [];
                var pagedformattedTopPages;
                if(data.pageAnalytics) {
                    _.each(data.pageAnalytics, function (singleRow) {
                        var subObj = {};

                        if (singleRow['url.path']) {
                            subObj.page = singleRow['url.path'];
                            subObj.pageviews = singleRow.pageviews;
                            subObj.avgTime = Math.abs(singleRow.avgTimeOnPage) / 1000;
                            subObj.uniquePageviews = singleRow.uniquePageviews;
                            //TODO
                            //subObj.entrances = singleRow['entrances'];
                            //subObj.bounceRate = singleRow['bounces']/singleRow['pageviews'];
                            //subObj.exitRate = self.calculatePercentage(singleRow['exits'], currentTotalPageviews);
                        }
                        if (subObj) {
                            formattedTopPages.push(subObj);
                        }
                    });

                    pagedformattedTopPages = formattedTopPages;
                    data.formattedTopPages = formattedTopPages;
                    data.pagedformattedTopPages = pagedformattedTopPages;
                    $scope.formattedTopPages = _.reject(formattedTopPages, function (analytics) {
                        return !angular.isDefined(analytics.page)
                    });
                    $scope.pagedformattedTopPages = _.reject(pagedformattedTopPages, function (analytics) {
                        return !angular.isDefined(analytics.page)
                    });
                }

                $scope.setNewReportData(data);
            });

            /*
            ChartAnalyticsService.runMongoReports($scope.date, $scope.analyticsAccount, function (data) {

                //console.log('New Data:', data);
                var formattedTopPages = [];
                var pagedformattedTopPages;
                _.each(data.pageAnalyticsReport, function (singleRow) {
                    var subObj = {};

                    if (singleRow['url.path']) {
                        subObj.page = singleRow['url.path'];
                        subObj.pageviews = singleRow.pageviews;
                        subObj.avgTime = Math.abs(singleRow.avgTimeOnPage) / 1000;
                        subObj.uniquePageviews = singleRow.uniquePageviews;
                        //TODO
                        //subObj.entrances = singleRow['entrances'];
                        //subObj.bounceRate = singleRow['bounces']/singleRow['pageviews'];
                        //subObj.exitRate = self.calculatePercentage(singleRow['exits'], currentTotalPageviews);
                    }
                    if (subObj) {
                        formattedTopPages.push(subObj);
                    }
                });

                //pagedformattedTopPages = formattedTopPages.slice(0, 15);  // don't bother shortening list (UI does)
                pagedformattedTopPages = formattedTopPages;
                data.formattedTopPages = formattedTopPages;
                data.pagedformattedTopPages = pagedformattedTopPages;
                $scope.formattedTopPages = _.reject(formattedTopPages, function (analytics) {
                    return !angular.isDefined(analytics.page)
                });
                $scope.pagedformattedTopPages = _.reject(pagedformattedTopPages, function (analytics) {
                    return !angular.isDefined(analytics.page)
                });
                $scope.setNewReportData(data);
            });
            */
        };

        $scope.runAnalyticsReports1 = function () {
            ChartAnalyticsService.runPagedReports($scope.date, $scope.analyticsAccount, function (data) {
                $scope.formattedTopPages = _.reject(data.formattedTopPages, function (analytics) {
                    return !angular.isDefined(analytics.page)
                });
                $scope.pagedformattedTopPages = _.reject(data.pagedformattedTopPages, function (analytics) {
                    return !angular.isDefined(analytics.page)
                });
            });

            ChartAnalyticsService.runReports($scope.date, $scope.analyticsAccount, function (data) {
                $scope.setReportData(data);
            });
        };

        /**
         *
         * @param result2 - userReport current month
         * @param result3 - userReport previous month
         */
        $scope.visitorDataReport = function (result2, result3) {

            var visitorsData = [];
            var currentTotalVisitors = 0;
            _.each(result2, function (visitor) {
                var subArr = [];
                var value = visitor.value || 0;
                currentTotalVisitors += value;
                subArr.push(new Date(visitor.timeframe.start.replace(" ", "T")).getTime() + localTimezoneOffset);
                /*subArr.push(new Date(visitor.timeframe.start.replace(" ", "T")).getTime());*/
                subArr.push(value);
                visitorsData.push(subArr);
            });
            //console.log('visitorsData:', visitorsData);
            $scope.visitorsData = visitorsData;

            var vistorsPreviousData = 0;
            _.each(result3, function (previousVisitor) {
                var value = previousVisitor.value || 0;
                vistorsPreviousData += value;
            });

            var visitorsPercent = ChartAnalyticsService.calculatePercentChange(vistorsPreviousData, currentTotalVisitors);

            //$scope.$apply(function () {
            $scope.visitors = currentTotalVisitors;
            $scope.visitorsPercent = visitorsPercent;
            //});
        };

        $scope.locationReportData = function (result0) {
            // ======================================
            // Visitor Locations
            // ======================================

            var locationData = [];
            if (result0) {
                var _formattedLocations = [];
                _.each(result0, function (loc) {
                    if (loc['ip_geo_info.province']) {
                        _formattedLocations.push(loc);
                    }
                });
                $scope.mostPopularState = _.max(_formattedLocations, function (o) {
                    return o.result;
                });
                _.each(result0, function (location) {
                    var _geo_info = ChartAnalyticsService.stateToAbbr(location['ip_geo_info.province']);
                    if (_geo_info) {
                        var subObj = {};
                        subObj.code = _geo_info;
                        subObj.value = location.result;
                        var locationExists = _.find(locationData, function (loc) {
                            return loc.code === location.code;
                        });
                        if (!locationExists && subObj.value) {
                            locationData.push(subObj);
                        }
                    }
                });
            }

            //$scope.$apply(function () {
            $scope.locationData = locationData;
            //});
        };

        /**
         * This is plotting (non-bounce) visitor count on site vs. bounce visitor time on site
         * slr.nonBounceAvg, slr.bounceAvg, slr.previousMonthBounceCount
         * @param result8 - nonBounceAvg
         * @param result10 - bounceAvg
         * @param result11 - previousMonthBounceCount
         */
        $scope.contentInteractionsReportData = function (result8, result10, previousMonthBounceCount) {

            // ----------------------------------------
            // Average Visit Duration
            // ----------------------------------------

            var avgSessionData = [];
            _.each(result8, function (session) {
                var subArr = [];
                var value = session.count || session.value || 0;
                subArr.push(new Date(session.timeframe.start.replace(" ", "T")).getTime() + localTimezoneOffset);
                /*subArr.push(new Date(session.timeframe.start.replace(" ", "T")).getTime());*/
                subArr.push(value);
                avgSessionData.push(subArr);
            });

            $scope.avgSessionData = avgSessionData;

            // ======================================
            // Bounces
            // ======================================

            var _bouncesData = [];
            var _totalBounces = 0;
            _.each(result10, function (bounce) {
                var subArr = [];
                var value = bounce.count || bounce.value || 0;
                _totalBounces += value;
                subArr.push(new Date(bounce.timeframe.start.replace(" ", "T")).getTime() + localTimezoneOffset);

                /*subArr.push(new Date(bounce.timeframe.start.replace(" ", "T")).getTime());*/
                subArr.push(value);
                _bouncesData.push(subArr);
            });

            $scope.bouncesData = _bouncesData;

            ChartAnalyticsService.timeOnSite($scope.avgSessionData, $scope.bouncesData, function (data) {
                $scope.timeonSiteConfig = data;
                $scope.timeonSiteConfig.loading = false;

            });


            var bouncesPercent = ChartAnalyticsService.calculatePercentChange(previousMonthBounceCount, _totalBounces);
            //$scope.$apply(function () {
            $scope.bounces = _totalBounces;
            $scope.bouncesPercent = bouncesPercent;
            //});
        };


        $scope.setNewReportData = function (results) {
            if (moment($scope.date.endDate).diff(moment($scope.date.startDate), 'days') <= 7) {
                ChartAnalyticsService.setGraunularity('hours');
            } else {
                ChartAnalyticsService.setGraunularity('days');
            }
            var desktop = 0;
            var mobile = 0;
            if(results.visitorDevices) {
                _.each(results.visitorDevices.result, function (device) {
                    var category = device['user_agent.device'];
                    if (category === 'desktop') {
                        desktop = device.result;
                    } else if (category === 'mobile') {
                        mobile = device.result;
                    }
                });
                $scope.desktop = desktop;
                $scope.mobile = mobile;

                $scope.device_data_loaded = true;
            } else {
                //console.log('No visitorDeviceReport:', results);
            }


            // ----------------------------------------
            // Visitors
            // ----------------------------------------
            if(results.users) {
                $scope.visitorDataReport(results.users.currentMonth, results.users.previousMonth);
            } else {
                //console.log('No userReport:', results);
            }
            if(results["daily404s"]){
                var fourOfours = [];
                _.each(results["daily404s"], function (fourOfour) {
                    var subArr = [];
                    subArr.push(new Date(fourOfour.timeframe.start.replace(" ", "T")).getTime() + localTimezoneOffset);
                    subArr.push(fourOfour.total);
                    fourOfours.push(subArr);
                });
                $scope.fourOfours = fourOfours;
            }
            if(results["404s"]){
                $scope.fourOfoursDetails = results["404s"];
            }
            // ----------------------------------------
            // Pageviews Metric
            // ----------------------------------------
            if(results.pageviews) {
                var pageviewsData = [];
                var currentTotalPageviews = 0;
                _.each(results.pageviews.currentMonth, function (pageView) {
                    var subArr = [];
                    var value = pageView.value || 0;
                    currentTotalPageviews += value;
                    /*subArr.push(new Date(pageView.timeframe.start.replace(" ", "T")).getTime());*/
                    subArr.push(new Date(pageView.timeframe.start.replace(" ", "T")).getTime() + localTimezoneOffset);

                    subArr.push(value);
                    pageviewsData.push(subArr);
                });

                $scope.pageviews = currentTotalPageviews;
                $scope.pageviewsData = pageviewsData;

                var pageviewsPreviousData = 0;
                _.each(results.pageviews.previousMonth, function (pageView) {
                    var value = pageView.value || 0;
                    pageviewsPreviousData += value;
                });

                $scope.pageviewsPreviousData = pageviewsPreviousData;

                var pageviewsPercent = ChartAnalyticsService.calculatePercentChange(pageviewsPreviousData, currentTotalPageviews);
                $scope.pageviewsPercent = pageviewsPercent;
            } else {
                //console.log('No pageViewsReport:', results);
            }


            // ----------------------------------------
            // Sessions
            // ----------------------------------------
            if(results.sessions) {
                var _sessionsData = [];
                var _totalSessions = 0;
                _.each(results.sessions.currentMonth, function (session) {
                    var subArr = [];
                    var value = session.total || session.value || 0;
                    _totalSessions += value;
                    subArr.push(new Date(session.timeframe.start.replace(" ", "T")).getTime() + localTimezoneOffset);

                    /* subArr.push(new Date(session.timeframe.start.replace(" ", "T")).getTime());*/
                    subArr.push(value);
                    _sessionsData.push(subArr);
                });
                $scope.sessions = _totalSessions;
                $scope.sessionsData = _sessionsData;

                var sessionsPreviousData = 0;
                _.each(results.sessions.previousMonth, function (previousSession) {
                    var value = previousSession.total || previousSession.value || 0;
                    sessionsPreviousData += value;
                });

                var sessionsPercent = ChartAnalyticsService.calculatePercentChange(sessionsPreviousData, _totalSessions);
                //console.log('total:' + _totalSessions + ', prev:' + sessionsPreviousData + ', percent:' + sessionsPercent);
                $scope.sessionsPercent = sessionsPercent;
            } else {
                //console.log('No sessionsReport:', results);
            }


            if($scope.pageviewsData && $scope.sessionsData && $scope.visitorsData
              &&  $scope.fourOfours) {
                ChartAnalyticsService.analyticsOverview($scope.pageviewsData, $scope.sessionsData, $scope.visitorsData, null, $scope.fourOfours,isVisibleLegend, setLegendVisibility, function (data) {
                    //$scope.$apply(function () {
                    $scope.analyticsOverviewConfig = data;
                    //});
                    $scope.analyticsOverviewConfig.loading = false;

                });

            } else {
                //console.log('No pagviewsData or sessionsDat or visitorsData');
            }





            if(results.sessionLength) {
                var slr = results.sessionLength;//slr = SessionLengthReport
                var secsToConv = 0;
                if (slr.currentMonthAverage) {
                    secsToConv = (slr.currentMonthAverage / 1000);
                }

                var visitDuration = ChartAnalyticsService.secToTime(secsToConv);

                if (slr.previousMonthAverage === null) {
                    slr.previousMonthAverage = 0;
                }

                $scope.visitDuration = visitDuration;

                var previousVisitDuration = slr.previousMonthAverage;

                var visitDurationPercent = ChartAnalyticsService.calculatePercentChange(previousVisitDuration, slr.currentMonthAverage);
                $scope.visitDurationPercent = visitDurationPercent;

                //8 = sessionLengthReport, 10=bounceReport, 11=NOTbouncePreviousReport ... previousMonthBounceCount
                $scope.contentInteractionsReportData(slr.nonBounceAvg, slr.bounceAvg, slr.previousMonthBounceCount);
            } else {
                //console.log('No sessionLengthReport:', results);
            }


            // ======================================
            // Traffic Sources
            // ======================================

            if(results.trafficSources) {
                $scope.trafficSourceData = results.trafficSources;
            } else {
                //console.log('No trafficSourcesReport:', results);
            }


            // ======================================
            // New vs. Returning Customers
            // ======================================

            if(results.newVsReturning) {
                var newCustomers = ['New'];
                var returningCustomers = ['Returning'];
                if (results.newVsReturning && results.newVsReturning.length) {
                    _.each(results.newVsReturning, function (result) {
                        if (result._id === 'new') {
                            newCustomers.push(result.count);
                        } else if (result._id === 'returning') {
                            returningCustomers.push(result.count);
                        }
                    });
                    var newVsReturning = [
                        newCustomers,
                        returningCustomers
                    ];
                } else {
                    var newVsReturning = [
                        ['New', 0],
                        ['Returning', 0]
                    ];
                }


                $scope.newVsReturning = newVsReturning;
                ChartAnalyticsService.newVsReturning($scope.newVsReturning, function (data) {
                    $scope.newVsReturningConfig = data;
                    $scope.newVsReturningConfig.loading = false;

                });
            } else {
                //console.log('No newVsReturningReport:', results);
            }


            // ======================================
            // Content
            // Time on Site, Bounces
            // ======================================

            var locationData = [];
            var countryLocationData = [];
            if (results.visitorLocations) {
                var _formattedLocations = [];
                _.each(results.visitorLocations, function (loc) {
                    if(loc._id === 'United States') {
                        _formattedLocations = _formattedLocations.concat(loc.provinces);
                    }
                    /*
                    if (loc['ip_geo_info.province']) {
                        _formattedLocations.push(loc);
                    }
                    */
                });
                $scope.mostPopularState = _.max(_formattedLocations, function (o) {
                    return o.count;
                });

                _.each(_formattedLocations, function (location) {
                    var _geo_info = ChartAnalyticsService.stateToAbbr(location['name']);
                    if (_geo_info) {
                        var subObj = {};
                        subObj.code = _geo_info;
                        subObj.value = location.count;
                        var locationExists = _.find(locationData, function (loc) {
                            return loc.code === location.code;
                        });
                        if (!locationExists && subObj.value) {
                            locationData.push(subObj);
                        }
                    }
                });
            } else {
                //console.log('No visitorLocations:', results);
            }
            if (results.visitorLocationsByCountry) {
                var _formattedCountryLocations = [];
                _.each(results.visitorLocationsByCountry, function (loc) {
                    if (loc['ip_geo_info.country'] && loc['ip_geo_info.country'] != "Unknown") {
                        _formattedCountryLocations.push(loc);
                    }
                });
                $scope.mostPopularCountry = _.max(_formattedCountryLocations, function (o) {
                    return o.result;
                });
                _.each(results.visitorLocationsByCountry, function (location) {
                    var _geo_info = ChartAnalyticsService.countryToAbbr(location['ip_geo_info.country']);
                    if (_geo_info && _geo_info != 'Unknown') {
                        var subObj = {};
                        subObj.code = _geo_info;
                        subObj.value = location.result;
                        var locationExists = _.find(countryLocationData, function (loc) {
                            return loc.code === location.code;
                        });
                        if (!locationExists && subObj.value) {
                            countryLocationData.push(subObj);
                        }
                    }
                });
            } else {
                //console.log('No visitorLocationsByCountryReport:', results);
            }
            if(results.visitorLocations && results.visitorLocationsByCountry) {
                $scope.locationData = locationData;

                $scope.locationLabel = 'States';
                $scope.locationsLength = locationData.length;
                $scope.mostPopularLabel = $scope.mostPopularState['name'];

                // Country based
                $scope.countryLocationData = countryLocationData;
                $scope.locationLabelCountry = 'Countries';
                $scope.locationsLengthCountry = $scope.countryLocationData.length;
                $scope.mostPopularLabelCountry = $scope.mostPopularCountry['ip_geo_info.country'];

                $scope.renderVisitorCharts();
            }

            // ======================================
            // User Agent Pie Chart
            // ======================================
            var userAgentData = [];
            var browserMap = {};
            if (results.userAgents) {
                var browserTotal = 0;
                _.each(results.userAgents, function (obj) {
                    var browser = obj._id.browserName;
                    var count = obj.count;
                    if (browserMap[browser]) {
                        browserMap[browser] += count;
                    } else {
                        browserMap[browser] = count;
                    }
                    browserTotal += count;
                });
                $scope.browserTotal = browserTotal;
                //console.log('browserMap:', browserMap);
                userAgentData = userAgentData.concat(_.pairs(browserMap));
                userAgentData = _.sortBy(userAgentData, function (pair) {
                    return pair[1]
                });
                //console.log('userAgentData', userAgentData);
                $scope.userAgentData = userAgentData;
                var uadLength = userAgentData.length - 1;
                if (userAgentData.length) {
                    $scope.topBrowser = userAgentData[uadLength][0];
                    var browserPercent = Math.round((userAgentData[uadLength][1] / browserTotal) * 100);
                    $scope.browserPercent = browserPercent;
                }

                ChartAnalyticsService.userAgentChart(userAgentData, function (config) {
                    $scope.userAgentConfig = config;
                    $scope.userAgentConfig.loading = false;
                    $timeout(function () {
                        $(window).resize();
                    }, 0);
                });

                $scope.userAgentTableData = userAgentData.reverse();
                //console.log('userAgentTableData:', $scope.userAgentTableData);
            }

            // ======================================
            // Revenue
            // ======================================
            if(results.revenue) {
                var revenueChartData = {
                    xData: [],
                    amountData: [],
                    orderData: []
                };
                var currentTotalRevenue = 0;
                var currentTotalCount = 0;
                _.each(results.revenue.currentMonth, function (rev) {
                    revenueChartData.xData.push(new Date(rev.timeframe.start.replace(" ", "T")).getTime() + localTimezoneOffset);
                    var amt = rev.total || 0;
                    var cnt = rev.count || 0;
                    revenueChartData.amountData.push(amt);
                    revenueChartData.orderData.push(cnt);
                    currentTotalRevenue += amt;
                    currentTotalCount += cnt;
                });

                $scope.revenueData = revenueChartData;
                $scope.revenue = parseFloat(currentTotalRevenue).toFixed(2);
                $scope.orderCount = currentTotalCount;

                var revenuePreviousData = 0;
                var ordersPreviousData = 0;
                _.each(results.revenue.prevMonth, function (rev) {
                    var value = rev.total || 0;
                    revenuePreviousData += value;
                    var cnt = rev.count || 0;
                    ordersPreviousData += cnt;
                });

                $scope.revenuePreviousData = revenuePreviousData;

                var revenuePercent = ChartAnalyticsService.calculatePercentChange(revenuePreviousData, currentTotalRevenue);
                $scope.revenuePercent = revenuePercent;

                var ordersPercent = ChartAnalyticsService.calculatePercentChange(ordersPreviousData, currentTotalCount);
                $scope.ordersPercent = ordersPercent;

                ChartAnalyticsService.revenueOverview($scope.revenueData, function (data) {
                    $scope.revenueConfig = data;
                    $scope.revenueConfig.loading = false;

                });
            } else {
                //console.log('No revenueReport:', results);
            }


            //=======================================
            // Cleanup
            //=======================================




            $scope.displayVisitors = $scope.visitors > 0;
            //$scope.renderAnalyticsCharts();
        };

        // $scope.switchLocationLabels = function(locationScope) {
        //     $scope.$apply(function(){
        //         if(locationScope === 'US') {
        //             $scope.locationLabel = 'States';
        //             $scope.locationsLength = $scope.locationData.length;
        //             $scope.mostPopularLabel = $scope.mostPopularState['ip_geo_info.province'];
        //         } else {
        //             $scope.locationLabel = 'Countries';
        //             $scope.locationsLength = $scope.countryLocationData.length;
        //             $scope.mostPopularLabel = $scope.mostPopularCountry['ip_geo_info.country'];
        //         }
        //     });
        // };

        $scope.setReportData = function (results) {
            console.log('setReportData - results:', results);
            $scope.legacyData = results;
            $scope.runNewReports();
            var desktop, mobile;
            _.each(results[1].result, function (device) {
                var category = device['user_agent.device'];
                if (category === 'desktop') {
                    desktop = device.result;
                }
                if (category === 'mobile') {
                    mobile = device.result;
                } else {
                    mobile = 0;
                }
            });

            $scope.desktop = desktop;
            $scope.mobile = mobile;

            $scope.device_data_loaded = true;

            // ----------------------------------------
            // Visitors
            // ----------------------------------------

            $scope.visitorDataReport(results[2].result, results[3].result);

            // ----------------------------------------
            // Pageviews Metric
            // ----------------------------------------

            var pageviewsData = [];
            var currentTotalPageviews = 0;
            _.each(results[4].result, function (pageView) {
                var subArr = [];
                var value = pageView.value || 0;
                currentTotalPageviews += value;
                subArr.push(new Date(pageView.timeframe.start.replace(" ", "T")).getTime());
                subArr.push(value);
                pageviewsData.push(subArr);
            });

            $scope.pageviews = currentTotalPageviews;
            $scope.pageviewsData = pageviewsData;

            var pageviewsPreviousData = 0;
            _.each(results[5].result, function (pageView) {
                var value = pageView.value || 0;
                pageviewsPreviousData += value;
            });

            $scope.pageviewsPreviousData = pageviewsPreviousData;

            var pageviewsPercent = ChartAnalyticsService.calculatePercentage(currentTotalPageviews, pageviewsPreviousData);
            $scope.pageviewsPercent = pageviewsPercent;



            if(results["daily404s"]){
                var fourOfours = [];
                _.each(results["daily404s"], function (fourOfour) {
                    var subArr = [];
                    subArr.push(new Date(fourOfour.timeframe.start.replace(" ", "T")).getTime() + localTimezoneOffset);
                    subArr.push(fourOfour.total);
                    fourOfours.push(subArr);
                });
                $scope.fourOfours = fourOfours;
            }
            if(results["404s"]){
                $scope.fourOfoursDetails = results["404s"];
            }

            // ----------------------------------------
            // Sessions
            // ----------------------------------------

            var _sessionsData = [];
            var _totalSessions = 0;
            _.each(results[6].result, function (session) {
                var subArr = [];
                var value = session.value || 0;
                _totalSessions += value;
                /*subArr.push(new Date(session.timeframe.start.replace(" ", "T")).getTime());*/
                subArr.push(new Date(session.timeframe.start.replace(" ", "T")).getTime() + localTimezoneOffset);

                subArr.push(value);
                _sessionsData.push(subArr);
            });
            $scope.sessions = _totalSessions;
            $scope.sessionsData = _sessionsData;


            ChartAnalyticsService.analyticsOverview($scope.pageviewsData, $scope.sessionsData, $scope.visitorsData, null,$scope.fourOfours, isVisibleLegend, setLegendVisibility, function (data) {
                $scope.$apply(function () {
                    $scope.analyticsOverviewConfig = data;
                });
                $scope.analyticsOverviewConfig.loading = false;
            });

            var sessionsPreviousData = 0;
            _.each(results[7].result, function (previousSession) {
                var value = previousSession.value || 0;
                sessionsPreviousData += value;
            });

            var sessionsPercent = ChartAnalyticsService.calculatePercentage(_totalSessions, sessionsPreviousData);

            $scope.sessionsPercent = sessionsPercent;

            var secsToConv = 0;
            if (results[9].result) {
                secsToConv = (results[9].result / 1000);
            }

            var visitDuration = ChartAnalyticsService.secToTime(secsToConv);

            if (results[15].result === null) {
                results[15].result = 0;
            }

            $scope.visitDuration = visitDuration;

            var previousVisitDuration = results[15].result;

            var visitDurationPercent = ChartAnalyticsService.calculatePercentage(results[9].result, previousVisitDuration);
            $scope.visitDurationPercent = visitDurationPercent;


            $scope.contentInteractionsReportData(results[8].result, results[10].result, results[11].result);

            // ======================================
            // Traffic Sources
            // ======================================

            $scope.trafficSourceData = results[12].result;

            // ChartAnalyticsService.trafficSources($scope.trafficSourceData, function (data) {
            //   $scope.trafficSourcesConfig = data;
            //   $scope.trafficSourcesConfig.loading = false;
            // });

            // ======================================
            // New vs. Returning Customers
            // ======================================

            var newVsReturning = [
                ['New', results[14].result],
                ['Returning', results[13].result]
            ];

            $scope.newVsReturning = newVsReturning;

            ChartAnalyticsService.newVsReturning($scope.newVsReturning, function (data) {
                $scope.newVsReturningConfig = data;
                $scope.newVsReturningConfig.loading = false;

            });

            // ======================================
            // Content
            // Time on Site, Bounces
            // ======================================

            $scope.locationReportData(results[0].result);

            $scope.displayVisitors = $scope.visitors > 0;

            //$scope.renderAnalyticsCharts();
        };

        $scope.renderVisitorCharts = function() {
            if ($("#visitor_locations").length) {
                $timeout(function () {
                    var location_data = angular.copy($scope.locationData);
                    var countryLocationData = angular.copy($scope.countryLocationData);
                    ChartAnalyticsService.visitorLocations(location_data, Highcharts.maps['countries/us/us-all'], countryLocationData, Highcharts.maps['custom/world']);
                    ChartAnalyticsService.visitorLocationsGlobal(location_data, Highcharts.maps['countries/us/us-all'], countryLocationData, Highcharts.maps['custom/world']);
                }, 200);
                if (!$scope.displayVisitors) {
                    console.log('no visitors');
                    // var deshBlockUI = blockUI.instances.get('deshboardBlock');
                    // deshBlockUI.start("There haven't been any new visitors to your site yet. Once they do that data will be displayed here. To increase your site visitors you should add a social post.");
                }
            } else {
                $timeout(function () {
                    $scope.renderVisitorCharts();
                }, 100);
            }
        };

        $scope.renderAnalyticsCharts = function () {
            if ($("#visitor_locations").length) {
                $timeout(function () {
                    var location_data = angular.copy($scope.locationData);
                    var countryLocationData = angular.copy($scope.countryLocationData);
                    ChartAnalyticsService.visitorLocations(location_data, Highcharts.maps['countries/us/us-all'], countryLocationData, Highcharts.maps['custom/world']);
                    ChartAnalyticsService.visitorLocationsGlobal(location_data, Highcharts.maps['countries/us/us-all'], countryLocationData, Highcharts.maps['custom/world']);
                }, 200);
                if (!$scope.displayVisitors) {
                    console.log('no visitors');
                    // var deshBlockUI = blockUI.instances.get('deshboardBlock');
                    // deshBlockUI.start("There haven't been any new visitors to your site yet. Once they do that data will be displayed here. To increase your site visitors you should add a social post.");
                }
            } else {
                $timeout(function () {
                    $scope.renderAnalyticsCharts();
                }, 100);
            }
        };

        $scope.displayDatePicker = function () {
            $timeout(function () {
                angular.element('.deshboard-date-picker').click();
            }, 0);
        };

        function reflowCharts() {
            window.Highcharts.charts.forEach(function (chart) {
                $timeout(function () {
                    if (angular.isDefined(chart) && Object.keys(chart).length)
                        chart.reflow();
                }, 0);
            })
        };

        $scope.$watch('overview', function (value, oldValue) {
            if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
                AnalyticsWidgetStateService.setSiteAnalyticsWidgetStates("overview", value);
                reflowCharts();
            }
        });

        $scope.$watch('locations', function (value, oldValue) {
            if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
                AnalyticsWidgetStateService.setSiteAnalyticsWidgetStates("locations", value);
                reflowCharts();
            }
        });

        $scope.$watch('locationsGlobal', function (value, oldValue) {
            if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
                AnalyticsWidgetStateService.setSiteAnalyticsWidgetStates("locationsGlobal", value);
                reflowCharts();
            }
        });

        $scope.$watch('interactions', function (value, oldValue) {
            if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
                AnalyticsWidgetStateService.setSiteAnalyticsWidgetStates("interactions", value);
                reflowCharts();
            }
        });

        $scope.$watch('device', function (value, oldValue) {
            if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
                AnalyticsWidgetStateService.setSiteAnalyticsWidgetStates("device", value);
                reflowCharts();
            }
        });

        $scope.$watch('newVReturning', function (value, oldValue) {
            if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
                AnalyticsWidgetStateService.setSiteAnalyticsWidgetStates("newVReturning", value);
                reflowCharts();
            }
        });

        $scope.$watch('trafficSources', function (value, oldValue) {
            if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
                AnalyticsWidgetStateService.setSiteAnalyticsWidgetStates("trafficSources", value);
                reflowCharts();
            }
        });

        $scope.$watch('pageanalytics', function (value, oldValue) {
            if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
                AnalyticsWidgetStateService.setSiteAnalyticsWidgetStates("pageanalytics", value);
                reflowCharts();
            }
        });

        $scope.$watch('analytics404', function (value, oldValue) {
            if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
                AnalyticsWidgetStateService.setSiteAnalyticsWidgetStates("analytics404", value);
                reflowCharts();
            }
        });

        $scope.$watch('ua', function (value, oldValue) {
            if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
                AnalyticsWidgetStateService.setSiteAnalyticsWidgetStates("ua", value);
                reflowCharts();
            }
        });

        $scope.$watch('userAgentsTable', function (value, oldValue) {
            if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
                AnalyticsWidgetStateService.setSiteAnalyticsWidgetStates("userAgentsTable", value);
                reflowCharts();
            }
        });

        $scope.$watch('rev', function (value, oldValue) {
            if (angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded) {
                AnalyticsWidgetStateService.setSiteAnalyticsWidgetStates("rev", value);
                reflowCharts();
            }
        });

        $scope.setAnalyticsWidgetStates = function () {
            AnalyticsWidgetStateService.getSiteAnalyticsWidgetStates();
            $timeout(function () {
                $scope.overview = AnalyticsWidgetStateService.siteAnalyticsWidgetStateConfig.overview;
                $scope.locations = AnalyticsWidgetStateService.siteAnalyticsWidgetStateConfig.locations;
                $scope.locationsGlobal = AnalyticsWidgetStateService.siteAnalyticsWidgetStateConfig.locationsGlobal;
                $scope.interactions = AnalyticsWidgetStateService.siteAnalyticsWidgetStateConfig.interactions;
                $scope.device = AnalyticsWidgetStateService.siteAnalyticsWidgetStateConfig.device;
                $scope.newVReturning = AnalyticsWidgetStateService.siteAnalyticsWidgetStateConfig.newVReturning;
                $scope.trafficSources = AnalyticsWidgetStateService.siteAnalyticsWidgetStateConfig.trafficSources;
                $scope.pageanalytics = AnalyticsWidgetStateService.siteAnalyticsWidgetStateConfig.pageanalytics;
                $scope.analytics404 = AnalyticsWidgetStateService.siteAnalyticsWidgetStateConfig.analytics404;
                $scope.ua = AnalyticsWidgetStateService.siteAnalyticsWidgetStateConfig.ua;
                $scope.userAgentsTable = AnalyticsWidgetStateService.siteAnalyticsWidgetStateConfig.userAgentsTable;
                $scope.rev = AnalyticsWidgetStateService.siteAnalyticsWidgetStateConfig.rev;
                $scope.dataLoaded = true;
                reflowCharts();
            }, 0);
        }


        $scope.uiState = {
            dashboardMode: false
        }


        $scope.$watch('uiState.dashboardMode', function (mode) {
            if (angular.isDefined(mode)) {
                if (mode) {
                    console.log("dashboard Mode");
                    setDashboardMode();
                }
                else {
                    console.log("desktop Mode");
                    setDesktopMode();
                }
            }
        })

        var timer = undefined;

        function setDashboardMode() {
            $rootScope.app.layout.isAnalyticsDashboardMode = true;
            timer = $interval(function () {
                console.log("Refreshing");
                $scope.runAnalyticsReports();
                $scope.siteTraffic();
            }, $scope.analyticsRefreshAfterTime);
        }

        function setDesktopMode() {
            $rootScope.app.layout.isAnalyticsDashboardMode = false;
            if (angular.isDefined(timer)) {
                $interval.cancel(timer);
                timer = undefined;
            }
        };

        function isVisibleLegend(name, widget) {
            var legend = widget.toLowerCase() + "_" + name.toLowerCase() + "_legend";
            legend = legend.replace(/ /g, "_");
            return AnalyticsWidgetStateService.getNamedSiteAnalyticsWidgetState(legend);
        }

        function setLegendVisibility(widget, name, value) {
            var legend = widget.toLowerCase() + "_" + name.toLowerCase() + "_legend";
            legend = legend.replace(/ /g, "_");
            AnalyticsWidgetStateService.setSiteAnalyticsWidgetStates(legend, value);
        }

        $scope.$watchGroup(['app.layout.isAnalyticsDashboardMode', 'app.layout.isSidebarClosed'], function (val1, val2) {
            if (angular.isDefined(val1) || angular.isDefined(val2)) {
                reflowCharts();
            }
        })


    }]);
}(angular));
