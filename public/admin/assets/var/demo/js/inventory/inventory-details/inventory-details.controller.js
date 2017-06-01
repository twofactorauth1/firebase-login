(function(){

app.controller('InventoryDetailsController', inventoryDetailsController);

inventoryDetailsController.$inject = ['$scope', '$state', '$attrs', '$filter', '$modal', '$timeout', '$stateParams', '$location', 'SweetAlert', 'toaster', 'InventoryService', 'ChartAnalyticsService'];
/* @ngInject */
function inventoryDetailsController($scope, $state, $attrs, $filter, $modal, $timeout, $stateParams, $location, SweetAlert, toaster, InventoryService, ChartAnalyticsService) {

    var vm = this;

    vm.init = init;

    console.log($stateParams.inventoryId);
    
    vm.state = {};

    vm.uiState = {
        loading: true,
        dimNotApplicableText: 'NA',
        loadingWatchInventory: true
    };

    vm.backToInventory = backToInventory;

    vm.parseValueToFloat = parseValueToFloat;

    vm.checkProductGroup = checkProductGroup;

    vm.unWatchInventoryItem = unWatchInventoryItem;

    vm.watchInventoryItem = watchInventoryItem;

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

    $scope.$watch(function() { return InventoryService.userOrgConfig }, function(config) {
        if(angular.isDefined(config)){
            vm.state.userOrgConfig = config;
            vm.uiState.inVentoryWatchList = config.watchList || [];
            vm.uiState.watched  = checkIfSelected();
            vm.uiState.loadingWatchInventory = false;
        }
    }, true);


    function checkIfSelected(){
        return _.contains(vm.uiState.inVentoryWatchList, $stateParams.inventoryId);
    }


    function unWatchInventoryItem() {
        vm.uiState.savingWatchInventory = true;
        var toasterMessage = 'Item removed from inventory watch list';
        vm.uiState.inVentoryWatchList = _.without(vm.uiState.inVentoryWatchList, $stateParams.inventoryId);
        vm.state.userOrgConfig.watchList = vm.uiState.inVentoryWatchList;

        InventoryService.updateUserOrgConfig(vm.state.userOrgConfig).then(function(response){                    
            toaster.pop('success', toasterMessage);
            vm.uiState.watched  = checkIfSelected();
            vm.uiState.savingWatchInventory = false;
        });
    };


    function watchInventoryItem() {
        vm.uiState.savingWatchInventory = true;
        var toasterMessage = 'Item add to inventory watch list';
        vm.uiState.inVentoryWatchList = _.first(_.union([$stateParams.inventoryId], vm.uiState.inVentoryWatchList), 5);
        vm.state.userOrgConfig.watchList = vm.uiState.inVentoryWatchList;
        vm.uiState.loadingWatchInventory = true;
        InventoryService.updateUserOrgConfig(vm.state.userOrgConfig).then(function(response){                    
            toaster.pop('success', toasterMessage);
            vm.uiState.watched  = checkIfSelected();
            vm.uiState.savingWatchInventory = false;
        });
    };

    function init(element) {
        vm.element = element;
        InventoryService.getSingleInventory($stateParams.inventoryId).then(function(response){
            vm.inventory = response.data;
            vm.uiState.loading = false;
        }) 
    }

}

})();
