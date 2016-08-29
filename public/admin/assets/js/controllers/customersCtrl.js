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
            name: function (value) {
                return [value.first, value.middle, value.last].join(' ').trim();
            },
            tags: function (value) {
                return $scope.contactTagsFn(value);
            },
            phone: function (value) {
                if (value.details[0] && value.details[0].phones && value.details[0].phones[0]) {
                    return value.details[0].phones[0].number.trim();
                }
                return "";
            },
            address: function (value) {
                return value.bestAddress
            },
            social: function (value) {
                if (value.hasLinkedInId) {
                    return 1;
                }
                if (value.hasGoogleId) {
                    return 2;
                }
                if (value.hasFacebookId) {
                    return 3;
                }
                if (value.hasTwitterId) {
                    return 4;
                }

                return 5;
            }
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


    }]);
}(angular));
