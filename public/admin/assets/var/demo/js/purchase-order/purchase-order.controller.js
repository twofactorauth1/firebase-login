(function(){

app.controller('PurchaseOrderComponentController', purchaseOrderComponentController);

purchaseOrderComponentController.$inject = ['$scope', '$attrs', '$filter', '$modal', '$timeout', '$location', 'PurchaseOrderService'];
/* @ngInject */
function purchaseOrderComponentController($scope, $attrs, $filter, $modal, $timeout, $location, PurchaseOrderService) {

    var vm = this;

    vm.state = {

    };
    vm.uiState ={
        loading: true
    }

    
    vm.createPurchaseOrder = createPurchaseOrder;
    vm.openModal = openModal;
    vm.closeModal = closeModal;
    vm.init = init;


    $scope.$watch(function() { return PurchaseOrderService.purchaseOrders }, function(data) {
        if(angular.isDefined(data)){
            vm.uiState.loading = false;
            vm.state.orders = data;    
        }        
    }, true);


    function openModal(size){
        $scope.modalInstance = $modal.open({
            templateUrl: 'new-purchase-order-modal',
            size: size,
            keyboard: false,
            backdrop: 'static',
            scope: $scope
        });
    }


    function closeModal() {
        $scope.modalInstance.close();
    }


    function createPurchaseOrder(po, form){
        PurchaseOrderService.createPurchaseOrder(po);
    }

    function init(element) {
        vm.element = element;
    }

}

})();
