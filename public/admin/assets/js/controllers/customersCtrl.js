'use strict';
/**
 * controller for customers
 */
(function(angular) {
    app.controller('CustomersCtrl', ["$scope", "toaster", "$modal", "$filter", "CustomerService", function($scope, toaster, $modal, $filter, CustomerService) {

        CustomerService.getCustomers(function(customers) {
            console.log('customers >>> ', customers);
            $scope.customers = customers;
        });

        $scope.getters = {
            created: function(value) {
                return value.created.date;
            },
            modified: function(value) {
                return value.modified.date;
            }
        };

        $scope.contactLabel = function(customer) {
            return CustomerService.contactLabel(customer);
        };

        $scope.checkBestEmail = function(contact) {
            var returnVal = CustomerService.checkBestEmail(contact);
            this.email = contact.email;
            return returnVal;
        };

        $scope.openCustomerModal = function(size) {
            $scope.modalInstance = $modal.open({
                templateUrl: 'new-customer-modal',
                controller: 'CustomerCtrl',
                size: size,
                scope: $scope
            });
        };

        $scope.cancel = function() {
            $scope.modalInstance.close();
        };

        $scope.viewSingle = function(customer) {
            window.location = '/admin/#/app/customers/' + customer._id;
        };

    }]);
})(angular);
