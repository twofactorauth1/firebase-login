(function(){

app.controller('InventoryComponentController', inventoryComponentController);

inventoryComponentController.$inject = ['$scope', '$attrs', '$filter', '$modal', '$timeout', '$location', 'InventoryService'];
/* @ngInject */
function inventoryComponentController($scope, $attrs, $filter, $modal, $timeout, $location, InventoryService) {

    var vm = this;

    vm.init = init;

    
    vm.viewSingleInventory = viewSingleInventory;

    $scope.$watch(function() { return InventoryService.inventory }, function(inventory) {
      vm.inventory = inventory;
    }, true);

    function viewSingleInventory(product){
        $location.path('/inventory/' + product._id);
    }

    function init(element) {
        vm.element = element;
    }

}

})();
