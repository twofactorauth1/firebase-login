'use strict';
/*global app, window*/
(function (angular) {
    app.controller('CustomersCtrl', ["$scope", "$state", "toaster", "$modal", "$window", "CustomerService",'$timeout', 'SweetAlert', "$location", "$q", function ($scope, $state, toaster, $modal, $window, CustomerService,  $timeout, SweetAlert, $location, $q) {

        $scope.tableView = 'list';
        $scope.itemPerPage = 100;
        $scope.showPages = 15;
        $scope.selectAllChecked = false;
        $scope.bulkActionChoice = {};
        $scope.tagsBulkAction = {};

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
            CustomerService.getCustomers(null, null, 0, 500, function(customers){
                $scope.customers = customers.results;
                $scope.showCustomers = true;
                console.log('customers:', customers);
            });

        };

        $scope.getCustomers();


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


    }]);
}(angular));
