(function(){

app.directive('ssbSidebar', ssbSidebar);

function ssbSidebar() {

    return {
        restrict: 'E',
        scope: {
            state: '='
        },
        templateUrl: 'assets/js/ssb-site-builder/ssb-sidebar/ssb-sidebar.component.html',
        controller: 'SiteBuilderSidebarController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();