(function(){

app.controller('EmailBuilderActionButtonsController', ssbEmailBuilderActionButtonsController);

ssbEmailBuilderActionButtonsController.$inject = ['$scope', '$attrs', '$filter', 'SimpleSiteBuilderService', '$timeout'];
/* @ngInject */
function ssbEmailBuilderActionButtonsController($scope, $attrs, $filter, SimpleSiteBuilderService, $timeout) {

    console.info('email-build sidebar directive init...')

    var vm = this;

    vm.init = init;
    vm.save = save;
    vm.cancel = cancel;
    vm.revert = revert;

    function save() {
    	vm.saveAction();
    }

    function cancel() {
    	vm.cancelAction();
    }

    function revert(versionId) {
        vm.revertAction({versionId: versionId});
    }

    function init(element) {
    	vm.element = element;
    }


}

})();
