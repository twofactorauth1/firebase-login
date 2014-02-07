(function () {

    var registerController = function ($scope, $location, $filter, dataService, modalService, clientService) {
        $scope.client = {};
        $scope.message = null;
        $scope.addClient = function () {
            if ($scope.addForm.$valid) {
                clientService.addClient($scope.client, successCallback, errorCallback);
            }
        };
        function successCallback (data, status, headers, config) {
            if (data.status) {
                $location.path('/login');
            }
            else {
                $scope.message = data.message;
            }
        };
        function errorCallback (data, status, headers, config) {
        };
    };

    customersManager.customersApp.controller('RegisterController',
                                             ['$scope', '$location', '$filter', 'dataService', 'modalService', 'clientService', registerController]);

}());
