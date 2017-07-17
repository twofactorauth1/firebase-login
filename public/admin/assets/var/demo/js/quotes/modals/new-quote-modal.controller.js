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
    

    $scope.$watch(function() { return QuoteCartDetailsService.cartDetail.items }, function(data) {
        if(angular.isDefined(data)){
            vm.uiState.loading = false;

            vm.state.item = QuoteCartDetailsService.getCartItem(vm.parentVm.state.selectedProductItem);
            vm.newItem = QuoteCartDetailsService.newItem;
        }        
    }, true);
    function addItemToCart(){
        vm.uiState.saveLoading = true;
    	QuoteCartDetailsService.addItemToCart(vm.state.item).then(function (response){
            vm.parentVm.closeModal();
            vm.uiState.saveLoading = false;
        });
    }
    (function init() {
        
    })();

}]);
