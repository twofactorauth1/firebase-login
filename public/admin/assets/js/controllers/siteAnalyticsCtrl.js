'use strict';
/**
 * controller for products
 */
(function(angular) {
    app.controller('siteAnalyticsCtrl', ["$scope", "$modal", "UserService", "ChartAnalyticsService", function($scope, $modal, UserService, ChartAnalyticsService) {
        setTimeout(function() {
            //ChartAnalyticsService.visitorLocations($scope.locationData, Highcharts.maps['countries/us/us-all']);
        }, 100);

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
            startDate: moment().subtract(29, 'days').utc().format("YYYY-MM-DDTHH:mm:ss") + "Z",
            endDate: moment().utc().format("YYYY-MM-DDTHH:mm:ss") + "Z"
        };

        var dateSwitch = false;
        $scope.$watch('selectedDate', function() {
            $scope.date.startDate = moment($scope.selectedDate.startDate).utc().format("YYYY-MM-DDTHH:mm:ss") + "Z";
            $scope.date.endDate = moment($scope.selectedDate.endDate).utc().format("YYYY-MM-DDTHH:mm:ss") + "Z";
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
            startDate: moment().subtract(29, 'days').toDate(),
            endDate: new Date()
        };

        $scope.pickerOptions = {
            startDate: moment().subtract(29, 'days').toDate(),
            endDate: new Date(),
            format: 'YYYY-MM-DD',
            opens: 'left',
            ranges: {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        };

        UserService.getAccount(function(account) {
            $scope.analyticsAccount = account;
            $scope.runAnalyticsReports();
        });

        $scope.runAnalyticsReports = function() {

            ChartAnalyticsService.runPagedReports($scope.date, $scope.analyticsAccount, function(data) {
                $scope.formattedTopPages = data.formattedTopPages;
                $scope.pagedformattedTopPages = data.pagedformattedTopPages;
            });

            ChartAnalyticsService.runReports($scope.date, $scope.analyticsAccount, function(data) {
                $scope.setReportData(data);
            });

            // ChartCommerceService.runReports(function(data) {
            //     $scope.monthlyRecurringRevenue = data.monthlyRecurringRevenue;
            //     $scope.avgRevenue = data.avgRevenue;
            //     $scope.annualRunRate = data.annualRunRate;
            //     $scope.arpu = data.arpu || null;
            //     $scope.totalCanceledSubscriptions = data.totalCanceledSubscriptions;
            //     $scope.cancelSubscriptionPercent = data.cancelSubscriptionPercent;
            //     $scope.cancelSubscriptionData = data.cancelSubscriptionData;
            //     $scope.cancelStart = data.cancelStart;
            //     $scope.potentialMRRLoss = data.potentialMRRLoss;
            //     $scope.userChurn = data.userChurn;
            //     $scope.lifetimeValue = data.lifetimeValue;
            //     $scope.totalRevenue = data.totalRevenue;
            //     $scope.totalFees = data.totalFees;
            //     $scope.totalRevenuePercent = data.totalRevenuePercent || null;
            //     $scope.netRevenue = data.netRevenue || null;
            //     $scope.totalCustomerData = data.totalCustomerData;
            //     $scope.totalPayingCustomerPercent = data.totalPayingCustomerPercent;
            //     $scope.customerStart = data.customerStart;
            //     $scope.totalPayingCustomers = data.totalPayingCustomers;
            //     $scope.renderCommerceCharts();
            // });
        };

        $scope.visitorDataReport = function(result2, result3) {
            var visitorsData = [];
            var currentTotalVisitors = 0;
            for (var k = 0; k < result2.length; k++) {
                var subArr = [];
                var value = result2[k].value || 0;
                currentTotalVisitors += value;
                subArr.push(new Date(result2[k].timeframe.start).getTime());
                subArr.push(value);
                visitorsData.push(subArr);
            };

            $scope.visitorsData = visitorsData;


            var vistorsPreviousData = 0;
            for (var h = 0; h < result3.length; h++) {
                var value = result3[h].value || 0;
                vistorsPreviousData += value;
            };

            var visitorsPercent = ChartAnalyticsService.calculatePercentage(vistorsPreviousData, currentTotalVisitors);

            $scope.$apply(function() {
                $scope.visitors = currentTotalVisitors;
                $scope.visitorsPercent = visitorsPercent;
            });
        };

        $scope.locationReportData = function(result0) {
            // ======================================
            // Visitor Locations
            // ======================================


            var locationData = [];
            for (var i = 0; i < result0.length; i++) {
                var subObj = {};
                subObj.code = ChartAnalyticsService.stateToAbbr(result0[i]['ip_geo_info.province']);
                subObj.value = result0[i].result;
                locationData.push(subObj);
            };
            $scope.$apply(function() {
                $scope.locationData = locationData;
            });
        };

        $scope.contentInteractionsReportData = function(result8, result10, result11) {
            // ----------------------------------------
            // Average Visit Duration
            // ----------------------------------------

            var avgSessionData = [];
            for (var b = 0; b < result8.length; b++) {
                var subArr = [];
                var value = result8[b].value || 0;
                subArr.push(new Date(result8[b].timeframe.start).getTime());
                subArr.push(value);
                avgSessionData.push(subArr);
            };

            $scope.avgSessionData = avgSessionData;


            // ======================================
            // Bounces
            // ======================================

            var _bouncesData = [];
            var _totalBounces = 0;
            for (var r = 0; r < result10.length; r++) {
                var subArr = [];
                var value = result10[r].value || 0;
                _totalBounces += value;
                subArr.push(new Date(result10[r].timeframe.start).getTime());
                subArr.push(value);
                _bouncesData.push(subArr);
            };

            $scope.bouncesData = _bouncesData;

            ChartAnalyticsService.timeOnSite($scope.avgSessionData, $scope.bouncesData, function(data) {
                $scope.timeonSiteConfig = data;
                $scope.timeonSiteConfig.loading = false;
            });


            var bouncesPercent = ChartAnalyticsService.calculatePercentage(_totalBounces, result11);
            $scope.$apply(function() {
                $scope.bounces = _totalBounces;
                $scope.bouncesPercent = bouncesPercent;
            });
        };

        $scope.setReportData = function(results) {
            var desktop, mobile;
            for (var i = 0; i < results[1].result.length; i++) {
                var category = results[1].result[i]['user_agent.device'];
                if (category === 'desktop') {
                    desktop = results[1].result[i].result;
                }
                if (category === 'mobile') {
                    mobile = results[1].result[i].result;
                } else {
                    mobile = 0;
                }
            };

            $scope.desktop = desktop;
            $scope.mobile = mobile;

            // ----------------------------------------
            // Visitors
            // ----------------------------------------

            $scope.visitorDataReport(results[2].result, results[3].result);

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

            $scope.pageviews = currentTotalPageviews;
            $scope.pageviewsData = pageviewsData;

            var pageviewsPreviousData = 0;
            for (var r = 0; r < results[5].result.length; r++) {
                var value = results[5].result[r].value || 0;
                pageviewsPreviousData += value;
            };

            $scope.pageviewsPreviousData = pageviewsPreviousData;

            var pageviewsPercent = ChartAnalyticsService.calculatePercentage(currentTotalPageviews, pageviewsPreviousData);
            $scope.pageviewsPercent = pageviewsPercent;

            // ----------------------------------------
            // Sessions
            // ----------------------------------------

            var _sessionsData = [];
            var _totalSessions = 0;
            for (var j = 0; j < results[6].result.length; j++) {
                var subArr = [];
                var value = results[6].result[j].value || 0;
                _totalSessions += value;
                subArr.push(new Date(results[6].result[j].timeframe.start).getTime());
                subArr.push(value);
                _sessionsData.push(subArr);
            };
            $scope.sessions = _totalSessions;
            $scope.sessionsData = _sessionsData;


            ChartAnalyticsService.analyticsOverview($scope.pageviewsData, $scope.sessionsData, $scope.visitorsData, function(data) {
                $scope.$apply(function() {
                    $scope.analyticsOverviewConfig = data;
                });
                $scope.analyticsOverviewConfig.loading = false;
            });

            var sessionsPreviousData = 0;
            for (var w = 0; w < results[7].result.length; w++) {
                var value = results[7].result[w].value || 0;
                sessionsPreviousData += value;
            };

            var sessionsPercent = ChartAnalyticsService.calculatePercentage(_totalSessions, sessionsPreviousData);

            $scope.sessionsPercent = sessionsPercent;

            var secsToConv = 0;
            if (results[9].result) {
                secsToConv = (results[9].result / 1000);
            }

            var visitDuration = ChartAnalyticsService.secToTime(secsToConv);

            if (results[15].result == null) {
                results[15].result = 0;
            }

            $scope.visitDuration = visitDuration;

            var previousVisitDuration = results[15].result;

            var visitDurationPercent = ChartAnalyticsService.calculatePercentage(results[9].result, previousVisitDuration);
            $scope.visitDurationPercent = visitDurationPercent;



            $scope.contentInteractionsReportData(results[8].result, results[10].result, results[11].result);

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
            $scope.totalTypes = _totalTypes;
            $scope.trafficSourceData = _trafficSourceData;

            ChartAnalyticsService.trafficSources($scope.trafficSourceData, function(data) {
                $scope.trafficSourcesConfig = data;
                $scope.trafficSourcesConfig.loading = false;
            });

            // // ======================================
            // // New vs. Returning Customers
            // // ======================================

            var newVsReturning = [
                ['New', results[14].result],
                ['Returning', results[13].result]
            ];
            $scope.newVsReturning = newVsReturning;

            ChartAnalyticsService.newVsReturning($scope.newVsReturning, function(data) {
                $scope.newVsReturningConfig = data;
                $scope.newVsReturningConfig.loading = false;
            });


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
            $scope.locationReportData(results[0].result);

            $scope.displayVisitors = $scope.visitors > 0;

            $scope.renderAnalyticsCharts();
        };

        $scope.renderAnalyticsCharts = function() {
            if ($("#visitor_locations").length) {
                setTimeout(function() {
                    ChartAnalyticsService.visitorLocations($scope.locationData, Highcharts.maps['countries/us/us-all']);
                }, 100);
                if (!$scope.displayVisitors) {
                    var deshBlockUI = blockUI.instances.get('deshboardBlock');
                    deshBlockUI.start("There haven't been any new visitors to your site yet. Once they do that data will be displayed here. To increase your site visitors you should add a social post.");
                }
            }
        };

        $scope.data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'My First dataset',
                fillColor: 'rgba(220,220,220,0.2)',
                strokeColor: 'rgba(220,220,220,1)',
                pointColor: 'rgba(220,220,220,1)',
                pointStrokeColor: '#fff',
                pointHighlightFill: '#fff',
                pointHighlightStroke: 'rgba(220,220,220,1)',
                data: [65, 59, 80, 81, 56, 55, 40, 84, 64, 120, 132, 87]
            }, {
                label: 'My Second dataset',
                fillColor: 'rgba(151,187,205,0.2)',
                strokeColor: 'rgba(151,187,205,1)',
                pointColor: 'rgba(151,187,205,1)',
                pointStrokeColor: '#fff',
                pointHighlightFill: '#fff',
                pointHighlightStroke: 'rgba(151,187,205,1)',
                data: [28, 48, 40, 19, 86, 27, 90, 102, 123, 145, 60, 161]
            }]
        };

        $scope.options = {

            maintainAspectRatio: false,

            // Sets the chart to be responsive
            responsive: true,

            ///Boolean - Whether grid lines are shown across the chart
            scaleShowGridLines: true,

            //String - Colour of the grid lines
            scaleGridLineColor: 'rgba(0,0,0,.05)',

            //Number - Width of the grid lines
            scaleGridLineWidth: 1,

            //Boolean - Whether the line is curved between points
            bezierCurve: false,

            //Number - Tension of the bezier curve between points
            bezierCurveTension: 0.4,

            //Boolean - Whether to show a dot for each point
            pointDot: true,

            //Number - Radius of each point dot in pixels
            pointDotRadius: 4,

            //Number - Pixel width of point dot stroke
            pointDotStrokeWidth: 1,

            //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
            pointHitDetectionRadius: 20,

            //Boolean - Whether to show a stroke for datasets
            datasetStroke: true,

            //Number - Pixel width of dataset stroke
            datasetStrokeWidth: 2,

            //Boolean - Whether to fill the dataset with a colour
            datasetFill: true,

            // Function - on animation progress
            onAnimationProgress: function() {},

            // Function - on animation complete
            onAnimationComplete: function() {},

            //String - A legend template
            legendTemplate: '<ul class="tc-chart-js-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'
        };
    }]);
})(angular);
