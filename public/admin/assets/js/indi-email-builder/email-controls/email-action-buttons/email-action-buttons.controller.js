(function(){

app.controller('EmailBuilderActionButtonsController', ssbEmailBuilderActionButtonsController);

ssbEmailBuilderActionButtonsController.$inject = ['$scope', '$attrs', '$filter', 'SimpleSiteBuilderService', '$timeout', 'toaster'];
/* @ngInject */
function ssbEmailBuilderActionButtonsController($scope, $attrs, $filter, SimpleSiteBuilderService, $timeout, toaster) {

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
        if (vm.settingsValid()) {
            vm.saveAction();
        } else {
            toaster.pop('warning', 'Mandatory field should not be blank');
        }
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