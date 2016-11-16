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
                        analyticDataLabel: 'MTD New Visitors',
                        analyticDataValue: DashboardService.state.analytics.visitors.total
                    },
                    {
                        analyticDataLabel: 'MTD Uniques',
                        analyticDataValue: DashboardService.state.analytics.allvisitors.total
                    },
                    {
                        analyticDataLabel: 'MTD Page Views',
                        analyticDataValue: DashboardService.state.analytics.pageViews.total
                    }
                ];

                break;

            case 'contacts':

                ret.widgetTitle = 'Contacts';
                ret.buttonTitle = 'View Contacts';
                ret.data = [
                    {
                        analyticDataLabel: 'MTD Contacts',
                        analyticDataValue: DashboardService.state.analytics.contacts.total
                    },
                    {
                        analyticDataLabel: 'MTD Leads',
                        analyticDataValue: DashboardService.state.analytics.contacts.leadTotal
                    }
                ]

                break;
            case 'CampaignMetrics':

                ret.widgetTitle = 'Campaigns';
                ret.buttonTitle = 'View Campaigns';
                ret.data = [
                    {
                        analyticDataLabel: 'MTD Sent',
                        analyticDataValue: DashboardService.state.analytics.campaigns.totalSent
                    },
                    {
                        analyticDataLabel: 'MTD Opened',
                        analyticDataValue: DashboardService.state.analytics.campaigns.totalOpened
                    },
                    {
                        analyticDataLabel: 'MTD Clicked',
                        analyticDataValue: DashboardService.state.analytics.campaigns.totalClicked
                    }
                ]

                break;
            case 'SocialMedia':

                ret.widgetTitle = 'Social Media';
                ret.buttonTitle = 'View Social Networks';
                ret.data = [
                    {
                        analyticDataLabel: 'Facebook',
                        analyticDataValue: function() { return vm.analyticData['SocialMedia'].facebook }
                    },
                    {
                        analyticDataLabel: 'Twitter',
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
                        analyticDataLabel: 'YTD Order Rev.',
                        analyticDataValue: '$' + (parseFloat(DashboardService.state.analytics.revenue.YTDTotalAmount) - parseFloat(DashboardService.state.analytics.revenue.YTDTotalTax)).toFixed(2)
                    },
                    {
                        analyticDataLabel: 'YTD Tax Collected',
                        analyticDataValue: DashboardService.state.analytics.revenue.YTDTotalTax
                    },
                    {
                        analyticDataLabel: 'YTD New Orders',
                        analyticDataValue: DashboardService.state.analytics.revenue.YTDTotalOrders
                    }
                ]

                break;
            default:
                //code
        }

        return ret;
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
        }, 500);

    }

}

})();
