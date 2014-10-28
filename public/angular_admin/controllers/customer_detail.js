define(['app', 'customerService', 'stateNavDirective', 'ngProgress', 'toasterService'], function(app) {
    app.register.controller('CustomerDetailCtrl', ['$scope', 'CustomerService', '$stateParams', '$state', 'ngProgress', 'ToasterService', function ($scope, CustomerService, $stateParams, $state, ngProgress, ToasterService) {
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
            ToasterService.processPending();
        });
        CustomerService.getActivityTypes(function (activity_types) {
            $scope.activity_types = activity_types;
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
        $scope.displayAddressFormat = function (address) {
            return _.filter([address.address, address.address2, address.city, address.state, address.country, address.zip],function(str) {
            	return str !== "";
         	 }).join(",")
        };
        $scope.showAddress = function (address) {
           	arrAddress =  _.filter([address.address, address.address2, address.city, address.state, address.country, address.zip, address.lat, address.lon],function(str) {
            	return str !== "";
         	 })
         	 return arrAddress.length > 0 ;
        };
    }]);
});
