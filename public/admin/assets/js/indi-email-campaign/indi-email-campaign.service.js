'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function() {

    app.factory('EmailCampaignService', EmailCampaignService);

    EmailCampaignService.$inject = ['$http', 'AccountService'];
    /* @ngInject */
    function EmailCampaignService($http, AccountService) {
        var campaignService = {};
        var baseCampaignAPIv1 = '/api/1.0/campaigns';
        var baseCmsAPIUrlv1 = '/api/1.0/cms';

        campaignService.loading = {
            value: 0
        };
        campaignService.getCampaign = getCampaign;
        campaignService.createCampaign = createCampaign;
        campaignService.updateCampaign = updateCampaign;
        campaignService.sendTestEmail = sendTestEmail;
        campaignService.getCampaignContacts = getCampaignContacts;
        campaignService.cancelCampaignForContact = cancelCampaignForContact;
        campaignService.duplicateCampaign = duplicateCampaign;
        campaignService.deleteCampaign = deleteCampaign;
        campaignService.checkIfDuplicateCampaign = checkIfDuplicateCampaign;

        /**
         * Get get email by ID
         * @param {string} id - email _id
         */
        function getCampaign(id) {

            function success(data) {}

            function error(error) {
                console.error('EmailCampaignService getCampaign error: ', JSON.stringify(error));
            }

            return campaignRequest($http.get([baseCampaignAPIv1, id].join('/')).success(success).error(error));
        }

        function createCampaign(campaign) {
            function success(data) {}

            function error(error) {
                console.error('EmailCampaignService createCampaign error: ', JSON.stringify(error));
            }

            return campaignRequest($http.post(baseCampaignAPIv1, campaign).success(success).error(error));
        }

        function updateCampaign(campaign) {

            function success(data) {}

            function error(error) {
                console.error('EmailCampaignService updateCampaign error: ', JSON.stringify(error));
            }

            return campaignRequest($http.post([baseCampaignAPIv1, campaign._id].join('/'), campaign).success(success).error(error));
        }

        function deleteCampaign(campaign) {

            function success(data) {}

            function error(error) {
                console.error('EmailCampaignService deleteCampaign error: ', JSON.stringify(error));
            }

            return campaignRequest(
                $http({
                    url: [baseCampaignAPIv1, campaign._id].join('/'),
                    method: "DELETE"
                }).success(success).error(error)
            )
        }

        function sendTestEmail(address, campaign) {
            var data = {
                address: address,
                content: campaign
            };

            function success(data) {}

            function error(error) {
                console.error('EmailCampaignService sendTestEmail error: ', JSON.stringify(error));
            }

            return campaignRequest($http.post([baseCmsAPIUrlv1, 'testemail'].join('/'), data).success(success).error(error));
        }

        function getCampaignContacts(id) {

            function success(data) {}

            function error(error) {
                console.error('EmailCampaignService getCampaignContacts error: ', JSON.stringify(error));
            }

            return campaignRequest($http.get([baseCampaignAPIv1, id, 'contacts'].join('/')).success(success).error(error));
        }

        function cancelCampaignForContact(campaign, contactId) {

            function success(data) {}

            function error(error) {
                console.error('EmailCampaignService cancelCampaignForContact error: ', JSON.stringify(error));
            }

            var promise = $http({
                url: [baseCampaignAPIv1, campaign._id, 'contact', contactId].join('/'),
                method: 'DELETE',
                data: campaign
            });

            return campaignRequest(promise).success(success).error(error);
        }

        function duplicateCampaign(campaign) {
            function success(data) {}

            function error(error) {
                console.error('EmailCampaignService duplicateCampaign error: ', JSON.stringify(error));
            }

            return campaignRequest($http.post([baseCampaignAPIv1, campaign._id, 'duplicate'].join('/'), campaign).success(success).error(error));
        }

        function checkIfDuplicateCampaign(id, title) {

            function success(data) {}

            function error(error) {
                console.error('EmailCampaignService getCampaign error: ', JSON.stringify(error));
            }
            if(id)
                return campaignRequest($http.get([baseCampaignAPIv1, id, 'campaigns', title].join('/')).success(success).error(error));
            else
                return campaignRequest($http.get([baseCampaignAPIv1, 'campaigns', 'exists', title].join('/')).success(success).error(error));
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
            fn.finally(function() {
                campaignService.loading.value = campaignService.loading.value - 1;
                console.info('service | loading -1 : ' + campaignService.loading.value);
            });
            return fn;
        }

        (function init() {

            AccountService.getAccount(function(data) {
                campaignService.account = data;
                campaignService.websiteId = data.website.websiteId;
            });

        })();


        return campaignService;
    }

})();
