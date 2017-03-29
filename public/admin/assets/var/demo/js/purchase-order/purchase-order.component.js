(function(){

app.directive('purchaseOrderComponent', purchaseOrderComponent);
/* @ngInject */
function purchaseOrderComponent() {

    return {
        restrict: 'E',
        scope: {},      
        templateUrl: 'assets/var/demo/js/purchase-order/purchase-order.component.html',
        controller: 'PurchaseOrderComponentController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
