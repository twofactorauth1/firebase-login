(function(){

app.directive('ssbSidebarSettingsPanel', ssbSidebarSettingsPanel);

function ssbSidebarSettingsPanel() {

    return {
        restrict: 'E',
        scope: {
            component: '=',
            state: '=',
            uiState: '=',
            addBackground: '='
        },
        templateUrl: function(element, attrs) {

            var url = '';

            if (attrs.settingsTemplate) {
                url = attrs.settingsTemplate;
            }

            return url;

        },
        controller: 'SiteBuilderSidebarSettingsPanelController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
