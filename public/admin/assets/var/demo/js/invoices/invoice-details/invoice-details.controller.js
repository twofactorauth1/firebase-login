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
    

    function backToInvoices(){
        $state.go("app.customers");
    }

    function init(element) {
        vm.element = element;
        InvoiceService.viewCustomerInvoice($stateParams.customerId).then(function(response){
            vm.invoice = response.data.response.payload.querydata.data;
            //vm.totalLineOrder = calculateTotal(vm.invoice);
            vm.uiState.loading = false;
        }) 
    }

    function calculateTotal(orders){
        var _sum = 0;
        _.each(orders, function(order){
            _sum+= order.lineTotal
        })
        return _sum;
    }

}

})();
