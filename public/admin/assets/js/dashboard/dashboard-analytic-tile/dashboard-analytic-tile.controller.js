(function(){

app.controller('DashboardAnalyticTileComponentController', dashboardAnalyticTileComponentController);

dashboardAnalyticTileComponentController.$inject = ['$scope', '$attrs', '$filter', 'DashboardService', '$modal'];
/* @ngInject */
function dashboardAnalyticTileComponentController($scope, $attrs, $filter, DashboardService, $modal) {

    var vm = this;

    vm.init = init;

    vm.analyticMap = analyticMap;

    function analyticMap() {

        var ret = [];

        switch(vm.analytic.name) {
            case "visitors":
                ret = [
                    {
                        analyticDataLabel: 'NEW VISITORS',
                        analyticDataValue: 0//DashboardService.getNewVisitorsByDay().total
                    },
                    {
                        analyticDataLabel: 'PAGE VIEWS',
                        analyticDataValue: 0//DashboardService.getPageViewsByDay().total
                    }
                ]
                break;
            case "contacts":

                break;
            case "CampaignMetrics":

                break;
            case "SocialMedia":

                break;
            case "visitors":

                break;
            case "Orders":

                break;
            case "Revenue":

                break;
            default:
                //code
        }

        return ret;
    }

    function init(element) {
        vm.element = element;

        vm.analytic.uiDetails = vm.analyticMap();

    }

}

})();
