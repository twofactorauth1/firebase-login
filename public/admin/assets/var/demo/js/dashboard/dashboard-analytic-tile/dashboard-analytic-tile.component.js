(function(){

app.directive('dashboardAnalyticTileComponent', dashboardAnalyticTile);
/* @ngInject */
function dashboardAnalyticTile() {

    return {
        restrict: 'E',
        scope: {
            state: '=',
            uiState: '=',
            analytic: '='
        },
        replace: true,
        templateUrl: 'assets/js/dashboard/dashboard-analytic-tile/dashboard-analytic-tile.component.html',
        controller: 'DashboardAnalyticTileComponentController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
