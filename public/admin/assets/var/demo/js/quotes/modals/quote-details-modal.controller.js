'use strict';
/*global app*/
app.controller('QuoteDetailsModalController', ['$scope', '$timeout', 'toaster', 'SweetAlert', 'QuoteCartDetailsService', function ($scope, $timeout, toaster, SweetAlert, QuoteCartDetailsService) {

    var vm = this;

    vm.uiState = {
        
    };

    vm.state = {
    	cartDetail: {

    	}
    };
    vm.initAttachment = initAttachment;

    vm.state.cartDetail = QuoteCartDetailsService.getCartDetail();
    vm.attachment = {};
    function initAttachment(){
      
        vm.attachment = {};
        document.getElementById("upload_cart_file").value = "";
    }
    (function init() {
        
    })();

}]);
