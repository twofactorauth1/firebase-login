'use strict';
/*global app*/
app.controller('QuoteDetailsModalController', ['$scope', '$modal', '$state', '$rootScope', '$timeout', 'toaster', 'SweetAlert', 'formValidations', 'QuoteCartDetailsService', 'UserPermissionsConfig', function ($scope, $modal, $state, $rootScope, $timeout, toaster, SweetAlert, formValidations, QuoteCartDetailsService, UserPermissionsConfig) {

    var vm = this;

    vm.uiState = {
       loadingDetailsModal: true,
       showAddBtn: true
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
    vm.searchInventory = searchInventory;
    vm.addProducts = addProducts;
    vm.addItemsToCart = addItemsToCart;
    vm.closeModal = closeModal;
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

    function searchInventory(){
        addProducts();
    }

    function addProducts(){
        openModal("new-quote-product-modal", "QuoteProductModalController", 'lg');
    }

    function openModal(modal, controller, size){

        var _modal = {
            templateUrl: modal,
            keyboard: true,
            backdrop: 'static',
            size: 'lg',
            scope: $scope,
            resolve: {
                parentVm: function() {
                    return vm;
                }
            }
        };

        if (controller) {
            _modal.controller = controller  + ' as vm';
        }


        vm.modalInstance = $modal.open(_modal);

        vm.modalInstance.result.then(null, function () {
            angular.element('.sp-container').addClass('sp-hidden');
        });
    }

    function closeModal() {
        if(vm.modalInstance)
            vm.modalInstance.close();
    }

    function addCartItems(item){
        var calcItem = QuoteCartDetailsService.getCartItem(item, {});
        QuoteCartDetailsService.addItemToCart(calcItem).then(function (response){
            vm.uiState.saveLoading = false;
            vm.state.cartDetail = QuoteCartDetailsService.cartDetail;
        });
    }

    function addItemsToCart(items) {
        if(items.length){
            if(!QuoteCartDetailsService.cartDetail._id){
                vm.uiState.saveLoading = true;
                QuoteCartDetailsService.getCartItemTitle("New Quote ("+ moment().format("MMM DD YY") + ")").then(function(response){
                    QuoteCartDetailsService.cartDetail.title = response.data;                        
                    _.each(items, function(item){
                        var _item = _.findWhere(QuoteCartDetailsService.cartDetail.items, { OITM_ItemCode: item.OITM_ItemCode });
                        addCartItems(item);
                    })
                })
            }
            else{
                vm.uiState.saveLoading = true;
                _.each(items, function(item){
                    var _item = _.findWhere(vm.state.cartDetail.items, { OITM_ItemCode: item.OITM_ItemCode });
                    addCartItems(item);
                })
            }
        }    
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

    (function init() {
        
    })();

}]);
