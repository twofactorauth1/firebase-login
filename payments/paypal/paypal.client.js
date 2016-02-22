/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var log = $$.g.getLogger("paypal.client");
var config = require('../../configs/paypal.config');
var Paypal = require('paypal-adaptive');

var paypalSdk = new Paypal({
    userId:    config.PAYPAL_API_USERNAME,
    password:  config.PAYPAL_API_PASSWORD,
    signature: config.PAYPAL_API_SIGNATURE,
    sandbox:   true //defaults to false
});

module.exports = {

    pay: function(receiverEmail, amount, memo, cancelUrl, returnUrl, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> pay');
        var payload = {
            requestEnvelope: {
                errorLanguage:  'en_US',
                detailLevel: 'ReturnAll'
            },
            actionType:     'PAY',
            currencyCode:   'USD',
            receiverList: {
                receiver: []
            }
        };

        payload.memo = memo;
        payload.cancelUrl = cancelUrl;
        payload.returnUrl = returnUrl;
        var receiver = {
            email:receiverEmail,
            amount:amount
        };
        payload.receiverList.receiver.push(receiver);
        paypalSdk.pay(payload, function (err, response) {
            if (err) {
                self.log.error('Error creating payment:', err);
                self.log.debug('Response:', response);
                return fn(err, response);
            } else {
                // Response will have the original Paypal API response
                //self.log.debug('Response:', response);
                // But also a paymentApprovalUrl, so you can redirect the sender to checkout easily
                self.log.debug('<< pay');
                fn(err, response.paymentApprovalUrl);
            }
        });

    },

    helloWorld: function(fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> helloWorld');
        var payload = {
            requestEnvelope: {
                errorLanguage:  'en_US',
                detailLevel: 'ReturnAll'
            },
            actionType:     'PAY',
            currencyCode:   'USD',
            memo:           'Hello World example',
            cancelUrl:      'http://test.com/cancel',
            returnUrl:      'http://test.com/success',
            receiverList: {
                receiver: [
                    {
                        email:  'kyle+testbusiness@indigenous.io',
                        amount: '100.00'
                    }
                ]
            }
        };

        paypalSdk.pay(payload, function (err, response) {
            if (err) {
                self.log.error(err);
                self.log.debug('Response:', response);
                return fn(err, response);
            } else {
                // Response will have the original Paypal API response
                self.log.debug('Response:', response);
                // But also a paymentApprovalUrl, so you can redirect the sender to checkout easily
                self.log.debug('Redirect to %s', response.paymentApprovalUrl);
                fn(err, response);
            }
        });
    }
};