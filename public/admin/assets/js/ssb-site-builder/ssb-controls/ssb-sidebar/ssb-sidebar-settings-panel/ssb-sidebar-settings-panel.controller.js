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
    vm.setTags = vm.setTags;
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

    vm.setTags = function (_customerTags) {
        console.log('setTags >>>');
        
        _.each(vm.component.tags, function (tag , index) {
          var matchingTag = _.findWhere(vm.customerTags, {
            data: tag
          });
          if(matchingTag)
          {        
            _customerTags.push(matchingTag);
          }
          else {
            _customerTags.push({
                data : tag,
                label : tag
            });
          }
        });
        vm.customerTags = _.uniq(_customerTags, function(c) { return c.label; })        
    }

    function init(element) {
        vm.element = element;
        vm.setTags(vm.customerTags);
    }
}

})();
