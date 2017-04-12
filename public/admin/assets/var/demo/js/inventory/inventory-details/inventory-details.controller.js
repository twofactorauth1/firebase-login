(function(){

app.controller('InventoryDetailsController', inventoryDetailsController);

inventoryDetailsController.$inject = ['$scope', '$state', '$attrs', '$filter', '$modal', '$timeout', '$stateParams', '$location', 'InventoryService', 'ChartAnalyticsService'];
/* @ngInject */
function inventoryDetailsController($scope, $state, $attrs, $filter, $modal, $timeout, $stateParams, $location, InventoryService, ChartAnalyticsService) {

    var vm = this;

    vm.init = init;

    console.log($stateParams.inventoryId);

    vm.uiState = {loading: true};

    vm.backToInventory = backToInventory;

    vm.parseValueToFloat = parseValueToFloat;

    function backToInventory(){
        $state.go("app.inventory");
    }

    $scope.$watch(function() { return InventoryService.inventory }, function(inventory) {
        if(angular.isDefined(inventory)){
            InventoryService.getSingleInventory($stateParams.inventoryId).then(function(response){
                vm.inventory = response;
                vm.uiState.loading = false;
            })   
        }        
    }, true);

    function parseValueToFloat(value){
        if(value){
            return parseFloat(parseFloat(value).toFixed(2));
        }
    }

    function init(element) {
        vm.element = element;
    }

}

})();
