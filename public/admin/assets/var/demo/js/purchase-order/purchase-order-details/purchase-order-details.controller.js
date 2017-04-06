(function(){

app.controller('PurchaseOrderDetailsController', purchaseOrderDetailsController);

purchaseOrderDetailsController.$inject = ['$scope', '$state', '$attrs', '$filter', '$modal', '$timeout', '$stateParams', '$location', 'PurchaseOrderService'];
/* @ngInject */
function purchaseOrderDetailsController($scope, $state, $attrs, $filter, $modal, $timeout, $stateParams, $location, PurchaseOrderService) {

    var vm = this;

    vm.init = init;

    vm.state = {};

    console.log($stateParams.purchaseOrderId);

    vm.backToPurchaseOrders = backToPurchaseOrders;
    vm.getPurchaseOrderDetails = getPurchaseOrderDetails;

    function backToPurchaseOrders(){
        $state.go("app.purchaseorders");
    }

    function getPurchaseOrderDetails(orderId){
        PurchaseOrderService.getPurchaseOrderDetails(orderId).then(function(response){
            vm.state.purchaseOrder = response.data;
        })
    }


    function init(element) {
        vm.element = element;
        vm.getPurchaseOrderDetails($stateParams.purchaseOrderId);
    }

}

})();
