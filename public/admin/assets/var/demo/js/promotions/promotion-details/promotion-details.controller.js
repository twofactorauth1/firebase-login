(function(){

app.controller('PromotionDetailsController', promotionDetailsController);

promotionDetailsController.$inject = ['$scope', '$state', '$attrs', '$filter', '$modal', '$timeout', '$stateParams', '$location', 'toaster', 'PromotionsService'];
/* @ngInject */
function promotionDetailsController($scope, $state, $attrs, $filter, $modal, $timeout, $stateParams, $location, toaster, PromotionsService) {

    var vm = this;

    vm.init = init;

    vm.uiState = {loading: true};

    vm.promotionId = $stateParams.promotionId;

    function init(){
        
    }

}

})();
