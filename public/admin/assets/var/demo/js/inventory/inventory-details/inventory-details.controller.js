(function(){

app.controller('InventoryDetailsController', inventoryDetailsController);

inventoryDetailsController.$inject = ['$scope', '$state', '$attrs', '$filter', '$modal', '$timeout', '$stateParams', '$location', 'InventoryService'];
/* @ngInject */
function inventoryDetailsController($scope, $state, $attrs, $filter, $modal, $timeout, $stateParams, $location, InventoryService) {

    var vm = this;

    vm.init = init;

    console.log($stateParams.inventoryId);

    vm.backToInventory = backToInventory;

    function backToInventory(){
        $state.go("app.inventory");
    }

    InventoryService.getSingleInventory($stateParams.inventoryId).then(function(response){
        vm.inventory = response;
    })

    function init(element) {
        vm.element = element;
    }

}

})();
