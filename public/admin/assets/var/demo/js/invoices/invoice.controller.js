(function(){

app.controller('InvoiceComponentController', invoiceComponentController);

invoiceComponentController.$inject = ['$scope', '$attrs', '$filter', '$modal', '$timeout', '$location', 'InvoiceService'];
/* @ngInject */
function invoiceComponentController($scope, $attrs, $filter, $modal, $timeout, $location, InvoiceService) {

    var vm = this;

    vm.init = init;

    vm.state = {};


    vm.uiState = {
        loading: true
    };

    vm.viewSingleInvoice = viewSingleInvoice;


    function viewSingleInvoice(invoice){
        $location.path('/invoices/' + invoice._id);
    }

    $scope.$watch(function() { return InvoiceService.invoices }, function(invoices) {
        if(angular.isDefined(invoices)){
            vm.state.invoices = invoices;
            vm.state.totalInvoices = invoices.length;
            vm.uiState.loading = false;
        }
    }, true);

    function init(element) {
        vm.element = element;
    }

}

})();