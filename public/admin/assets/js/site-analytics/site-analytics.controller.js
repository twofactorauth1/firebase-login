'use strict';
/*global app, moment, angular, Highcharts*/
/*jslint unparam:true*/
(function (angular) {
    app.controller('siteAnalyticsCtrl', ["$scope", "$modal", "SiteAnalyticsService", "$timeout", function ($scope, $modal, SiteAnalyticsService, $timeout) {

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


        $scope.runAnalyticsReports = function () {

            SiteAnalyticsService.runReports(function(){

            });

            ChartAnalyticsService.runPagedReports($scope.date, $scope.analyticsAccount, function (data) {
                $scope.formattedTopPages = _.reject(data.formattedTopPages, function(analytics){ return !angular.isDefined(analytics.page)});
                $scope.pagedformattedTopPages = _.reject(data.pagedformattedTopPages, function(analytics){ return !angular.isDefined(analytics.page)});
            });

            ChartAnalyticsService.runReports($scope.date, $scope.analyticsAccount, function (data) {
                $scope.setReportData(data);
            });
        };

        $scope.visitorDataReport = function (result2, result3) {
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

            $scope.visitorsData = visitorsData;

            var vistorsPreviousData = 0;
            _.each(result3, function (previousVisitor) {
                var value = previousVisitor.value || 0;
                vistorsPreviousData += value;
            });

            var visitorsPercent = ChartAnalyticsService.calculatePercentage(vistorsPreviousData, currentTotalVisitors);

            $scope.$apply(function () {
                $scope.visitors = currentTotalVisitors;
                $scope.visitorsPercent = visitorsPercent;
            });
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

            $scope.$apply(function () {
                $scope.locationData = locationData;
            });
        };

        $scope.contentInteractionsReportData = function (result8, result10, result11) {
            // ----------------------------------------
            // Average Visit Duration
            // ----------------------------------------

            var avgSessionData = [];
            _.each(result8, function (session) {
                var subArr = [];
                var value = session.value || 0;
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
                var value = bounce.value || 0;
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


            var bouncesPercent = ChartAnalyticsService.calculatePercentage(_totalBounces, result11);
            $scope.$apply(function () {
                $scope.bounces = _totalBounces;
                $scope.bouncesPercent = bouncesPercent;
            });
        };

        $scope.setReportData = function (results) {
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


            ChartAnalyticsService.analyticsOverview($scope.pageviewsData, $scope.sessionsData, $scope.visitorsData, function (data) {
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
                }, 100);
                if (!$scope.displayVisitors) {
                    console.log('no visitors');
                    // var deshBlockUI = blockUI.instances.get('deshboardBlock');
                    // deshBlockUI.start("There haven't been any new visitors to your site yet. Once they do that data will be displayed here. To increase your site visitors you should add a social post.");
                }
            }
        };

    }]);
}(angular));