(function(){

app.controller('QuoteDetailsController', QuoteDetailsController);

QuoteDetailsController.$inject = ['$scope', '$timeout', 'toaster', 'SweetAlert', 'formValidations', 'parentVm', '$modal', 'QuoteService', 'UserPermissionsConfig'];
/* @ngInject */
function QuoteDetailsController($scope, $timeout, toaster, SweetAlert, formValidations, parentVm, $modal, QuoteService, UserPermissionsConfig) {

    var vm = this;

    vm.uiState = {
        loading: true,
        loadingDetailsModal: true
    };

    
    vm.parentVm = parentVm;
    vm.initAttachment = initAttachment;
    vm.calculateTotalPrice = calculateTotalPrice;
    vm.removeItemFromCart = removeItemFromCart;
    vm.saveQuote = saveQuote;
    vm.attachment = {};
    vm.checkIfValidEmail = checkIfValidEmail;
    vm.state = {
        orgCardAndPermissions: UserPermissionsConfig.orgConfigAndPermissions
    };
    vm.state.cartDetail = angular.copy(vm.parentVm.state.cartDetails);
    vm.selectCardCode = selectCardCode;
    vm.deleteQuote = deleteQuote;
    vm.closeModal = closeModal;
    vm.addProducts = addProducts;
    vm.addItemsToCart = addItemsToCart;
    function selectCardCode(customer){
        vm.state.cartDetail.companyName = customer.OCRD_CardName;
    }

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

    function saveQuote(isSubmit){
        vm.uiState.saveLoading = true;
        QuoteService.updateQuote(vm.state.cartDetail).then(function (response) {
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
                vm.parentVm.uiState.loading = true;
                QuoteService.getQuotes();
                toaster.pop("success", "Quote submitted successfully");
                vm.parentVm.closeModal();

            })
        }
        else{
            vm.parentVm.uiState.loading = true;
            QuoteService.getQuotes();
            vm.parentVm.closeModal();
            toaster.pop("success", "Quote saved successfully");
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

    function deleteQuote(){
        SweetAlert.swal({
            title: "Are you sure?",
            text: "Do you want to delete this quote?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete quote!",
            cancelButtonText: "No, do not delete quote!",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function (isConfirm) {
            if (isConfirm) {
                vm.uiState.saveLoading = true;
                QuoteService.deleteQuote(vm.state.cartDetail).then(function (data) {
                    toaster.pop('success', "Quote deleted.", "Quote was deleted successfully.");
                    vm.parentVm.closeModal();
                });
            } else {
                SweetAlert.swal("Not Deleted", "The quote was not deleted.", "error");
            }
        });
    }

    function initAttachment(){      
        vm.attachment = {};
        vm.state.cartDetail.attachment = {};
        if(document.getElementById("upload_quote_file"))
            document.getElementById("upload_quote_file").value = "";
    }

    if(vm.parentVm.state.cartDetails.status != "Sent"){
        QuoteService.getQuoteDetails(vm.parentVm.state.cartDetails._id).then(function(response){
            vm.state.cartDetail = response.data;
            checkIfEditMode();
            vm.uiState.loading = false;
            $scope.$watch(function() { return QuoteService.customers }, function(customers) {
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
        })
    }
    else{        
        checkIfEditMode();
        vm.uiState.loading = false;
    }

    function checkIfEditMode(){
        vm.uiState.showDeleteBtn = vm.uiState.showAddBtn = vm.state.cartDetail.status != "Sent";
        vm.uiState.isViewMode = vm.state.cartDetail.status == "Sent";
    }

    function addProducts(){
        openModal("new-quote-product-modal", "QuoteProductModalController", 'lg')
    }

    function addItemsToCart(items) {
        if(items.length){
           _.each(items, function(item){
                var _item = _.findWhere(vm.state.cartDetail.items, { OITM_ItemCode: item.OITM_ItemCode });
                if(!_item){
                    item.quantity = 1;
                    vm.state.cartDetail.items.push(item);
                }
            })
            setVendorSpecialPricing(); 
        }        
    }

    function openModal(modal, controller, size){

        var _modal = {
            templateUrl: modal,
            keyboard: false,
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
    (function init() {
        
    })();

}

})();
