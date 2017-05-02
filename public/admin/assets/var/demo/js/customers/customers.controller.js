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
        globalSearch: undefined,
        fieldSearch: {},
    };

    $scope.$watch(function() { return CustomersService.customers }, function(customers) {
        if(angular.isDefined(customers)){
            vm.state.customers = customers;
            vm.uiState.loading = false;
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
    }

}

})();