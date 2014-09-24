define(['app', 'customerService', 'stateNavDirective'], function(app) {
    app.register.controller('CustomerDetailCtrl', ['$scope', 'CustomerService', '$stateParams', '$state', function ($scope, CustomerService, $stateParams, $state) {
        $scope.customerId = $stateParams.id;
        CustomerService.getCustomer($scope.customerId, function (customer) {
            $scope.customer = customer;
            $scope.fullName = [$scope.customer.first, $scope.customer.middle, $scope.customer.last].join(' ');
        });
    }]);
});
