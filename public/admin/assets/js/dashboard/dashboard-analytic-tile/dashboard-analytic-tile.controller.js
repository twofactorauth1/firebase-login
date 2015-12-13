(function(){

app.controller('DashboardAnalyticTileComponentController', dashboardAnalyticTileComponentController);

dashboardAnalyticTileComponentController.$inject = ['$scope', '$attrs', '$filter', 'DashboardService', '$modal'];
/* @ngInject */
function dashboardAnalyticTileComponentController($scope, $attrs, $filter, DashboardService, $modal) {

    var vm = this;

    vm.init = init;

    vm.analyticMap = analyticMap;
    vm.uiDetails = [];
    vm.analyticData = {
        'visitors': {},
        'contacts': {},
        'CampaignMetrics': {},
        'Revenue': {}
    };
    vm.getVisitorData = getVisitorData;
    vm.getContactData = getContactData;
    vm.getCampaignData = getCampaignData;
    vm.getRevenueData = getRevenueData;

    function getVisitorData() {
        DashboardService.getPageViewsByDayReport().then(function(data){
            vm.analyticData['visitors'].pageviews = data.total;
        });
        DashboardService.getNewVisitorsByDayReport().then(function(data){
            vm.analyticData['visitors'].visitors = data.total;
        });
    }

    function getContactData() {
        DashboardService.getContactsByDayReport().then(function(data){
            vm.analyticData['contacts'].customers = data.total;
            vm.analyticData['contacts'].leads = data.leadTotal;
        });
    }

    function getCampaignData() {
        // DashboardService.getContactsByDayReport().then(function(data){
            vm.analyticData['CampaignMetrics'].active = 0;
            vm.analyticData['CampaignMetrics'].openedclosed = 0;
        // });
    }

    function getRevenueData() {
        DashboardService.getContactsByDayReport().then(function(data){
            vm.analyticData['Revenue'].month = data.total;
            vm.analyticData['Revenue'].ytd = data.totalAmount;
        });
    }

    function analyticMap() {

        var ret = [];

        switch(vm.analytic.name) {
            case 'visitors':

                vm.getVisitorData();

                ret = [
                    {
                        analyticDataLabel: 'NEW VISITORS',
                        analyticDataValue: vm.analyticData['visitors'].visitors
                    },
                    {
                        analyticDataLabel: 'PAGE VIEWS',
                        analyticDataValue: vm.analyticData['visitors'].pageviews
                    }
                ]

                break;

            case 'contacts':

                vm.getContactData();

                ret = [
                    {
                        analyticDataLabel: 'CUSTOMERS',
                        analyticDataValue: vm.analyticData['contacts'].customers
                    },
                    {
                        analyticDataLabel: 'LEADS',
                        analyticDataValue: vm.analyticData['contacts'].leads
                    }
                ]
                break;
            case 'CampaignMetrics':

                vm.getCampaignData();

                ret = [
                    {
                        analyticDataLabel: 'ACTIVE',
                        analyticDataValue: vm.analyticData['CampaignMetrics'].active
                    },
                    {
                        analyticDataLabel: 'OPENED/CLOSED',
                        analyticDataValue: vm.analyticData['CampaignMetrics'].openedclosed
                    }
                ]

                break;
            case 'SocialMedia':

                break;
            case 'Orders':

                break;
            case 'Revenue':

                vm.getRevenueData();

                ret = [
                    {
                        analyticDataLabel: 'REVENUE',
                        analyticDataValue: vm.analyticData['Revenue'].month
                    },
                    {
                        analyticDataLabel: 'YTD',
                        analyticDataValue: vm.analyticData['Revenue'].ytd
                    }
                ]

                break;
            default:
                //code
        }

        return ret;
    }

    function init(element) {
        vm.element = element;

        vm.uiDetails = vm.analyticMap();

    }

}

})();
