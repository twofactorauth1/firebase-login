'use strict';
/*global app*/
app.controller('NewQuoteModalController', ['$scope', 'parentVm', '$timeout', 'toaster', 'SweetAlert', "QuoteCartDetailsService", function ($scope, parentVm, $timeout, toaster, SweetAlert, QuoteCartDetailsService) {

    var vm = this;
    vm.parentVm = parentVm;
    vm.uiState = {
        
    };
    vm.state = {
    	
    };
    
    vm.state.item = vm.parentVm.state.selectedProductItem;
    vm.state.item.quantity = 1;
    vm.addItemToCart = addItemToCart;
    function addItemToCart(){
    	QuoteCartDetailsService.addItemToCart(vm.state.item);
    	vm.parentVm.closeModal();
    }
    (function init() {
        
    })();

}]);
