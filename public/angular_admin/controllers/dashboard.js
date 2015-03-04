define([
  'app',
  'ngProgress',
  'paymentService',
  'highcharts',
  'highcharts-funnel',
  'highcharts-standalone',
  'highmaps-data',
  'highmaps-us',
  'highcharts-ng',
  'formatCurrency',
  'secTotime',
  'formatText',
  'formatPercentage',
  'dashboardService',
  'customerService',
  'angular-daterangepicker',
  'daterangepicker',
  'count-to',
  'keenService',
  'navigationService',
  'chartAnalyticsService',
  'chartCommerceService',
  'userService', 'activityDirective', 'ngOnboarding', 'blockUI'
], function(app) {
  app.register.controller('DashboardCtrl', ['$scope',
    '$window',
    '$resource',
    'ngProgress',
    'PaymentService',
    'dashboardService',
    'CustomerService',
    'keenService',
    'NavigationService',
    'ChartAnalyticsService',
    'ChartCommerceService',
    'UserService',
    '$location',
    'blockUI',
    function($scope, $window, $resource, ngProgress, PaymentService, dashboardService, CustomerService, keenService, NavigationService, ChartAnalyticsService, ChartCommerceService, UserService, $location, blockUI) {
      UserService.getUserPreferences(function(preferences) {
        $scope.userPreferences = preferences;
        if ($scope.userPreferences.tasks) {
          if ($scope.showOnboarding = false && $scope.userPreferences.tasks.dashboard == undefined || $scope.userPreferences.tasks.dashboard == false) {
            $scope.finishOnboarding();
          }
        }
      });
      $scope.showOnboarding = false;
      $scope.stepIndex = 0;
      $scope.onboardingSteps = [{
        overlay: false
      }]
      $scope.beginOnboarding = function(type) {
        if (type == 'dashboard') {
          $scope.stepIndex = 0;

          $scope.onboardingSteps = [{
            overlay: true,
            title: 'Task: Explore Dashboard',
            description: "Checkout various stats and analytics about your site.",
            position: 'centered',
            width: 400
          }];
        }
      };

      $scope.finishOnboarding = function() {
        $scope.userPreferences.tasks.dashboard = true;
        UserService.updateUserPreferences($scope.userPreferences, false, function() {});
      };

      if ($location.$$search['onboarding']) {
        $scope.beginOnboarding($location.$$search['onboarding']);
      }

      ngProgress.start();
      NavigationService.updateNavigation();


      $scope.$watch('activeTab', function(newValue, oldValue) {
        console.log('tab changed');
        if (newValue != oldValue && newValue == 'analytics') {
          setTimeout(function() {
            ChartAnalyticsService.visitorLocations($scope.locationData, Highcharts.maps['countries/us/us-all']);
          }, 100);
        }
        //$(window).trigger('resize');
      });

      $scope.activeTab = 'analytics';
      $scope.analyticsOverviewConfig = {};
      $scope.timeonSiteConfig = {};
      $scope.trafficSourcesConfig = {};
      $scope.newVsReturningConfig = {};
      $scope.customerOverviewConfig = {};
      $scope.analyticsOverviewConfig.loading = true;
      $scope.timeonSiteConfig.loading = true;
      $scope.trafficSourcesConfig.loading = true;
      $scope.newVsReturningConfig.loading = true;
      $scope.customerOverviewConfig.loading = true;
      $scope.displayVisitors = true;

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
          $scope.analyticsOverviewConfig.loading = true;
          $scope.timeonSiteConfig.loading = true;
          $scope.trafficSourcesConfig.loading = true;
          $scope.newVsReturningConfig.loading = true;
          $scope.customerOverviewConfig.loading = true;
          $scope.displayVisitors = true;
          $("#visitor_locations").html($("#visitor_location_loading").clone().show());
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
        format: 'MMMM D, YYYY',
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

      $scope.newDesktop = false;

      $scope.$watch('desktop', function() {
        $scope.newDesktop = true;
        setTimeout(function() {
          $scope.newDesktop = false;
        }, 100);
      });

      $scope.runAnalyticsReports = function(account) {
        //console.log('account is: ', account);
        //console.log('date is: ', $scope.date);
        ChartAnalyticsService.runPagedReports($scope.date, account, function(data) {
          $scope.formattedTopPages = data.formattedTopPages;
          $scope.pagedformattedTopPages = data.pagedformattedTopPages;
        });

        ChartAnalyticsService.runReports($scope.date, account, function(data) {
                 $scope.setReportData(data);
        });        
      };
      UserService.getAccount(function(account) {
        $scope.analyticsAccount = account;
        $scope.runAnalyticsReports(account);
      });


      $scope.setReportData = function(results)
      {
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

            $scope.visitorsData = visitorsData;

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

            var visitorsPercent = ChartAnalyticsService.calculatePercentage(vistorsPreviousData, currentTotalVisitors);
            $scope.visitors = currentTotalVisitors;
            $scope.visitorsPercent = visitorsPercent;
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

            $scope.pageviewsPreviousData = pageviewsPreviousData;

            var pageviewsPercent = ChartAnalyticsService.calculatePercentage(currentTotalPageviews, pageviewsPreviousData);
            $scope.pageviewsPercent = pageviewsPercent;
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
            $scope.sessions = _totalSessions;
            $scope.sessionsData = _sessionsData;
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

            var sessionsPercent = ChartAnalyticsService.calculatePercentage(_totalSessions, sessionsPreviousData);

            $scope.sessionsPercent = sessionsPercent;

            var secsToConv = 0;
            if (results[9].result && _totalSessions) {
              secsToConv = (results[9].result / 1000) / _totalSessions;
            }
            var visitDuration = ChartAnalyticsService.secToTime(secsToConv);

            if (results[15].result == null) {
                results[15].result = 0;
            }

            $scope.visitDuration = visitDuration;

            var previousVisitDuration = results[15].result;

            var visitDurationPercent = ChartAnalyticsService.calculatePercentage(results[9].result, previousVisitDuration);
            $scope.visitDurationPercent = visitDurationPercent;
            // ----------------------------------------
            // Average Visit Duration
            // ----------------------------------------

            var avgSessionData = [];
            for (var b = 0; b < results[8].result.length; b++) {
                var subArr = [];
                var value = results[8].result[b].value || 0;
                subArr.push(new Date(results[8].result[b].timeframe.start).getTime());
                subArr.push(value);
                avgSessionData.push(subArr);
            };

             $scope.avgSessionData = avgSessionData;
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

            $scope.bounces = _totalBounces;
            $scope.bouncesData = _bouncesData;

            // if (_totalBounces >= $scope.bounces) {
            //     $scope.bounces = _totalBounces;
            //     if ($scope.firstQuery) {
            //         $scope.bouncesData = _bouncesData;
            //     } else {
            //         $scope.timeonSiteConfig.series[1].data = _bouncesData;
            //     }
            // }

            var bouncesPercent = ChartAnalyticsService.calculatePercentage(_totalBounces, results[11].result);
            $scope.bouncesPercent = bouncesPercent;
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
            $scope.newVsReturning = newVsReturning;

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
            console.log('locationData >>> ', results[0]);
            for (var i = 0; i < results[0].result.length; i++) {
                var subObj = {};
                subObj.code = ChartAnalyticsService.stateToAbbr(results[0].result[i]['ip_geo_info.province']);
                subObj.value = results[0].result[i].result;
                locationData.push(subObj);
            };
            $scope.locationData = locationData;
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
            
            $scope.displayVisitors = $scope.visitors > 0;                    
            $scope.renderAnalyticsCharts();
      }

      $scope.renderAnalyticsCharts = function() {

        ChartAnalyticsService.analyticsOverview($scope.pageviewsData, $scope.sessionsData, $scope.visitorsData, function(data) {
          $scope.analyticsOverviewConfig = data;
          $scope.analyticsOverviewConfig.loading = false;
        });

        ChartAnalyticsService.timeOnSite($scope.avgSessionData, $scope.bouncesData, function(data) {
          $scope.timeonSiteConfig = data;
          $scope.timeonSiteConfig.loading = false;
        });

        ChartAnalyticsService.trafficSources($scope.trafficSourceData, function(data) {
          $scope.trafficSourcesConfig = data;
          $scope.trafficSourcesConfig.loading = false;
        });

        ChartAnalyticsService.newVsReturning($scope.newVsReturning, function(data) {
          $scope.newVsReturningConfig = data;
          $scope.newVsReturningConfig.loading = false;
        });

        ChartAnalyticsService.visitorLocations($scope.locationData, Highcharts.maps['countries/us/us-all']);

        // var resizeTimer = 0;
        // window.onresize = function() {
        //     if (resizeTimer)
        //         clearTimeout(resizeTimer);

        //     resizeTimer = setTimeout(function() {
        //         if ($scope.analyticsOverviewConfig && $scope.customerOverviewConfig) {
        //             $scope.analyticsOverviewConfig.options.chart.width = (document.getElementById('main-viewport').offsetWidth) - 60;
        //             $scope.customerOverviewConfig.options.chart.width = (document.getElementById('activity-section').offsetWidth) - 20;
        //         }
        //     }, 100);
        // };
        if (!$scope.displayVisitors) {
          var deshBlockUI = blockUI.instances.get('deshboardBlock');
          deshBlockUI.start("There haven't been any new visitors to your site yet. Once they do that data will be displayed here. To increase your site visitors you should add a social post.");
        }
        ngProgress.complete();
        if ($location.$$search.onboarding) {
          $scope.showOnboarding = true;
        }
      };
      $scope.renderCommerceCharts = function() {
        ChartCommerceService.customerOverview($scope.totalCustomerData, $scope.customerStart, $scope.cancelSubscriptionData, $scope.cancelStart, function(data) {
          $scope.customerOverviewConfig = data;
          $scope.customerOverviewConfig.loading = false;
        });
      };

      $scope.runCommerceReports = ChartCommerceService.runReports(function(data) {
        $scope.monthlyRecurringRevenue = data.monthlyRecurringRevenue;
        $scope.avgRevenue = data.avgRevenue;
        $scope.annualRunRate = data.annualRunRate;
        $scope.arpu = data.arpu || null;
        $scope.totalCanceledSubscriptions = data.totalCanceledSubscriptions;
        $scope.cancelSubscriptionPercent = data.cancelSubscriptionPercent;
        $scope.cancelSubscriptionData = data.cancelSubscriptionData;
        $scope.cancelStart = data.cancelStart;
        $scope.potentialMRRLoss = data.potentialMRRLoss;
        $scope.userChurn = data.userChurn;
        $scope.lifetimeValue = data.lifetimeValue;
        $scope.totalRevenue = data.totalRevenue;
        $scope.totalFees = data.totalFees;
        $scope.totalRevenuePercent = data.totalRevenuePercent || null;
        $scope.netRevenue = data.netRevenue || null;
        $scope.totalCustomerData = data.totalCustomerData;
        $scope.totalPayingCustomerPercent = data.totalPayingCustomerPercent;
        $scope.customerStart = data.customerStart;
        $scope.totalPayingCustomers = data.totalPayingCustomers;

        $scope.renderCommerceCharts();
      });

      $scope.runCommerceReports;

      // window.setInterval(function() {
      //     console.log('running reports');
      //     $scope.runReports;
      // }, 15000);

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

      $scope.pageLimit = 15;

      $scope.pageChangeFn = function(currentPage, totalPages) {
        var begin = ((currentPage - 1) * $scope.pageLimit);
        var end = begin + $scope.pageLimit;
        $scope.pagedformattedTopPages = $scope.formattedTopPages.slice(begin, end);
      };

    }
  ]);
});
