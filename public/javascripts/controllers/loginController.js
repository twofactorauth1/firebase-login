(function () {

    var loginController = function ($scope, $location, $filter, dataService, modalService, clientService) {
        $scope.credential = {};
        $scope.loginFailed = false;
        $scope.loginClient = function () {
            if ($scope.loginForm.$valid) {
                clientService.loginClient($scope.credential, successCallback, errorCallback);
            }
        };
        function successCallback (data, status, headers, config) {
            console.log(data, status, headers, config);
            if (data.status) {
                $location.path('/customers');
                $scope.loginFailed = false;
            }
            else {
                $scope.loginFailed = true;
            }
        };
        function errorCallback (data, status, headers, config) {
            $scope.loginFailed = true;
        }
    };

    customersManager.customersApp.controller('LoginController',
                                             ['$scope', '$location', '$filter', 'dataService', 'modalService', 'clientService', loginController]);

}());
