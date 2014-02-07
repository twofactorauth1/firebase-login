(function () {

    var loginController = function ($scope, $location, $filter, dataService, modalService) {
        $scope.credential = {};
        $scope.loginFailed = false;
        $scope.loginUser = function () {
            console.log($scope.loginForm.$valid);
        };
    };

    customersManager.customersApp.controller('LoginController',
        ['$scope', '$location', '$filter', 'dataService', 'modalService', loginController]);

}());
