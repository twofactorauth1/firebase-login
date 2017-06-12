(function(){

app.controller('CustomersComponentController', customersComponentController);

customersComponentController.$inject = ['$scope', '$attrs', '$filter', '$modal', '$timeout', '$location', 'pagingConstant', 'CustomersService', 'UtilService'];
/* @ngInject */
function customersComponentController($scope, $attrs, $filter, $modal, $timeout, $location, pagingConstant, CustomersService, UtilService) {

    var vm = this;

    vm.init = init;

    vm.state = {};

    vm.viewCustomerLedger = viewCustomerLedger;

    vm.pagingConstant = pagingConstant;

    vm.showFilteredRecords = showFilteredRecords;
    

    vm.uiState = {
        loading: true,
        globalSearch: CustomersService.globalSearch,
        fieldSearch: CustomersService.fieldSearch
    };

    $scope.$watch(function() { return CustomersService.customers }, function(customers) {
        if(angular.isDefined(customers)){
            vm.state.customers = customers.results;
            vm.uiState.loading = false;
        }
    }, true);


    /********** GLOBAL SEARCH RELATED **********/

    


    /********** FIELD SEARCH RELATED **********/

    $scope.$watch('vm.uiState.fieldSearch', function (search) {
        if(angular.isDefined(search)){
            if(!angular.equals(search, CustomersService.fieldSearch)){
                CustomersService.fieldSearch = angular.copy(search);
            }
        }
    }, true);


    $scope.$watch('vm.uiState.globalSearch', function (term) {
        if(angular.isDefined(term)){
            if(!angular.equals(term, CustomersService.globalSearch)){
                CustomersService.globalSearch = angular.copy(term);
            }
        }
    }, true);

    function viewCustomerLedger(customer){
        $location.path('/ledger/' + customer.OCRD_CardCode);
    }

    function showFilteredRecords(){
        return UtilService.showFilteredRecords(vm.uiState.globalSearch, vm.uiState.fieldSearch);
    }


    function init(element) {
        vm.element = element;

        $timeout(function() {
            var params = {
                globalSearch: vm.uiState.globalSearch,
                fieldSearch: vm.uiState.fieldSearch
            }
            $scope.$broadcast('refreshTableData', params);
        }, 0);
    }

}

})();