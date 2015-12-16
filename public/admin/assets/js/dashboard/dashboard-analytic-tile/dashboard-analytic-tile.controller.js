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
    vm.analyticData = {
        'visitors': {},
        'contacts': {},
        'CampaignMetrics': {},
        'Revenue': {},
        'SocialMedia': {}
    };

    function analyticMap() {

        var ret = {};

        switch(vm.analytic.name) {
            case 'visitors':

                ret.widgetTitle = 'Website';
                ret.buttonTitle = 'View Analytics';
                ret.data = [
                    {
                        analyticDataLabel: 'NEW VISITORS',
                        analyticDataValue: DashboardService.state.analytics.visitors.total
                    },
                    {
                        analyticDataLabel: 'PAGE VIEWS',
                        analyticDataValue: DashboardService.state.analytics.pageViews.total
                    }
                ]

                break;

            case 'contacts':

                ret.widgetTitle = 'Contacts';
                ret.buttonTitle = 'View Contacts';
                ret.data = [
                    {
                        analyticDataLabel: 'CUSTOMERS',
                        analyticDataValue: DashboardService.state.analytics.contacts.total
                    },
                    {
                        analyticDataLabel: 'LEADS',
                        analyticDataValue: DashboardService.state.analytics.contacts.leadTotal
                    }
                ]

                break;
            case 'CampaignMetrics':

                ret.widgetTitle = 'Campaigns';
                ret.buttonTitle = 'View Campaigns';
                ret.data = [
                    {
                        analyticDataLabel: 'SENT',
                        analyticDataValue: DashboardService.state.analytics.campaigns.totalSent
                    },
                    {
                        analyticDataLabel: 'OPENED',
                        analyticDataValue: DashboardService.state.analytics.campaigns.totalOpened
                    },
                    {
                        analyticDataLabel: 'CLICKED',
                        analyticDataValue: DashboardService.state.analytics.campaigns.totalClicked
                    }
                ]

                break;
            case 'SocialMedia':

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

                ret.widgetTitle = 'E-Commerce';
                ret.buttonTitle = 'View Revenue';
                ret.data = [
                    {
                        analyticDataLabel: 'YTD REVENUE',
                        analyticDataValue: '$' + DashboardService.state.analytics.revenue.YTDTotalAmount
                    },
                    {
                        analyticDataLabel: 'YTD ORDERS',
                        analyticDataValue: DashboardService.state.analytics.revenue.YTDTotalOrders
                    }
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
    $scope.$watch(function() { return DashboardService.state.analytics }, function(state, oldState) {
        if(state && state !== oldState){
            vm.uiDetails = vm.analyticMap();
        }
    })
    

    function init(element) {

        vm.element = element;

        $timeout(function() {
            vm.uiDetails = vm.analyticMap();
        }, 0);

    }

}

})();
