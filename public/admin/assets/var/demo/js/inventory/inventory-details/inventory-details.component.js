(function(){

app.directive('inventoryDetailsComponent', inventoryDetailsComponent);
/* @ngInject */
function inventoryDetailsComponent() {

    return {
        restrict: 'E',
        scope: {},      
        templateUrl: 'assets/var/demo/js/inventory/inventory-details/inventory-details.component.html',
        controller: 'InventoryDetailsController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
