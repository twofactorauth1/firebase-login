(function(){

app.directive('ssbAccountTemplates', ssbAccountTemplates);

function ssbAccountTemplates() {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'assets/js/ssb-site-builder/ssb-account-templates/ssb-account-templates.component.html',
        controller: 'SiteBuilderAccountTemplatesController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
