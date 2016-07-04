'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

  app.factory('EmailCampaignService', EmailCampaignService);

  EmailCampaignService.$inject = ['$http', 'AccountService'];
  /* @ngInject */
  function EmailCampaignService($http, AccountService) {
    var campaignService = {};
    var baseCampaignAPIv1 = '/api/1.0/campaigns';

    campaignService.loading = {value: 0};
    campaignService.getCampaign = getCampaign;

    /**
     * Get get email by ID
     * @param {string} id - email _id
     */
    function getCampaign(id) {

      function success(data) {
      }

      function error(error) {
        console.error('EmailCampaignService getCampaign error: ', JSON.stringify(error));
      }

      return campaignRequest($http.get([baseCampaignAPIv1, id].join('/')).success(success).error(error));
    }

    /**
     * A wrapper around API requests
     * @param {function} fn - callback
     *
     * @returns {function} fn - callback
     *
     */
    function campaignRequest(fn) {
      campaignService.loading.value = campaignService.loading.value + 1;
      console.info('service | loading +1 : ' + campaignService.loading.value);
      fn.finally(function () {
        campaignService.loading.value = campaignService.loading.value - 1;
        console.info('service | loading -1 : ' + campaignService.loading.value);
      });
      return fn;
    }

    (function init() {

      AccountService.getAccount(function (data) {
        campaignService.account = data;
        campaignService.websiteId = data.website.websiteId;
      });

    })();


    return campaignService;
  }

})();
