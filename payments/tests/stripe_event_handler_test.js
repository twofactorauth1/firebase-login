/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
process.env.NODE_ENV = "testing";
var app = require('../../app');
var testHelpers = require('../../testhelpers/testhelpers.js');
var handler = require('../stripe.event.handler.js');
var eventDao = require('../dao/stripe_event.dao.js');

var _log = $$.g.getLogger("stripe_event_handler_test");
var testContext = {};
testContext.plans = [];


exports.stripe_event_dao_test = {
    setUp: function (cb) {
        _log.debug('>> setUp');
        cb();
    },

    tearDown: function (cb) {
        var self = this;
        _log.debug('>> tearDown');
        cb();
    },

    testHandlePing: function(test) {
        var self = this;
        test.expect(1);
        _log.debug('>> testHandlePing');
        var event = {
            "created": 1326853478,
            "livemode": false,
            "id": "evt_00000000000001",
            "type": "ping",
            "object": "event",
            "request": null,
            "data": {

            }
        };
        handler.handleEvent(event, function(err, value){
            if(err) {
                test.ok(false, 'Error in handle event: ' + err);
                test.done();
            } else {
                test.ok(true);
                test.done();
            }
        });
    },


    testHandleAccountApplicationDeauthorized: function(test) {
        test.done();
    },

    testHandleChargeFailed: function(test) {
        test.expect(1);
        var event = {
            "created": 1326853478,
            "livemode": false,
            "id": "evt_00000000000000",
            "type": "charge.failed",
            "object": "event",
            "request": null,
            "data": {
                "object": {
                    "id": "ch_00000000000000",
                    "object": "charge",
                    "created": 1416242591,
                    "livemode": false,
                    "paid": false,
                    "amount": 750,
                    "currency": "usd",
                    "refunded": false,
                    "card": {
                        "id": "card_00000000000000",
                        "object": "card",
                        "last4": "4242",
                        "brand": "Visa",
                        "funding": "credit",
                        "exp_month": 12,
                        "exp_year": 2015,
                        "fingerprint": "zPg4XxLwxy7ko9YB",
                        "country": "US",
                        "name": null,
                        "address_line1": null,
                        "address_line2": null,
                        "address_city": null,
                        "address_state": null,
                        "address_zip": null,
                        "address_country": null,
                        "cvc_check": null,
                        "address_line1_check": null,
                        "address_zip_check": null,
                        "dynamic_last4": null,
                        "customer": "cus_00000000000000",
                        "type": "Visa"
                    },
                    "captured": true,
                    "balance_transaction": "txn_00000000000000",
                    "failure_message": null,
                    "failure_code": null,
                    "amount_refunded": 0,
                    "customer": "cus_00000000000000",
                    "invoice": "in_00000000000000",
                    "description": null,
                    "dispute": null,
                    "metadata": {
                    },
                    "statement_description": "statement",
                    "fraud_details": {
                        "stripe_report": null,
                        "user_report": null
                    },
                    "receipt_email": null,
                    "receipt_number": null,
                    "shipping": null,
                    "fee": 52,
                    "fee_details": [
                        {
                            "amount": 52,
                            "currency": "usd",
                            "type": "stripe_fee",
                            "description": "Stripe processing fees",
                            "application": null
                        }
                    ]
                }
            }
        };

        handler.handleEvent(event, function(err, value){
            if(err) {
                test.ok(false, 'Error in handle event: ' + err);
                test.done();
            } else {
                //need to wait until the event has a status of processed.
                setTimeout(function(){
                    _log.debug('in setTimeout');
                    test.ok(true);
                    test.done();

                }, 10000);
            }
        });
    },

    testHandleChargeDisputeCreated: function(test) {
        test.done();
    },

    testHandleCustomerSubscriptionDeleted: function(test) {
        test.done();
    },

    testHandleInvoicePaymentFailed: function(test) {
        test.done();
    }
}

