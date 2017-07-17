'use strict';
/*global app*/
app.controller('QuoteDetailsModalController', ['$scope', '$timeout', 'toaster', 'SweetAlert', 'QuoteCartDetailsService', function ($scope, $timeout, toaster, SweetAlert, QuoteCartDetailsService) {

    var vm = this;

    vm.uiState = {
        
    };

    vm.state = {};
    vm.initAttachment = initAttachment;
    vm.calculateTotalPrice = calculateTotalPrice;
    vm.state.cartDetail = QuoteCartDetailsService.cartDetail;
    vm.removeItemFromCart = removeItemFromCart;
    vm.attachment = {};
    
    function calculateTotalPrice(items){
    	return QuoteCartDetailsService.calculateTotalPrice(items);
    }

    function removeItemFromCart(index){
    	QuoteCartDetailsService.removeItemFromCart(index);
    }
    function initAttachment(){
      
        vm.attachment = {};
        document.getElementById("upload_cart_file").value = "";
    }
    (function init() {
        
    })();

}]);
