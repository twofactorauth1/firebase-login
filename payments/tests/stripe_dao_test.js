/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
process.env.NODE_ENV = "testing";
var app = require('../../app');
var contactDao = require('../../dao/contact.dao.js');
var testHelpers = require('../../testhelpers/testhelpers.js');


var stripeDao = require('../dao/stripe.dao.js');
var _log = $$.g.getLogger("stripe.dao.test");

exports.device_dao_test = {
    setUp: function(cb) {
        var self = this;
        _log.info('creating test contact.');
        testHelpers.createTestContact(function(err, value) {
            if (err) {
                throw Error("Failed to setup test");
            }
            _log.info('created test contact.');
            self.contact = value;
            cb();
        });
    },

    tearDown: function(cb) {
        var self = this;
        contactDao.remove(self.contact, function(err, value){
            if (err) {
                throw Error("Failed to delete test contact");
            }
            _log.info('deleted test contact.');
            self.contact = null;
            cb();
        });
    },

    testCreateStripeCustomer: function(test) {
        var self = this;
        test.expect(1);
        _log.info('creating stripe customer.');
        stripeDao.createStripeCustomer(null, self.contact, function(err, contact){
            if (err) {
                test.ok(false, err);
                return test.done();
            }
            test.notEqual(contact.stripeId, "", 'StripeId was not set.');
            test.done();
        });
    }
};