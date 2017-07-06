(function(){

app.controller('PromotionDetailsController', promotionDetailsController);

promotionDetailsController.$inject = ['$scope', '$window', '$state', '$attrs', '$filter', '$modal', '$timeout', '$stateParams', '$location', 'toaster', 'SweetAlert', 'formValidations', 'PromotionsService', 'UserPermissionsConfig'];
/* @ngInject */
function promotionDetailsController($scope, $window, $state, $attrs, $filter, $modal, $timeout, $stateParams, $location, toaster, SweetAlert, formValidations, PromotionsService, UserPermissionsConfig) {

    var vm = this;

    vm.init = init;

    vm.uiState = {
        loading: true,
        saveLoading: false
    };
    vm.attachment = {
    };
    vm.state = {
        orgCardAndPermissions: UserPermissionsConfig.orgConfigAndPermissions
    };
    vm.promotionId = $stateParams.promotionId;
    vm.backToPromotions = backToPromotions;
    vm.deletePromotion = deletePromotion;
    vm.editPromotion = editPromotion;
    vm.openMediaModal = openMediaModal;
    vm.openModal = openModal;
    vm.closeModal = closeModal;
    vm.removeProduct = removeProduct;
    vm.checkIfValidEmail = checkIfValidEmail;
    vm.updatePromotion = updatePromotion;
    vm.initAttachment = initAttachment;
    vm.viewPromotionPdf = viewPromotionPdf;
    vm.addShipment = addShipment;
    vm.shipmentStatusOptions = PromotionsService.shipmentStatusOptions;
    vm.getPromoType = getPromoType;
    vm.exportShipments = exportShipments;
    function backToPromotions(){
        $state.go("app.promotions");
    }

    vm.promoTypeOptions = PromotionsService.promoTypeOptions;
    vm.reportSheduleOptions = PromotionsService.reportSheduleOptions;

    function editPromotion(){
        vm.uiState.editPromotion = !vm.uiState.editPromotion;
    }

    function getPromoType(type){
        if(type){
            var _type = _.findWhere(vm.promoTypeOptions.options, {
                value: type
            });
            return _type.label;
        }
    }

    function deletePromotion(){
        SweetAlert.swal({
            title: "Are you sure?",
            text: "Do you want to delete this promotion?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete promotion!",
            cancelButtonText: "No, do not delete promotion!",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function (isConfirm) {
            if (isConfirm) {
                PromotionsService.deletePromotion(vm.state.promotion).then(function (data) {
                    toaster.pop('success', "Promotion deleted.", "Promotion was deleted successfully.");
                    backToPromotions();
                });
            } else {
                SweetAlert.swal("Not Deleted", "The promotion was not deleted.", "error");
            }
        });
    }

    function openMediaModal(modal, controller, size) {
        console.log('openModal >>> ', modal, controller);
        var _modal = {
            templateUrl: modal,
            keyboard: false,
            backdrop: 'static',
            size: 'lg',
            resolve: {
                vm: function() {
                    return vm;
                }
            }
        };
        if (controller) {
            _modal.controller = controller;
            _modal.resolve.showInsert = function () {
              return true;
            };
            _modal.resolve.insertMedia = function () {
              return insertMedia;
            };
            _modal.resolve.isSingleSelect = function () {
              return true
            };
        }

        if (size) {
            _modal.size = 'lg';
        }

        vm.modalInstance = $modal.open(_modal);

        vm.modalInstance.result.then(null, function () {
            angular.element('.sp-container').addClass('sp-hidden');
        });
    }

    function insertMedia(asset) {
        vm.state.promotion.promoImage = asset.url.replace(/^https?:/,'');
    }


    function openModal(modal, controller, size){
        
        var _modal = {
            templateUrl: modal,
            keyboard: false,
            backdrop: 'static',
            size: 'lg',
            resolve: {
                parentVm: function() {
                    return vm;
                }
            }
        };

        if (controller) {
            _modal.controller = controller + ' as vm';
        }


        vm.modalInstance = $modal.open(_modal);

        vm.modalInstance.result.then(null, function () {
            angular.element('.sp-container').addClass('sp-hidden');
        });
    }
    
    function closeModal() {
        if(vm.modalInstance)
            vm.modalInstance.close();
    }

    function removeProduct(product, index){
        vm.state.promotion.products.splice(index, 1);
    }


    function checkIfValidEmail(email) {
        if(email){
            var regex = formValidations.email;
            var regexValue = regex.test(email.text);

            if(!regexValue){
                return false;
            }
        }
    }


    function updatePromotion(){
        vm.uiState.saveLoading = true;
        PromotionsService.updatePromotion(vm.state.promotion).then(function (response) {
            var promotionId = response.data._id;
            vm.state.promotion = response.data;
            if(vm.attachment && vm.attachment.name){
                PromotionsService.updatePromotionAttachment(vm.attachment, promotionId).then(function (promotion){
                    vm.state.promotion = promotion.data;
                    setDefaults();                 
                });
            }
            else{
                setDefaults();
            }         
        });
    }

    function setDefaults(){
        vm.initAttachment();
        vm.uiState.saveLoading = false;
        toaster.pop('success', "Promotion saved.", "Promotion was saved successfully.");
        if(vm.promotionId == 'new'){
            $state.go('app.promotions');
        } 
    }

    $scope.$watch("vm.state.promotion.vendor", function(newValue, oldValue) {
        if(angular.isDefined(newValue) && angular.isDefined(oldValue) && newValue != oldValue){
            clearProductList()
        }
    }, true);


    $scope.$watch("vm.state.promotion.type", function(newValue, oldValue) {
        if(angular.isDefined(newValue) && angular.isDefined(oldValue) && newValue != oldValue){
            clearProductList()
        }
    }, true);


    function clearProductList(){
        vm.state.promotion.products = [];
    }

    function initAttachment(){
      
        vm.attachment = {};
        document.getElementById("upload_file").value = "";
    }

    function viewPromotionPdf(){
        $window.open(vm.state.promotion.attachment.url, '_blank');
    }

    $scope.$watch("vm.state.promotion.attachment", function(attachment){
        if(attachment && attachment.url &&  attachment.mimeType == 'application/pdf'){
            $timeout(function() {
                var myPDF = new PDFObject({ 
                    url: attachment.url 
                }).embed('pdf-container');
            }, 500);
        }
    }, true);


    $scope.$watch(function() { return PromotionsService.shipments }, function(shipments) {
        vm.state.shipments = angular.copy(shipments);
        getShipmentStats();
    }, true);

    function addShipment(){
        
    }

    function getShipmentStats(){
        vm.state.shipmentStats = {};
        if(vm.state.shipments){
            // Reports
            vm.state.shipmentStats.reports = _.size(_.filter(vm.state.shipments, function(shipment) {
                return shipment.attachment && shipment.attachment.name
            }));
            // Try State
            vm.state.shipmentStats.tryState = _.size(_.filter(vm.state.shipments, function(shipment) {
                return shipment.status === vm.shipmentStatusOptions.TRY
            }));
            // Buy State
            vm.state.shipmentStats.buyState = _.size(_.filter(vm.state.shipments, function(shipment) {
                return shipment.status === vm.shipmentStatusOptions.BUY
            }));
            // RMA State
            vm.state.shipmentStats.rmaState = _.size(_.filter(vm.state.shipments, function(shipment) {
                return shipment.status === vm.shipmentStatusOptions.RMA
            }));
            // Confugured
            vm.state.shipmentStats.configured = _.size(_.filter(vm.state.shipments, function(shipment) {
                return shipment.configDate
            }));
            // Confugured
            vm.state.shipmentStats.deployed = _.size(_.filter(vm.state.shipments, function(shipment) {
                return shipment.deployDate
            }));
            // Promo Sales
            vm.state.shipmentStats.promoSales = getPromoSales();
        }
    }

    function getPromoSales(){
        var promoShipments = _.filter(vm.state.shipments, function(shipment) {
            return shipment.status === vm.shipmentStatusOptions.BUY
        })
        if(promoShipments){
            var products = _.without(_.flatten(_.pluck(promoShipments, "products")), null);
            var totalPrice = _.reduce(products, function(m, product) { 
                return m + parseFloat(product.itemPrice || 0) ; }, 0);
            return totalPrice;
        }
    }

    function exportShipments(){
        PromotionsService.exportShipments(vm.promotionId);
    }

    function init(){
        
        if(vm.promotionId == 'new'){
            vm.state.promotion = {
                _id: null
            };
            vm.uiState.loading = false; 
        }
        else{
            PromotionsService.viewPromotionDetails(vm.promotionId).then(function(response){  
                vm.state.promotion = response.data;
                vm.uiState.loading = false;            
            })
        }
        PromotionsService.getVendors().then(function(response){  
            vm.state.vendors = response.data;
        })

        PromotionsService.clearShipmentList();
        if(vm.state.orgCardAndPermissions.permissions.promotion.shipments.edit){
            if(!PromotionsService.customers){
                PromotionsService.getCustomers();
            }
        }
    }

}

})();
