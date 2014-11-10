define(['app', 'ngProgress', 'formatCurrency', 'highcharts', 'highcharts-ng'], function(app) {
    app.register.controller('SinglePageAnalyticsCtrl', ['$scope','$stateParams', 'ngProgress', function($scope, $stateParams, ngProgress) {
        ngProgress.start();
        $scope.$back = function() { window.history.back(); };

        console.log('$route.current.params.postname >>> ', $stateParams.pageId);

        //dimensions
        //ga:date

        //metrics
        //ga:pageviews,ga:timeOnPage,ga:exits,ga:avgTimeOnPage,ga:entranceRate,ga:entrances,ga:exitRate,ga:uniquePageviews

        //filter
        //ga:pagePath=~/admin*

    }]);
});