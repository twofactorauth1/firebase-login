'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

  app.factory('EmailBuilderService', EmailBuilderService);

  EmailBuilderService.$inject = ['$http', 'AccountService'];
  /* @ngInject */
  function EmailBuilderService($http, AccountService) {
    var emailService = {};
    var baseCmsAPIUrlv1 = '/api/1.0/cms';
    var baseCmsAPIUrlv2 = '/api/2.0/cms';
    var baseWebsiteAPIUrlv1 = '/api/1.0/cms/website';

    emailService.loading = {value: 0};
    emailService.email = {};
    emailService.getEmails = getEmails;
    emailService.getEmail = getEmail;
    emailService.updateEmail = updateEmail;
    emailService.sendOneTimeEmail = sendOneTimeEmail;

    /**
     * Get list of all emails for the account
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
     * Get get email by ID
     * @param {string} id - email _id
     */
    function getEmail(id) {

        function success(data) {
            emailService.email = data;
        }

        function error(error) {
            console.error('EmailBuilderService getEmail error: ', JSON.stringify(error));
        }

        return emailRequest($http.get([baseCmsAPIUrlv1, 'email', id].join('/')).success(success).error(error));
    }

    /**
     * Update Email by ID
     * @param {object} - email object
     */
    function updateEmail(email) {
      function success(data) {
      }

      function error(error) {
        console.error('EmailBuilderService updateEmail error: ', JSON.stringify(error));
      }

      var promise = $http({
        url: [baseCmsAPIUrlv2, 'email', email._id].join('/'),
        method: "PUT",
        data: angular.toJson(email)
      });
      return emailRequest(promise).success(success).error(error);
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

    function sendOneTimeEmail(address, email) {

        var payload = angular.toJson({
            address: address,
            content: email
        });

        function success(data) {

        }

        function error(error) {
            console.error('EmailBuilderService sendOneTimeEmail error: ', JSON.stringify(error));
        }

        return emailRequest(
            $http({
                url: [baseCmsAPIUrlv1, 'testemail'].join('/'),
                method: "POST",
                data: payload
            })
            .success(success)
            .error(error)
        )

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
