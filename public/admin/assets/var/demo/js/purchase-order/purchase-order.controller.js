(function(){

app.controller('PurchaseOrderComponentController', purchaseOrderComponentController);

purchaseOrderComponentController.$inject = ['$scope', '$attrs', '$filter', '$modal', '$timeout', '$location', 'SweetAlert', 'toaster', 'pagingConstant', 'PurchaseOrderService'];
/* @ngInject */
function purchaseOrderComponentController($scope, $attrs, $filter, $modal, $timeout, $location, SweetAlert, toaster, pagingConstant, PurchaseOrderService) {

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
    vm.selectAllClickFn = selectAllClickFn;
    vm.orderSelectClickFn = orderSelectClickFn;
    vm.bulkActionSelectFn = bulkActionSelectFn;
    vm.selectedOrdersFn = selectedOrdersFn;
    vm.pagingConstant = pagingConstant;

    vm.bulkActionChoice = {};

    vm.bulkActionChoices = [{data: 'archive', label: 'Archive'}];

    vm.init = init;


    $scope.$watch(function() { return PurchaseOrderService.purchaseOrders }, function(data) {
        if(angular.isDefined(data)){
            vm.uiState.loading = false;
            vm.state.orders = data;    
        }        
    }, true);

    $scope.$watchGroup(["$parent.account", "$parent.currentUser"], _.debounce(function(values) {
        if(values[0] && values[1]){
            vm.state.account = values[0];
            vm.state.user = values[1];
            vm.state.orgCardAndPermissions = getOrgConfigAndPermissions(vm.state.user, vm.state.account)
        }
    }, 0), true);


    // Need to move this to a service in order to use it globally 
    function getOrgConfigAndPermissions(user, account){

        var userAccount = _.find(user.accounts, function(acc){
            return acc.accountId == account._id
        })
       
        var orgConfigAry = user.orgConfig || [];  
        var orgConfigAndPermissions = {
            permissions: null,
            config: null
        }
        var orgConfig = _.find(orgConfigAry, function(config){
            return config.orgId == account.orgId
        })

        orgConfigAndPermissions.permissions = userAccount.permissions;
        orgConfigAndPermissions.config = orgConfig;


        return orgConfigAndPermissions;
    };


    function openModal(size){

        var templateUrl = 'new-purchase-order-modal';

        var isVendor = _.contains(vm.state.orgCardAndPermissions.permissions, 'vendor');
        if(isVendor){
            templateUrl = 'new-vendor-purchase-order-modal';
        }

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
        if(po && po.attachment){
            return false;
        }
        else{
            return true;
        }
    }


    function viewPurchaseOrderDetails(order){
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
                    PurchaseOrderService.deleteBulkPurchaseOrders(_selectedOrdersId).then(function(response){
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

    function init(element) {
        vm.element = element;
    }

}

})();
