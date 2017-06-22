'use strict';
/*global app*/
app.controller('PromotionShipmentModalController', ['$timeout', 'parentVm', 'toaster', 'PromotionsService', function ($timeout, parentVm, toaster, PromotionsService) {

    var vm = this;

    vm.parentVm = parentVm;
    
    vm.state = {
        shipment : {
        }
    };
    vm.attachment = {};
    vm.initAttachment = initAttachment;
    vm.statusOptions = PromotionsService.shipmentStatusOptions;
    
    function initAttachment(){
        vm.attachment = {};
        document.getElementById("upload_shipment_file").value = "";
    }

    (function init() {
        
    })();

}]);
