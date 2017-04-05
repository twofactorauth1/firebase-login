(function(){

app.directive('purchaseOrderDetailsComponent', purchaseOrderDetailsComponent);
/* @ngInject */
function purchaseOrderDetailsComponent() {

    return {
        restrict: 'E',
        scope: {},      
        templateUrl: 'assets/var/demo/js/purchase-order/purchase-order-details/purchase-order-details.component.html',
        controller: 'PurchaseOrderDetailsController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
