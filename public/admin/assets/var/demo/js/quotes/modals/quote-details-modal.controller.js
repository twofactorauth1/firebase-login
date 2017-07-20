'use strict';
/*global app*/
app.controller('QuoteDetailsModalController', ['$scope', '$rootScope', '$timeout', 'toaster', 'SweetAlert', 'formValidations', 'QuoteCartDetailsService', 'UserPermissionsConfig', function ($scope, $rootScope, $timeout, toaster, SweetAlert, formValidations, QuoteCartDetailsService, UserPermissionsConfig) {

    var vm = this;

    vm.uiState = {
       loadingDetailsModal: true
    };

    vm.state = {
        orgCardAndPermissions: UserPermissionsConfig.orgConfigAndPermissions
    };
    vm.initAttachment = initAttachment;
    vm.calculateTotalPrice = calculateTotalPrice;
    vm.state.cartDetail = QuoteCartDetailsService.cartDetail;
    vm.removeItemFromCart = removeItemFromCart;
    vm.saveQuote = saveQuote;
    vm.attachment = {};
    vm.checkIfValidEmail = checkIfValidEmail;
    vm.selectCardCode = selectCardCode;


    function selectCardCode(customer){
        vm.state.cartDetail.companyName = customer.OCRD_CardName;
    }


    function calculateTotalPrice(items){
    	return QuoteCartDetailsService.calculateTotalPrice(items);
    }

    function removeItemFromCart(index){
    	QuoteCartDetailsService.removeItemFromCart(index, refreshCart);
    }

    function refreshCart(){
       vm.state.cartDetail = QuoteCartDetailsService.cartDetail; 
    }

    function saveQuote(isSubmit){

        
        vm.uiState.saveLoading = true;
        var _quote = angular.copy(vm.state.cartDetail);
        delete _quote._id;
        QuoteCartDetailsService.createQuote(_quote).then(function (response) {
            vm.state.quote = response.data;
            if(vm.attachment && vm.attachment.name){
                QuoteCartDetailsService.updateQuoteAttachment(vm.attachment, vm.state.quote._id).then(function (quote){
                    vm.state.quote = quote.data;
                    setDefaults(isSubmit);                 
                });
            }
            else{
                setDefaults(isSubmit);
            }         
        });
    }

    function setDefaults(isSubmit){
        if(isSubmit){
            QuoteCartDetailsService.submitQuote(vm.state.quote).then(function(){
                QuoteCartDetailsService.deleteCartDetails(vm.state.cartDetail).then(function(){
                    toaster.pop("success", "Quote submitted successfully");
                    $rootScope.$broadcast('$quoteAddedFromCart');
                    $scope.closeModal();
                })
            })
        }
        else{
            QuoteCartDetailsService.deleteCartDetails(vm.state.cartDetail).then(function(){
                toaster.pop("success", "Quote saved successfully");
                $rootScope.$broadcast('$quoteAddedFromCart');
                $scope.closeModal();
            })
        }
        
    }

    function checkIfValidEmail(email) {
        if(email){
            var regex = formValidations.email;
            var regexValue = regex.test(email.text);

            if(!regexValue){
                return false;
            }
        }
    }

    function initAttachment(){      
        vm.attachment = {};
        document.getElementById("upload_cart_file").value = "";
    }


    $scope.$watch(function() { return QuoteCartDetailsService.customers }, function(customers) {
        if(angular.isDefined(customers)){
            vm.state.customers = _.map(
                customers, 
                function(customer) {
                    return { OCRD_CardName: customer.OCRD_CardName, OCRD_CardCode: customer.OCRD_CardCode };
                }
            );
            vm.uiState.loadingDetailsModal = false;   
            var isVendor = vm.state.orgCardAndPermissions && vm.state.orgCardAndPermissions.isVendor;
            if(isVendor){
                if(vm.state.customers && vm.state.customers.length == 1){
                    vm.state.cartDetail.cardCode = vm.state.customers[0].OCRD_CardCode;
                    vm.state.cartDetail.companyName = vm.state.customers[0].OCRD_CardName;
                }
            }         
        }
    }, true);

    (function init() {
        
    })();

}]);
