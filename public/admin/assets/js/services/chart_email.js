'use strict';
/**
 * service for chart analytics
 */
(function (angular) {
  app.service('ChartEmailService', ['KeenService', function (KeenService) {

    this.queryMandrillData = function (fn) {
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

        client.run([
          queryData.emailsSent
        ], function (response) {
          console.log('response ', response);
          var _response = {
            emailsSent: response.result
          };
          fn(_response);
        });
      });

    };


  }]);
})(angular);
