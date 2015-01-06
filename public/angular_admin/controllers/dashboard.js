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
    'userService','activityDirective'
    ], function(app) {
    app.register.controller('DashboardCtrl',
        ['$scope',
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
    function($scope, $window, $resource, ngProgress, PaymentService, dashboardService, CustomerService, keenService, NavigationService, ChartAnalyticsService, ChartCommerceService, UserService) {

        ngProgress.start();
        NavigationService.updateNavigation();

        $scope.activeTab = 'analytics';

        $scope.$watch('activeTab', function() {
            console.log('tab changed');
            //$(window).trigger('resize');
        });

        $scope.date = {
            startDate: moment().subtract('days', 29).utc().format("YYYY-MM-DDTHH:mm:ss") + "Z",
            endDate: moment().utc().format("YYYY-MM-DDTHH:mm:ss") + "Z"
        };

        var dateSwitch = false;
        $scope.$watch('selectedDate', function() {
           $scope.date.startDate = moment($scope.selectedDate.startDate).utc().format("YYYY-MM-DDTHH:mm:ss") + "Z";
           $scope.date.endDate = moment($scope.selectedDate.endDate).utc().format("YYYY-MM-DDTHH:mm:ss") + "Z";
           //update user preferences
           if (dateSwitch) {
                $scope.runAnalyticsReports();
            }
            dateSwitch = true;
        });

        $scope.selectedDate = $scope.date;

        $scope.pickerOptions = {
            format: 'MMMM D, YYYY',
            opens: 'left',
            ranges: {
               'Today': [moment(), moment()],
               'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
               'Last 7 Days': [moment().subtract('days', 6), moment()],
               'Last 30 Days': [moment().subtract('days', 29), moment()],
               'This Month': [moment().startOf('month'), moment().endOf('month')],
               'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
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
            ChartAnalyticsService.runReports($scope.date, account, function(data) {

                $scope.desktop = data.desktop;
                $scope.mobile = data.mobile;
                $scope.visitorsData = data.visitorsData;
                $scope.visitors = data.currentTotalVisitors;
                $scope.pageviews = data.currentTotalPageviews;
                $scope.pageviewsData = data.pageviewsData;
                $scope.pageviewsPercent = data.pageviewsPercent;
                $scope.visitorsPercent = data.visitorsPercent;
                $scope.pageviewsPreviousData = data.pageviewsPreviousData;
                $scope.sessions = data.totalSessions;
                $scope.sessionsData = data.sessionData;
                $scope.sessionsPercent = data.sessionsPercent;
                $scope.bounces = data.totalBounces;
                $scope.bouncesData = data.bouncesData;
                $scope.bouncesPercent = data.bouncesPercent;
                $scope.totalTypes = data.totalTypes;
                $scope.trafficSourceData = data.trafficSourceData;
                $scope.newVsReturning = data.newVsReturning;
                $scope.locationData = data.locationData;
                $scope.formattedTopPages = data.formattedTopPages;
                $scope.pagedformattedTopPages = data.pagedformattedTopPages;
                $scope.visitDuration = data.visitDuration;
                $scope.visitDurationPercent = data.visitDurationPercent;
                $scope.avgSessionData = data.avgSessionData;

                $scope.renderAnalyticsCharts();
            });
        };
        UserService.getAccount(function(account){
            $scope.runAnalyticsReports(account);
        });


        $scope.renderAnalyticsCharts = function() {

            ChartAnalyticsService.analyticsOverview($scope.pageviewsData, $scope.sessionsData, $scope.visitorsData, function(data) {
                $scope.analyticsOverviewConfig = data;
            });

            ChartAnalyticsService.timeOnSite($scope.avgSessionData, $scope.bouncesData, function(data) {
                $scope.timeonSiteConfig = data;
            });

            ChartAnalyticsService.trafficSources($scope.trafficSourceData, function(data) {
                $scope.trafficSourcesConfig = data;
            });

            ChartAnalyticsService.newVsReturning($scope.newVsReturning, function(data) {
                $scope.newVsReturningConfig = data;
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

            ngProgress.complete();
        };

        $scope.renderCommerceCharts = function() {
            ChartCommerceService.customerOverview($scope.totalCustomerData, $scope.customerStart, $scope.cancelSubscriptionData, $scope.cancelStart, function(data) {
                $scope.customerOverviewConfig = data;
            });
        };

        $scope.runCommerceReports = ChartCommerceService.runReports
(function(data) {
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

    }]);
});
