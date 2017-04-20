(function(){

app.directive('ledgerDetailsComponent', ledgerDetailsComponent);
/* @ngInject */
function ledgerDetailsComponent() {

    return {
        restrict: 'E',
        scope: {},      
        templateUrl: 'assets/var/demo/js/customers/ledger-details/ledger-details.component.html',
        controller: 'LedgerDetailsController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
