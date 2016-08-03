'use strict';
/*global app, $$*/
/*jslint unparam: true*/
(function (angular) {
  app.service('ChartEmailService', [ '$q', function ($q) {

    this.queryMandrillData = function (emails, fn) {
      var self = this;
      var deferred = $q.defer();
      // ======================================
      // Emails Sent
      // # of emails sent from this account grouped by emailId
      // ======================================


      return deferred.promise;

    };

    this.formatEmails = function (emails, data) {
      _.each(emails, function (_email) {
        var sent, open, click;

        var matchingEmailSent = _.find(data.emailsSent, function (_result) {
          return _result['msg.metadata.emailId'] === _email._id;
        });

        if (matchingEmailSent) {
          sent = matchingEmailSent.result;
        }

        var matchingEmailOpen = _.find(data.emailsOpen, function (_result) {
          return _result['msg.metadata.emailId'] === _email._id;
        });

        if (matchingEmailOpen) {
          open = matchingEmailOpen.result;
        }

        var matchingEmailClick = _.find(data.emailsClick, function (_result) {
          return _result['msg.metadata.emailId'] === _email._id;
        });

        if (matchingEmailClick) {
          click = matchingEmailClick.result;
        }

        if (sent && open) {
          _email.openRate = Math.round((open / sent) * 100) + '%';
          _email.sent = sent;
        }

        if (sent && !open) {
          _email.openRate = '0%';
          _email.sent = sent;
        }

        if (click && sent) {
          _email.clickRate = Math.round((click / sent) * 100) + '%';
          _email.clicks = click;
        }

        if (sent && !click) {
          _email.clickRate = '0%';
          _email.clicks = click || 0;
        }

      });

      return emails;
    };


  }]);
}(angular));
