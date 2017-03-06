(function(){

app.directive('inventoryComponent', inventoryComponent);
/* @ngInject */
function inventoryComponent() {

    return {
        restrict: 'E',
        scope: {},      
        templateUrl: 'assets/var/demo/js/inventory/inventory.component.html',
        controller: 'InventoryComponentController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
