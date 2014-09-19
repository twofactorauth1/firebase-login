define(['app', 'customerService'], function(app) {
    app.register.controller('CustomerCtrl', ['$scope', 'CustomerService', function ($scope, CustomerService) {
        $scope.customerFilter = {};
        $scope.customerOrder = 'first';
        CustomerService.getCustomers(function (customers) {
            $scope.customers = customers;
            $scope.$watch('searchBar', function (newValue, oldValue) {
                if (newValue) {
                    var searchBarSplit = newValue.split(' ');
                    if (searchBarSplit.length >= 3) {
                        $scope.customerFilter.first = searchBarSplit[0];
                        $scope.customerFilter.middle = searchBarSplit[1];
                        $scope.customerFilter.last = searchBarSplit[2];
                    } else if (searchBarSplit.length == 2) {
                        $scope.customerFilter.first = searchBarSplit[0];
                        $scope.customerFilter.last = searchBarSplit[1];
                    } else if (searchBarSplit.length == 1) {
                        $scope.customerFilter.first = searchBarSplit[0];
                    }
                }
            });
        });
    }]);
});
