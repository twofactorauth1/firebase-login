(function () {

  app.controller('EmailCampaignController', indiEmailCampaignController);

  indiEmailCampaignController.$inject = ['$scope', 'EmailBuilderService', '$stateParams', '$state', 'toaster', 'AccountService', 'WebsiteService', '$modal', '$timeout', '$document', '$window', 'EmailCampaignService'];
  /* @ngInject */
  function indiEmailCampaignController($scope, EmailBuilderService, $stateParams, $state, toaster, AccountService, WebsiteService, $modal, $timeout, $document, $window, EmailCampaignService) {

    console.info('email-campaign directive init...');

    var vm = this;

    vm.init = init;

    vm.campaignId = $stateParams.id;
    vm.campaign = {status: 'DRAFT'};
    vm.dataLoaded = false;
    vm.disableEditing = true;
    vm.account = null;
    vm.website = {settings: {}};
    vm.saveAsDraftFn = saveAsDraftFn;
    vm.sendTestFn = sendTestFn;
    vm.activateCampaignFn = activateCampaignFn;

    function saveAsDraftFn() {
      var fn = EmailCampaignService.updateCampaign;

      if (vm.campaignId !== 'create') {
        fn = EmailCampaignService.createCampaign;
      }

      fn(vm.campaign)
        .then(function (res) {
          vm.campaign = res.data;
          toaster.pop('success', 'Campaign saved');
        }, function (err) {
          toaster.pop('error', 'Campaign save failed');
        });
    }

    function sendTestFn() {
      EmailCampaignService.sendTestEmail(vm.campaign)
        .then(function (res) {
          toaster.pop('success', 'Send test email');
        }, function (err) {
          toaster.pop('error', 'Send test mail failed');
        });
    }

    function activateCampaignFn() {
      vm.campaign.status = 'PENDING';
      vm.disableEditing = true;
      vm.saveAsDraftFn();
    }

    function init(element) {
      vm.element = element;

      AccountService.getAccount(function (data) {
        vm.account = data;
      });

      WebsiteService.getWebsite(function (data) {
        vm.website = data;
      });

      if (vm.campaignId !== 'create') {
        EmailCampaignService.getCampaign(vm.campaignId)
          .then(function (res) {
            if (!res.data._id) {
              toaster.pop('error', 'Campaign not found');
              $state.go('app.marketing.campaigns');
            }
            vm.campaign = res.data;
            if (vm.campaign.status === 'DRAFT') {
              vm.disableEditing = false;
            }
            vm.dataLoaded = true;
          }, function (err) {
            $state.go('app.marketing.campaigns');
          });
      }
    }


  }

})();
