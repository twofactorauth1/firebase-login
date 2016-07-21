(function(){

app.directive('emailSidebarSettingsPanel', emailSidebarSettingsPanel);

emailSidebarSettingsPanel.$inject = ['$compile', '$http', '$templateCache', '$parse'];
/* @ngInject */
function emailSidebarSettingsPanel($compile, $http, $templateCache, $parse) {

    return {
        restrict: 'E',
        scope: {
            component: '=',
            state: '=',
            uiState: '=',
            settingsTemplate: '@'
        },
        controller: 'SiteBuilderSidebarSettingsPanelController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {

            var templateUrl = '';

            if (ctrl.settingsTemplate) {

                if (ctrl.settingsTemplate.indexOf('#COMPONENTTYPE#') !== -1) {
                    ctrl.settingsTemplate = ctrl.settingsTemplate.replace('#COMPONENTTYPE#', scope.component.type);
                }


                templateUrl = ctrl.settingsTemplate;

                $http
                    .get(templateUrl, { cache: $templateCache })
                    .success(function(templateContent) {

                        element.empty().append($compile(templateContent)(scope));

                        ctrl.init(element);

                    });

            }

        }
    };

}

})();
