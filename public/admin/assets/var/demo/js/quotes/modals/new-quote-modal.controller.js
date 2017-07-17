'use strict';
/*global app*/
app.controller('NewQuoteModalController', ['$scope', 'parentVm', '$timeout', 'toaster', 'SweetAlert', "QuoteCartDetailsService", function ($scope, parentVm, $timeout, toaster, SweetAlert, QuoteCartDetailsService) {

    var vm = this;
    vm.parentVm = parentVm;
    vm.uiState = {
        
    };
    vm.state = {

    }; 
    vm.addItemToCart = addItemToCart;
    vm.newItem = QuoteCartDetailsService.newItem;
    $scope.$watch(function() { return QuoteCartDetailsService.cartDetail.items }, function(data) {
        if(angular.isDefined(data)){
            vm.uiState.loading = false;
            vm.state.item = QuoteCartDetailsService.getCartItem(vm.parentVm.state.selectedProductItem);
        }
    }, true);
    function addItemToCart(){
    	QuoteCartDetailsService.addItemToCart(vm.state.item);
    	vm.parentVm.closeModal();
    }
    (function init() {
        
    })();

}]);
