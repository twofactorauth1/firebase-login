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
var testContext = {};

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
        stripeDao.createStripeCustomer(null, self.contact, '0', function(err, contact){
            if (err) {
                test.ok(false, err);
                return test.done();
            }
            console.dir(contact);
            test.notEqual(contact.stripeId, "", 'StripeId was not set.');
            test.done();
        });
    },

    testListStripeCustomers: function(test) {
        var self = this;
        stripeDao.listStripeCustomers('0', '10', function(err, customers){
            if (err) {
                test.ok(false, err);
                return test.done();
            }
            _log.info('listing customers');
            console.dir(customers);
            testContext.customerId = customers.data[0].id;
            test.done();
        });
    },

    testGetStripeCustomer: function(test) {
        var self = this;
        stripeDao.getStripeCustomer(testContext.customerId, function(err, customer){
            if (err) {
                test.ok(false, err);
                return test.done();
            }
            _log.info('get customer');
            console.dir(customer);
            test.done();
        });
    },

    testUpdateStripeCustomer: function(test) {
        var self = this;
        test.expect(1);
        stripeDao.getStripeCustomer(testContext.customerId, function(err, customer){
            if (err) {
                test.ok(false, err);
                return test.done();
            }
            _log.info('get customer');
            console.dir(customer);
            var params = {};
            params.description = 'New Description!';
            stripeDao.updateStripeCustomer(testContext.customerId, params, function(err, customer){
                if (err) {
                    test.ok(false, err);
                    return test.done();
                }
                _log.info('updated customer');
                test.equals('New Description!', customer.description, "Description was not updated.");

                test.done();
            });
        });
    },

    testDeleteStripeCustomer: function(test) {
        var self = this;
        test.expect(1);
        stripeDao.getStripeCustomer(testContext.customerId, function(err, customer) {
            if (err) {
                test.ok(false, err);
                return test.done();
            }
            _log.info('got customer... now try to delete it.');
            stripeDao.deleteStripeCustomer(testContext.customerId, null, function(err, confirmation){
                if (err) {
                    test.ok(false, err);
                    return test.done();
                }
                console.dir(confirmation);
                _log.info('deleted customer.  Make sure when we get customer again, it shows deleted.');
                stripeDao.getStripeCustomer(testContext.customerId, function(err, customer) {
                   if(err) {
                       test.ok(false, err);
                       return test.done();
                   }
                   console.dir(customer);
                   test.ok(customer.deleted, "Deleted was not true");
                   test.done();
                });
            });
        });
    },

    testCreateStripePlan: function(test) {
        test.done();
    },

    testCreateStripePlanForAccount: function(test) {
        test.done();
    }
};