define(['app', 'customerService', 'stateNavDirective', 'ngProgress'], function(app) {
    app.register.controller('CustomerDetailCtrl', ['$scope', 'CustomerService', '$stateParams', '$state', 'ngProgress', function ($scope, CustomerService, $stateParams, $state, ngProgress) {
        ngProgress.start();
        $scope.customerId = $stateParams.id;
        CustomerService.getCustomer($scope.customerId, function (customer) {
            $scope.customer = customer;
            $scope.fullName = [$scope.customer.first, $scope.customer.middle, $scope.customer.last].join(' ');
            $scope.contactLabel = CustomerService.contactLabel(customer);            
        });
        CustomerService.getCustomerActivities($scope.customerId, function (activities) {
            $scope.activities = activities;
            ngProgress.complete();
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
