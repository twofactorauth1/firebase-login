'use strict';
/*global app*/
app.controller('PromotionShipmentModalController', ['$scope', '$timeout', 'parentVm', 'toaster', 'PromotionsService', 'SweetAlert', function ($scope, $timeout, parentVm, toaster, PromotionsService, SweetAlert) {

    var vm = this;

    vm.parentVm = parentVm;
    
    vm.state = {
        orgCardAndPermissions: vm.parentVm.state.orgCardAndPermissions
    };
    vm.uiState = {
        loadingShipmentModal: true,
        deleteShipment: false
    };
    vm.attachment = {};
    vm.initAttachment = initAttachment;
    vm.statusOptions = PromotionsService.shipmentStatusOptions;
    vm.saveShipment = saveShipment;
    vm.selectCardCode = selectCardCode;
    vm.loadShipment = loadShipment;
    vm.deleteShipment = deleteShipment;
    vm.addProductsToShipment = addProductsToShipment;
    vm.shipmentProductOptions = angular.copy(vm.parentVm.state.promotion.products)
    vm.removeProduct = removeProduct;
    vm.setShipmentProduct = setShipmentProduct;

    function initAttachment(){
        vm.attachment = {};
        document.getElementById("upload_shipment_file").value = "";
    }


    function saveShipment(){
        vm.uiState.saveLoading = true;
        vm.state.shipment.promotionId = vm.parentVm.promotionId;
        PromotionsService.saveShipment(vm.state.shipment).then(function (response) {
            var shipmentId = response.data._id;
            vm.state.shipment = response.data;
            if(vm.attachment && vm.attachment.name){
                PromotionsService.updateShipmentAttachment(vm.attachment, shipmentId).then(function (shipment){
                    vm.state.shipment = shipment.data;
                    setDefaults();                 
                });
            }
            else{
                setDefaults();
            }         
        });
    }

    function setDefaults(){
        vm.uiState.saveLoading = false;
        vm.parentVm.closeModal();
        PromotionsService.refreshPromotionShipment(true);
    }

    $scope.$watch(function() { return PromotionsService.customers }, function(customers) {
        
        if(angular.isDefined(customers)){
            vm.state.customers = _.map(
                customers, 
                function(customer) {
                    return { OCRD_CardName: customer.OCRD_CardName, OCRD_CardCode: customer.OCRD_CardCode };
                }
            );
            vm.uiState.loadingShipmentModal = false;   
            var isVendor = vm.state.orgCardAndPermissions && vm.state.orgCardAndPermissions.isVendor;
            if(isVendor){
                if(vm.state.customers && vm.state.customers.length == 1){
                    vm.state.shipment.cardCode = vm.state.customers[0].OCRD_CardCode;
                    vm.state.shipment.companyName = vm.state.customers[0].OCRD_CardName;
                }
            }         
        }
    }, true);

    function selectCardCode(customer){
        vm.state.shipment.companyName = customer.OCRD_CardName;
    }
   

    function loadShipment(){
        if(vm.parentVm.currentShipment){
            vm.state.shipment = vm.parentVm.currentShipment;
            vm.uiState.deleteShipment = true;
        }
        else{
            vm.state.shipment = {};
        }
    }

    function deleteShipment(){
        SweetAlert.swal({
            title: "Are you sure?",
            text: "Do you want to delete this shipment?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete shipment!",
            cancelButtonText: "No, do not delete shipment!",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function (isConfirm) {
            if (isConfirm) {
                vm.uiState.saveLoading = true;
                PromotionsService.deleteShipment(vm.state.shipment).then(function (data) {
                    toaster.pop('success', "Shipment deleted.", "Shipment was deleted successfully.");
                    setDefaults();
                });
            } else {
                SweetAlert.swal("Not Deleted", "The shipment was not deleted.", "error");
            }
        });
    }

    function addProductsToShipment(){
        vm.state.shipment.products = vm.state.shipment.products || [];
        vm.state.shipment.products.push({
            itemName: null,
            itemCode: null,
            quantity: 1,
            serial: null,
            itemPrice: 0
        })
    }

    function removeProduct(product, index){
        vm.state.shipment.products.splice(index, 1);
    }

    function setShipmentProduct(product){       
        var _product = _.findWhere(vm.shipmentProductOptions,{
            itemCode: product.itemCode
        })
        product.itemName = _product.itemName;
        product.itemPrice = _product.itemPrice;
    }

    
    (function init() {
        vm.loadShipment();
    })();

}]);
