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
        $state.go("app.invoices");
    }

    function init(element) {
        vm.element = element;
        InvoiceService.getSingleInvoice($stateParams.invoiceId).then(function(response){
            vm.invoice = response;
            vm.totalLineOrder = calculateTotal(response.orders);
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
