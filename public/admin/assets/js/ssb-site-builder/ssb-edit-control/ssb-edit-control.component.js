(function(){

app.directive('ssbEditControl', ssbEditControl);

function ssbEditControl() {

    return {
        restrict: 'E',
        scope: {
            state: '=',
            index: '='
        },
        templateUrl: 'assets/js/ssb-site-builder/ssb-edit-control/ssb-edit-control.component.html',
        controller: 'SiteBuilderEditControlController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();