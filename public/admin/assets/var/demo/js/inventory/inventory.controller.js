(function(){

app.controller('InventoryComponentController', inventoryComponentController);

inventoryComponentController.$inject = ['$scope', '$attrs', '$filter', '$modal', '$timeout', '$location', 'InventoryService'];
/* @ngInject */
function inventoryComponentController($scope, $attrs, $filter, $modal, $timeout, $location, InventoryService) {

    var vm = this;

    vm.init = init;

    vm.state = {};

    vm.uiState = {
        loading: true,
        sortData: {
            column: '',
            details: {}
        },
        globalSearch: InventoryService.globalSearch,
        fieldSearch: {
            OITM_ItemName: InventoryService.fieldSearch.OITM_ItemName,
            OMRC_FirmName: InventoryService.fieldSearch.OMRC_FirmName,
            OITM_ItemCode: InventoryService.fieldSearch.OITM_ItemCode
        },
        showFilter: InventoryService.showFilter
    };
    
    vm.viewSingleInventory = viewSingleInventory;
    vm.getDimentions = getDimentions;
    vm.getWeight = getWeight;
    vm.numberOfPages = numberOfPages;
    vm.nextPage = nextPage;
    vm.previousPage = previousPage;
    vm.sortInventory = sortInventory;
    vm.showFilter = showFilter;
    

    $scope.$watch(function() { return InventoryService.inventory }, function(inventory) {
        if(angular.isDefined(inventory)){
            vm.state.inventory = inventory.results;
            vm.state.totalInventory = inventory.total;
            vm.uiState.loading = false;
            
        }
    }, true);


    $scope.$watch(function() { return InventoryService.page }, function(page) {
        if(angular.isDefined(page)){
            vm.uiState.curPage = InventoryService.page;
        }
    }, true);

    function viewSingleInventory(product){
        $location.path('/inventory/' + product["@id"]);
    }


    function getDimentions(product){
        var _dimentions = "";
        if(product){
            var _sum =  parseFloat(product.OITM_SLength1) +
                parseFloat(product.OITM_SWidth1) +
                parseFloat(product.OITM_BHeight1)

            if(_sum > 0){
                _dimentions =  parseFloat(product.OITM_SLength1).toFixed(2) + "X" +
                    parseFloat(product.OITM_SWidth1).toFixed(2) + "X" +
                    parseFloat(product.OITM_BHeight1).toFixed(2)
            }    

            
        }
        return _dimentions
    }

    function getWeight(product){
        var weight = "";
        if(product && product.OITM_SWeight1 > 0){
            weight =  parseFloat(product.OITM_SWeight1).toFixed(2);
            if(product.OITM_SWeight1 == 0){
                weight = 0;
            }
            if(product.OWGT_UnitName){
                if(product.OITM_SWeight1 > 1)
                    weight += " " + product.OWGT_UnitName + 's';
                else{
                    weight += " " + product.OWGT_UnitName;
                }
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
        vm.uiState.pageLoading = true;
        InventoryService.getInventory().then(function(response){
            vm.state.inventory = response.data.results;
            vm.state.totalInventory = response.data.total;
            vm.uiState.pageLoading = false;
        });
    }


    function previousPage() {
        vm.uiState.pageLoading = true;
        InventoryService.page = InventoryService.page - 1;
        
        InventoryService.skip = InventoryService.skip - InventoryService.limit;
        loadInventory();
    }

    /********** SORTING RELATED **********/

    function sortInventory(col, name){
        if(vm.uiState.sortData.column !== name){
            vm.uiState.sortData.details = {};
        }
        vm.uiState.sortData.column = name;
        if(vm.uiState.sortData.details[name]){
            if(vm.uiState.sortData.details[name].direction === 1){
                vm.uiState.sortData.details[name].direction = -1;
            }
            else{
                vm.uiState.sortData.details[name].direction = 1;   
            }
        }
        else{
            vm.uiState.sortData.details[name] = {
                direction: 1,
                sortColum: col
            }
        }
        InventoryService.sortBy = col;
        InventoryService.sortDir = vm.uiState.sortData.details[name].direction;
        loadDefaults();
        loadInventory();
    }


    function loadDefaults(){
        InventoryService.page = 0;
        InventoryService.skip = 0;
    }


    /********** GLOBAL SEARCH RELATED **********/

    $scope.$watch('vm.uiState.globalSearch', function (term) {
        if(angular.isDefined(term)){
            if(!angular.equals(term, InventoryService.globalSearch)){
                loadDefaults();
                InventoryService.globalSearch = angular.copy(term);
                loadInventory();
            }
        }
    }, true);


    /********** FIELD SEARCH RELATED **********/

    $scope.$watch('vm.uiState.fieldSearch', function (search) {
        if(angular.isDefined(search)){
            if(!angular.equals(search, InventoryService.fieldSearch)){
                loadDefaults();
                InventoryService.fieldSearch = angular.copy(search);
                loadInventory();
            }
        }
    }, true);



    function showFilter(){
        vm.uiState.showFilter = !vm.uiState.showFilter;
        if(!vm.uiState.showFilter)
            clearFilter();
    }


    function clearFilter(){
        InventoryService.fieldSearch = {};
        vm.uiState.fieldSearch = {
            OITM_ItemName: null,
            OMRC_FirmName: null,
            OITM_ItemCode: null
        }
    }

    function init(element) {
        vm.element = element;
    }

}

})();