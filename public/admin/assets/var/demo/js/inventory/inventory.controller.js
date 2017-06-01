(function(){

app.controller('InventoryComponentController', inventoryComponentController);

inventoryComponentController.$inject = ['$scope', '$attrs', '$filter', '$modal', '$timeout', '$location', 'pagingConstant', 'toaster', 'InventoryService', 'UtilService'];
/* @ngInject */
function inventoryComponentController($scope, $attrs, $filter, $modal, $timeout, $location, pagingConstant, toaster, InventoryService, UtilService) {

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
        inVentoryWatchList: []
    };

    vm.viewSingleInventory = viewSingleInventory;
    vm.getDimentions = getDimentions;
    vm.getWeight = getWeight;
    vm.getPrice = getPrice;
    vm.numberOfPages = numberOfPages;

    vm.sortInventory = sortInventory;    
    vm.pagingConstant = pagingConstant;
    vm.selectPage = selectPage;
    vm.checkIfSelected = checkIfSelected;
    vm.quantitySearchOptions =[
        {
           "label": "> 0",
           "value":  1
        },{
           "label": "= 0",
           "value":  -1
        }

    ]

    vm.showPages = vm.pagingConstant.displayedPages;
    vm.productSelectClickFn = productSelectClickFn;
    vm.bulkActionSelectFn = bulkActionSelectFn;
    vm.showFilteredRecords = showFilteredRecords;
    vm.cancel = cancel;

    vm.bulkActionChoice = {};

    vm.bulkActionChoices = [
        {
            data: 'watch',
            label: 'Watch'
        },{
            data: 'unwatch',
            label: 'Unwatch'
        }];

    $scope.$watch(function() { return InventoryService.inventory }, function(inventory) {
        if(angular.isDefined(inventory)){
            vm.state.inventory = inventory.results;
            vm.state.totalInventory = InventoryService.totalInventory;
            vm.state.totalFilteredInventory = inventory.total;
            vm.uiState.loading = false;
            drawPages();
        }
    }, true);


    $scope.$watch(function() { return InventoryService.userOrgConfig }, function(config) {
        if(angular.isDefined(config)){
            vm.state.userOrgConfig = config;
            //vm.uiState.inVentoryWatchList = config.watchList || [];
        }
    }, true);


    $scope.$watch(function() { return InventoryService.page }, function(page) {
        if(angular.isDefined(page)){
            vm.uiState.curPage = InventoryService.page;
            drawPages();
        }
    }, true);

    function viewSingleInventory(product){
        $location.path('/inventory/' + product["@id"]);
    }

    function drawPages(){
      var start = 1;
      var end;
      var i;
      var prevPage = vm.uiState.curPage;
      var totalItemCount = vm.state.totalFilteredInventory;
      var currentPage = vm.uiState.curPage;
      var numPages = numberOfPages();

      start = Math.max(start, currentPage - Math.abs(Math.floor(vm.showPages / 2)));
      end = start + vm.showPages;

      if (end > numPages) {
        end = numPages + 1;
        start = Math.max(1, end - vm.showPages);
      }

      vm.pages = [];


      for (i = start; i < end; i++) {
        vm.pages.push(i);
      }
    }

    function selectPage(page){
        if(page != InventoryService.page){
            vm.uiState.pageLoading = true;
            InventoryService.page = page;

            InventoryService.skip = (page - 1) * InventoryService.limit;
            loadInventory();

        }

    }

    function getDimentions(product){
        var _dimentions = "";
        if(product){
            if(product.OITB_ItmsGrpNam && product.OITB_ItmsGrpNam.toLowerCase() == 'services'){
                _dimentions = "NA";
                return _dimentions;
            }

            var _sum =  parseFloat(product.OITM_SLength1) +
                parseFloat(product.OITM_SWidth1) +
                parseFloat(product.OITM_BHeight1)

            if(_sum > 0){
                _dimentions =  roundToNumber(parseFloat(product.OITM_SLength1)) + "X" +
                    roundToNumber(parseFloat(product.OITM_BHeight1)) + "X" +
                    roundToNumber(parseFloat(product.OITM_SWidth1))
            }

        }
        return _dimentions;
    }


    function roundToNumber(value){
        return $filter('number')(value, 0);
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

    function getPrice(product){
        var price = "";
        if(product && product.ITM1_Price > 0){
            price =  parseFloat(product.ITM1_Price).toFixed(2);
            if(product.ITM1_Price == 0){
                price = 0.00;
            }
        }
        return price;
    }

    /********** PAGINATION RELATED **********/

    vm.uiState.pageSize = InventoryService.limit;
    vm.uiState.skip = InventoryService.skip;


    function numberOfPages() {
        if (vm.state.inventory) {
            return Math.ceil(vm.state.totalFilteredInventory / vm.uiState.pageSize);
        }
        return 0;
    }


    function loadInventory(){
        vm.uiState.pageLoading = true;
        InventoryService.getInventory().then(function(response){
            vm.state.inventory = response.data.results;
            vm.uiState.pageLoading = false;
            vm.uiState.loadingFilter = false;
            $("html, body").animate({
              scrollTop: 0
            }, 600);
        });
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
        InventoryService.page = 1;
        InventoryService.skip = 0;
    }


    /********** GLOBAL SEARCH RELATED **********/

    $scope.$watch('vm.uiState.globalSearch', function (term) {
        if(angular.isDefined(term)){
            if(!angular.equals(term, InventoryService.globalSearch)){
                vm.uiState.loadingFilter = true;
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
                vm.uiState.loadingFilter = true;
                loadDefaults();
                InventoryService.fieldSearch = angular.copy(search);
                loadInventory();
            }
        }
    }, true);

    function clearFilter(){
        //InventoryService.fieldSearch = {};
        vm.uiState.fieldSearch = {
            OITM_ItemName: undefined,
            OMRC_FirmName: undefined,
            OITM_ItemCode: undefined
        }
    }


    function productSelectClickFn($event, product) {
        $event.stopPropagation();

        if(_.contains(vm.uiState.inVentoryWatchList, product["@id"])){
            vm.uiState.inVentoryWatchList = _.without(vm.uiState.inVentoryWatchList, product["@id"]);
        }
        else{
            if(vm.uiState.inVentoryWatchList.length == 5){
                vm.uiState.inVentoryWatchList.shift();
            }
            vm.uiState.inVentoryWatchList.push(product["@id"]);
        }
    };


    function checkIfSelected(product, list){
        return _.contains(list, product["@id"]);
    }

    function bulkActionSelectFn() {

       
        var toasterMessage = 'Items added to inventory watch list';
        if (vm.bulkActionChoice.action.data == 'unwatch'){
            toasterMessage = 'Items removed from inventory watch list';
        }

        if (vm.bulkActionChoice.action.data == 'unwatch') {

            vm.state.userOrgConfig.watchList = _.difference(vm.state.userOrgConfig.watchList || [], vm.uiState.inVentoryWatchList);
        }
        if (vm.bulkActionChoice.action.data == 'watch') {
            vm.state.userOrgConfig.watchList = _.first(_.union(vm.uiState.inVentoryWatchList, vm.state.userOrgConfig.watchList || []), 5);
        }

        vm.uiState.inVentoryWatchList = [];
        InventoryService.updateUserOrgConfig(vm.state.userOrgConfig).then(function(response){
            vm.bulkActionChoice = null;
            vm.bulkActionChoice = {};
            toaster.pop('success', toasterMessage);
        });

    };

    function showFilteredRecords(){
        return !vm.uiState.loadingFilter && UtilService.showFilteredRecords(vm.uiState.globalSearch, vm.uiState.fieldSearch);
    }

    function cancel($event) {
        $event.stopPropagation();
    };

    function init(element) {
        vm.element = element;
    }

}

})();
