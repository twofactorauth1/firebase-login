(function(){

app.directive('ssbFlyover', ssbFlyover);

function ssbFlyover() {

    return {
        restrict: 'E',
        scope: {
            state: '=',
            uiState: '='
        },
        templateUrl: 'assets/js/ssb-site-builder/ssb-flyover/ssb-flyover.component.html',
        controller: 'SiteBuilderFlyoverController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();