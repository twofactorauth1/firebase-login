(function(){

app.controller('InvoiceDetailsController', invoiceDetailsController);

invoiceDetailsController.$inject = ['$scope', '$state', '$attrs', '$filter', '$modal', '$timeout', '$stateParams', '$location', 'InvoiceService', 'CustomersService'];
/* @ngInject */
function invoiceDetailsController($scope, $state, $attrs, $filter, $modal, $timeout, $stateParams, $location, InvoiceService, CustomersService) {

    var vm = this;

    vm.init = init;

    

    vm.uiState = {loading: true};

    vm.backToLedger = backToLedger;
    vm.calculateTotal = calculateTotal;
    vm.parseValueToFloat = parseValueToFloat;
    vm.parseValueToDate = parseValueToDate;

    vm.customerId = $stateParams.customerId;
    vm.transId = $stateParams.transId;

    function backToLedger(){
        $state.go('app.ledgerDetails', {customerId: vm.customerId});
    }

    function init(element) {
        vm.element = element;
        InvoiceService.viewCustomerInvoice(vm.customerId).then(function(response){
            var customer = response.data.response.payload.querydata.data;
            if(customer && customer.row){
                if(angular.isArray(customer.row)){
                    vm.customer = customer;
                }
                else{
                    vm.customer = {
                        row: [
                            customer.row
                        ]
                    }
                }
                loadInvoiceDetails(vm.customer.row);
                vm.uiState.loading = false;
            }
            else{
                vm.uiState.loading = false;
            }
        })
    }


    function loadInvoiceDetails(ledgerDetails){
        vm.invoiceDetails = _.filter(ledgerDetails, function(row){
            return row._CustStatmentDtl_TransId == vm.transId
        })
        vm.totalLineOrder = calculateTotal(vm.invoiceDetails);            
    }

    function calculateTotal(orders){
        var _sum = 0;
        _.each(orders, function(order){
            _sum+= parseFloat(order.INV1_LineTotal)
        })
        return _sum;
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
