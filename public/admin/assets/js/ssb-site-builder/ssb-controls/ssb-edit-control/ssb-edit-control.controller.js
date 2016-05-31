(function(){

app.controller('SiteBuilderEditControlController', ssbSiteBuilderEditControlController);

ssbSiteBuilderEditControlController.$inject = ['$scope', '$rootScope', '$interval', '$attrs', '$filter', '$timeout', '$q', 'SimpleSiteBuilderService', 'SweetAlert'];
/* @ngInject */
function ssbSiteBuilderEditControlController($scope, $rootScope, $interval, $attrs, $filter, $timeout, $q, SimpleSiteBuilderService, SweetAlert) {

    var vm = this;

    vm.init = init;
    vm.isElementControl = false;
    vm.isComponentControl = false;
    vm.isComponentPartialAreaControl = false;
    vm.setActive = setActive;
    vm.moveSection = moveSection;
    vm.duplicateSection = duplicateSection;
    vm.removeSectionFromPage = removeSectionFromPage;
    vm.scrollToActiveSection = scrollToActiveSection;
    vm.uiState.activeElementHistory = [];


    /**
     * Handle menu per content type ['component' | 'component-partial-area' | 'element']
     */
    function handleMenuPenVisibleForComponent(event, id, type) {

        return setPosition();

    }

    function handleMenuPenVisibleForComponentPartialArea(event, id, type) {

        if (id && id === vm.element.attr('data-control-id') && type === 'component-partial-area') {
            return setPosition();
        }

    }

    function handleMenuPenVisibleForElement(event, id, type) {

        if (id && id === vm.element.attr('data-control-id') && type === 'element') {
            return setPosition();
        }

    }



    /*
     * Position to account for section's margin/padding
     * and edit-control placement @ top:0, left:0
     */
    function setPosition() {

        var isActiveElement = vm.uiState.activeElement && angular.isDefined(vm.uiState.activeElement.type);

        if (vm.uiState.hoveredSectionIndex === vm.sectionIndex &&
            vm.uiState.hoveredComponentIndex === vm.componentIndex ||
            isActiveElement &&
            !SimpleSiteBuilderService.isIENotEdge) {

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
                    if(editEl.hasClass("no-offset-top")){
                        topOffset = 0;
                        leftOffset = 0;
                    }
                    editElTop = editEl[0].getBoundingClientRect().top;
                    editElLeft = editEl[0].getBoundingClientRect().left;
                    top = editEl[0].getBoundingClientRect().top - topOffset - topbarHeight + scrollTop;
                    left = editEl[0].getBoundingClientRect().left - leftOffset - sidebarWidth;
                }

                if (left < 0) {
                    left = 0;
                }

                if (editElLeft === sidebarWidth) {
                    left = 0;
                }

                if (editElTop - topbarHeight < 30 && top < 0) {
                    top = 20;
                    left = left + 36;
                }
                // Handled case when element is at right position
                if(left > 100){
                    top = top + 30;
                    left = left + 36;
                }

                if (editControl && editControl.length) {
                    editControl.css({ top: top, left: left });
                    $timeout(function() {
                        editControl.addClass('ssb-on');
                    }, 500);
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

        if (compiled || (componentIndex === null && sectionIndex === null)) {
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

    function setActiveElement() {

        console.log('vm.uiState.activeElement', vm.uiState.activeElement);

        var previousActiveElement = vm.uiState.activeElementHistory[vm.uiState.activeElementHistory.length - 1];

        if (vm.uiState.activeElement && vm.uiState.activeElement.type) {
            vm.uiState.activeElementHistory.push(vm.uiState.activeElement);
        } else {
            vm.uiState.activeElement = previousActiveElement;
        }

        var sectionPanelLoadConfig = {
            name: vm.uiState.activeElement.name,
            id: vm.uiState.activeElement.id
        };

        vm.uiState.navigation.sectionPanel.loadPanel(sectionPanelLoadConfig);
        vm.uiState.showSectionPanel = true;
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
        if(vm.state.page.sections[index].global){
            SweetAlert.swal({
                title: "Are you sure?",
                text: "You are removing a global section. Changes made to global sections on this page will be reflected on all other pages. Consider removing from this page only.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Remove from all pages",
                cancelButtonText: "Hide on this page",
                showNoActionButton: true,
                noActionButtonText: 'Cancel',
                closeOnConfirm: true,
                closeOnCancel: true
            },
            function (isConfirm) {
                //Remove from all pages
                if (isConfirm) {
                    vm.state.page.sections[index].global = false;
                    vm.state.page.sections[index].visibility = false;
                    vm.uiState.toggleSection(vm.state.page.sections[index]);
                }
                //Hide on this page
                else if(angular.isDefined(isConfirm) && isConfirm === false){
                    vm.state.page.sections[index].visibility = false;
                    vm.uiState.toggleSection(vm.state.page.sections[index]);
                }
            });
        } else {
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
                    SimpleSiteBuilderService.removeSectionFromPage(index);
                }
            });
        }
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

        vm.isComponentControl = vm.element.hasClass('ssb-edit-control-component') && !vm.element.hasClass('ssb-edit-control-element')  && !vm.element.hasClass('ssb-edit-control-component-area');
        vm.isComponentPartialAreaControl = vm.element.hasClass('ssb-edit-control-component-area');
        vm.isElementControl = vm.element.hasClass('ssb-edit-control-element');

        /**
         * Handle events for component and element menu (section menu pen position handled via CSS only)
         */
        if (vm.isComponentControl) {
            $rootScope.$on('$ssbMenuPenVisibleForComponent', handleMenuPenVisibleForComponent);
        } else if (vm.isComponentPartialAreaControl) {
            $rootScope.$on('$ssbMenuPenVisibleForComponentPartialArea', handleMenuPenVisibleForComponentPartialArea);
        } else if (vm.isElementControl) {
            $rootScope.$on('$ssbMenuPenVisibleForElement', handleMenuPenVisibleForElement);
        }

    }

}

})();
