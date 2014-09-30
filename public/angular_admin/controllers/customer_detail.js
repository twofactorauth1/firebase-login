define(['app', 'customerService', 'stateNavDirective'], function(app) {
    app.register.controller('CustomerDetailCtrl', ['$scope', 'CustomerService', '$stateParams', '$state', function ($scope, CustomerService, $stateParams, $state) {
        $scope.customerId = $stateParams.id;
        CustomerService.getCustomer($scope.customerId, function (customer) {
            $scope.customer = customer;
            $scope.fullName = [$scope.customer.first, $scope.customer.middle, $scope.customer.last].join(' ');
            $scope.contactLabel = CustomerService.contactLabel(customer);            
        });
        CustomerService.getCustomerActivities($scope.customerId, function (activities) {
            $scope.activities = activities;
        });
        $scope.moreToggleFn = function (type) {
            var id = '.li-' + type + '.more';
            if ($(id).hasClass('hidden')) {
                $(id).removeClass('hidden');
            } else {
                $(id).addClass('hidden');
            }
        };
        $scope.importContactFn = function () {
            CustomerService.postFullContact($scope.customerId, function (data) {
                console.info(data);
            });
        };
    }]);
});
