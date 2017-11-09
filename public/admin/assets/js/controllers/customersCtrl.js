'use strict';
/*global app, window*/
(function (angular) {
    app.controller('CustomersCtrl', ["$scope", "$state", "toaster", "$modal", "$window", "CustomerService", "OrganizationService",'$timeout', 'SweetAlert', "$location", "$q","formValidations", function ($scope, $state, toaster, $modal, $window, CustomerService, OrganizationService,  $timeout, SweetAlert, $location, $q,formValidations) {

        $scope.tableView = 'list';
        $scope.itemPerPage = 100;
        $scope.showPages = 15;
        $scope.selectAllChecked = false;
        $scope.bulkActionChoice = {};
        $scope.tagsBulkAction = {};
        $scope.organizations=[];


        if (!$state.current.sort) {
            $scope.order = "reverse";
        }

        $scope.default_image_url = "/admin/assets/images/default-user.png";

        $scope.bulkActionChoices = [
            {data: 'tags', label: 'Tags'},
            {data: 'delete', label: 'Delete'}
        ];

        /*
         * @getCustomers
         * -
         */


        $scope.getCustomers = function () {
            CustomerService.loadAllCustomers(function(customers){
                $scope.customers = customers.results;
                $scope.showCustomers = true;
                console.log('customers:', customers);
            });
        };

        $scope.getCustomers();

        $scope.emailRegexPattern = formValidations.email;
        $scope.getOrganizations = function () {
            OrganizationService.loadOrganizations(function(organizations){
                $scope.organizations = organizations;
                if(organizations.length==1){
                    $scope.orgId =organizations[0];
                }else{
                    $scope.orgId = organizations.filter(function(org) {
                      return org._id === 0;
                    })[0];
                }
                console.log('organizations:', organizations,$scope.orgId);
            });
        };

        $scope.getOrganizations();


        $scope.viewSingle = function (customer) {
            var tableState = $scope.getSortOrder();
            $state.current.sort = tableState.sort;
            $location.path('/customers/' + customer._id);
        };


        /*
         * @getters
         * - getters for the sort on the table
         */

        $scope.getters = {
            created: function (value) {
                return value.created.date || -1;
            },
            modified: function (value) {
                return value.modified.date;
            },

            trialDays: function(value){
                var _days = 'N/A';
                if(value.billing && value.billing.plan == 'NO_PLAN_ARGUMENT'){
                    _days = value.trialDaysRemaining
                }
                if(value.billing && value.billing.plan != 'NO_PLAN_ARGUMENT'){
                    _days = 'N/A';
                }
                return _days;
            }
        };


        $scope.filterCustomers = function () {
          $scope.showFilter = !$scope.showFilter;
        };



        /*
         * @column
         * -
         */

        $scope.column = {
            "_id": true,
            "subdomain": true,
            "customDomain": true,
            "signupDate": true,
            "trialDays": true,
            "plan": true,
            "phone": true,
            "created": true,
            "modified": true
        };


        $scope.selectAllClickFn = function ($event) {
            $event.stopPropagation();
            if ($scope.selectAllChecked) {
                $scope.selectAllChecked = false;
            } else {
                $scope.selectAllChecked = true;
            }
            $scope.displayedCustomers.forEach(function(customer, index) {
                customer.isSelected = $scope.selectAllChecked;
            });
        };


        $scope.customerSelectClickFn = function ($event, customer) {
            $event.stopPropagation();
            if (customer.isSelected) {
                customer.isSelected = false;
            } else {
                customer.isSelected = true;
            }
        };

        $scope.clearSelectionFn = function () {
            $scope.selectAllChecked = false;
            $scope.displayedCustomers.forEach(function(customer, index) {
                customer.isSelected = $scope.selectAllChecked;
            });
        };

        $scope.openSimpleModal = function (modal) {
            //$scope.orgId = LocalAcObject.getter().orgId;
            var _modal = {
                templateUrl: modal,
                scope: $scope,
                keyboard: true,
                backdrop: 'static'
            };
            $scope.modalInstance = $modal.open(_modal);
            $scope.modalInstance.result.then(null, function () {
                angular.element('.sp-container').addClass('sp-hidden');
            });
            //$scope.orgId = LocalAcObject.getter().orgId;
        };

        $scope.closeModal = function () {
            $scope.modalInstance.close();
            $scope.socailList = false;
            $scope.groupList = false;
        };

        $scope.addCustomer = function() {
            var orgId = $scope.orgId._id;
            var subdomain = $scope.subdomain;
            var username = $scope.username;
            var password = $scope.password;
            var oem = $scope.oem;
            var passkey = $scope.passkey;
            $scope.showCustomers = false;
            CustomerService.addNewCustomer(orgId, subdomain, username, password, oem, passkey, function(err, value){
                $scope.showCustomers = true;
                if(err) {
                    toaster.pop('warning', err.message);
                } else {
                    $scope.closeModal();
                    CustomerService.refreshCustomers(function(customers){
                        $scope.customers = customers.results;
                    });
                }
            });
        };

        $scope.clearCustomerModal =function(){
            $scope.subdomain = "";
            $scope.username = "";
            $scope.password = "";
        }
    }]);
}(angular));
