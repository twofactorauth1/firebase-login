(function(){

app.controller('PromotionDetailsController', promotionDetailsController);

promotionDetailsController.$inject = ['$scope', '$state', '$attrs', '$filter', '$modal', '$timeout', '$stateParams', '$location', 'toaster', 'SweetAlert', 'formValidations', 'PromotionsService'];
/* @ngInject */
function promotionDetailsController($scope, $state, $attrs, $filter, $modal, $timeout, $stateParams, $location, toaster, SweetAlert, formValidations, PromotionsService) {

    var vm = this;

    vm.init = init;

    vm.uiState = {
        loading: true,
        editPromotion: true
    };

    vm.state = {};
    vm.promotionId = $stateParams.promotionId;
    vm.backToPromotions = backToPromotions;
    vm.deletePromotion = deletePromotion;
    vm.editPromotion = editPromotion;
    vm.openMediaModal = openMediaModal;
    vm.openModal = openModal;
    vm.closeModal = closeModal;
    vm.removeProduct = removeProduct;
    vm.checkIfValidEmail = checkIfValidEmail;
    function backToPromotions(){
        $state.go("app.promotions");
    }

    function editPromotion(){
        vm.uiState.editPromotion = !vm.uiState.editPromotion;
    }

    function deletePromotion(){
        SweetAlert.swal({
            title: "Are you sure?",
            text: "Do you want to delete this promotion?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete promotion!",
            cancelButtonText: "No, do not delete promotion!",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function (isConfirm) {
            if (isConfirm) {
                PromotionsService.deletePromotion(vm.state.promotion).then(function (data) {
                    toaster.pop('success', "Promotion deleted.", "Promotion was deleted successfully.");
                    backToPromotions();
                });
            } else {
                SweetAlert.swal("Not Deleted", "The promotion was not deleted.", "error");
            }
        });
    }

    function openMediaModal(modal, controller, size) {
        console.log('openModal >>> ', modal, controller);
        var _modal = {
            templateUrl: modal,
            keyboard: false,
            backdrop: 'static',
            size: 'lg',
            resolve: {
                vm: function() {
                    return vm;
                }
            }
        };
        if (controller) {
            _modal.controller = controller;
            _modal.resolve.showInsert = function () {
              return true;
            };
            _modal.resolve.insertMedia = function () {
              return insertMedia;
            };
            _modal.resolve.isSingleSelect = function () {
              return true
            };
        }

        if (size) {
            _modal.size = 'lg';
        }

        vm.modalInstance = $modal.open(_modal);

        vm.modalInstance.result.then(null, function () {
            angular.element('.sp-container').addClass('sp-hidden');
        });
    }

    function insertMedia(asset) {
        vm.state.promotion.promoImage = asset.url.replace(/^https?:/,'');
    }


    function openModal(modal, controller, size){
        var _modal = {
            templateUrl: modal,
            keyboard: false,
            backdrop: 'static',
            size: 'lg',
            resolve: {
                parentVm: function() {
                    return vm;
                }
            }
        };

        if (controller) {
            _modal.controller = controller + ' as vm';
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

    function removeProduct(product, index){
        vm.state.promotion.products.splice(index, 1);
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

    function init(){
        
        PromotionsService.viewPromotionDetails(vm.promotionId).then(function(response){  
            vm.state.promotion = response.data;
            vm.uiState.loading = false;            
        })

        PromotionsService.getVendors().then(function(response){  
            vm.state.vendors = response.data;          
        })
    }

}

})();
