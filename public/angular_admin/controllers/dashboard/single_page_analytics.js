define(['app', 'ngProgress', 'formatCurrency', 'highcharts', 'highcharts-ng', 'dashboardService'], function(app) {
    app.register.controller('SinglePageAnalyticsCtrl', ['$scope','$location', 'ngProgress', 'dashboardService', function($scope, $location, ngProgress, dashboardService) {
        ngProgress.start();
        $scope.$back = function() { window.history.back(); };

        console.log('$route.current.params.postname >>> ', $location.$$search['pageurl']);

         $scope.query = function(params) {
            return new Promise(function(resolve, reject) {
                dashboardService.queryGoogleAnalytics(params, function(data) {
                    resolve(data);
                });
            });

        };

        var topPageViews = $scope.query({
                                ids: 'ga:82461709',
                                metrics: 'ga:pageviews,ga:timeOnPage,ga:exits,ga:avgTimeOnPage,ga:entranceRate,ga:entrances,ga:exitRate,ga:uniquePageviews',
                                dimensions: 'ga:date',
                                'start-date': '30daysAgo',
                                'end-date': 'yesterday',
                                filter: 'ga:pagePath=~/admin*'
                            });

        Promise.all([topPageViews]).then(function(results) {
            console.log('results >>> ', results);
        });



        //dimensions
        //ga:date

        //metrics
        //ga:pageviews,ga:timeOnPage,ga:exits,ga:avgTimeOnPage,ga:entranceRate,ga:entrances,ga:exitRate,ga:uniquePageviews

        //filter
        //ga:pagePath=~/admin*

    }]);
});