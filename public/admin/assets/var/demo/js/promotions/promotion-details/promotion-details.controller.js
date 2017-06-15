(function(){

app.controller('PromotionDetailsController', promotionDetailsController);

promotionDetailsController.$inject = ['$scope', '$state', '$attrs', '$filter', '$modal', '$timeout', '$stateParams', '$location', 'toaster', 'PromotionsService'];
/* @ngInject */
function promotionDetailsController($scope, $state, $attrs, $filter, $modal, $timeout, $stateParams, $location, toaster, PromotionsService) {

    var vm = this;

    vm.init = init;

    vm.uiState = {loading: true};

    vm.state = {};
    vm.promotionId = $stateParams.promotionId;
    vm.backToPromotions = backToPromotions;

    function backToPromotions(){
        $state.go("app.promotions");
    }

    function init(){
        
        PromotionsService.viewPromotionDetails(vm.promotionId).then(function(response){  
            vm.state.promotion = response.data;
            vm.uiState.loading = false;
            
        })
    }

}

})();
