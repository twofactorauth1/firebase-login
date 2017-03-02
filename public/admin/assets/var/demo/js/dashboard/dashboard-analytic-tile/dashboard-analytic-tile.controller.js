(function(){

app.controller('DashboardAnalyticTileComponentController', dashboardAnalyticTileComponentController);

dashboardAnalyticTileComponentController.$inject = ['$scope', '$attrs', '$filter', 'DashboardService', '$modal', '$timeout'];
/* @ngInject */
function dashboardAnalyticTileComponentController($scope, $attrs, $filter, DashboardService, $modal, $timeout) {

    var vm = this;

    vm.init = init;

    vm.analyticMap = analyticMap;
    vm.uiDetails = [];

    //TODO: get from Dashboard.service
    /*vm.analyticData = {
        'visitors': {},
        'contacts': {},
        'CampaignMetrics': {},
        'Revenue': {},
        'SocialMedia': {}
    };*/


        vm.analyticData = {
            'Inventory': {},
            'Quotes': {},
            'PurchaseOrders': {},
            'Invoices': {},
            'Renewals': {},
            'Promotions': {}
        };

    function analyticMap() {
        var ret = {};
        var analyticsObject = DashboardService.state.analytics;

        if (analyticsObject) {
            switch(vm.analytic.name) {
                case 'Inventory':

                    ret.widgetTitle = 'Inventory';
                    ret.buttonTitle = 'Check Inventory';
                    ret.data = [
                        {name: 'SKU #'},
                        {name: 'Vender'},
                        {name: 'Qty OH'}
                    ];

                    break;

                case 'Quotes':

                    ret.widgetTitle = 'Quotes';
                    ret.buttonTitle = 'Build a quote';
                    ret.data = [
                        {name: 'Quote #'},
                        {name: 'End User'},
                        {name: 'Amount'}
                    ];

                    break;
                case 'PurchaseOrders':

                    ret.widgetTitle = 'Purchase Orders';
                    ret.buttonTitle = 'Submit a PO';
                    ret.data = [
                        {name: 'PO #'},
                        {name: 'Amount'},
                        {name: 'Status'}
                    ];

                    break;
                case 'Invoices':

                    ret.widgetTitle = 'Invoices';
                    ret.buttonTitle = 'Pay Invoice';
                    ret.data = [
                        {name: 'Invoice #'},
                        {name: 'Amount'},
                        {name: 'Due Date'}
                    ];
                    break;
                
                case 'Renewals':

                    ret.widgetTitle = 'Renewals';
                    ret.buttonTitle = 'View All renewals';
                    ret.data = [
                        {name: 'Date'},
                        {name: 'End User'},
                        {name: 'Amount'}
                    ];

                    break;
                case 'Promotions':

                    ret.widgetTitle = 'Promotions';
                    ret.buttonTitle = 'View Promotions';
                    ret.data = [
                        {name: 'Promotion'},
                        {name: 'Promo Potential'}
                    ];

                    break;
                
                default:
                //code
            }

        } else {
            $timeout(function(){
                vm.analyticMap();;
            }, 100);
        }

        vm.uiDetails = ret;
        return ret;
    }

    $scope.$watch(function() { return DashboardService.state.analytics }, function(state, oldState) {
        if(state && state !== oldState){
            vm.analyticMap();
        }
    })

    function init(element) {
        vm.element = element;

        $timeout(function() {
            vm.analyticMap();
        }, 0);

    }

}

})();
