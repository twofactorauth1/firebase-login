(function(){

app.controller('SiteBuilderEditControlController', ssbSiteBuilderEditControlController);

ssbSiteBuilderEditControlController.$inject = ['$scope', '$attrs', '$filter', 'SimpleSiteBuilderService'];
/* @ngInject */
function ssbSiteBuilderEditControlController($scope, $attrs, $filter, SimpleSiteBuilderService) {
	
    console.info('site-build edit control directive init...')

    var vm = this;

    vm.somethingEditControl = 'something edit control';
    vm.init = init;
    vm.setActiveSection = setActiveSection;
    vm.uiState = {};

    function setActiveSection(index) {
    	SimpleSiteBuilderService.setActiveSection(index);
    }

    // function setEditControlVisibilityOn() {
    //     vm.uiState.showEditControl = true;
    // }

    // function setEditControlVisibilityOff() {
    //     vm.uiState.showEditControl = false;
    // }

    function init(element) {
    	vm.element = element;
        // vm.element.on('mouseenter', setEditControlVisibilityOn);
        // vm.element.on('mouseleave', setEditControlVisibilityOff);
    }

}

})();