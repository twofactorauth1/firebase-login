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

    

    function backToInvoices(){
        $state.go("app.invoices");
    }

    function init(element) {
        vm.element = element;
        InvoiceService.getSingleInvoice($stateParams.invoiceId).then(function(response){
            vm.invoice = response;
            vm.uiState.loading = false;
        }) 
    }

}

})();
