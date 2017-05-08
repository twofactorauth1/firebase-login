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
        dimNotApplicableText: 'NA'
    };

    vm.backToInventory = backToInventory;

    vm.parseValueToFloat = parseValueToFloat;

    vm.checkProductGroup = checkProductGroup;

    vm.unWatchInventoryItem = unWatchInventoryItem;

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
        }
    }, true);


    function checkIfSelected(){
        return _.contains(vm.uiState.inVentoryWatchList, $stateParams.inventoryId);
    }


    function unWatchInventoryItem() {
        
        var watchMessage = "Do you want to remove this item from inventory watch list?";
        var confirmMessage = "Yes, remove from watch list!";
        var cancelMessage = "No, do not remove from watch list!";
        var toasterMessage = 'Item removed from inventory watch list';
        
        
        SweetAlert.swal({
            title: "Are you sure?",
            text: watchMessage,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: confirmMessage,
            cancelButtonText: cancelMessage,
            closeOnConfirm: true,
            closeOnCancel: true
          },
          function (isConfirm) {
            if (isConfirm) {
                vm.uiState.inVentoryWatchList = _.without(vm.uiState.inVentoryWatchList, $stateParams.inventoryId);
                vm.state.userOrgConfig.watchList = vm.uiState.inVentoryWatchList;
                InventoryService.updateUserOrgConfig(vm.state.userOrgConfig).then(function(response){                    
                    toaster.pop('success', toasterMessage);
                    vm.uiState.watched  = checkIfSelected();
                });
            }
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
