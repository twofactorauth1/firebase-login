(function(){

app.controller('InventoryDetailsController', inventoryDetailsController);

inventoryDetailsController.$inject = ['$scope', '$attrs', '$filter', '$modal', '$timeout', '$stateParams', '$location', 'InventoryService'];
/* @ngInject */
function inventoryDetailsController($scope, $attrs, $filter, $modal, $timeout, $stateParams, $location, InventoryService) {

    var vm = this;

    vm.init = init;

    console.log($stateParams.inventoryId);

    InventoryService.getSingleInventory($stateParams.inventoryId).then(function(response){
        vm.inventory = response;
    })

    function init(element) {
        vm.element = element;
    }

}

})();
