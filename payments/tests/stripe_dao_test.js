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
testContext.plans = [];

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
        var self = this;
        var planId = "plan_" + Date.now();
        test.expect(8);
        stripeDao.createStripePlan(planId, 100, "usd", "month", 1, "Plan ID", 0, {}, "Stmt Desc", null,
            function(err, plan){
                if(err) {
                    test.ok(false, err);
                    return test.done();
                }
                _log.info('received plan: ');
                console.dir(plan);
                test.equals(planId, plan.id);
                test.equals(100, plan.amount);
                test.equals('usd', plan.currency);
                test.equals('month', plan.interval);
                test.equals(1, plan.interval_count);
                test.equals('Plan ID', plan.name);
                test.equals(null, plan.trial_period_days);
                test.equals('Stmt Desc', plan.statement_description);
                testContext.plans.push(planId);
                test.done();
            });

    },

    testCreateStripePlanForAccount: function(test) {
        /*
            Skipping this test for now.  The call to Stripe with the accessID isn't behaving properly.
         */
        test.done();

        /*
        var self = this;
        var planId = "plan_" + Date.now();
        test.expect(8);
        stripeDao.createStripePlan(planId, 100, "usd", "month", 1, "Plan ID", 0, {}, "Stmt Desc", 'test_access_id',
            function(err, plan){
                if(err) {
                    test.ok(false, err);
                    return test.done();
                }
                _log.info('received plan: ');
                console.dir(plan);
                test.equals(planId, plan.id);
                test.equals(100, plan.amount);
                test.equals('usd', plan.currency);
                test.equals('month', plan.interval);
                test.equals(1, plan.interval_count);
                test.equals('Plan ID', plan.name);
                test.equals(null, plan.trial_period_days);
                test.equals('Stmt Desc', plan.statement_description);
                testContext.plans.push(planId);
                test.done();
            });
        */
    },

    testUpdateStripePlan : function(test) {
        var self = this;
        var planId = testContext.plans[0];
        test.expect(2);
        stripeDao.updateStripePlan(planId, 'New name', null, 'New DESC', null,  function(err, plan){
            if(err) {
                test.ok(false, err);
                return test.done();
            }
            _log.info('updated plan: ');
            test.equals('New name', plan.name);
            test.equals('New DESC', plan.statement_description);
            test.done();
        });
    },

    testUpdateStripePlanForAccount : function(test) {
        test.done();
    },

    testGetStripePlan: function(test) {
        var self = this;
        var planId = testContext.plans[0];
        test.expect(1);
        stripeDao.getStripePlan(planId, null, function(err, plan){
            if(err) {
                test.ok(false, err);
                return test.done();
            }
            _log.info('got plan: ');
            console.dir(plan);
            test.equals(planId, plan.id);
            test.done();
        });
    },

    testGetStripePlanForAccount: function(test) {
        test.done();
    },

    testListStripePlans: function(test) {
        var self = this;
        test.expect(1);
        stripeDao.listStripePlans(null, function(err, plans){
            if(err) {
                test.ok(false, err);
                return test.done();
            }
            _log.info('got plans: ');
            console.dir(plans);
            test.ok(plans.data.length > 0, "Did not retrieve any plans.");
            test.done();
        });
    },

    testListStripePlansForAccount: function(test) {
        test.done();
    },

    testDeleteStripePlan: function(test) {
        var self = this;
        var planId = testContext.plans[0];
        stripeDao.deleteStripePlan(planId, null, function(err, confirmation){
            if(err) {
                test.ok(false, err);
                return test.done();
            }
            _log.info('delete plan.  Confirmation: ');
            console.dir(confirmation);
            test.done();
        });
    },

    testDeleteStripePlanForAccount: function(test) {
        test.done();
    }
};