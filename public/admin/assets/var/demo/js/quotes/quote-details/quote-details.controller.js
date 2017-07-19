(function(){

app.controller('QuoteDetailsController', QuoteDetailsController);

QuoteDetailsController.$inject = ['$scope', '$timeout', 'toaster', 'SweetAlert', 'formValidations', 'parentVm', 'QuoteService'];
/* @ngInject */
function QuoteDetailsController($scope, $timeout, toaster, SweetAlert, formValidations, parentVm, QuoteService) {

    var vm = this;

    vm.uiState = {
        loading: true
    };

    vm.state = {};
    vm.parentVm = parentVm;
    vm.initAttachment = initAttachment;
    vm.calculateTotalPrice = calculateTotalPrice;
    vm.removeItemFromCart = removeItemFromCart;
    vm.updateQuote = updateQuote;
    vm.attachment = {};
    vm.checkIfValidEmail = checkIfValidEmail;
    vm.state.cartDetail = angular.copy(vm.parentVm.state.cartDetails);
    function calculateTotalPrice(items){

        var totalPrice = 0;
        if(items){
            totalPrice = _.reduce(items, function(m, item) {
                return m + (item.ITM1_Price || 0) *  item.quantity; },
            0);
        }
        vm.state.cartDetail.total = totalPrice;
        return totalPrice || 0;
    }

    function removeItemFromCart(index){
        vm.state.cartDetail.items.splice(index, 1);
        setVendorSpecialPricing();
    }

    function setVendorSpecialPricing(){            
        var items =  _.groupBy(vm.state.cartDetail.items, function(item){ 
            return item._shortVendorName; 
        });
        var keyArr = _.map(items, function(g, key){return {vendor: key}});

        _.each(keyArr, function(item){
            if(vm.state.cartDetail.vendorSpecialPricing && vm.state.cartDetail.vendorSpecialPricing.length){
                if(!_.contains(_.pluck(vm.state.cartDetail.vendorSpecialPricing, "vendor"), item.vendor)){
                    vm.state.cartDetail.vendorSpecialPricing.push({
                        "vendor": item.vendor
                    })
                }
            }
            else{
                vm.state.cartDetail.vendorSpecialPricing = [];
                vm.state.cartDetail.vendorSpecialPricing.push({
                    "vendor": item.vendor
                })
            }
        })

        vm.state.cartDetail.vendorSpecialPricing = _.filter(vm.state.cartDetail.vendorSpecialPricing, function(item){
            return _.contains(_.pluck(keyArr, 'vendor'), item.vendor) 
        })

    }

    function updateQuote(isSubmit){
        vm.uiState.saveLoading = true;
        var _quote = angular.copy(vm.state.cartDetail);
        QuoteService.createQuote(_quote).then(function (response) {
            vm.state.quote = response.data;
            if(vm.attachment && vm.attachment.name){
                QuoteService.updateQuoteAttachment(vm.attachment, vm.state.quote._id).then(function (quote){
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
            QuoteService.submitQuote(vm.state.quote).then(function(){
                toaster.pop("success", "Quote submitted successfully");
                $scope.closeModal();
            })
        }
        else{
            $scope.closeModal();
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
    if(vm.parentVm.state.cartDetails.status != "Sent"){
        QuoteService.getQuoteDetails(vm.parentVm.state.cartDetails._id).then(function(response){
            vm.state.cartDetail = response.data;
            checkIfEditMode();
            vm.uiState.loading = false;
        })
    }
    else{        
        checkIfEditMode();
        vm.uiState.loading = false;
    }

    function checkIfEditMode(){
        vm.uiState.isViewMode = vm.state.cartDetail.status == "Sent";
    }
    

    (function init() {
        
    })();

}

})();
