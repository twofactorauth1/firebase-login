app.controller('SiteBuilderSidebarController', ssbSiteBuilderSidebarController);

ssbSiteBuilderSidebarController.$inject = ['$scope', '$attrs', '$filter', 'SimpleSiteBuilderService'];
/* @ngInject */
function ssbSiteBuilderSidebarController($scope, $attrs, $filter, SimpleSiteBuilderService) {
	
    console.info('site-build sidebar directive init...')

    var vm = this;

    vm.somethingSidebar = 'something sidebar';
    vm.init = init;

    function init(element) {
    	vm.element = element;
    }

}