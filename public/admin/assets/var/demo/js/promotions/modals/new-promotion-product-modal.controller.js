'use strict';
/*global app*/
app.controller('PromotionProductModalController', ['$timeout', 'parentVm', 'pagingConstant', 'toaster', 'SecurematicsProductService', function ($timeout, parentVm, pagingConstant, toaster, SecurematicsProductService) {

    var vm = this;

    vm.parentVm = parentVm;
    vm.pagingConstant = pagingConstant;

    vm.state = {};
    vm.products = angular.copy(vm.parentVm.state.promotion.products) || [];
    vm.uiState = {
        loading: true,
        limit: vm.pagingConstant.numberOfRowsPerPage,
        skip: 0,
        curPage: 1,
        sortData: {
            column: '',
            details: {}
        },
        fieldSearch: {
            
        }
    };

    vm.selectPage = selectPage;
    vm.showPages = vm.pagingConstant.displayedPages;
    vm.numberOfPages = numberOfPages;
    vm.checkIfSelected = checkIfSelected;
    vm.productSelectClickFn = productSelectClickFn;
    vm.addProductsToPromotions = addProductsToPromotions;
    function drawPages(){
      var start = 1;
      var end;
      var i;
      var prevPage = vm.uiState.curPage;
      var totalItemCount = vm.state.totalProducts;
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
            loadProducts();
        }
    }

    function numberOfPages() {
        if (vm.state.totalProducts) {
            return Math.ceil(vm.state.totalProducts / vm.uiState.limit);
        }
        return 0;
    }

    function loadProducts(){
        SecurematicsProductService.getProducts(vm.uiState).then(function(response){
            vm.state.products = response.data.results;
            vm.state.totalProducts = response.data.total;
            vm.uiState.loading = false;
            vm.uiState.pageLoading = false;
            drawPages();
        })
    }


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
              itemCode: product.OITM_ItemCode
            });
        }
    };

    function addProductsToPromotions(){
        vm.parentVm.state.promotion.products = angular.copy(vm.products);
        vm.parentVm.closeModal();
    }

    (function init() {
        loadProducts();
    })();

}]);
