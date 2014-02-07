(function () {

    var registerController = function ($scope, $location, $filter, dataService, modalService, clientService) {
        $scope.client = {};
        $scope.addClient = function () {
            if ($scope.addForm.$valid) {
                clientService.loginClient($scope.credential, successCallback, errorCallback);
            }
        };
        function successCallback (data, status, headers, config) {
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
        };
    };

    customersManager.customersApp.controller('RegisterController',
                                             ['$scope', '$location', '$filter', 'dataService', 'modalService', 'clientService', registerController]);

}());
