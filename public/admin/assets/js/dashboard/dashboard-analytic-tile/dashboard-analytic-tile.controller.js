(function(){

app.controller('DashboardAnalyticTileComponentController', dashboardAnalyticTileComponentController);

dashboardAnalyticTileComponentController.$inject = ['$scope', '$attrs', '$filter', 'DashboardService', '$modal'];
/* @ngInject */
function dashboardAnalyticTileComponentController($scope, $attrs, $filter, DashboardService, $modal) {

    var vm = this;

    vm.init = init;

    vm.analyticMap = analyticMap;
    vm.uiDetails = [];

    //TODO: get from Dashboard.service
    vm.analyticData = {
        'visitors': {},
        'contacts': {},
        'CampaignMetrics': {},
        'Revenue': {},
        'SocialMedia': {}
    };

    vm.getVisitorData = getVisitorData;
    vm.getContactData = getContactData;
    vm.getCampaignData = getCampaignData;
    vm.getRevenueData = getRevenueData;
    vm.getSocialData = getSocialData;
    vm.hideIfNotImplemented = hideIfNotImplemented;

    function getVisitorData() {
        DashboardService.getPageViewsByDayReport().then(function(data){
            vm.analyticData['visitors'].pageviews = data.data.total;
        });
        DashboardService.getNewVisitorsByDayReport().then(function(data){
            vm.analyticData['visitors'].visitors = data.data.total;
        });
    }

    function getContactData() {
        DashboardService.getContactsByDayReport().then(function(data){
            vm.analyticData['contacts'].customers = data.data.total;
            vm.analyticData['contacts'].leads = data.data.leadTotal;
        });
    }

    function getCampaignData() {
        // DashboardService.getContactsByDayReport().then(function(data){
            vm.analyticData['CampaignMetrics'].active = 0;
            vm.analyticData['CampaignMetrics'].openedclosed = 0;
        // });
    }

    function getSocialData() {
        // DashboardService.getContactsByDayReport().then(function(data){
            vm.analyticData['SocialMedia'].facebook = 0;
            vm.analyticData['SocialMedia'].twitter = 0;
        // });
    }

    function getRevenueData() {
        DashboardService.getContactsByDayReport().then(function(data){
            vm.analyticData['Revenue'].month = data.data.total;
            vm.analyticData['Revenue'].ytd = data.data.totalAmount;
        });
    }

    function analyticMap() {

        var ret = {};

        switch(vm.analytic.name) {
            case 'visitors':

                vm.getVisitorData();
                ret.widgetTitle = 'Website';
                ret.buttonTitle = 'View Analytics';
                ret.data = [
                    {
                        analyticDataLabel: 'NEW VISITORS',
                        analyticDataValue: function() { return vm.analyticData['visitors'].visitors }
                    },
                    {
                        analyticDataLabel: 'PAGE VIEWS',
                        analyticDataValue: function() { return vm.analyticData['visitors'].pageviews }
                    }
                ]

                break;

            case 'contacts':

                vm.getContactData();
                ret.widgetTitle = 'Contacts';
                ret.buttonTitle = 'View Contacts';
                ret.data = [
                    {
                        analyticDataLabel: 'CUSTOMERS',
                        analyticDataValue: function() { return vm.analyticData['contacts'].customers }
                    },
                    {
                        analyticDataLabel: 'LEADS',
                        analyticDataValue: function() { return vm.analyticData['contacts'].leads }
                    }
                ]
                break;
            case 'CampaignMetrics':

                vm.getCampaignData();
                ret.widgetTitle = 'Campaigns';
                ret.buttonTitle = 'View Campaigns';
                ret.data = [
                    {
                        analyticDataLabel: 'ACTIVE',
                        analyticDataValue: function() { return vm.analyticData['CampaignMetrics'].active }
                    },
                    {
                        analyticDataLabel: 'OPENED/CLOSED',
                        analyticDataValue: function() { return vm.analyticData['CampaignMetrics'].openedclosed }
                    }
                ]

                break;
            case 'SocialMedia':

                vm.getSocialData();
                ret.widgetTitle = 'Social Media';
                ret.buttonTitle = 'View Social Networks';
                ret.data = [
                    {
                        analyticDataLabel: 'FACEBOOK',
                        analyticDataValue: function() { return vm.analyticData['SocialMedia'].facebook }
                    },
                    {
                        analyticDataLabel: 'TWITTER',
                        analyticDataValue: function() { return vm.analyticData['SocialMedia'].twitter }
                    }
                ]

                break;
            case 'Orders':

                break;
            case 'Revenue':

                vm.getRevenueData();
                ret.widgetTitle = 'E-Commerce';
                ret.buttonTitle = 'View Revenue';
                ret.data = [
                    {
                        analyticDataLabel: 'MONTHLY REVENUE',
                        analyticDataValue: function() { return vm.analyticData['Revenue'].month }
                    }
                    // ,
                    // {
                    //     analyticDataLabel: 'YTD',
                    //     analyticDataValue: function() { return vm.analyticData['Revenue'].ytd }
                    // }
                ]

                break;
            default:
                //code
        }

        return ret;
    }

    function hideIfNotImplemented() {

        if (vm.uiDetails.data === undefined) {
            vm.element.parent().hide()
        }

    }

    function init(element) {
        vm.element = element;

        vm.uiDetails = vm.analyticMap();

        // vm.hideIfNotImplemented();

    }

}

})();
