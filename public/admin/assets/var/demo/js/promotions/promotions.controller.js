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
    
    $scope.$watch(function() { return PromotionsService.promotions }, function(promotions) {
        if(angular.isDefined(promotions)){
            vm.state.promotions = promotions;            
            vm.uiState.loading = false;
        }
    }, true);


    $scope.$watch(function() { return PromotionsService.userOrgConfig }, function(config) {
        if(angular.isDefined(config)){
            vm.state.userOrgConfig = config;
        }
    }, true);

    function showFilteredRecords(){
        return UtilService.showFilteredRecords(vm.uiState.globalSearch, vm.uiState.fieldSearch);
    }

    function init(element) {
        vm.element = element;
    }

}

})();
