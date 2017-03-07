(function(){

app.controller('InventoryDetailsController', inventoryDetailsController);

inventoryDetailsController.$inject = ['$scope', '$state', '$attrs', '$filter', '$modal', '$timeout', '$stateParams', '$location', 'InventoryService', 'ChartAnalyticsService'];
/* @ngInject */
function inventoryDetailsController($scope, $state, $attrs, $filter, $modal, $timeout, $stateParams, $location, InventoryService, ChartAnalyticsService) {

    var vm = this;

    vm.init = init;

    console.log($stateParams.inventoryId);

    vm.backToInventory = backToInventory;

    function backToInventory(){
        $state.go("app.inventory");
    }

    vm.salesTimelineData = [
        {
            _date: '01/17/2017',
            _time: ' 03:50 AM',
            userName: "Alberta Dennis",
            qty: 1,
            revenue: "$81",
            grown: true 
        },{
            _date: '01/17/2016',
            _time: ' 02:20 AM',
            userName: "Kyle Warner",
            qty: 5,
            revenue: "$405",
            grown: true 
        },
        {
            _date: '01/17/2016',
            _time: ' 01:10 AM',
            userName: "Alice Peter",
            qty: 3,
            revenue: "$243",
            grown: false 
        },
        {
            _date: '01/17/2016',
            _time: ' 00:30 AM',
            userName: "Noah Long",
            qty: 1,
            revenue: "$81",
            grown: true 
        }
    ]


    InventoryService.getSingleInventory($stateParams.inventoryId).then(function(response){
        vm.inventory = response;
    })

    vm.salesConfig = ChartAnalyticsService.salesDemoChart;

    function init(element) {
        vm.element = element;
    }

}

})();
