(function(){

app.controller('InventoryComponentController', inventoryComponentController);

inventoryComponentController.$inject = ['$scope', '$attrs', '$filter', '$modal', '$timeout', '$location', 'InventoryService'];
/* @ngInject */
function inventoryComponentController($scope, $attrs, $filter, $modal, $timeout, $location, InventoryService) {

    var vm = this;

    vm.init = init;

    vm.state = {};
    vm.uiState = {loading: true};
    
    vm.viewSingleInventory = viewSingleInventory;
    vm.getDimentions = getDimentions;
    vm.getWeight = getWeight;
    vm.numberOfPages = numberOfPages;
    vm.nextPage = nextPage;
    vm.previousPage = previousPage;
    

    $scope.$watch(function() { return InventoryService.inventory }, function(inventory) {
        if(angular.isDefined(inventory)){
            vm.state.inventory = inventory.results;
            vm.state.totalInventory = inventory.total;
            vm.uiState.loading = false;
            vm.uiState.pageLoading = false;
        }
    }, true);


    $scope.$watch(function() { return InventoryService.page }, function(page) {
        if(angular.isDefined(page)){
            vm.uiState.curPage = InventoryService.page;
        }
    }, true);

    function viewSingleInventory(product){
        $location.path('/inventory/' + product._id);
    }


    function getDimentions(product){
        if(product){
            return parseFloat(product.OITM_SLength1).toFixed(2) + "X" +
                parseFloat(product.OITM_SWidth1).toFixed(2) + "X" +
                parseFloat(product.OITM_BHeight1).toFixed(2)
        }
    }

    function getWeight(product){
        var weight = "";
        if(product){
            weight =  parseFloat(product.OITM_SWeight1).toFixed(2);
            if(product.OITM_SWeight1 == 0){
                weight = 0;
            }
            if(product.OWGT_UnitName){
                weight += " " + product.OWGT_UnitName;
            }
        }
        return weight;
    }


    /********** PAGINATION RELATED **********/
    
    vm.uiState.pageSize = InventoryService.limit;
    vm.uiState.skip = InventoryService.skip;


    function numberOfPages() {
        if (vm.state.inventory) {
            return Math.ceil(vm.state.totalInventory / vm.uiState.pageSize);
        }
        return 0;
    }

    function nextPage() {
        vm.uiState.pageLoading = true;
        InventoryService.page = InventoryService.page + 1;
        InventoryService.skip = InventoryService.skip + InventoryService.limit;
        loadInventory();
    }

    function loadInventory(){
        InventoryService.getInventory();
    }


    function previousPage() {
        vm.uiState.pageLoading = true;
        InventoryService.page = InventoryService.page - 1;
        
        InventoryService.skip = InventoryService.skip - InventoryService.limit;
        loadInventory();
    }

    function init(element) {
        vm.element = element;
    }

}

})();