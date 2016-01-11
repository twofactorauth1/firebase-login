(function(){

app.directive('ssbTopbar', ssbTopbar);

function ssbTopbar() {

    return {
        restrict: 'E',
        scope: {
            state: '=',
            uiState: '='
        },
        templateUrl: 'assets/js/ssb-site-builder/ssb-controls/ssb-topbar/ssb-topbar.component.html',
        controller: 'SiteBuilderTopbarController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
