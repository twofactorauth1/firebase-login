(function(){

app.controller('ShipmentsComponentController', shipmentsComponentController);

shipmentsComponentController.$inject = ['$scope', '$attrs', '$window', '$filter', '$stateParams', '$modal', '$timeout', '$location', 'pagingConstant', 'toaster', 'PromotionsService', 'UtilService'];
/* @ngInject */
function shipmentsComponentController($scope, $attrs, $window, $filter, $stateParams, $modal, $timeout, $location, pagingConstant, toaster, PromotionsService, UtilService) {

    var vm = this;

    vm.init = init;

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
    vm.preventClick = preventClick;
    vm.getShipmentStatus = getShipmentStatus;
    vm.stringifyAddress = stringifyAddress;
    vm.getProductsName = getProductsName;
    function showFilteredRecords(){
        return UtilService.showFilteredRecords(vm.uiState.globalSearch, vm.uiState.fieldSearch);
    }

    function getShipmentStatus(status){
        if(status){
            var _status = _.findWhere(vm.statusOptions.options, {
                value: status
            });
            return _status.label;
        }
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

    function viewPdf($event, attachment){
        $event.stopPropagation();
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

    $scope.$watch(function() { return PromotionsService.refreshShipment }, function(status) {
        if(angular.isDefined(status) && status){
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

    function preventClick($event){
        $event.stopPropagation();
        
    }

    function stringifyAddress(details) {
        var _firstRow = "";
        var _middleRow = "";
        var _bottomRow = "";
        if (details) {
            if(details.customerName){
                _firstRow += details.customerName + '<br>';
            }
            if(details.address1 || details.address2)
            {
                if(details.address1){
                    _middleRow +=  details.address1 + " ";     
                }
                if(details.address2){
                    _middleRow += details.address2;    
                }
                if(_middleRow.length){
                    _middleRow += '<br>';  
                }
            }
            if(details.city || details.state || details.zip)
            {
                if(details.city){
                    _bottomRow +=  details.city + ", ";     
                }
                if(details.state){
                    _bottomRow +=  details.state + " ";  
                }
                if(details.zip){
                    _bottomRow +=  details.zip;  
                }
            }
        }
        return _firstRow + _middleRow + _bottomRow;
    }

    function getProductsName(products){
        return _.pluck(products, 'itemName').join(", ");
    }
}

})();
