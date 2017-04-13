(function(){

app.directive('invoiceDetailsComponent', invoiceDetailsComponent);
/* @ngInject */
function invoiceDetailsComponent() {

    return {
        restrict: 'E',
        scope: {},      
        templateUrl: 'assets/var/demo/js/invoices/invoice-details/invoice-details.component.html',
        controller: 'InvoiceDetailsController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
