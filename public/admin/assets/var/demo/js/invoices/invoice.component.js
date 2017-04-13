(function(){

app.directive('invoiceComponent', invoiceComponent);
/* @ngInject */
function invoiceComponent() {

    return {
        restrict: 'E',
        scope: {},      
        templateUrl: 'assets/var/demo/js/invoices/invoice.component.html',
        controller: 'InvoiceComponentController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
