'use strict';
/*global app*/
app.controller('PromotionShipmentModalController', ['$timeout', 'parentVm', 'toaster', 'PromotionsService', function ($timeout, parentVm, toaster, PromotionsService) {

    var vm = this;

    vm.parentVm = parentVm;
    
    vm.state = {};
    vm.uiState = {};
    vm.attachment = {};
    vm.initAttachment = initAttachment;
    vm.statusOptions = PromotionsService.shipmentStatusOptions;
    vm.saveShipment = saveShipment;
    function initAttachment(){
        vm.attachment = {};
        document.getElementById("upload_shipment_file").value = "";
    }


    function saveShipment(){
        vm.uiState.saveLoading = true;
        vm.state.shipment.promotionId = vm.parentVm.state.promotion._id;
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
    }

    (function init() {
        
    })();

}]);
