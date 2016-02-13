(function(){

app.controller('SiteBuilderEditControlController', ssbSiteBuilderEditControlController);

ssbSiteBuilderEditControlController.$inject = ['$scope', '$attrs', '$filter', '$timeout', 'SimpleSiteBuilderService'];
/* @ngInject */
function ssbSiteBuilderEditControlController($scope, $attrs, $filter, $timeout, SimpleSiteBuilderService) {

    var vm = this;

    vm.init = init;
    vm.setActiveSection = setActiveSection;
    vm.moveSection = moveSection;

    $scope.$watchGroup(['vm.uiState.hoveredSectionIndex', 'vm.uiState.hoveredComponentIndex'], setPosition);


    /*
     * Turn on edit control for hovered element, set position near top left of element
     * - adjust position to account for headers, sidebars
     * - global header height = 60
     * - SB topbar height = 65
     * - global navigation sidebar width = 70
     * - SB sidebar width = 70
     */
    function setPosition() {

        if (vm.uiState.hoveredSectionIndex === vm.sectionIndex && vm.uiState.hoveredComponentIndex === vm.index) {

            $timeout(function() {
                vm.element.addClass('on');

                vm.element.css({
                    'top': vm.uiState.hoveredComponentOffset.top,
                    'left': vm.uiState.hoveredComponentOffset.left,
                    'position': 'fixed'
                });

                console.log('top', vm.uiState.hoveredComponentOffset.top - (60 + 65));
                console.log('left', vm.uiState.hoveredComponentOffset.left - (70 + 70));
                console.log(vm.uiState.hoveredComponentParent);
            })

        } else {
            vm.element.removeClass('on');
        }

    }

    function setActiveSection(index) {
    	SimpleSiteBuilderService.setActiveSection(index);

        if (index !== undefined) {
            vm.uiState.showSectionPanel = true;
        }
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

        vm.setActiveSection(toIndex);

    }

    function init(element) {
    	vm.element = element;
    }

}

})();
