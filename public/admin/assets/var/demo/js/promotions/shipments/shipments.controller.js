(function(){

app.controller('ShipmentsComponentController', shipmentsComponentController);

shipmentsComponentController.$inject = ['$scope', '$attrs', '$window', '$filter', '$stateParams', '$modal', '$timeout', '$location', 'pagingConstant', 'toaster', 'PromotionsService', 'UtilService'];
/* @ngInject */
function shipmentsComponentController($scope, $attrs, $window, $filter, $stateParams, $modal, $timeout, $location, pagingConstant, toaster, PromotionsService, UtilService) {

    var vm = this;

    vm.init = init;

    vm.state = {};

    vm.uiState = {
        loading: true
    };

    vm.pagingConstant = pagingConstant;
    vm.promotionId = $stateParams.promotionId;
    vm.showFilteredRecords = showFilteredRecords;
    vm.openModal = openModal;
    vm.closeModal = closeModal;
    vm.parseValueToDate = parseValueToDate;
    vm.statusOptions = PromotionsService.shipmentStatusOptions;
    vm.viewPdf = viewPdf;
    vm.loadShipments = loadShipments;
    function showFilteredRecords(){
        return UtilService.showFilteredRecords(vm.uiState.globalSearch, vm.uiState.fieldSearch);
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

    function parseValueToDate(value){
        if(value){
            var formattedDate = Date.parse(value); // "M/d/yyyy h:mm:ss a"
            return formattedDate;
        }
    }

    function viewPdf(attachment){
        if(attachment.url)
            $window.open(attachment.url, '_blank');
    }

    function loadShipments(){
        vm.uiState.loading = true;
        PromotionsService.getShipments(vm.promotionId).then(function(response){
            vm.state.shipments = response.data;
            vm.uiState.loading = false;
        })
    }

    $scope.$watch(function() { return PromotionsService.refreshPromotionShipment }, function(status) {
        if(angular.isDefined(status)){
            loadShipments();
        }
    }, true);

    

    function init(element) {
        vm.element = element;
        if(vm.promotionId != 'new'){
            vm.loadShipments();
        }
        else{
            vm.state.shipments = [];
        }
    }

}

})();
