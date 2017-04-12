(function(){

app.controller('InventoryDetailsController', inventoryDetailsController);

inventoryDetailsController.$inject = ['$scope', '$state', '$attrs', '$filter', '$modal', '$timeout', '$stateParams', '$location', 'InventoryService', 'ChartAnalyticsService'];
/* @ngInject */
function inventoryDetailsController($scope, $state, $attrs, $filter, $modal, $timeout, $stateParams, $location, InventoryService, ChartAnalyticsService) {

    var vm = this;

    vm.init = init;

    console.log($stateParams.inventoryId);

    vm.uiState = {loading: true};

    vm.backToInventory = backToInventory;

    vm.parseValueToFloat = parseValueToFloat;

    function backToInventory(){
        $state.go("app.inventory");
    }

            

    function parseValueToFloat(value){
        if(value){
            return parseFloat(value);
        }
    }

    function init(element) {
        vm.element = element;
        InventoryService.getSingleInventory($stateParams.inventoryId).then(function(response){
            vm.inventory = response.data;
            vm.uiState.loading = false;
        }) 
    }

}

})();
