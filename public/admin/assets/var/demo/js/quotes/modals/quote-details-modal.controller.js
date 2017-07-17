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
    vm.createQuote = createQuote;
    vm.attachment = {};
    
    function calculateTotalPrice(items){
    	return QuoteCartDetailsService.calculateTotalPrice(items);
    }

    function removeItemFromCart(index){
    	QuoteCartDetailsService.removeItemFromCart(index);
    }

    function createQuote(){
        vm.uiState.saveLoading = true;
        var _quote = angular.copy(vm.state.cartDetail);
        delete _quote._id;
        QuoteCartDetailsService.createQuote(_quote).then(function (response) {
            vm.state.quote = response.data;
            if(vm.attachment && vm.attachment.name){
                QuoteCartDetailsService.updateQuoteAttachment(vm.attachment, vm.state.quote._id).then(function (quote){
                    vm.state.quote = quote.data;
                    setDefaults();                 
                });
            }
            else{
                setDefaults();
            }         
        });
    }

    function setDefaults(){
        QuoteCartDetailsService.deleteCartDetails(vm.state.cartDetail).then(function(){
            $scope.closeModal();
        })
    }

    function initAttachment(){      
        vm.attachment = {};
        document.getElementById("upload_cart_file").value = "";
    }

    (function init() {
        
    })();

}]);
