'use strict';
/*global app, Keen, $$*/
/*jslint unparam: true*/
(function (angular) {
  app.service('ChartEmailService', ['KeenService', '$q', function (KeenService, $q) {

    this.queryMandrillData = function (emails, fn) {
      var self = this;
      var deferred = $q.defer();
      // ======================================
      // Emails Sent
      // # of emails sent from this account grouped by emailId
      // ======================================
      KeenService.keenClient(function (client) {
        var queryData = {};

        queryData.emailsSent = new Keen.Query("count", {
          eventCollection: "mandrill_send",
          targetProperty: 'msg.metadata.emailId',
          groupBy: 'msg.metadata.emailId',
          filters: [{
            "property_name": 'msg.metadata.accountId',
            "operator": "eq",
            "property_value": $$.server.accountId
          }]
        });

        queryData.emailsOpen = new Keen.Query("count_unique", {
          eventCollection: "mandrill_open",
          targetProperty: '_id',
          groupBy: 'msg.metadata.emailId',
          filters: [{
            "property_name": 'msg.metadata.accountId',
            "operator": "eq",
            "property_value": $$.server.accountId
          }]
        });

        queryData.emailsClick = new Keen.Query("count_unique", {
          eventCollection: "mandrill_click",
          targetProperty: '_id',
          groupBy: 'msg.metadata.emailId',
          filters: [{
            "property_name": 'msg.metadata.accountId',
            "operator": "eq",
            "property_value": $$.server.accountId
          }]
        });

        client.run([
          queryData.emailsSent,
          queryData.emailsOpen,
          queryData.emailsClick
        ], function (response) {
          var _response = {
            emailsSent: response[0].result,
            emailsOpen: response[1].result,
            emailsClick: response[2].result
          };
          var formatted = self.formatEmails(emails, _response);
          deferred.resolve(fn(formatted));
        });
      });

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
