(function(){

app.controller('SiteBuilderSidebarSettingsPanelController', ssbSiteBuilderSidebarSettingsPanelController);

ssbSiteBuilderSidebarSettingsPanelController.$inject = ['$scope', '$attrs', '$filter', '$document', '$timeout', 'SimpleSiteBuilderService', '$modal', 'editableOptions', '$location', 'SweetAlert'];
/* @ngInject */
function ssbSiteBuilderSidebarSettingsPanelController($scope, $attrs, $filter, $document, $timeout, SimpleSiteBuilderService, $modal, editableOptions, $location, SweetAlert) {

    console.info('site-build sidebar settings-panel directive init...')

    var vm = this;

    vm.init = init

    //TODO: move into config services
    vm.spectrum = {
      options: SimpleSiteBuilderService.getSpectrumColorOptions()
    };

    $scope.component = vm.component;

    function init(element) {

        vm.element = element;

    }
}

})();
