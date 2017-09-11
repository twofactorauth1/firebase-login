(function(){

app.controller('InventoryDetailsController', inventoryDetailsController);

inventoryDetailsController.$inject = ['$scope', '$state', '$attrs', '$filter', '$modal', '$timeout', '$stateParams', '$location', 'SweetAlert', 'toaster', 'InventoryService', 'ChartAnalyticsService', 'UserPermissionsConfig'];
/* @ngInject */
function inventoryDetailsController($scope, $state, $attrs, $filter, $modal, $timeout, $stateParams, $location, SweetAlert, toaster, InventoryService, ChartAnalyticsService, UserPermissionsConfig) {

    var vm = this;

    vm.init = init;

    console.log($stateParams.inventoryId);
    
    vm.state = {
        orgCardAndPermissions: UserPermissionsConfig.orgConfigAndPermissions
    };

    vm.uiState = {
        loading: true,
        dimNotApplicableText: '',
        loadingWatchInventory: true,
        userPermissions: $scope.$parent.userPermissions
    };

    vm.backToInventory = backToInventory;

    vm.parseValueToFloat = parseValueToFloat;

    vm.checkProductGroup = checkProductGroup;

    vm.watchInventoryItem = watchInventoryItem;
   
    vm.getWeightUnits = getWeightUnits;
    vm.openModal = openModal;     
    vm.closeModal = closeModal;
    vm.addItemToQuote = addItemToQuote;

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
        if(vm.inventory && vm.uiState.inVentoryWatchList)
            return _.contains(vm.uiState.inVentoryWatchList, vm.inventory.OITM_ItemCode);
    }

    function watchInventoryItem() {
        vm.uiState.savingWatchInventory = true;
        vm.state.userActivity = {};
        if(vm.uiState.watched){
            var toasterMessage = 'Item removed from inventory watch list';
            vm.uiState.inVentoryWatchList = _.without(vm.uiState.inVentoryWatchList, vm.inventory.OITM_ItemCode); 
            vm.state.userActivity = {
                activityType: 'INV_UNWATCH',
                note: "Product Name: " + vm.inventory.OITM_ItemName
            }           
        }
        else{
            var toasterMessage = 'Item add to inventory watch list';
            vm.uiState.inVentoryWatchList = _.first(_.union([vm.inventory.OITM_ItemCode], vm.uiState.inVentoryWatchList), 5);    
            vm.state.userActivity = {
                activityType: 'INV_WATCH',
                note: "Product Name: " + vm.inventory.OITM_ItemName
            } 
        }
        
        vm.state.userOrgConfig.watchList = vm.uiState.inVentoryWatchList;
        vm.uiState.loadingWatchInventory = true;
        InventoryService.updateUserOrgConfig(vm.state.userOrgConfig).then(function(response){    
            InventoryService.createUserActivity(vm.state.userActivity);             
            toaster.pop('success', toasterMessage);
            vm.uiState.watched  = checkIfSelected();
            vm.uiState.savingWatchInventory = false;
            vm.uiState.loadingWatchInventory = false;
        });
    };

    function getWeightUnits(weight, unit){
        var weightUnits = "";
        if(unit && weight){
            if(weight > 1)
                weightUnits = unit + 's';
            else{
                weightUnits = unit;
            }
        }
        return weightUnits;
    }

    function addItemToQuote(item, modal, controller, size){
        vm.state.selectedProductItem = item;
        openModal(modal, controller, size);
    }

    function openModal(modal, controller, size){
        
        var _modal = {
            templateUrl: modal,
            keyboard: true,
            backdrop: 'static',
            size: 'lg',
            resolve: {
                parentVm: function() {
                    return vm;
                }
            }
        };

        if (controller) {
            _modal.controller = controller + ' as vm';
        }


        vm.modalInstance = $modal.open(_modal);

        vm.modalInstance.result.then(null, function () {
            angular.element('.sp-container').addClass('sp-hidden');
        });
    }


    function closeModal() {
        if(vm.modalInstance)
            vm.modalInstance.close();
    }

    function init(element) {
        vm.element = element;
        InventoryService.getSingleInventory($stateParams.inventoryId).then(function(response){
            vm.inventory = response.data;
            vm.uiState.watched  = checkIfSelected();
            vm.uiState.loading = false;
        }) 
    }

}

})();
