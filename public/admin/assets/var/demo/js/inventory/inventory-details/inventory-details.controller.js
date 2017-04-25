(function(){

app.controller('InventoryDetailsController', inventoryDetailsController);

inventoryDetailsController.$inject = ['$scope', '$state', '$attrs', '$filter', '$modal', '$timeout', '$stateParams', '$location', 'InventoryService', 'ChartAnalyticsService'];
/* @ngInject */
function inventoryDetailsController($scope, $state, $attrs, $filter, $modal, $timeout, $stateParams, $location, InventoryService, ChartAnalyticsService) {

    var vm = this;

    vm.init = init;

    console.log($stateParams.inventoryId);

    vm.uiState = {
        loading: true,
        dimNotApplicableText: 'NA'
    };

    vm.backToInventory = backToInventory;

    vm.parseValueToFloat = parseValueToFloat;

    vm.checkProductGroup = checkProductGroup;

    function backToInventory(){
        $state.go("app.inventory");
    }

            

    function parseValueToFloat(value){
        if(value){
            return parseFloat(value);
        }
    }

    function checkProductGroup(value){
        if(vm.inventory.OITB_ItmsGrpNam && vm.inventory.OITB_ItmsGrpNam.toLowerCase() == 'services'){            
            return vm.uiState.dimNotApplicableText;
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
