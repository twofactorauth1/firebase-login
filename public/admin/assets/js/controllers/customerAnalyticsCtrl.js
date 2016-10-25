'use strict';
/*global app, moment, angular, Highcharts*/
/*jslint unparam:true*/
(function (angular) {
    app.controller('customerAnalyticsCtrl', ["$scope", "$modal", "UserService", "ChartAnalyticsService", "$timeout", function ($scope, $modal, UserService, ChartAnalyticsService, $timeout) {

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

        $scope.date = {
            startDate: moment().subtract(29, 'days').format(),
            endDate: moment().format()
        };
        $scope.Math = Math;

        var dateSwitch = false;
        $scope.$watch('selectedDate', function () {
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
                $scope.pagedformattedTopPages = null;

                $scope.runAnalyticsReports($scope.analyticsAccount);
            }
            dateSwitch = true;
        });

        $scope.selectedDate = {
            startDate: moment().subtract(29, 'days').startOf('day'),
            endDate: moment()
        };

        $scope.pickerOptions = {
            startDate: moment().subtract(29, 'days').toDate(),
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


        UserService.getAccount(function (account) {
            $scope.analyticsAccount = account;
            $scope.runAnalyticsReports();
        });

        $scope.runAnalyticsReports = function () {
            console.log('runAnalyticsReports');
            ChartAnalyticsService.runAdminMongoReports($scope.date, $scope.analyticsAccount, function (data) {
                //console.log('ABOUT TO COMPARE!!!\n\n\n\n\n');
                //console.log('Legacy Data:', $scope.legacyData);
                console.log('New Data:', data);
                var formattedTopPages = [];
                var pagedformattedTopPages;
                _.each(data.pageAnalyticsReport, function (singleRow) {
                    var subObj = {};

                    if (singleRow['url.path']) {
                        subObj.page = singleRow['url.path'];
                        subObj.accountId = singleRow['id'];
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
        };



        /**
         *
         * @param result2 - userReport current month
         * @param result3 - userReport previous month
         */
        $scope.visitorDataReport = function (result2, result3) {
            console.log('visitor data report:');
            console.log('result2:', result2);
            console.log('result3:', result3);
            var visitorsData = [];
            var currentTotalVisitors = 0;
            _.each(result2, function (visitor) {
                var subArr = [];
                var value = visitor.value || 0;
                currentTotalVisitors += value;
                subArr.push(new Date(visitor.timeframe.start).getTime());
                subArr.push(value);
                visitorsData.push(subArr);
            });
            console.log('visitorsData:', visitorsData);
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
            console.log('contentInteractionsReportData:');
            console.log('nonBounceAvg:', result8);
            console.log('bounceAvg:', result10);
            console.log('previousMonthBounceCount:', previousMonthBounceCount);
            // ----------------------------------------
            // Average Visit Duration
            // ----------------------------------------

            var avgSessionData = [];
            _.each(result8, function (session) {
                var subArr = [];
                var value = session.count || session.value || 0;
                subArr.push(new Date(session.timeframe.start).getTime());
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
                subArr.push(new Date(bounce.timeframe.start).getTime());
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



        $scope.setNewReportData = function(results) {
            /*
             * set the granularity of labels in ChartService
             */

            if(moment($scope.date.endDate).diff(moment($scope.date.startDate), 'days') <=7) {
                ChartAnalyticsService.setGraunularity('hours');
            } else {
                ChartAnalyticsService.setGraunularity('days');
            }
            var desktop = 0;
            var mobile = 0;
            _.each(results.visitorDeviceReport.result, function(device){
                var category = device['user_agent.device'];
                if(category === 'desktop') {
                    desktop = device.result;
                } else if (category === 'mobile') {
                    mobile = device.result;
                }
            });
            $scope.desktop = desktop;
            $scope.mobile = mobile;

            $scope.device_data_loaded = true;

            // ----------------------------------------
            // Visitors
            // ----------------------------------------

            $scope.visitorDataReport(results.userReport.currentMonth, results.userReport.previousMonth);

            // ----------------------------------------
            // Pageviews Metric
            // ----------------------------------------

            var pageviewsData = [];
            var currentTotalPageviews = 0;
            _.each(results.pageViewsReport.currentMonth, function (pageView) {
                var subArr = [];
                var value = pageView.value || 0;
                currentTotalPageviews += value;
                subArr.push(new Date(pageView.timeframe.start).getTime());
                subArr.push(value);
                pageviewsData.push(subArr);
            });

            $scope.pageviews = currentTotalPageviews;
            $scope.pageviewsData = pageviewsData;

            var dauData = [];
            _.each(results.dau, function(dau){
                var subArr = [];
                var value = dau.total || 0;
                subArr.push(new Date(dau.timeframe.start).getTime());
                subArr.push(value);
                dauData.push(subArr);
            });
            $scope.dauData = dauData;

            var pageviewsPreviousData = 0;
            _.each(results.pageViewsReport.previousMonth, function (pageView) {
                var value = pageView.value || 0;
                pageviewsPreviousData += value;
            });

            $scope.pageviewsPreviousData = pageviewsPreviousData;

            var pageviewsPercent = ChartAnalyticsService.calculatePercentChange(pageviewsPreviousData, currentTotalPageviews);
            $scope.pageviewsPercent = pageviewsPercent;

            // ----------------------------------------
            // Sessions
            // ----------------------------------------


            var _sessionsData = [];
            var _totalSessions = 0;
            _.each(results.sessionsReport.currentMonth, function (session) {
                var subArr = [];
                var value = session.total || session.value || 0;
                _totalSessions += value;
                subArr.push(new Date(session.timeframe.start).getTime());
                subArr.push(value);
                _sessionsData.push(subArr);
            });
            $scope.sessions = _totalSessions;
            $scope.sessionsData = _sessionsData;



            ChartAnalyticsService.analyticsOverview($scope.pageviewsData, $scope.sessionsData, $scope.visitorsData, $scope.dauData, function (data) {
                //$scope.$apply(function () {
                    $scope.analyticsOverviewConfig = data;
                //});
                $scope.analyticsOverviewConfig.loading = false;
            });

            var sessionsPreviousData = 0;
            _.each(results.sessionsReport.previousMonth, function (previousSession) {
                var value = previousSession.total || previousSession.value || 0;
                sessionsPreviousData += value;
            });
            console.log('Calculate percent change sessions:');
            var sessionsPercent = ChartAnalyticsService.calculatePercentChange(sessionsPreviousData, _totalSessions);
            console.log('total:' + _totalSessions + ', prev:' + sessionsPreviousData + ', percent:' + sessionsPercent);
            $scope.sessionsPercent = sessionsPercent;

            var slr = results.sessionLengthReport;//slr = SessionLengthReport
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

            // ======================================
            // Traffic Sources
            // ======================================

            $scope.trafficSourceData = results.trafficSourcesReport;

            // ======================================
            // New vs. Returning Customers
            // ======================================

            var newCustomers = ['New'];
            var returningCustomers = ['Returning'];
            _.each(results.newVsReturningReport, function(result){
                if(result._id === 'new') {
                    newCustomers.push(result.count);
                } else if(result._id === 'returning') {
                    returningCustomers.push(result.count);
                }
            });
            var newVsReturning = [
                newCustomers,
                returningCustomers
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

            var locationData = [];
            if (results.visitorLocationsReport) {
                var _formattedLocations = [];
                _.each(results.visitorLocationsReport, function (loc) {
                    if (loc['ip_geo_info.province']) {
                        _formattedLocations.push(loc);
                    }
                });
                $scope.mostPopularState = _.max(_formattedLocations, function (o) {
                    return o.result;
                });
                _.each(results.visitorLocationsReport, function (location) {
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

            // ======================================
            // User Agent Pie Chart
            // ======================================
            var userAgentData = [];
            var browserMap = {};
            if(results.userAgents) {
                var browserTotal = 0;
                _.each(results.userAgents, function(obj){
                    var browser = obj._id.browserName;
                    var count = obj.count;
                    if(browserMap[browser]) {
                        browserMap[browser] += count;
                    } else {
                        browserMap[browser] = count;
                    }
                    browserTotal+= count;                    
                });
                $scope.browserTotal = browserTotal;
                console.log('browserMap:', browserMap);
                userAgentData = userAgentData.concat(_.pairs(browserMap));
                userAgentData = _.sortBy(userAgentData, function(pair){return pair[1]});
                console.log('userAgentData', userAgentData);
                $scope.userAgentData = userAgentData;
                var uadLength = userAgentData.length -1;
                $scope.topBrowser = userAgentData[uadLength][0];
                var browserPercent = Math.round((userAgentData[uadLength][1] / browserTotal) * 100);
                $scope.browserPercent = browserPercent;

                ChartAnalyticsService.userAgentChart(userAgentData, function(config){
                    $scope.userAgentConfig = config;
                    $scope.userAgentConfig.loading = false;
                });

                $scope.userAgentTableData = userAgentData.reverse();
                console.log('userAgentTableData:', $scope.userAgentTableData);
            }

            // ======================================
            // OS Pie Chart
            // ======================================
            var osData = [];
            var osMap = {};
            if(results.osReport) {
                var osTotal = 0;
                _.each(results.osReport, function(obj){
                    var os = obj._id.osName;
                    if(os === 'undefined' || os === undefined) {
                        os = 'Unknown';
                    }
                    var count = obj.count;
                    if(osMap[os]) {
                        osMap[os] += count;
                    } else {
                        osMap[os] = count;
                    }
                    osTotal += count;
                });
                osData = osData.concat(_.pairs(osMap));
                osData = _.sortBy(osData, function(pair){return pair[1];});
                $scope.osData = osData;
                var osLength = osData.length - 1;
                $scope.topOS = osData[osLength][0];
                var osPercent = Math.floor((osData[osLength][1] / osTotal) * 100);
                $scope.osPercent = osPercent;

                ChartAnalyticsService.osChart(osData, function(config){
                    $scope.osConfig = config;
                    $scope.osConfig.loading = false;
                });
            }
            // ======================================
            // Revenue
            // ======================================
            var revenueChartData = {
                xData: [],
                amountData: [],
                orderData: []
            };
            var currentTotalRevenue = 0;
            var currentTotalCount = 0;
            _.each(results.revenueReport.currentMonth, function(rev){
                revenueChartData.xData.push(new Date(rev.timeframe.start).getTime());
                var amt = rev.total || 0;
                var cnt = rev.count || 0;
                revenueChartData.amountData.push(amt);
                revenueChartData.orderData.push(cnt);
                currentTotalRevenue+= amt;
                currentTotalCount+= cnt;
            });

            $scope.revenueData = revenueChartData;
            $scope.revenue = parseFloat(currentTotalRevenue).toFixed(2);
            $scope.orderCount = currentTotalCount;

            var revenuePreviousData = 0;
            var ordersPreviousData = 0;
            _.each(results.revenueReport.prevMonth, function (rev) {
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

            // ======================================
            // Emails
            // ======================================

            var emailsData = [];
            var totalEmails = 0;
            _.each(results.emailsReport.emails, function(email){
                var subArr = [];
                var value = email.total || 0;
                subArr.push(new Date(email.timeframe.start).getTime());
                subArr.push(value);
                totalEmails += value;
                emailsData.push(subArr);
            });

            var campaignsData = [];
            _.each(results.emailsReport.campaigns, function(campaign){
                var subArr = [];
                var value = campaign.total || 0;
                subArr.push(new Date(campaign.timeframe.start).getTime());
                subArr.push(value);

                campaignsData.push(subArr);
            });

            var opensData = [];
            var totalOpens = 0;
            _.each(results.emailsReport.opens, function(open){
                var subArr = [];
                var value = open.total || 0;
                subArr.push(new Date(open.timeframe.start).getTime());
                subArr.push(value);
                totalOpens += value;
                opensData.push(subArr);
            });

            var clicksData = [];
            var totalClicks = 0;
            _.each(results.emailsReport.clicks, function(click){
                var subArr = [];
                var value = click.total || 0;
                subArr.push(new Date(click.timeframe.start).getTime());
                subArr.push(value);
                totalClicks += value;
                clicksData.push(subArr);
            });

            ChartAnalyticsService.emailsOverview(emailsData, campaignsData, opensData, clicksData, function(data){
                $scope.emailsOverviewConfig = data;
                $scope.emailsOverviewConfig.loading = false;
                $scope.totalEmails = totalEmails;
                $scope.totalOpens = totalOpens;
                $scope.totalClicks = totalClicks;
            });

            //=======================================
            // Cleanup
            //=======================================

            $scope.locationData = locationData;


            $scope.displayVisitors = $scope.visitors > 0;

            $scope.renderAnalyticsCharts();

        };

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
                subArr.push(new Date(pageView.timeframe.start).getTime());
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

            // ----------------------------------------
            // Sessions
            // ----------------------------------------

            var _sessionsData = [];
            var _totalSessions = 0;
            _.each(results[6].result, function (session) {
                var subArr = [];
                var value = session.value || 0;
                _totalSessions += value;
                subArr.push(new Date(session.timeframe.start).getTime());
                subArr.push(value);
                _sessionsData.push(subArr);
            });
            $scope.sessions = _totalSessions;
            $scope.sessionsData = _sessionsData;


            ChartAnalyticsService.analyticsOverview($scope.pageviewsData, $scope.sessionsData, $scope.visitorsData, null, function (data) {
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

            $scope.renderAnalyticsCharts();
        };

        $scope.renderAnalyticsCharts = function () {
            if ($("#visitor_locations").length) {
                $timeout(function () {
                    var location_data = angular.copy($scope.locationData);
                    ChartAnalyticsService.visitorLocations(location_data, Highcharts.maps['countries/us/us-all']);
                }, 200);
                if (!$scope.displayVisitors) {
                    console.log('no visitors');
                    // var deshBlockUI = blockUI.instances.get('deshboardBlock');
                    // deshBlockUI.start("There haven't been any new visitors to your site yet. Once they do that data will be displayed here. To increase your site visitors you should add a social post.");
                }
            } else {
                $timeout(function(){
                    $scope.renderAnalyticsCharts();
                }, 100);
            }
        };


        $scope.displayDatePicker = function(){
            $timeout(function() {
                angular.element('.deshboard-date-picker').click();
            }, 0);
        }

    }]);
}(angular));
