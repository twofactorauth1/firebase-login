(function(){

app.directive('ssbSidebarSettingsPanel', ssbSidebarSettingsPanel);

function ssbSidebarSettingsPanel() {

    return {
        restrict: 'E',
        scope: {
            state: '=',
            uiState: '='
        },
        templateUrl: function(element, attrs) {

            var url = '';

            if (attrs.settingsType === 'design') {
                url = 'assets/js/ssb-site-builder/ssb-components/ssb-page-section/sidebar.settings.design.html';
            } else if (attrs.settingsType === 'layout') {
                url = 'assets/js/ssb-site-builder/ssb-components/ssb-page-section/sidebar.settings.layout.html';
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
