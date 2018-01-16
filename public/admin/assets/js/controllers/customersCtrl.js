'use strict';
/*global app, window*/
(function (angular) {
    app.controller('CustomersCtrl', ["$scope", "$state", "toaster", "$modal", "$window", "CustomerService", "OrganizationService",'$timeout', 'SweetAlert', "$location", "$q","formValidations", "pagingConstant", "CustomerPagingService", "UtilService", function ($scope, $state, toaster, $modal, $window, CustomerService, OrganizationService,  $timeout, SweetAlert, $location, $q, formValidations, pagingConstant, CustomerPagingService, UtilService) {

        $scope.tableView = 'list';
        $scope.itemPerPage = 100;
        $scope.showPages = 15;
        $scope.selectAllChecked = false;
        $scope.bulkActionChoice = {};
        $scope.tagsBulkAction = {};
        $scope.organizations=[];

        $scope.loadingFilter = true;
        
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
            CustomerService.getPagedCustomers($scope.pagingParams, checkIfFieldSearch(), function(customers){                
                $scope.customers = customers.results;
                $scope.customerCount = customers.total;
                drawPages();
                $scope.showCustomers = true;
                $scope.loadingFilter = false;
                console.log('customers:', customers);
                $scope.pageLoading = false;
            });
        };

        

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
            $location.path('/customers/' + customer._id);
        };


        /*
         * @getters
         * - getters for the sort on the table
         */


        $scope.filterCustomers = function () {
            $scope.pagingParams.showFilter = !$scope.pagingParams.showFilter;
            setDefaults();
            if (!$scope.pagingParams.showFilter){
                clearFilter();
            }
        };

        function showFilter() {
            $scope.pagingParams.showFilter = !$scope.pagingParams.showFilter;
            setDefaults();
            if (!$scope.pagingParams.showFilter){
                clearFilter();
            }
        }



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
                    loadDefaults();
                    loadCustomersWithDefaults();
                }
            });
        };

        // PAGING RELATED

        $scope.numberOfPages = numberOfPages;
        $scope.selectPage = selectPage;
        $scope.sortCustomers = sortCustomers;
        $scope.showFilteredRecords = showFilteredRecords;
        $scope.loadCustomersWithDefaults = loadCustomersWithDefaults;

        $scope.pagingParams = {
            limit: pagingConstant.numberOfRowsPerPage,
            skip: CustomerPagingService.skip,
            curPage: CustomerPagingService.page,
            showPages: pagingConstant.displayedPages,
            globalSearch: angular.copy(CustomerPagingService.globalSearch),
            fieldSearch: angular.copy(CustomerPagingService.fieldSearch),
            showFilter: CustomerPagingService.showFilter,
            sortBy: CustomerPagingService.sortBy,
            sortDir: CustomerPagingService.sortDir
        };

        $scope.showFilter = false;

        $scope.sortData = {
            column: '',
            details: {}
        };

        if($scope.sortData.column == '' && $scope.pagingParams.sortBy !== undefined) {
            $scope.sortData.column = $scope.pagingParams.sortBy === "created.date" ? "created" : 
            $scope.pagingParams.sortBy === "details.emails.email" ? "email" : $scope.pagingParams.sortBy;
            $scope.sortData.details[$scope.sortData.column] = {
                direction: $scope.pagingParams.sortDir,
                sortColum: $scope.sortData.column
            };
        }

        // Paging Related

        function drawPages() {
            var start = 1,
                end,
                i,
                //var prevPage = $scope.pagingParams.curPage;
                currentPage = $scope.pagingParams.curPage,
                numPages = numberOfPages();

            start = Math.max(start, currentPage - Math.abs(Math.floor($scope.pagingParams.showPages / 2)));
            end = start + $scope.pagingParams.showPages;

            if (end > numPages) {
                end = numPages + 1;
                start = Math.max(1, end - $scope.pagingParams.showPages);
            }

            $scope.pages = [];


            for (i = start; i < end; i++) {
                $scope.pages.push(i);
            }
        }


        function numberOfPages() {
            if ($scope.customers) {
                return Math.ceil($scope.customerCount / $scope.pagingParams.limit);
            }
            return 0;
        }

        function selectPage(page) {
            if (page != $scope.pagingParams.curPage) {
                $scope.pagingParams.curPage = page;
                $scope.pagingParams.skip = (page - 1) * $scope.pagingParams.limit;
                $scope.pageLoading = true;
                setDefaults();
                $scope.getCustomers();
            }
        }


        function setDefaults() {
            CustomerPagingService.skip = angular.copy($scope.pagingParams.skip);
            CustomerPagingService.page = angular.copy($scope.pagingParams.curPage);
            CustomerPagingService.globalSearch = angular.copy($scope.pagingParams.globalSearch);
            CustomerPagingService.fieldSearch = angular.copy($scope.pagingParams.fieldSearch);
            CustomerPagingService.showFilter = angular.copy($scope.pagingParams.showFilter);
            CustomerPagingService.sortBy = angular.copy($scope.pagingParams.sortBy);
            CustomerPagingService.sortDir = angular.copy($scope.pagingParams.sortDir);

        }


        function loadDefaults() {
            $scope.pagingParams.curPage = 1;
            $scope.pagingParams.skip = 0;
            CustomerPagingService.skip = $scope.pagingParams.skip;
            CustomerPagingService.page = $scope.pagingParams.curPage;
            $scope.pageLoading = true;
        }

        /********** SORTING RELATED **********/

        function sortCustomers(col, name) {
            if ($scope.sortData.column !== name) {
                $scope.sortData.details = {};
            }
            $scope.sortData.column = name;
            if ($scope.sortData.details[name]) {
                if ($scope.sortData.details[name].direction === 1) {
                    $scope.sortData.details[name].direction = -1;
                } else {
                    $scope.sortData.details[name].direction = 1;
                }
            } else {
                $scope.sortData.details[name] = {
                    direction: 1,
                    sortColum: col
                };
            }
            $scope.pagingParams.sortBy = col;
            $scope.pagingParams.sortDir = $scope.sortData.details[name].direction;
            loadDefaults();
            setDefaults();
            $scope.getCustomers();
        }

        /********** GLOBAL SEARCH RELATED **********/

        $scope.$watch('pagingParams.globalSearch', function (term) {
            if (angular.isDefined(term)) {
                if (!angular.equals(term, CustomerPagingService.fieldSearch)) {
                    $scope.loadingFilter = true;
                    loadDefaults();
                    setDefaults();
                    $scope.getCustomers();
                }
            }
        }, true);

        /********** FILTER RELATED **********/

        $scope.$watch('pagingParams.fieldSearch', function (search) {
            if (angular.isDefined(search)) {
                if (!angular.equals(search, CustomerPagingService.fieldSearch)) {
                    $scope.loadingFilter = true;
                    loadDefaults();
                    setDefaults();
                    $scope.getCustomers();
                }
            }
        }, true);

        function clearFilter() {
            $scope.pagingParams.fieldSearch = {};
        }


        function checkIfFieldSearch() {
            var isFieldSearch = false,
                fieldSearch = $scope.pagingParams.fieldSearch;
            if (!_.isEmpty(fieldSearch)) {
                for (var i = 0; i <= Object.keys(fieldSearch).length - 1; i++) {
                    var key = Object.keys(fieldSearch)[i],
                        value = fieldSearch[key];

                    if (value) {
                        isFieldSearch = true;
                    }
                }
            }
            return isFieldSearch;
        }

        function showFilteredRecords() {
            return !$scope.loadingFilter && UtilService.showFilteredRecords($scope.pagingParams.globalSearch, $scope.pagingParams.fieldSearch);
        }
        $scope.getCustomerCount = function () {
            CustomerService.getTotalCustomers(function (response) {
                $scope.totalItemCount = response.count;
            });
        };

        function loadCustomersWithDefaults(){
            $scope.getCustomerCount();
            $scope.getCustomers();
        }
        
        loadCustomersWithDefaults();

        $scope.clearCustomerModal =function(){
            $scope.subdomain = "";
            $scope.username = "";
            $scope.password = "";
        }
        /// EXPORT

        $scope.selectAllClickFn = function ($event) {
            $event.stopPropagation();
            if ($scope.selectAllChecked) {
                $scope.selectAllChecked = false;
            } else {
                $scope.selectAllChecked = true;
            }
            $scope.customers.forEach(function (customer) {
                customer.isSelected = $scope.selectAllChecked;
            });
        };

        $scope.clearSelectionFn = function () {
            $scope.selectAllChecked = false;
            $scope.customers.forEach(function (customer) {
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

        $scope.selectedCustomersFn = function () {
            var exportCustomers = _.filter($scope.customers, function (customer) {
                return customer.isSelected;
            });
            $scope.exportText = exportCustomers.length ? "Export Selected " + exportCustomers.length : "Export";
            return exportCustomers;
        };

        $scope.exportCustomersFn = function () {
            if ($scope.selectedCustomersFn().length > 0) {
                CustomerService.exportCsvCustomers(_.pluck($scope.selectedCustomersFn(), '_id'), null);
            } else {
                CustomerService.exportCsvCustomers(null, $scope.pagingParams);
            }
            $scope.clearSelectionFn();
            toaster.pop('success', 'Customer export started.');
        };

    }]);
}(angular));
