(function(){

app.controller('PurchaseOrderComponentController', purchaseOrderComponentController);

purchaseOrderComponentController.$inject = ['$scope', '$attrs', '$filter', '$modal', '$timeout', '$location', 'SweetAlert', 'toaster', 'pagingConstant', 'PurchaseOrderService'];
/* @ngInject */
function purchaseOrderComponentController($scope, $attrs, $filter, $modal, $timeout, $location, SweetAlert, toaster, pagingConstant, PurchaseOrderService) {

    var vm = this;

    vm.state = {
        newPurchaseOrder: {}
    };
    vm.uiState ={
        loading: true,
        globalSearch: undefined,
        fieldSearch: {
            title: undefined
        },
    }

    
    vm.createPurchaseOrder = createPurchaseOrder;
    vm.openModal = openModal;
    vm.viewArchivedPo = viewArchivedPo; 
    vm.closeModal = closeModal;
    vm.checkIfInValid = checkIfInValid;
    vm.viewPurchaseOrderDetails = viewPurchaseOrderDetails;
    vm.selectAllClickFn = selectAllClickFn;
    vm.orderSelectClickFn = orderSelectClickFn;
    vm.bulkActionSelectFn = bulkActionSelectFn;
    vm.selectedOrdersFn = selectedOrdersFn;
    vm.pagingConstant = pagingConstant;
    vm.showFilteredRecords = showFilteredRecords;

    vm.bulkActionChoice = {};

    vm.bulkActionChoices = [{data: 'archive', label: 'Archive'}];

    vm.init = init;


    $scope.$watch(function() { return PurchaseOrderService.purchaseOrders }, function(data) {
        if(angular.isDefined(data)){
            vm.uiState.loading = false;
            vm.state.orders = data;    
        }        
    }, true);


    $scope.$watch("$parent.orgCardAndPermissions", function(permissions) {
        if(angular.isDefined(permissions)){
            vm.state.orgCardAndPermissions = permissions;
        }
    });

    function openModal(size){
        vm.state.newPurchaseOrder = {};
        var templateUrl = 'new-purchase-order-modal';

        var isVendor = vm.state.orgCardAndPermissions.isVendor;
        if(isVendor){
            templateUrl = 'new-vendor-purchase-order-modal';
            if(vm.state.orgCardAndPermissions.isVendorWithOneCardCode){
                vm.state.newPurchaseOrder.cardCode = vm.state.orgCardAndPermissions.cardCodes[0];
            }
        }

        $scope.modalInstance = $modal.open({
            templateUrl: templateUrl,
            size: size,
            keyboard: false,
            backdrop: 'static',
            scope: $scope
        });
    }


    function closeModal() {
        if($scope.modalInstance)
            $scope.modalInstance.close();
        vm.uiState.modalLoading = false;
    }

    function viewArchivedPo(size){

        $scope.modalInstance = $modal.open({
            templateUrl: 'archived-purchase-order-modal',
            size: size,
            keyboard: false,
            backdrop: 'static',
            scope: $scope
        });

        getArchivedPurchaseOrders();
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
        if(po && po.attachment){
            return false;
        }
        else{
            return true;
        }
    }


    function viewPurchaseOrderDetails(order){
        closeModal();
        $location.path('/purchase-orders/' + order._id);
    }


    function selectAllClickFn($event) {
        $event.stopPropagation();
        vm.selectAllChecked = !vm.selectAllChecked;
        vm.displayedOrders.forEach(function(order, index) {
            order.isSelected = vm.selectAllChecked
        });
    };


    function orderSelectClickFn($event, order) {
        $event.stopPropagation();
        if (order.isSelected) {
            order.isSelected = false;
        } else {
            order.isSelected = true;
        }
    };


    function selectedOrdersFn() {
        var exportOrders = _.filter(vm.displayedOrders, function(order) { return order.isSelected; });
        return exportOrders;
    };


    function bulkActionSelectFn() {
        var selectedOrders = vm.selectedOrdersFn();
        var deleteMessage = "Do you want to archive the "+ selectedOrders.length + " purchase order?";
        if(selectedOrders.length > 1)
          deleteMessage = "Do you want to archive the "+ selectedOrders.length + " purchase orders?";
        if (vm.bulkActionChoice.action.data == 'archive') {
            SweetAlert.swal({
                title: "Are you sure?",
                text: deleteMessage,
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, archive it!",
                cancelButtonText: "No, do not archive it!",
                closeOnConfirm: true,
                closeOnCancel: true
              },
              function (isConfirm) {
                if (isConfirm) {
                    var _selectedOrdersId = [];
                    _.each(selectedOrders, function(order){
                        _selectedOrdersId.push(order._id);
                    })
                    PurchaseOrderService.archiveBulkPurchaseOrders(_selectedOrdersId).then(function(response){
                        vm.bulkActionChoice = null;
                        vm.bulkActionChoice = {};
                        toaster.pop('success', 'Purchase orders successfully archived');
                    });
                } else {
                    vm.bulkActionChoice = null;
                    vm.bulkActionChoice = {};
                }
              });
        }
    };



    function getArchivedPurchaseOrders(){       
        vm.uiState.modalLoading = true;  
        PurchaseOrderService.getArchivedPurchaseOrders().then(function(response){
            vm.state.archivedOrders = response.data;
            vm.uiState.modalLoading = false;
        })
    }

    function showFilteredRecords(){
        if(vm.uiState.globalSearch || checkIfFieldSearch()){
            return true;
        }
        else{
            return false;
        }
    }

    function checkIfFieldSearch(){
        var isFieldSearch = false;
        var fieldSearch = vm.uiState.fieldSearch;
        if(!_.isEmpty(fieldSearch)){
            for(var i=0; i <= Object.keys(fieldSearch).length - 1; i++){
                var key = Object.keys(fieldSearch)[i];
                var value = fieldSearch[key];

                if(value){
                   isFieldSearch = true;
                }
            }
        }
        return isFieldSearch;
    }

    function init(element) {
        vm.element = element;
    }

}

})();
