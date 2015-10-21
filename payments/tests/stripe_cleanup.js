/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
process.env.NODE_ENV = "testing";
var app = require('../../app');
var contactDao = require('../../dao/contact.dao.js');
var testHelpers = require('../../testhelpers/testhelpers.js');
var userDao = require('../../dao/user.dao.js');


var stripeDao = require('../dao/stripe.dao.js');
var _log = $$.g.getLogger("stripe.dao.test");
var testContext = {};
testContext.plans = [];

//var testAccessToken = 'sk_test_4NTU0RVH2SV3VumrAW1uZQYR';
var stripeConfig = require('../../configs/stripe.config');
var testAccessToken = stripeConfig.STRIPE_TEST_SECRET_KEY;
var async = require('async');

exports.stripe_dao_test = {
    setUp: function(cb) {
        var self = this;

        cb();

    },

    tearDown: function(cb) {
        var self = this;
        cb();

    },

    cleanupCustomers: function(test) {
        stripeDao.listStripeCustomers(0, 100, function(err, customers){
            var numDeleted = 0;
            var customerId = '';
            if(customers.data.length > 0) {
                customerId = customers.data[customers.data.length -1].id;
            }

            async.each(customers.data, function(customer, cb){
                if(customer.email === 'test@example.com' || customer.email == null) {
                    stripeDao.deleteStripeCustomer(customer.id, null, null, function(err, value){
                        if(err) {
                            _log.error('Error deleting customer:', err);
                        } else {
                            _log.debug('Deleted customer');
                            numDeleted++;
                        }
                        cb();
                    });
                } else {
                    //_log.debug('skipping customer: ' + customer.email);
                    cb();
                }
            }, function done(err){
                if(err) {
                    test.ok(false, 'Error:' + err);
                } else {
                    test.ok(true);
                }
                _log.info('Deleted ' + numDeleted + ' customers');
                //_log.debug("starting_after:'" + customerId + "'");
                test.done();
            });


        });
    }
};