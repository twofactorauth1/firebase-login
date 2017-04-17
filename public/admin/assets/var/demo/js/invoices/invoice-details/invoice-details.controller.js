(function(){

app.controller('InvoiceDetailsController', invoiceDetailsController);

invoiceDetailsController.$inject = ['$scope', '$state', '$attrs', '$filter', '$modal', '$timeout', '$stateParams', '$location', 'InvoiceService'];
/* @ngInject */
function invoiceDetailsController($scope, $state, $attrs, $filter, $modal, $timeout, $stateParams, $location, InvoiceService) {

    var vm = this;

    vm.init = init;

    console.log($stateParams.invoiceId);

    vm.uiState = {loading: true};

    vm.backToInvoices = backToInvoices;
    vm.calculateTotal = calculateTotal;
    vm.parseValueToFloat = parseValueToFloat;
    vm.parseValueToDate = parseValueToDate;


    function backToInvoices(){
        $state.go("app.customers");
    }

    function init(element) {
        vm.element = element;
        InvoiceService.viewCustomerInvoice($stateParams.customerId).then(function(response){
            vm.invoice = response.data.response.payload.querydata.data;
            if(vm.invoice && vm.invoice.row)
                vm.totalLineOrder = calculateTotal(vm.invoice);
            vm.uiState.loading = false;
        })
    }

    function calculateTotal(orders){
        var _sum = 0;
        _.each(orders.row, function(order){
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
