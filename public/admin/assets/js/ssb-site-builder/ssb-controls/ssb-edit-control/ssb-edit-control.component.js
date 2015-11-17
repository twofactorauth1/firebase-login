(function(){

app.directive('ssbEditControl', ssbEditControl);

function ssbEditControl() {

    return {
        restrict: 'E',
        scope: {
            state: '=',
            uiState: '=',
            index: '='
        },
        templateUrl: 'assets/js/ssb-site-builder/ssb-controls/ssb-edit-control/ssb-edit-control.component.html',
        controller: 'SiteBuilderEditControlController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();