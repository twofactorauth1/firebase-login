(function(){

app.controller('SiteBuilderSidebarSettingsPanelController', ssbSiteBuilderSidebarSettingsPanelController);

ssbSiteBuilderSidebarSettingsPanelController.$inject = ['$scope', '$attrs', '$filter', '$document', '$timeout', 'SimpleSiteBuilderService', '$modal', 'editableOptions', '$location', 'SweetAlert'];
/* @ngInject */
function ssbSiteBuilderSidebarSettingsPanelController($scope, $attrs, $filter, $document, $timeout, SimpleSiteBuilderService, $modal, editableOptions, $location, SweetAlert) {

    console.info('site-build sidebar settings-panel directive init...')

    var vm = this;

    vm.init = init

    //get functions from ssb-sidebar.controller.js
    var pVm = $scope.$parent.vm;
    vm.addBackground = pVm.addBackground;
    vm.navigation = pVm.navigation;
    vm.removeImage = pVm.removeImage;
    vm.removeBackgroundImage = pVm.removeBackgroundImage;

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
