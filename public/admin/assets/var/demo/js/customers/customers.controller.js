(function(){

app.controller('CustomersComponentController', customersComponentController);

customersComponentController.$inject = ['$scope', '$attrs', '$filter', '$modal', '$timeout', '$location', 'pagingConstant', 'CustomersService'];
/* @ngInject */
function customersComponentController($scope, $attrs, $filter, $modal, $timeout, $location, pagingConstant, CustomersService) {

    var vm = this;

    vm.init = init;

    vm.state = {};

    vm.viewCustomerLedger = viewCustomerLedger;

    vm.pagingConstant = pagingConstant;


    vm.uiState = {
        loading: true
    };

    $scope.$watch(function() { return CustomersService.customers }, function(customers) {
        if(angular.isDefined(customers)){
            vm.state.customers = customers;
            vm.uiState.loading = false;
        }
    }, true);



    function viewCustomerLedger(customer){
        $location.path('/invoices/' + customer.OCRD_CardCode);
    }

    function init(element) {
        vm.element = element;
    }

}

})();