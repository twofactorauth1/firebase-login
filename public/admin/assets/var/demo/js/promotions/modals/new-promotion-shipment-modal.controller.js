'use strict';
/*global app*/
app.controller('PromotionShipmentModalController', ['$scope', '$timeout', 'parentVm', 'toaster', 'PromotionsService', function ($scope, $timeout, parentVm, toaster, PromotionsService) {

    var vm = this;

    vm.parentVm = parentVm;
    
    vm.state = {};
    vm.uiState = {
        loadingShipmentModal: true
    };
    vm.attachment = {};
    vm.initAttachment = initAttachment;
    vm.statusOptions = PromotionsService.shipmentStatusOptions;
    vm.saveShipment = saveShipment;
    vm.selectCardCode = selectCardCode;
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

    $scope.$watch("$parent.orgCardAndPermissions", function(permissions) {
        if(angular.isDefined(permissions)){
            vm.state.orgCardAndPermissions = permissions;
        }
    });
    (function init() {
        
    })();

}]);
