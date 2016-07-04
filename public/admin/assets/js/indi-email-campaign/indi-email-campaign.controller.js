(function () {

  app.controller('EmailCampaignController', indiEmailCampaignController);

  indiEmailCampaignController.$inject = ['$scope', 'EmailBuilderService', '$stateParams', '$state', 'toaster', 'AccountService', 'WebsiteService', '$modal', '$timeout', '$document', '$window', 'EmailCampaignService'];
  /* @ngInject */
  function indiEmailCampaignController($scope, EmailBuilderService, $stateParams, $state, toaster, AccountService, WebsiteService, $modal, $timeout, $document, $window, EmailCampaignService) {

    console.info('email-campaign directive init...');

    var vm = this;

    vm.init = init;

    vm.campaignId = $stateParams.id;
    vm.campaign = {};
    vm.dataLoaded = false;
    vm.account = null;
    vm.website = {settings: {}};

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
            vm.dataLoaded = true;
          }, function (err) {
            $state.go('app.marketing.campaigns');
          });
      }
    }


  }

})();
