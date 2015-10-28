(function(){

app.directive('ssbSiteBuilder', ssbSiteBuilder);

function ssbSiteBuilder() {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'assets/js/ssb-site-builder/ssb-site-builder.component.html',
        controller: 'SiteBuilderController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();