(function(){

app.controller('SiteBuilderActionButtonsController', ssbSiteBuilderActionButtonsController);

ssbSiteBuilderActionButtonsController.$inject = ['$scope', '$attrs', '$filter', 'SimpleSiteBuilderService'];
/* @ngInject */
function ssbSiteBuilderActionButtonsController($scope, $attrs, $filter, SimpleSiteBuilderService) {

    console.info('site-build sidebar directive init...')

    var vm = this;

    vm.init = init;
    vm.save = save;
    vm.cancel = cancel;
    vm.revert = revert;
    vm.publish = publish;

    function save() {
    	vm.saveAction();
    }

    function cancel() {
    	vm.cancelAction();
    }

    function revert(versionId) {
        vm.revertAction({versionId: versionId});
    }

    function publish() {
        vm.publishAction();
    }

    function init(element) {
    	vm.element = element;
    }

}

})();
