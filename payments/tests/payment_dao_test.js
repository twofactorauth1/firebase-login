/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
process.env.NODE_ENV = "testing";
var app = require('../../app');
var testHelpers = require('../../testhelpers/testhelpers.js');
var paymentDao = require('../dao/payment.dao.js');

var _log = $$.g.getLogger("payment.dao.test");
var testContext = {};
testContext.plans = [];


exports.payment_dao_test = {
    setUp: function (cb) {
        var self = this;
        cb();
    },

    tearDown: function (cb) {
        var self = this;
        cb();
    },

    testGetPaymentByChargeId: function(test) {
        var self = this;
        var chargeId = 'charge_' + Date.now();
        var customerId = 'custId_' + Date.now();
        test.expect(1);
        //create some payments
        var p1 = $.Deferred(), p2 = $.Deferred();

        testHelpers.createTestPayment({'chargeId': chargeId, 'customerId': customerId}, function(err, pmnt){
            if(err) {
                p1.reject();
                test.ok(false, 'Error creating payment: ' + err);
                test.done();
            }
            p1.resolve();
        });

        testHelpers.createTestPayment({'chargeId': 'charge_2'}, function(err, pmnt){
            if(err) {
                p2.reject();
                test.ok(false, 'Error creating payment: ' + err);
                test.done();
            }
            p2.resolve();
        });
        $.when(p1,p2).done(function(){
            paymentDao.getPaymentByChargeId(chargeId, function(err, pmnt){
                if(err) {
                    test.ok(false, 'Error retrieving payment: ' + err);
                    test.done();
                }
                test.equals(customerId, pmnt.get('customerId'));
                test.done();
            });
        });
    }
}
