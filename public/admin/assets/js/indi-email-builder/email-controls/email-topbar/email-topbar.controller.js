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

        promise = saveWebsite().then(function(){
            return (
                EmailBuilderService.updateEmail(vm.state.email).then(function(response){
                    SimpleSiteBuilderService.getSite(vm.state.website._id).then(function(){
                        console.log('email saved');
                        toaster.pop('success', 'Email Saved', 'The email was saved successfully.');
                        vm.state.saveLoading = false;
                        vm.state.pendingEmailChanges = false;
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