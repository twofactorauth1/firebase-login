(function(){

app.controller('CustomersComponentController', customersComponentController);

customersComponentController.$inject = ['$scope', '$attrs', '$filter', '$modal', '$timeout', '$location', 'pagingConstant', 'CustomersService', 'UtilService'];
/* @ngInject */
function customersComponentController($scope, $attrs, $filter, $modal, $timeout, $location, pagingConstant, CustomersService, UtilService) {

    var vm = this;

    vm.init = init;

    vm.state = {};

    vm.viewCustomerLedger = viewCustomerLedger;

    vm.pagingConstant = pagingConstant;

    vm.showFilteredRecords = showFilteredRecords;
    
    vm.numberOfPages = numberOfPages;

    vm.sortCustomers = sortCustomers;

    vm.selectPage = selectPage;

    vm.uiState = {
        loading: true,
        globalSearch: CustomersService.globalSearch,
        fieldSearch: CustomersService.fieldSearch || {},
        sortData: {
            column: '',
            details: {}
        }
    };

    $scope.$watch(function() { return CustomersService.customers }, function(customers) {
        if(angular.isDefined(customers)){
            vm.state.customers = customers.results;
            vm.uiState.loading = false;
            vm.state.totalCustomers = CustomersService.totalCustomers;
            vm.state.totalFilteredCustomers = customers.total;
            drawPages();
        }
    }, true);

    $scope.$watch(function() { return CustomersService.page }, function(page) {
        if(angular.isDefined(page)){
            vm.uiState.curPage = CustomersService.page;
            drawPages();
        }
    }, true);

    vm.showPages = vm.pagingConstant.displayedPages;

    /********** SORTING RELATED **********/

    function sortCustomers(col, name){
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
        CustomersService.sortBy = col;
        CustomersService.sortDir = vm.uiState.sortData.details[name].direction;
        loadDefaults();
        loadCustomers();
    }


    function loadDefaults(){
        CustomersService.page = 1;
        CustomersService.skip = 0;
    }


    function drawPages(){
      var start = 1;
      var end;
      var i;
      var prevPage = vm.uiState.curPage;
      var totalItemCount = vm.state.totalFilteredCustomers;
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

    vm.uiState.pageSize = CustomersService.limit;
    vm.uiState.skip = CustomersService.skip;

    function numberOfPages() {
        if (vm.state.customers) {
            return Math.ceil(vm.state.totalFilteredCustomers / vm.uiState.pageSize);
        }
        return 0;
    }

    function selectPage(page){
        if(page != CustomersService.page){
            vm.uiState.pageLoading = true;
            CustomersService.page = page;

            CustomersService.skip = (page - 1) * CustomersService.limit;
            loadCustomers();
        }

    }

    /********** GLOBAL SEARCH RELATED **********/

    $scope.$watch('vm.uiState.globalSearch', function (term) {
        if(angular.isDefined(term)){
            if(!angular.equals(term, CustomersService.globalSearch)){
                vm.uiState.loadingFilter = true;
                loadDefaults();
                CustomersService.globalSearch = angular.copy(term);
                loadCustomers();
            }
        }
    }, true);   


    /********** FIELD SEARCH RELATED **********/

    $scope.$watch('vm.uiState.fieldSearch', function (search) {
        if(angular.isDefined(search)){
            if(!angular.equals(search, CustomersService.fieldSearch)){
                vm.uiState.loadingFilter = true;
                loadDefaults();
                CustomersService.fieldSearch = angular.copy(search);
                loadCustomers();
            }
        }
    }, true);

    function loadCustomers(){
        vm.uiState.pageLoading = true;
        CustomersService.getCustomers().then(function(response){
            vm.state.customers = response.data.results;
            vm.uiState.pageLoading = false;
            vm.uiState.loadingFilter = false;
            $("html, body").animate({
              scrollTop: 0
            }, 600);
        });
    }

    function clearFilter(){
        vm.uiState.fieldSearch = {}
    }
    function viewCustomerLedger(customer){
        $location.path('/ledger/' + customer.OCRD_CardCode);
    }

    function showFilteredRecords(){
        return UtilService.showFilteredRecords(vm.uiState.globalSearch, vm.uiState.fieldSearch);
    }


    function init(element) {
        vm.element = element;
    }

}

})();