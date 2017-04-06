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
    vm.checkIfInValid = checkIfInValid;
    vm.viewPurchaseOrderDetails = viewPurchaseOrderDetails;

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
        vm.uiState.saveLoading = true;
        PurchaseOrderService.createPurchaseOrder(po).then(function(response){
            vm.closeModal();
            vm.uiState.saveLoading = false;
        })
    }


    vm.getters = {
        created: function (value) {
            return value.created.date;
        }
    };


    function checkIfInValid(po){
        if(po && po.attachment && po.attachment.type == 'application/pdf'){
            return false;
        }
        else{
            return true;
        }
    }


    function viewPurchaseOrderDetails(order){
        $location.path('/purchase-orders/' + order._id);
    }

    function init(element) {
        vm.element = element;
    }

}

})();
