(function(){

app.controller('PromotionDetailsController', promotionDetailsController);

promotionDetailsController.$inject = ['$scope', '$state', '$attrs', '$filter', '$modal', '$timeout', '$stateParams', '$location', 'toaster', 'SweetAlert', 'PromotionsService'];
/* @ngInject */
function promotionDetailsController($scope, $state, $attrs, $filter, $modal, $timeout, $stateParams, $location, toaster, SweetAlert, PromotionsService) {

    var vm = this;

    vm.init = init;

    vm.uiState = {
        loading: true,
        editPromotion: false
    };

    vm.state = {};
    vm.promotionId = $stateParams.promotionId;
    vm.backToPromotions = backToPromotions;
    vm.deletePromotion = deletePromotion;
    vm.editPromotion = editPromotion;

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

    function init(){
        
        PromotionsService.viewPromotionDetails(vm.promotionId).then(function(response){  
            vm.state.promotion = response.data;
            vm.uiState.loading = false;            
        })
    }

}

})();
