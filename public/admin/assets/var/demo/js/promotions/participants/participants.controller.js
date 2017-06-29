(function(){

app.controller('ParticipantsComponentController', participantsComponentController);

participantsComponentController.$inject = ['$scope', '$attrs', '$window', '$filter', '$stateParams', '$modal', '$timeout', '$location', 'pagingConstant', 'toaster', 'SecurematicsParticipantsService', 'UtilService'];
/* @ngInject */
function participantsComponentController($scope, $attrs, $window, $filter, $stateParams, $modal, $timeout, $location, pagingConstant, toaster, SecurematicsParticipantsService, UtilService) {

    var vm = this;

    vm.init = init;
    vm.pagingConstant = pagingConstant;

    vm.state = {};
    
    vm.uiState = {
        loading: true,
        limit: vm.pagingConstant.numberOfRowsPerPage,
        skip: 0,
        curPage: 1,
        sortData: {
            column: '',
            details: {}
        }
    };

    vm.selectPage = selectPage;
    vm.showPages = vm.pagingConstant.displayedPages;
    vm.numberOfPages = numberOfPages;
    vm.checkIfSelected = checkIfSelected;
    vm.productSelectClickFn = productSelectClickFn;
    vm.addProductsToPromotions = addProductsToPromotions;
    vm.filterParticipants = filterParticipants;
    
    function drawPages(){
      var start = 1;
      var end;
      var i;
      var prevPage = vm.uiState.curPage;
      var totalItemCount = vm.state.totalParticipants;
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
        if(page != vm.uiState.curPage){
            vm.uiState.pageLoading = true;
            vm.uiState.curPage = page;
            vm.uiState.skip = (page - 1) * vm.uiState.limit;
            loadParticipants();
        }
    }

    function numberOfPages() {
        if (vm.state.totalParticipants) {
            return Math.ceil(vm.state.totalParticipants / vm.uiState.limit);
        }
        return 0;
    }

    function loadParticipants(){
        SecurematicsParticipantsService.getParticipants(vm.uiState).then(function(response){
            vm.state.participants = response.data.results;
            vm.state.totalParticipants = response.data.total;
            vm.uiState.loading = false;
            vm.uiState.pageLoading = false;
            drawPages();
        })
    }

    function filterParticipants(value){
        loadDefaults();
        vm.uiState.globalSearch = angular.copy(value);
        loadParticipants();
    };


    function checkIfSelected(product){
        return _.contains(_.pluck(vm.products, "itemCode"), product.OITM_ItemCode);
    }

    function productSelectClickFn($event, product) {
        $event.stopPropagation();

        if(_.contains(_.pluck(vm.products, "itemCode"), product.OITM_ItemCode)){
            vm.products = _.reject(vm.products, function(item){
              return product.OITM_ItemCode == item.itemCode
            });
        }
        else{            
            vm.products.push({
              itemName: product.OITM_ItemName,
              itemCode: product.OITM_ItemCode,
              itemPrice: product.ITM1_Price
            });
        }
    };

    function addProductsToPromotions(){
        vm.parentVm.state.promotion.products = angular.copy(vm.products);
        vm.parentVm.closeModal();
    }

    function loadDefaults() {
        vm.uiState.curPage = 1;
        vm.uiState.skip = 0;
        vm.uiState.pageLoading = true;
    }

    function init(element) {
        vm.element = element;
        loadParticipants();
    }
}

})();
