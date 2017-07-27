(function(){

app.controller('InvoiceDetailsController', invoiceDetailsController);

invoiceDetailsController.$inject = ['$scope', '$state', '$attrs', '$filter', '$modal', '$timeout', '$stateParams', '$location', 'toaster', 'InvoiceService', 'InventoryService'];
/* @ngInject */
function invoiceDetailsController($scope, $state, $attrs, $filter, $modal, $timeout, $stateParams, $location, toaster, InvoiceService, InventoryService) {

    var vm = this;

    vm.init = init;



    vm.uiState = {loading: true};

    vm.backToLedger = backToLedger;
    vm.calculateTotal = calculateTotal;
    vm.parseValueToFloat = parseValueToFloat;
    vm.parseValueToDate = parseValueToDate;
    vm.goToInventory = goToInventory;

    vm.customerId = $stateParams.customerId;
    vm.transId = $stateParams.transId;

    function backToLedger(){
        $state.go('app.ledgerDetails', {customerId: vm.customerId});
    }

    function init(element) {
        vm.element = element;
        InvoiceService.viewCustomerInvoice(vm.customerId, vm.transId).then(function(response){
            var customer = response.data;
            if(customer && customer.results){
                vm.invoiceDetails = customer.results;
                //vm.totalLineOrder = calculateTotal(vm.invoiceDetails);
                calculateTotal(vm.invoiceDetails);
                vm.uiState.loading = false;
            }
            else{
                vm.uiState.loading = false;
            }
        }).catch(function(error) {
            vm.uiState.loading = false;
            if(error.data && error.data.message)
                toaster.pop('error', 'Error', error.data.message);
        });
    }

    function goToInventory(name){
        InventoryService.getSingleInventoryByName(name).then(function(response){
            if (response) {
                $state.go('app.singleInventory', {inventoryId: response.data["@id"]});
            } else {
                // no-op;
            }
        });
    }

    function calculateTotal(orders){
        var _sum = 0;
        var totalTax = 0;
        var totalFreight = 0;
        var totalDiscount = 0;
        var totalPaidToDate = 0;
        _.each(orders, function(order){
            _sum += parseFloat(order.INV1_LineTotal || 0);
            totalTax += parseFloat(order.OINV_VatSum  || 0);
            totalFreight += parseFloat(order.OINV_TotalExpns || 0);
            totalDiscount += parseFloat(order.OINV_DiscSum || 0);
            totalPaidToDate += parseFloat(order.OINV_PaidToDate || 0);
        })
        vm.totalTax = totalTax;
        vm.totalFreight = totalFreight;
        vm.totalDiscount = totalDiscount;
        vm.total = totalTax + totalFreight + totalDiscount;
        vm.totalLineOrder = _sum;
        //return _sum;
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
