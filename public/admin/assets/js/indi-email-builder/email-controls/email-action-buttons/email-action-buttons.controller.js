(function(){

app.controller('EmailBuilderActionButtonsController', ssbEmailBuilderActionButtonsController);

ssbEmailBuilderActionButtonsController.$inject = ['$scope', '$attrs', '$filter', 'SimpleSiteBuilderService', '$timeout'];
/* @ngInject */
function ssbEmailBuilderActionButtonsController($scope, $attrs, $filter, SimpleSiteBuilderService, $timeout) {

    console.info('email-build sidebar directive init...')

    var vm = this;

    vm.init = init;
    vm.save = save;
    vm.createCampaign = createCampaign;
    vm.sendEmail = sendEmail;
    vm.cancel = cancel;
    vm.revert = revert;
    vm.settingsValid = settingsValid;

    function save() {
        vm.saveAction();
    }

    function createCampaign() {
        vm.createCampaignAction();
    }

    function sendEmail() {
    	vm.sendEmailAction();
    }

    function cancel() {
    	vm.cancelAction();
    }

    function revert(versionId) {
        vm.revertAction({versionId: versionId});
    }
    
    function settingsValid() {
        return vm.settingsValidAction();
    }

    function init(element) {
    	vm.element = element;
    }


}

})();
