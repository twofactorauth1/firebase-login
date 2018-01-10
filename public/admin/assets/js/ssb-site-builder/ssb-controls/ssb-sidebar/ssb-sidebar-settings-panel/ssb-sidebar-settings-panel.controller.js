(function(){

app.controller('SiteBuilderSidebarSettingsPanelController', ssbSiteBuilderSidebarSettingsPanelController);

ssbSiteBuilderSidebarSettingsPanelController.$inject = ['$scope', '$attrs', '$filter', '$document', '$timeout', 'SimpleSiteBuilderService', '$modal', 'editableOptions', '$location', 'SweetAlert', 'ContactService'];
/* @ngInject */
function ssbSiteBuilderSidebarSettingsPanelController($scope, $attrs, $filter, $document, $timeout, SimpleSiteBuilderService, $modal, editableOptions, $location, SweetAlert, ContactService) {

    console.info('site-build sidebar settings-panel directive init...')

    var vm = this;

    vm.init = init

    //get functions from ssb-sidebar.controller.js
    var pVm = $scope.$parent.vm;
    vm.addBackground = pVm.addBackground;
    vm.addBackgroundVideo = pVm.addBackgroundVideo;
    vm.addImage = pVm.addImage;
    vm.openModal = pVm.openModal;
    vm.setActiveComponent = pVm.setActiveComponent;
    vm.removeImage = pVm.removeImage;
    vm.removeBackgroundImage = pVm.removeBackgroundImage;
    vm.removeSectionFromPage = pVm.removeSectionFromPage;
    vm.hideSectionFromPage = pVm.hideSectionFromPage;
    vm.editSectionName = pVm.editSectionName;
    vm.moveSection = pVm.moveSection;
    vm.duplicateSection = pVm.duplicateSection;
    vm.enabledPlatformSections = pVm.enabledPlatformSections;
    vm.contactTags = pVm.contactTags;
    vm.constructVideoUrl = pVm.constructVideoUrl;
    vm.donationProductTags = pVm.donationProductTags;

    vm.addSectionToPage = addSectionToPage;
    vm.tagToCustomer = tagToCustomer;
    vm.setTags = setTags;
    vm.filteredSections = filteredSections;
    vm.isSelectedLayout = isSelectedLayout;
    vm.resizeWindow = resizeWindow;
    vm.changeButtonDesign = changeButtonDesign;
    vm.addCustomField = pVm.addCustomField;
    vm.checkDuplicateField = pVm.checkDuplicateField;
    vm.openCal = openCal;
    vm.closeCal = closeCal;

    vm.isHero = vm.component.title && vm.component.title.toLowerCase() === 'hero';


    //TODO: move into config services
    vm.spectrum = {
      options: SimpleSiteBuilderService.getSpectrumColorOptions()
    };

    vm.fontFamilyOptions = SimpleSiteBuilderService.getFontFamilyOptions();

    vm.fontWeightOptions = SimpleSiteBuilderService.getFontWeightOptions();


    $scope.component = vm.component;

    //TODO: change child components... unset (blank out) or set to color?
    $scope.$watch(function() {
        return vm.component ? vm.component.txtcolor : '';
    }, function(color) {
        console.debug(color);
    });

    $scope.$watch(function() {
        return vm.component && vm.component.bg ? vm.component.bg.color : '';
    }, function(color) {
        console.debug(color);
    });

    $scope.$watch('component.bg.img.overlaycolor', function (newValue, oldValue) {
        if (newValue) {
            if (!angular.isDefined($scope.component.bg.img.overlayopacity) || isNaN($scope.component.bg.img.overlayopacity)) {
                $scope.component.bg.img.overlayopacity = 100;
            }
        }
    });

    /*
     * isSelectedLayout
     *
     * @param section {}
     * @returns bool
     *
     * TODO: optimize with filteredSections?
     *
     */
    function isSelectedLayout(section) {

        var selected = false;
        var currentSection = vm.state.page.sections[vm.uiState.activeSectionIndex];

        if (section.type === 'ssb-page-section' && section.version === currentSection.version) {

            //match title
            selected = section.title === currentSection.title;

        } else {

            var childComponents = _.map(currentSection.components, function(component) {
                return {
                    type: component.type,
                    version: component.version
                }
            });
            var match = _.findWhere(childComponents, { 'type': section.type, 'version': parseInt(section.version, 10) });
            if(!match)
                // check without parsing the version
                match = _.findWhere(childComponents, { 'type': section.type, 'version': section.version });
            //match type
            selected = angular.isObject(match);

        }

        return selected;
    }

    /*
     * filteredSections
     * - Return section content related to currently selected section
     *
     * @returns {*}
     *
     * TODO: optimize with isSelectedLayout?
     *
     */
    function filteredSections() {

        var currentSection = vm.state.page.sections[vm.uiState.activeSectionIndex];
        var childComponentTypes = _(currentSection.components).pluck('type');
        var enabledPlatformSectionsWithFooter =  _.filter(vm.state.platformSections, function(section) {
                                return  section.type === 'footer' || section.enabled
                              });

        //filter list of enabled content sections based on title or type
        return _.filter(enabledPlatformSectionsWithFooter, function(section) {

            //if ssb-page-section, match on title
            if (section.type === 'ssb-page-section') {

                //match title if current section has title else match component type
                if(currentSection.title)
                  return section.title === currentSection.title;
                else if(currentSection.name)
                  return section.name === currentSection.name;
                else if(currentSection.components.length === 1){
                  if(currentSection.components[0].type === "navigation"){
                    return section.title === "Header";
                  }
                }
            //else if legacy component
            } else if (currentSection.components.length === 1) {

                //match type
                return _.contains(childComponentTypes, section.type);

            }

        })


    }

    function tagToCustomer(value) {
      return ContactService.tagToContact(value);
    }

    function setTags(_customerTags) {
        console.log('setTags >>>');
        if(vm.component && vm.component.tags){
          _.each(vm.component.tags, function (tag , index) {
            var matchingTag = _.findWhere(vm.contactTags, {
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
          vm.contactTags = _.uniq(_customerTags, function(c) { return c.label; })
        }
    }

    // function addCustomField(type){
    //     var cleanType = type.replace(' ','');
    //     var newInfo = {
    //         name: cleanType,
    //         type: type,
    //         label: type,
    //         custom: true,
    //         optional:true,
    //         visible: true
    //     }
    //     vm.component.contactInfo.push(newInfo);
    //     vm.contactInfo = {};
    // }

    // function checkDuplicateField(_type){
    //     return _.filter(vm.component.contactInfo, function(info){ return info.type.toLowerCase() === _type.toLowerCase(); }).length;
    // }


    function resizeWindow(){
      $(window).trigger('resize');
    }

    function addSectionToPage(section, version, activeSectionIndex){
      if(!vm.isSelectedLayout(section)){
        return pVm.addSectionToPage(section, version, activeSectionIndex);
      }
    }

    function changeButtonDesign(version) {
        var button = vm.uiState.activeElement;
        var updateVersion=true;
        var elementId = vm.uiState.activeElement._id.replace("button-element_", "");
        if(elementId){
            var selectedButton = $(".ssb-theme-btn[data-compiled='"+elementId+"']");
            if(selectedButton.length === 1){
                $(selectedButton).removeClass(function(i, c) {
                    return c.match(/ssb-theme-btn-style-\d+/g) && c.match(/ssb-theme-btn-style-\d+/g).join(" ");
                });
            }
            if(button.version){
                var versionIsNumber = button.version && typeof button.version === "number";
                if(versionIsNumber)	 {
                    updateVersion= button.version!=version;
                }else{
                    updateVersion = !button.version['ssb-theme-btn-style-' + version];
                } 
                delete button.version;
            }
        }
        if(updateVersion){
            button.version = version;
        }
    }

    function openCal($event, type) {
        $event.preventDefault();
        $event.stopPropagation();
        if (type == 'start') {
          vm.startCalOpened = true;
        }
        if (type == 'end') {
          vm.endCalOpened = true;
        }
    };

    function closeCal($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = false;
    };


    function init(element) {
        vm.element = element;
        vm.setTags(vm.contactTags);
    }
}

})();
