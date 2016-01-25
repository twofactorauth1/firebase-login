(function(){

app.controller('SiteBuilderSidebarSettingsPanelController', ssbSiteBuilderSidebarSettingsPanelController);

ssbSiteBuilderSidebarSettingsPanelController.$inject = ['$scope', '$attrs', '$filter', '$document', '$timeout', 'SimpleSiteBuilderService', '$modal', 'editableOptions', '$location', 'SweetAlert', 'CustomerService'];
/* @ngInject */
function ssbSiteBuilderSidebarSettingsPanelController($scope, $attrs, $filter, $document, $timeout, SimpleSiteBuilderService, $modal, editableOptions, $location, SweetAlert, CustomerService) {

    console.info('site-build sidebar settings-panel directive init...')

    var vm = this;

    vm.init = init

    //get functions from ssb-sidebar.controller.js
    var pVm = $scope.$parent.vm;
    vm.addBackground = pVm.addBackground;
    vm.addImage = pVm.addImage;
    vm.openModal = pVm.openModal;
    vm.setActiveComponent = pVm.setActiveComponent;
    vm.removeImage = pVm.removeImage;
    vm.removeBackgroundImage = pVm.removeBackgroundImage;
    vm.removeSectionFromPage = pVm.removeSectionFromPage;
    vm.hideSectionFromPage = pVm.hideSectionFromPage;
    vm.editSectionName = pVm.editSectionName;
    vm.tagToCustomer = tagToCustomer;
    vm.customerTags = pVm.customerTags;
    //TODO: move into config services
    vm.spectrum = {
      options: SimpleSiteBuilderService.getSpectrumColorOptions()
    };

    $scope.component = vm.component;

    //TODO: change child components... unset (blank out) or set to color?
    $scope.$watch(function() {
        return vm.component ? vm.component.txtcolor : '';
    }, function(color) {
        console.debug(color);
    });

    $scope.$watch(function() {
        return vm.component ? vm.component.bg.color : '';
    }, function(color) {
        console.debug(color);
    });


    function tagToCustomer(value) {
      return CustomerService.tagToCustomer(value);
    }

    function init(element) {

        vm.element = element;

    }
}

})();
