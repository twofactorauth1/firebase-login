(function () {

    var logoutController = function ($scope, $location, $filter, dataService, modalService, clientService) {
        clientService.logoutClient(successCallback, errorCallback);
        function successCallback (data, status, headers, config) {
            if (data.status) {
                $location.path('/login');
            }
        };
        function errorCallback (data, status, headers, config) {
        };

    };

    customersManager.customersApp.controller('LogoutController',
                                             ['$scope', '$location', '$filter', 'dataService', 'modalService', 'clientService', logoutController]);

}());
