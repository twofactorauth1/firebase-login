'use strict';
/**
 * controller for customers
 */
(function(angular) {
    app.controller('CustomersCtrl', ["$scope", "toaster", "$modal", "$filter", "CustomerService", function($scope, toaster, $modal, $filter, CustomerService) {

        CustomerService.getCustomers(function(customers) {
            console.log('customers >>> ', customers);
            _.each(customers, function(customer) {
                customer.bestEmail = $scope.checkBestEmail(customer);
                customer.bestAddress = $scope.checkAddress(customer);
            });
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

        $scope.column = {
            "photo": true,
            "name": true,
            "category": true,
            "email": true,
            "address": true,
            "social": true,
            "phone": true,
            "created": true,
            "modified": true
        };

        $scope.contactLabel = function(customer) {
            return CustomerService.contactLabel(customer);
        };

        $scope.checkBestEmail = function(contact) {
            var returnVal = CustomerService.checkBestEmail(contact);
            this.email = contact.email;
            return returnVal;
        };

        $scope.checkFacebookId = function(contact) {
            var returnVal = CustomerService.checkFacebookId(contact);
            this.facebookId = contact.facebookId;
            return returnVal;
        };

        $scope.checkTwitterId = function(contact) {
            var returnVal = CustomerService.checkTwitterId(contact);
            this.twitterId = contact.twitterId;
            return returnVal;
        };

        $scope.checkLinkedInId = function(contact) {
            var returnVal = CustomerService.checkLinkedInId(contact);
            this.linkedInUrl = contact.linkedInUrl;
            this.linkedInId = contact.linkedInId;
            return returnVal;
        };

        $scope.checkAddress = function(contact) {
            var returnVal = CustomerService.checkAddress(contact);
            this.address = contact.address;
            return returnVal;
        };

        $scope.preventClick = function(event) {
            event.stopPropagation();
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
            window.location = '/admin/#/customers/' + customer._id;
        };

    }]);
})(angular);
