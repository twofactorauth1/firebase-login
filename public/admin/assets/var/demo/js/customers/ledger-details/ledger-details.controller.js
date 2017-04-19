(function(){

app.controller('LedgerDetailsController', ledgerDetailsController);

ledgerDetailsController.$inject = ['$scope', '$state', '$attrs', '$filter', '$modal', '$timeout', '$stateParams', '$location', 'CustomersService'];
/* @ngInject */
function ledgerDetailsController($scope, $state, $attrs, $filter, $modal, $timeout, $stateParams, $location, CustomersService) {

    var vm = this;

    vm.init = init;

    console.log($stateParams.customerId);

    vm.uiState = {loading: true};

    vm.backToCustomers = backToCustomers;
    
    vm.parseValueToFloat = parseValueToFloat;
    vm.parseValueToDate = parseValueToDate;


    function backToCustomers(){
        $state.go("app.customers");
    }

    function init(element) {
        vm.element = element;
        CustomersService.getLedgerDetails($stateParams.customerId).then(function(response){
            var ledger = response.data.response.payload.querydata.data;
            if(ledger && ledger.row){
                if(angular.isArray(ledger.row)){
                    vm.ledger = ledger
                }
                else{
                    vm.ledger = {
                        row: [
                            ledger.row
                        ]
                    }
                }
                vm.uiState.loading = false;
            }
            else{
                $scope.$watch(function() { return CustomersService.customers }, function(customers) {
                    if(angular.isDefined(customers)){
                        vm.listledger = _.find(CustomersService.customers, function(customer){
                            return customer.OCRD_CardCode.toLowerCase() == $stateParams.customerId.toLowerCase()
                        })
                    }
                    vm.uiState.loading = false;
                }, true);
            }
            
        })
    }
    
    function parseValueToFloat(value){
        if(value){
            return parseFloat(value);
        }
    }

    function parseValueToDate(value){
        if(value){
            var formattedDate = Date.parse(value); // "M/d/yyyy h:mm:ss a"
            return formattedDate;
        }
    }


}

})();
