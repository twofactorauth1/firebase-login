(function(){

app.controller('PromotionsComponentController', promotionsComponentController);

promotionsComponentController.$inject = ['$scope', '$attrs', '$filter', '$modal', '$timeout', '$location', 'pagingConstant', 'toaster', 'PromotionsService', 'UtilService'];
/* @ngInject */
function promotionsComponentController($scope, $attrs, $filter, $modal, $timeout, $location, pagingConstant, toaster, PromotionsService, UtilService) {

    var vm = this;

    vm.init = init;

    vm.state = {};

    vm.uiState = {
        loading: true
    };

    vm.pagingConstant = pagingConstant;

    vm.showFilteredRecords = showFilteredRecords;
    vm.openModal = openModal;
    vm.closeModal = closeModal;
    vm.openMediaModal = openMediaModal;
    vm.removeImage = removeImage;
    vm.checkIfInValid = checkIfInValid;
    vm.createPromotion = createPromotion;
    vm.parseValueToDate = parseValueToDate;
    vm.viewPromotionDetails = viewPromotionDetails;
    vm.getProductsName = getProductsName;
    vm.addNewPromotion = addNewPromotion;
    $scope.$watch(function() { return PromotionsService.promotions }, function(promotions) {
        if(angular.isDefined(promotions)){
            vm.state.promotions = promotions;            
            vm.uiState.loading = false;
        }
    }, true);


    function viewPromotionDetails(promotion){
        $location.path('/promotions/' + promotion._id);
    }

    function addNewPromotion(){
        $location.path('/promotions/new');
    }

    function showFilteredRecords(){
        return UtilService.showFilteredRecords(vm.uiState.globalSearch, vm.uiState.fieldSearch);
    }


    function openModal(size){
        vm.state.promotion = {};
        var templateUrl = 'new-promotion-modal';
        
        vm.modalInstance = $modal.open({
            templateUrl: templateUrl,
            size: size,
            keyboard: true,
            backdrop: 'static',
            scope: $scope
        });
    }


    function closeModal() {
        if(vm.modalInstance)
            vm.modalInstance.close();
        vm.uiState.modalLoading = false;
        vm.state.promotion = {};
    }


    function openMediaModal(modal, controller, size) {
        console.log('openModal >>> ', modal, controller);
        var _modal = {
            templateUrl: modal,
            keyboard: true,
            backdrop: 'static',
            size: 'md',
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

    function removeImage() {
        vm.state.promotion.promoImage = null;
    }

    function checkIfInValid(promotion){
        if(promotion && promotion.attachment){
            return false;
        }
        else{
            return true;
        }
    }


    function parseValueToDate(value){
        if(value){
            var formattedDate = Date.parse(value); // "M/d/yyyy h:mm:ss a"
            return formattedDate;
        }
    }

    function createPromotion(promotion){
        vm.uiState.saveLoading = true;
        PromotionsService.createPromotion(promotion).then(function(response){
            vm.closeModal();
            vm.uiState.saveLoading = false;
        })
    }

    function getProductsName(products){
        return _.pluck(products, 'itemName').join(", ");
    }

    function init(element) {
        vm.element = element;
    }

    vm.getters = {
      shipmentCount: function (value) {
          return value.shipmentCount ? value.shipmentCount : 0;
      }
    };

}

})();
