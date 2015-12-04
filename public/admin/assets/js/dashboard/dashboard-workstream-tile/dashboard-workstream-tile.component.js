(function(){

app.directive('dashboardWorkstreamTileComponent', dashboardWorkstreamTile);

function dashboardWorkstreamTile() {

    return {
        restrict: 'E',
        scope: {
            state: '=',
            workstream: '='
        },
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
