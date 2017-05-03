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
   $scope.finalrevenuedata = 'loading....';
   $scope.showrevenue=false;
    function analyticMap() {
        var ret = {};
        var revenuedata = DashboardService.revenueFromStripe;
        $scope.finalrevenuedata = 'loading....';
        revenuedata = parseFloat(revenuedata).toFixed(2);
            if(!isNaN(revenuedata)){
                 $scope.finalrevenuedata = revenuedata;
                  $scope.showrevenue = true;
            }else{
                 $scope.finalrevenuedata = 'loading....';
            }

        var analyticsObject = DashboardService.state.analytics;
        if (analyticsObject) {
            switch(vm.analytic.name) {
                case 'visitors':

                    ret.widgetTitle = 'Website';
                    ret.buttonTitle = 'View Analytics';
                    ret.data = [
                        {
                            analyticDataLabel: 'MTD New Visitors',
                            analyticDataValue: analyticsObject.visitors.total
                        },
                        {
                            analyticDataLabel: 'MTD Uniques',
                            analyticDataValue: analyticsObject.allvisitors.total
                        },
                        {
                            analyticDataLabel: 'MTD Page Views',
                            analyticDataValue: analyticsObject.pageViews.total
                        }
                    ];

                    break;

                case 'contacts':

                    ret.widgetTitle = 'Contacts';
                    ret.buttonTitle = 'View Contacts';
                    ret.data = [
                        {
                            analyticDataLabel: 'MTD Contacts',
                            analyticDataValue: analyticsObject.contacts.total
                        },
                        {
                            analyticDataLabel: 'MTD Leads',
                            analyticDataValue: analyticsObject.contacts.leadTotal
                        }
                    ]

                    break;
                case 'CampaignMetrics':

                    ret.widgetTitle = 'Campaigns';
                    ret.buttonTitle = 'View Campaigns';
                    ret.data = [
                        {
                            analyticDataLabel: 'MTD Sent',
                            analyticDataValue: analyticsObject.campaigns.totalSent
                        },
                        {
                            analyticDataLabel: 'MTD Opened',
                            analyticDataValue: analyticsObject.campaigns.totalOpened
                        },
                        {
                            analyticDataLabel: 'MTD Clicked',
                            analyticDataValue: analyticsObject.campaigns.totalClicked
                        }
                    ]

                    break;
                case 'SocialMedia':

                    ret.widgetTitle = 'Social Media';
                    ret.buttonTitle = 'View Social Networks';
                    ret.data = [
                        {
                            analyticDataLabel: 'Facebook',
                            analyticDataValue: function () {
                                return vm.analyticData['SocialMedia'].facebook
                            }
                        },
                        {
                            analyticDataLabel: 'Twitter',
                            analyticDataValue: function () {
                                return vm.analyticData['SocialMedia'].twitter
                            }
                        }
                    ]

                    break;
                case 'Orders':

                    break;
                case 'Revenue':

                    ret.widgetTitle = 'E-Commerce';
                    ret.buttonTitle = 'View Orders';
                    ret.data = [
                        {
                            analyticDataLabel: 'YTD Revenue (Stripe)',
                            analyticDataValue: $scope.finalrevenuedata
                        }
                        ,
                        //{
                        //    analyticDataLabel: 'YTD New Rev (non-Recurring)',
                        //    analyticDataValue: parseFloat(analyticsObject.revenue.YTDTotalAmount).toFixed(2)
                        //}
                        //,
                        // {
                        //     analyticDataLabel: 'YTD Tax Collected',
                        //     analyticDataValue: analyticsObject.revenue.YTDTotalTax
                        // },
                        {
                            analyticDataLabel: 'YTD New Orders',
                            analyticDataValue: analyticsObject.revenue.YTDTotalOrders
                        }
                    ]

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
      $scope.$watch(function() { return DashboardService.revenueFromStripe }, function(state, oldState) {

            vm.analyticMap();

    })

    function init(element) {
        vm.element = element;

        $timeout(function() {
            vm.analyticMap();
        }, 0);

    }

}

})();
