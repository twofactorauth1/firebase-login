define(['app', 'ngProgress', 'formatCurrency', 'highcharts', 'highcharts-ng'], function(app) {
    app.register.controller('OtherRevenueCtrl', ['$scope', 'ngProgress', function($scope, ngProgress) {
        ngProgress.start();
        $scope.$back = function() { window.history.back(); };

    }]);
});