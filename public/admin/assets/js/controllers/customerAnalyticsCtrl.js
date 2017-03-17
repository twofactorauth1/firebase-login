'use strict';
/*global app, moment, angular, Highcharts*/
/*jslint unparam:true*/
(function (angular) {
    app.controller('customerAnalyticsCtrl', ["$scope", "$modal", "UserService", "ChartAnalyticsService", "$timeout", "AnalyticsWidgetStateService", "$interval", "analyticsConstant", "$rootScope", function ($scope, $modal, UserService, ChartAnalyticsService, $timeout, AnalyticsWidgetStateService, $interval, analyticsConstant, $rootScope) {

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
                $scope.countryLocationData = null;
                $scope.pagedformattedTopPages = null;

                $scope.runAnalyticsReports($scope.analyticsAccount);
            }
            dateSwitch = true;
        });

        $scope.selectedDate = {
            startDate: moment().subtract(6, 'days').startOf('day'),
            endDate: moment()
        };

        $scope.pickerOptions = {
            startDate: moment().subtract(6, 'days').toDate(),
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
            $scope.platformTraffic();
        });

        $scope.platformTraffic = function() {
            ChartAnalyticsService.getPlatformTraffic(function(data){
                var trafficData = _.pluck(data, 'count');
                var livePlatformTrafficConfig = ChartAnalyticsService.liveTraffic(trafficData);
                $scope.livePlatformTraffic = data;
                $scope.livePlatformTrafficConfig = livePlatformTrafficConfig;

                $timeout($scope.updatePlatformTraffic, 15000);
            });
        };

        $scope.updatePlatformTraffic = function() {
            ChartAnalyticsService.getPlatformTraffic(function(data){
                var chart = $('#live-traffic-chart').highcharts();
                chart.series[0].setData(_.pluck(data, 'count'), true);

                $scope.livePlatformTraffic = data;
                $timeout($scope.updatePlatformTraffic, 15000);
            });
        };

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

                //Frontrunner Sites Pageviews
                var _topFiveAccounts =_.first(_.sortBy($scope.pagedformattedTopPages, function(num){ return -num.pageviews; }), 5);

                var accountIdArray = _.map(_topFiveAccounts, function(account){
                    return account.accountId;
                });

                ChartAnalyticsService.getFrontrunnerSitesPageviews($scope.date, $scope.analyticsAccount, accountIdArray, function (data) {

                    var _data = _.object(_.map(data, function (value, key) {
                        var item = _.find(_topFiveAccounts, function(account){
                            return account.accountId == key;
                        });
                        if(item){
                            return [item.page, value];
                        }
                    }));
                    var series = [];
                    Object.keys(_data).forEach(function(key, index) {

                        var _chartData = [];
                        var _chartCount = 0;
                        _.each(_data[key], function (cData) {
                            var subArr = [];
                            var value = cData.value || 0;
                            _chartCount += value;
                            subArr.push(new Date(cData.timeframe.start.replace(" ", "T")).getTime());
                            subArr.push(value);
                            _chartData.push(subArr);
                        });
                        console.log(_chartCount);
                        var sData = {
                            name: key,
                            data: _chartData
                        }
                        series.push(sData);
                    });

                    ChartAnalyticsService.frontrunnerSitesPageviews(_data, series, function(data){
                        $scope.frontrunnerSitesPageviewsConfig = data;
                    });
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
                subArr.push(new Date(visitor.timeframe.start.replace(" ", "T")).getTime());
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
                subArr.push(new Date(session.timeframe.start.replace(" ", "T")).getTime());
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
                subArr.push(new Date(bounce.timeframe.start.replace(" ", "T")).getTime());
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
                subArr.push(new Date(pageView.timeframe.start.replace(" ", "T")).getTime());
                subArr.push(value);
                pageviewsData.push(subArr);
            });

            $scope.pageviews = currentTotalPageviews;
            $scope.pageviewsData = pageviewsData;

            var dauData = [];
            _.each(results.dau, function(dau){
                var subArr = [];
                var value = dau.total || 0;
                subArr.push(new Date(dau.timeframe.start.replace(" ", "T")).getTime());
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
                subArr.push(new Date(session.timeframe.start.replace(" ", "T")).getTime());
                subArr.push(value);
                _sessionsData.push(subArr);
            });
            $scope.sessions = _totalSessions;
            $scope.sessionsData = _sessionsData;



            ChartAnalyticsService.analyticsOverview($scope.pageviewsData, $scope.sessionsData, $scope.visitorsData, $scope.dauData, isVisibleLegend, setLegendVisibility, function (data) {
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

            $scope.trafficSourceData = ChartAnalyticsService.mergeLiveTrafficData(results.trafficSourcesReport);

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
            var countryLocationData = [];
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
            if(results.visitorLocationsByCountryReport) {
                var _formattedCountryLocations = [];
                _.each(results.visitorLocationsByCountryReport, function(loc){
                    if(loc['ip_geo_info.country'] && loc['ip_geo_info.country'] != "Unknown") {
                        _formattedCountryLocations.push(loc);
                    }
                });
                $scope.mostPopularCountry = _.max(_formattedCountryLocations, function(o){
                    return o.result;
                });
                _.each(results.visitorLocationsByCountryReport, function(location){
                    var _geo_info = ChartAnalyticsService.countryToAbbr(location['ip_geo_info.country']);
                    if(_geo_info && _geo_info!='Unknown') {
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
                revenueChartData.xData.push(new Date(rev.timeframe.start.replace(" ", "T")).getTime());
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
                subArr.push(new Date(email.timeframe.start.replace(" ", "T")).getTime());
                subArr.push(value);
                totalEmails += value;
                emailsData.push(subArr);
            });

            var campaignsData = [];
            _.each(results.emailsReport.campaigns, function(campaign){
                var subArr = [];
                var value = campaign.total || 0;
                subArr.push(new Date(campaign.timeframe.start.replace(" ", "T")).getTime());
                subArr.push(value);

                campaignsData.push(subArr);
            });

            var opensData = [];
            var totalOpens = 0;
            _.each(results.emailsReport.opens, function(open){
                var subArr = [];
                var value = open.total || 0;
                subArr.push(new Date(open.timeframe.start.replace(" ", "T")).getTime());
                subArr.push(value);
                totalOpens += value;
                opensData.push(subArr);
            });

            var clicksData = [];
            var totalClicks = 0;
            _.each(results.emailsReport.clicks, function(click){
                var subArr = [];
                var value = click.total || 0;
                subArr.push(new Date(click.timeframe.start.replace(" ", "T")).getTime());
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

            $scope.locationLabel = 'States';
            $scope.locationsLength = locationData.length;
            $scope.mostPopularLabel = $scope.mostPopularState['ip_geo_info.province'];

            // Country based
            $scope.countryLocationData = countryLocationData;
            $scope.locationLabelCountry = 'Countries';
            $scope.locationsLengthCountry = $scope.countryLocationData.length;
            $scope.mostPopularLabelCountry = $scope.mostPopularCountry['ip_geo_info.country'];


            $scope.displayVisitors = $scope.visitors > 0;

            $scope.renderAnalyticsCharts();

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

            // ----------------------------------------
            // Sessions
            // ----------------------------------------

            var _sessionsData = [];
            var _totalSessions = 0;
            _.each(results[6].result, function (session) {
                var subArr = [];
                var value = session.value || 0;
                _totalSessions += value;
                subArr.push(new Date(session.timeframe.start.replace(" ", "T")).getTime());
                subArr.push(value);
                _sessionsData.push(subArr);
            });
            $scope.sessions = _totalSessions;
            $scope.sessionsData = _sessionsData;


            ChartAnalyticsService.analyticsOverview($scope.pageviewsData, $scope.sessionsData, $scope.visitorsData, null, isVisibleLegend, setLegendVisibility, function (data) {
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
                $timeout(function(){
                    $scope.renderAnalyticsCharts();
                }, 100);
            }
        };


        $scope.displayDatePicker = function(){
            $timeout(function() {
                angular.element('.deshboard-date-picker').click();
            }, 0);
        };

        function reflowCharts(){
            window.Highcharts.charts.forEach(function(chart){
                $timeout(function() {
                    if(chart)
                        chart.reflow();
                }, 500);
            })
        };

        $scope.$watch('overview', function (value, oldValue) {
            if(angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded){
                AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("overview", value);
                reflowCharts();
            }
        });

        $scope.$watch('locations', function (value, oldValue) {
            if(angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded){
                AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("locations", value);
                reflowCharts();
            }
        });


        $scope.$watch('locationsGlobal', function (value, oldValue) {
            if(angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded){
                AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("locationsGlobal", value);
                reflowCharts();
            }
        });

        $scope.$watch('interactions', function (value, oldValue) {
            if(angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded){
                AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("interactions", value);
                reflowCharts();
            }
        });

        $scope.$watch('device', function (value, oldValue) {
            if(angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded){
                AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("device", value);
                reflowCharts();
            }
        });

        $scope.$watch('newVReturning', function (value, oldValue) {
            if(angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded){
                AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("newVReturning", value);
                reflowCharts();
            }
        });

        $scope.$watch('trafficSources', function (value, oldValue) {
            if(angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded){
                AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("trafficSources", value);
                reflowCharts();
            }
        });

        $scope.$watch('pageanalytics', function (value, oldValue) {
            if(angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded){
                AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("pageanalytics", value);
                reflowCharts();
            }
        });

        $scope.$watch('ua', function (value, oldValue) {
            if(angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded){
                AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("ua", value);
                reflowCharts();
            }
        });

        $scope.$watch('userAgentsTable', function (value, oldValue) {
            if(angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded){
                AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("userAgentsTable", value);
                reflowCharts();
            }
        });

        $scope.$watch('rev', function (value, oldValue) {
            if(angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded){
                AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("rev", value);
                reflowCharts();
            }
        });

        $scope.$watch('os', function (value, oldValue) {
            if(angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded){
                AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("os", value);
                reflowCharts();
            }
        });

        $scope.$watch('campaigns', function (value, oldValue) {
            if(angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded){
                AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("campaigns", value);
                reflowCharts();
            }
        });

        $scope.$watch('frontrunnerSite', function (value, oldValue) {
            if(angular.isDefined(value) && angular.isDefined(oldValue) && !angular.equals(value, oldValue) && $scope.dataLoaded){
                AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates("frontrunnerSite", value);
                reflowCharts();
            }
        });

        $scope.setAnalyticsWidgetStates = function(){
            AnalyticsWidgetStateService.getPlateformAnalyticsWidgetStates();
            $timeout(function() {
                $scope.overview = AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig.overview;
                $scope.locations = AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig.locations;
                $scope.locationsGlobal = AnalyticsWidgetStateService.siteAnalyticsWidgetStateConfig.locationsGlobal;
                $scope.interactions = AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig.interactions;
                $scope.device = AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig.device;
                $scope.newVReturning = AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig.newVReturning;
                $scope.trafficSources = AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig.trafficSources;
                $scope.pageanalytics = AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig.pageanalytics;
                $scope.ua = AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig.ua;
                $scope.userAgentsTable = AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig.userAgentsTable;
                $scope.rev = AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig.rev;
                $scope.os = AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig.os;
                $scope.campaigns = AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig.campaigns;
                $scope.frontrunnerSite = AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig.frontrunnerSite;
                $scope.dataLoaded = true;
                reflowCharts();
            }, 0);

        }


        $scope.uiState = {
            dashboardMode: false
        }


        $scope.$watch('uiState.dashboardMode', function (mode) {
            if(angular.isDefined(mode)){
                if(mode)
                {
                    console.log("dashboard Mode")
                    setDashboardMode();
                }
                else{
                    console.log("desktop Mode")
                    setDesktopMode();
                }
            }
        })

        var timer=undefined;
        function setDashboardMode(){
            $rootScope.app.layout.isAnalyticsDashboardMode = true;
            timer = $interval(function(){
                console.log("Refreshing");
                $scope.runAnalyticsReports();
                $scope.platformTraffic();
            }, $scope.analyticsRefreshAfterTime);
        }

        function setDesktopMode(){
            $rootScope.app.layout.isAnalyticsDashboardMode = false;
            if(angular.isDefined(timer))
            {
                $interval.cancel(timer);
                timer=undefined;
            }
        };

        $scope.$watchGroup(['app.layout.isAnalyticsDashboardMode', 'app.layout.isSidebarClosed'],  function (val1, val2) {
            if(angular.isDefined(val1) || angular.isDefined(val2)){
                reflowCharts();
            }
        })


        function isVisibleLegend(name, widget){
            var legend = widget.toLowerCase() + "_" + name.toLowerCase() + "_legend";
            legend = legend.replace(/ /g, "_");
            return AnalyticsWidgetStateService.plateformAnalyticsWidgetStateConfig[legend];
        }

        function setLegendVisibility(widget, name, value){
            var legend = widget.toLowerCase() + "_" + name.toLowerCase() + "_legend";
            legend = legend.replace(/ /g, "_");
            AnalyticsWidgetStateService.setPlateformAnalyticsWidgetStates(legend, value);
        }

    }]);
}(angular));
