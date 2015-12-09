(function(){

app.directive('dashboardWorkstreamTileComponent', dashboardWorkstreamTile);
/* @ngInject */
function dashboardWorkstreamTile() {

    return {
        restrict: 'E',
        scope: {
            state: '=',
            uiState: '=',
            workstream: '='
        },
        replace: true,
        templateUrl: 'assets/js/dashboard/dashboard-workstream-tile/dashboard-workstream-tile.component.html',
        controller: 'DashboardWorkstreamTileComponentController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
