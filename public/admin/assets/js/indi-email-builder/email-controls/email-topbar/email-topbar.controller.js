(function(){

app.controller('EmailBuilderTopbarController', ssbEmailBuilderTopbarController);

ssbEmailBuilderTopbarController.$inject = ['$scope', '$rootScope', '$timeout', '$attrs', '$filter', 'EmailBuilderService', 'SimpleSiteBuilderService', '$modal', '$location', 'SweetAlert', 'toaster', '$q'];
/* @ngInject */
function ssbEmailBuilderTopbarController($scope, $rootScope, $timeout, $attrs, $filter, EmailBuilderService, SimpleSiteBuilderService, $modal, $location, SweetAlert, toaster, $q) {

    console.info('email-build topbar directive init...')

    var vm = this;

    vm.init = init;
    vm.saveEmail = saveEmail;
    vm.createCampaign = createCampaign;
    vm.openSendEmailModal = openSendEmailModal;
    vm.cancelPendingEdits = cancelPendingEdits;
    vm.hideActiveToolTips = hideActiveToolTips;
    vm.checkSettingsValidityFn = checkSettingsValidityFn;


    function saveEmail() {
        vm.state.saveLoading = true;
        var promise = null;

        vm.state.pendingPageChanges = false;

        //hide section panel
        vm.uiState.showSectionPanel = false;

        //reset section panel
        vm.uiState.navigation.sectionPanel.reset();
        //upate email componet type if type is custom named
        if(vm.state.email && vm.state.email.components && vm.state.email.components.length > 0){
              var component_length = vm.state.email.components.length;
              for(var m = 0; m < component_length; m++){
                 var current_component = vm.state.email.components[m];
                 if(current_component.type_custom === undefined){
                    vm.state.email.components[m].type_custom = vm.state.email.components[m].type;
                 }
              }
        }

        promise = saveWebsite().then(function(){
            return (
                EmailBuilderService.updateEmail(vm.state.email).then(function(response){
                    SimpleSiteBuilderService.getSite(vm.state.website._id).then(function(){
                        console.log('email saved');
                        toaster.pop('success', 'Email Saved', 'The email was saved successfully.');
                        vm.state.saveLoading = false;
                        vm.state.pendingEmailChanges = false;
                        vm.uiState.updateEmailCache(response.data, true);
                    })
                }).catch(function(error) {
                    var message = error.data ? error.data.message : 'The email was not saved. Please try again.';
                    toaster.pop('error', 'Error', message);
                    vm.state.saveLoading = false;
                })
            )
        })


        return promise;

    }

    function createCampaign(email) {
        vm.uiState.createCampaign(email);
    }

    function openSendEmailModal(address) {
        vm.uiState.openSimpleModal('send-test-email-modal');
    }

    function cancelPendingEdits() {
        vm.uiState.openSidebarPanel = '';
        vm.uiState.showSectionPanel = false;
        vm.uiState.openSidebarSectionPanel = { name: '', id: '' };
        vm.state.pendingEmailChanges = false;
        vm.state.pendingWebsiteChanges = false;
        SimpleSiteBuilderService.website = angular.copy(vm.state.originalWebsite);
        EmailBuilderService.email = angular.copy(vm.state.originalEmail);
        vm.hideActiveToolTips();
    }

    function saveWebsite() {
        vm.state.pendingWebsiteChanges = false;
        return (
            SimpleSiteBuilderService.saveWebsite(vm.state.website).then(function(response){
                console.log('website saved');
            }).finally(function() {
                vm.hideActiveToolTips();
            })
        )
    }

    function hideActiveToolTips() {
        angular.element('.tooltip').remove();
    }

    function checkSettingsValidityFn () {
        if (vm.state.email.title && vm.state.email.subject && vm.state.email.fromName && vm.state.email.fromEmail) {
            return true;
        } else {
            return false;
        }
    }

    function init(element) {
    	vm.element = element;
        if (!vm.state.email) {
            vm.state.email = EmailBuilderService.email;
        }
    }

}

})();
