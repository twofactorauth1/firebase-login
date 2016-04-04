(function(){

app.controller('SiteBuilderEditControlController', ssbSiteBuilderEditControlController);

ssbSiteBuilderEditControlController.$inject = ['$scope', '$rootScope', '$interval', '$attrs', '$filter', '$timeout', '$q', 'SimpleSiteBuilderService', 'SweetAlert'];
/* @ngInject */
function ssbSiteBuilderEditControlController($scope, $rootScope, $interval, $attrs, $filter, $timeout, $q, SimpleSiteBuilderService, SweetAlert) {

    var vm = this;

    vm.init = init;
    vm.setActive = setActive;
    vm.moveSection = moveSection;
    vm.duplicateSection = duplicateSection;
    vm.removeSectionFromPage = removeSectionFromPage;
    vm.scrollToActiveSection = scrollToActiveSection;

    /**
     * Watch for hovered components and component areas
     */
    // if (vm.componentIndex !== undefined) {
        // $scope.$watchGroup(['vm.uiState.hoveredSectionIndex', 'vm.uiState.hoveredComponentIndex'], setPosition);
    // }

    // $interval(setPosition, 1000, false);

    /**
     * Events for compiled editor elememts
     */
    $rootScope.$on('$ssbMenuOpen', function(event, componentId, editorId, elementId) {
        setPosition();
    });


    /*
     * Turn on edit control for hovered element, set position near top left of element
     * - adjust position to account for section's
     *   margin/padding and edit-control placement @ top:0, left:0
     */
    function setPosition() {

        if (vm.uiState.hoveredSectionIndex === vm.sectionIndex && vm.uiState.hoveredComponentIndex === vm.componentIndex) {

                var top = 0;
                var left = 0;
                var editElTop = 0;
                var editElLeft = 0;
                var topbarHeight = 125;
                var sidebarWidth = 140;
                var scrollTop = document.querySelector('.ssb-site-builder-container').scrollTop;
                var topOffset = 35;
                var leftOffset = 35;

                var editEl = vm.uiState.hoveredComponentEl;
                var editControl = vm.uiState.hoveredComponentEditControl;

                if (editEl.length) {
                    editElTop = editEl[0].getBoundingClientRect().top;
                    editElLeft = editEl[0].getBoundingClientRect().left;
                    top = editEl[0].getBoundingClientRect().top - topOffset - topbarHeight + scrollTop;
                    left = editEl[0].getBoundingClientRect().left - leftOffset - sidebarWidth;
                }

                if (left < 0 || editElLeft === sidebarWidth) {
                    left = 0;
                }

                if (editElTop - topbarHeight < 30) {
                    top = editElTop - topbarHeight;
                    left = left + 36;
                }

                if (editControl && editControl.length) {
                    editControl.css({ top: top, left: left });
                    editControl.addClass('ssb-on');
                }

        } else {

            if (!vm.element.data('compiled-control-id')) {
                vm.element.removeClass('on');
            }

        }

    }

    function setActive(sectionIndex, componentIndex, compiled) {

        vm.uiState.showSectionPanel = false;
        vm.uiState.navigation.sectionPanel.reset();
        SimpleSiteBuilderService.setActiveSection(undefined);
        SimpleSiteBuilderService.setActiveComponent(undefined);

        if (compiled) {
            setActiveElement();
        } else if (componentIndex !== undefined) {
            setActiveComponent(sectionIndex, componentIndex);
        } else {
            setActiveSection(sectionIndex);
        }

    }

    function setActiveSection(index) {

        var section = vm.state.page.sections[index];
        var name = $filter('cleanType')(section.title || section.name).toLowerCase().trim().replace(' ', '-') + ' Section';

        $timeout(function() {
            SimpleSiteBuilderService.setActiveSection(index);
            SimpleSiteBuilderService.setActiveComponent(undefined);

            vm.uiState.navigation.sectionPanel.loadPanel({ id: '', name: name });

            if (index !== undefined) {
                vm.uiState.showSectionPanel = true;
            }
        });
    }

    function setActiveComponent(sectionIndex, componentIndex) {

        var component = vm.state.page.sections[sectionIndex].components[componentIndex];
        var name = $filter('cleanType')(component.type).toLowerCase().trim().replace(' ', '-');
        var sectionPanelLoadConfig = {
            name: name,
            id: component._id,
            componentId: component._id
        };

        // SimpleSiteBuilderService.setActiveSection(undefined);
        // SimpleSiteBuilderService.setActiveComponent(undefined);

        $timeout(function() {

            SimpleSiteBuilderService.setActiveSection(sectionIndex);
            SimpleSiteBuilderService.setActiveComponent(componentIndex);

            vm.uiState.navigation.sectionPanel.loadPanel(sectionPanelLoadConfig);

            if (sectionIndex !== undefined && componentIndex !== undefined) {
                vm.uiState.showSectionPanel = true;
            }

        });

    }

    function setActiveComponentArea(sectionIndex, componentIndex, area) {
        // TODO: implement
        // TODO: setActiveComponentArea
    }

    function setActiveElement() {

        $timeout(function() {
            var sectionPanelLoadConfig = {
                name: vm.uiState.activeElement.name,
                id: vm.uiState.activeElement.id
            };

            vm.uiState.navigation.sectionPanel.loadPanel(sectionPanelLoadConfig);
            vm.uiState.showSectionPanel = true;
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
