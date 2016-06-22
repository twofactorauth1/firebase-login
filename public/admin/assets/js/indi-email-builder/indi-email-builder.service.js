'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

    app.factory('EmailBuilderService', EmailBuilderService);

    EmailBuilderService.$inject = ['$http', 'AccountService'];
    /* @ngInject */
    function EmailBuilderService($http, AccountService) {
        var emailService = {};
        var baseWebsiteAPIUrlv1 = '/api/1.0/cms/website';

        emailService.loading = {value: 0};
        emailService.getEmails = getEmails;

        /**
         * Get latest website object for this account
         * @param {string} id - website _id
         * @param {boolean} isLoading - if loading this data is in progress
         */
        function getEmails() {

            function success(data) {
                emailService.emails = data;
            }

            function error(error) {
                console.error('EmailBuilderService getEmails error: ', JSON.stringify(error));
            }

            return emailRequest($http.get([baseWebsiteAPIUrlv1, emailService.websiteId, 'emails'].join('/')).success(success).error(error));
        }

        /**
         * A wrapper around API requests
         * @param {function} fn - callback
         *
         * @returns {function} fn - callback
         *
         */
        function emailRequest(fn) {
            emailService.loading.value = emailService.loading.value + 1;
            console.info('service | loading +1 : ' + emailService.loading.value);
            fn.finally(function () {
                emailService.loading.value = emailService.loading.value - 1;
                console.info('service | loading -1 : ' + emailService.loading.value);
            })
            return fn;
        }

        (function init() {

            AccountService.getAccount(function (data) {
                emailService.account = data;
                emailService.websiteId = data.website.websiteId;
            });

        })();


        return emailService;
    }

})();
