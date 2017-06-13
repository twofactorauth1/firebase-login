/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var appConfig = require('../configs/app.config');
var AWS = require('aws-sdk');

var sqsUtil = {

    log: $$.g.getLogger("sqsUtil"),
    sqs : new AWS.SQS({apiVersion: '2012-11-05'}),

    sendMessage:function(queueUrl, headers, message, fn) {
        var self = this;
        self.log.debug('>> sendMessage');
        var params = {
            DelaySeconds: 0,
            MessageAttributes: headers,
            MessageBody: JSON.stringify(message),
            QueueUrl: queueUrl
        };

        sqs.sendMessage(params, function(err, data) {
            if (err) {
                self.log.error('Error sending message:', err);
                fn(err);
            } else {
                self.log.debug('<< sendMessage');
                fn(null, data);
            }
        });
    }



};

module.exports = sqsUtil;
