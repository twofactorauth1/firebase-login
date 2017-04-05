(function(){

app.controller('PurchaseOrderDetailsController', purchaseOrderDetailsController);

purchaseOrderDetailsController.$inject = ['$scope', '$state', '$attrs', '$filter', '$modal', '$timeout', '$stateParams', '$location', 'PurchaseOrderService'];
/* @ngInject */
function purchaseOrderDetailsController($scope, $state, $attrs, $filter, $modal, $timeout, $stateParams, $location, PurchaseOrderService) {

    var vm = this;

    vm.init = init;

    console.log($stateParams.purchaseOrderId);

    vm.backToPurchaseOrders = backToPurchaseOrders;

    function backToPurchaseOrders(){
        $state.go("app.purchaseorders");
    }


    function init(element) {
        vm.element = element;
    }

}

})();
