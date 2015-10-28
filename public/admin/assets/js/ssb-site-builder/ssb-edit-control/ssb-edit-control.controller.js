(function(){

app.controller('SiteBuilderEditControlController', ssbSiteBuilderEditControlController);

ssbSiteBuilderEditControlController.$inject = ['$scope', '$attrs', '$filter', 'SimpleSiteBuilderService'];
/* @ngInject */
function ssbSiteBuilderEditControlController($scope, $attrs, $filter, SimpleSiteBuilderService) {
	
    console.info('site-build edit control directive init...')

    var vm = this;

    vm.somethingEditControl = 'something edit control';
    vm.init = init;

    function init(element) {
    	vm.element = element;
    }

}

})();