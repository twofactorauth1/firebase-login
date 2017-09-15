'use strict';
/*global app*/
app.controller('QuoteProductModalController', ['$timeout', 'parentVm', 'pagingConstant', 'toaster', 'SecurematicsProductService', function ($timeout, parentVm, pagingConstant, toaster, SecurematicsProductService) {

    var vm = this;

    vm.parentVm = parentVm;
    vm.pagingConstant = pagingConstant;

    vm.state = {};
    vm.products = [];
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
    vm.filterProducts = filterProducts;
    
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

    function filterProducts(value){
        loadDefaults();
        vm.uiState.globalSearch = angular.copy(value);
        loadProducts();
    };


    function checkIfSelected(product){
        return _.contains(_.pluck(vm.products, "itemCode"), product.OITM_ItemCode);
    }

    function productSelectClickFn($event, product) {
        $event.stopPropagation();

        if(!_.contains(_.pluck(vm.products, "OITM_ItemCode"), product.OITM_ItemCode)){
            vm.products.push(product);
        }
    };

    function addProductsToPromotions(){
        vm.parentVm.addItemsToCart(vm.products);
        $timeout(function() {
            vm.parentVm.closeModal();
        }, 1000);
        
    }

    function loadDefaults() {
        vm.uiState.curPage = 1;
        vm.uiState.skip = 0;
        vm.uiState.pageLoading = true;
    }

    (function init() {
        loadProducts();
    })();

}]);
