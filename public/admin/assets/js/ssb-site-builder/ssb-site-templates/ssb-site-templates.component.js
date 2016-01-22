(function(){

app.directive('ssbSiteTemplates', ssbSiteTemplates);

function ssbSiteTemplates() {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'assets/js/ssb-site-builder/ssb-site-templates/ssb-site-templates.component.html',
        controller: 'SiteBuilderSiteTemplatesController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
