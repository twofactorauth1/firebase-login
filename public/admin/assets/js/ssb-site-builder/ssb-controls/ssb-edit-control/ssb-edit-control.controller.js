(function(){

app.controller('SiteBuilderEditControlController', ssbSiteBuilderEditControlController);

ssbSiteBuilderEditControlController.$inject = ['$scope', '$attrs', '$filter', '$timeout', '$q', 'SimpleSiteBuilderService', 'SweetAlert'];
/* @ngInject */
function ssbSiteBuilderEditControlController($scope, $attrs, $filter, $timeout, $q, SimpleSiteBuilderService, SweetAlert) {

    var vm = this;

    vm.init = init;
    vm.setActive = setActive;
    vm.moveSection = moveSection;
    vm.duplicateSection = duplicateSection;
    vm.removeSectionFromPage = removeSectionFromPage;
    vm.scrollToActiveSection = scrollToActiveSection;

    /**
     * Watch for hovered components
     */
    if (vm.componentIndex !== undefined) {
        $scope.$watchGroup(['vm.uiState.hoveredSectionIndex', 'vm.uiState.hoveredComponentIndex'], setPosition);
    }


    /*
     * Turn on edit control for clicked element, set position near top left of element
     * - adjust position to account for section's
     *   margin/padding and edit-control placement @ top:0, left:0
     */
    function setPosition() {

        if (vm.uiState.hoveredSectionIndex === vm.sectionIndex && vm.uiState.hoveredComponentIndex === vm.componentIndex) {

            var section = vm.element.parent('section');
            var sectionTop = parseInt(section.css('marginTop')) + parseInt(section.css('paddingTop'));
            var sectionLeft = parseInt(section.css('marginLeft')) + parseInt(section.css('paddingLeft'));

            var top = vm.uiState.hoveredComponentPosition.top;
            var left = vm.uiState.hoveredComponentPosition.left;

            if (parseInt(top) === 0 || parseInt(top) - sectionTop === 0) {
                top = 35;
            }

            if (parseInt(left) === 0 || parseInt(left) - sectionLeft === 0) {
                left = 5;
            }

            vm.element.css({
                'top': top,
                'left': left
            });

            $timeout(function() {

                vm.element.addClass('on');

            })

        } else {
            vm.element.removeClass('on');
        }

    }

    function setActive(sectionIndex, componentIndex) {
        vm.uiState.showSectionPanel = false;
        vm.uiState.navigation.sectionPanel.reset();

        if (componentIndex !== undefined) {
            setActiveComponent(sectionIndex, componentIndex);
        } else {
            setActiveSection(sectionIndex);
        }
    }

    function setActiveSection(index) {

        SimpleSiteBuilderService.setActiveSection(index);
        SimpleSiteBuilderService.setActiveComponent(undefined);

        if (index !== undefined) {
            vm.uiState.showSectionPanel = true;
        }
    }

    function setActiveComponent(sectionIndex, componentIndex) {

        var component = vm.state.page.sections[sectionIndex].components[componentIndex];
        var name = $filter('cleanType')(component.type).toLowerCase().trim().replace(' ', '-');
        var sectionPanelLoadConfig = {
            name: name,
            id: component._id,
            componentId: component._id
        };

        SimpleSiteBuilderService.setActiveSection(undefined);
        SimpleSiteBuilderService.setActiveComponent(undefined);

        $timeout(function() {

            SimpleSiteBuilderService.setActiveSection(sectionIndex);
            SimpleSiteBuilderService.setActiveComponent(componentIndex);

            vm.uiState.navigation.sectionPanel.loadPanel(sectionPanelLoadConfig);
            vm.uiState.navigation.sectionPanel.navigationHistory = [];

            if (sectionIndex !== undefined && componentIndex !== undefined) {
                vm.uiState.showSectionPanel = true;
            }

        });

    }

    function moveSection(direction, section, index) {

        var sectionsArray = vm.state.page.sections;
        var toIndex;
        var fromIndex = index;

        if (direction === 'up') {
            toIndex = fromIndex - 1;
        }

        if (direction === 'down') {
            toIndex = fromIndex + 1;
        }

        sectionsArray.splice(toIndex, 0, sectionsArray.splice(fromIndex, 1)[0] );

        vm.setActive(toIndex);

        scrollToActiveSection();

    }

    function duplicateSection(section, index) {

        var sectionsArray = vm.state.page.sections;
        var insertAtIndex = (index > 0) ? (index - 1) : index;

        section = SimpleSiteBuilderService.setTempUUIDForSection(section);

        section.accountId = 0;

        SimpleSiteBuilderService.addSectionToPage(section, null, null, null, index).then(function() {
            console.log('duplicateSection -> SimpleSiteBuilderService.addSectionToPage')
        }, function(error) {
            console.error('duplicateSection -> SimpleSiteBuilderService.addSectionToPage', JSON.stringify(error));
        });

    }

    function removeSectionFromPage(index) {
      SweetAlert.swal({
        title: "Are you sure?",
        text: "Do you want to delete this section?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, do not delete it!",
        closeOnConfirm: true,
        closeOnCancel: true
      },
      function (isConfirm) {
        if (isConfirm) {
          SimpleSiteBuilderService.removeSectionFromPage(index)
        }
      });
    }

    function scrollToActiveSection() {
        $timeout(function () {
            var scrollContainerEl = document.querySelector('.ssb-site-builder-container');
            var activeSection = document.querySelector('.ssb-active-section');
            if (activeSection) {
              scrollContainerEl.scrollTop = activeSection.offsetTop;
            }
        }, 500);
    }

    function init(element) {
    	vm.element = element;
    }

}

})();
