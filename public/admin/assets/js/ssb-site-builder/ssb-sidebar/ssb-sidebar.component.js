(function(){

app.directive('ssbSidebar', ssbSidebar);

function ssbSidebar() {

    return {
        restrict: 'E',
        scope: {
            page: '='
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