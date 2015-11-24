(function(){

app.controller('SiteBuilderActionButtonsController', ssbSiteBuilderActionButtonsController);

ssbSiteBuilderActionButtonsController.$inject = ['$scope', '$attrs', '$filter', 'SimpleSiteBuilderService'];
/* @ngInject */
function ssbSiteBuilderActionButtonsController($scope, $attrs, $filter, SimpleSiteBuilderService) {
	
    console.info('site-build sidebar directive init...')

    var vm = this;

    vm.somethingActionButtons = 'something action buttons';
    vm.init = init;
    vm.save = save;
    vm.cancel = cancel;

    function save() {
    	vm.saveAction();
    }

    function cancel() {
    	vm.cancelAction();
    }

    function init(element) {
    	vm.element = element;
    }

}

})();