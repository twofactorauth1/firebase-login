(function(){

app.controller('PurchaseOrderComponentController', purchaseOrderComponentController);

purchaseOrderComponentController.$inject = ['$scope', '$attrs', '$filter', '$modal', '$timeout', '$location', 'SweetAlert', 'toaster', 'pagingConstant', 'formValidations', 'PurchaseOrderService', 'UtilService'];
/* @ngInject */
function purchaseOrderComponentController($scope, $attrs, $filter, $modal, $timeout, $location, SweetAlert, toaster, pagingConstant, formValidations, PurchaseOrderService, UtilService) {

    var vm = this;

    vm.state = {
        newPurchaseOrder: {}
    };
    vm.uiState ={
        loading: true,
        globalSearch: PurchaseOrderService.globalSearch,
        fieldSearch: PurchaseOrderService.fieldSearch,
        loadingNewPoModal: true
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
    vm.setBulkActionChoiceFn=setBulkActionChoiceFn
    vm.pagingConstant = pagingConstant;
    vm.showFilteredRecords = showFilteredRecords;    
    vm.selectCardCode = selectCardCode;
    vm.getSubmitterName = getSubmitterName;
    vm.preventClick = preventClick;
    vm.formValidations = formValidations; 
    vm.bulkActionChoice = {};

    vm.bulkActionChoices = [{data: 'archive', label: 'Archive'}];

    vm.init = init;


    $scope.$watch(function() { return PurchaseOrderService.purchaseOrders }, function(data) {
        if(angular.isDefined(data)){
            vm.uiState.loading = false;
            vm.state.orders = data;    
        }        
    }, true);


    /********** GLOBAL SEARCH RELATED **********/

    $scope.$watch('vm.uiState.globalSearch', function (term) {
        if(angular.isDefined(term)){
            if(!angular.equals(term, PurchaseOrderService.globalSearch)){
                PurchaseOrderService.globalSearch = angular.copy(term);
            }
        }
    }, true);


    $scope.$watch('vm.uiState.fieldSearch', function (search) {
        if(angular.isDefined(search)){
            if(!angular.equals(search, PurchaseOrderService.fieldSearch)){
                PurchaseOrderService.fieldSearch = angular.copy(search);
            }
        }
    }, true);


    $scope.$watch("$parent.orgCardAndPermissions", function(permissions) {
        if(angular.isDefined(permissions)){
            vm.state.orgCardAndPermissions = permissions;
        }
    });

    function setDefaultsForNewPO(){
        vm.state.newPurchaseOrder = {
            submitterEmail: angular.copy($scope.$parent.currentUser.email)
        };
    }

    function openModal(size){
        setDefaultsForNewPO();
        var templateUrl = 'new-purchase-order-modal';
        var isVendor = vm.state.orgCardAndPermissions && vm.state.orgCardAndPermissions.isVendor;
        if(isVendor){
            if(vm.state.customers && vm.state.customers.length == 1){
                vm.state.newPurchaseOrder.cardCode = vm.state.customers[0].OCRD_CardCode;
                vm.state.newPurchaseOrder.companyName = vm.state.customers[0].OCRD_CardName;
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
        setDefaultsForNewPO();
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
            toaster.pop('success', "Thank You for your PO. The order is being processed. If you have any questions, then please contact "+ PurchaseOrderService.createPurchaseOrderEmailTo, null, 10000);
        })
    }


    vm.getters = {
        created: function (value) {
            return value.created.date;
        },
        submitter: function (value) {
            return getSubmitterName(value.submitter);
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


    function checkIfSelected(participant){
        return _.contains(_.pluck(vm.participants, "OCRD_CardCode"), participant.OCRD_CardCode);
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
    function setBulkActionChoiceFn(lable){
        vm.bulkActionChoice.action={data:lable.toLowerCase()}
        vm.bulkActionSelectFn();
    }

    function preventClick($event){
        $event.stopPropagation();

    }

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
        return UtilService.showFilteredRecords(vm.uiState.globalSearch, vm.uiState.fieldSearch);
    }

    $scope.$watch(function() { return PurchaseOrderService.customers }, function(customers) {
        if(angular.isDefined(customers)){
            vm.state.customers = _.map(
                customers, 
                function(customer) {
                    return { OCRD_CardName: customer.OCRD_CardName, OCRD_CardCode: customer.OCRD_CardCode };
                }
            );
            vm.uiState.loadingNewPoModal = false;   
            var isVendor = vm.state.orgCardAndPermissions && vm.state.orgCardAndPermissions.isVendor;
            if(isVendor){
                if(vm.state.customers && vm.state.customers.length == 1){
                    vm.state.newPurchaseOrder.cardCode = vm.state.customers[0].OCRD_CardCode;
                    vm.state.newPurchaseOrder.companyName = vm.state.customers[0].OCRD_CardName;
                }
            }         
        }
    }, true);

    function selectCardCode(customer){
        vm.state.newPurchaseOrder.companyName = customer.OCRD_CardName;
    }

    function getSubmitterName(user){
        var _userName = "";
        if(!user){
            return _userName;
        }
        if(user.first || user.last){
            _userName = user.first + " " + user.last;
        }
        else{
            _userName = user.username;
        }
        return _userName.trim();
    }

    function init(element) {
        vm.element = element;

        $timeout(function() {
            var params = {
                globalSearch: vm.uiState.globalSearch,
                fieldSearch: vm.uiState.fieldSearch
            }
            $scope.$broadcast('refreshTableData', params);
        }, 0);
    }

}

})();
