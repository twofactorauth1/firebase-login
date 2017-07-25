'use strict';
/*global app*/
app.controller('NewQuoteModalController', ['$scope', 'parentVm', '$timeout', 'toaster', 'SweetAlert', "QuoteCartDetailsService", function ($scope, parentVm, $timeout, toaster, SweetAlert, QuoteCartDetailsService) {

    var vm = this;
    vm.parentVm = parentVm;
    vm.uiState = {
        newItem: true
    };
    vm.state = {

    }; 
    vm.addItemToCart = addItemToCart;
    

    $scope.$watch(function() { return QuoteCartDetailsService.cartDetail.items }, function(data) {
        if(angular.isDefined(data)){
            vm.uiState.loading = false;
            vm.state.item = QuoteCartDetailsService.getCartItem(vm.parentVm.state.selectedProductItem, vm.uiState);            
        } 
    }, true);

    function addItemToCart(){
        vm.uiState.saveLoading = true;
        if(!QuoteCartDetailsService.cartDetail._id){
            QuoteCartDetailsService.getCartItemTitle("New Quote ("+ moment().format("MMM DD YY") + ")").then(function(response){
                QuoteCartDetailsService.cartDetail.title = response.data;
                addCartItems();
            })            
        }
        else{
            addCartItems();
        }
    }

    function addCartItems(){
        QuoteCartDetailsService.addItemToCart(vm.state.item).then(function (response){
            vm.parentVm.closeModal();
            vm.uiState.saveLoading = false;
        });
    }
    (function init() {
        
    })();

}]);
