'use strict';
/*global app*/
app.controller('NewQuoteModalController', ['$scope', 'parentVm', '$timeout', 'toaster', 'SweetAlert', "QuoteCartDetailsService", function ($scope, parentVm, $timeout, toaster, SweetAlert, QuoteCartDetailsService) {

    var vm = this;
    vm.parentVm = parentVm;
    vm.uiState = {
        
    };
    vm.state = {
    	item: QuoteCartDetailsService.getCartItem(vm.parentVm.state.selectedProductItem)
    }; 
    vm.addItemToCart = addItemToCart;
    vm.newItem = QuoteCartDetailsService.newItem;
    function addItemToCart(){
    	QuoteCartDetailsService.addItemToCart(vm.state.item);
    	vm.parentVm.closeModal();
    }
    (function init() {
        
    })();

}]);
