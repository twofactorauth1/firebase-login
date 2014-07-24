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

var testAccessToken = 'sk_test_4NTU0RVH2SV3VumrAW1uZQYR';
var initialized = false;

exports.stripe_dao_test = {
    setUp: function(cb) {
        var self = this;

        if(!initialized) {
            _log.info('creating test contact.');
            testHelpers.createTestContact(function(err, value) {
                if (err) {
                    throw Error("Failed to setup test");
                }
                _log.info('created test contact.');
                testContext.contact = value;
                console.dir(testContext.contact);
                initialized = true;
                cb();
            });
        } else {
            cb();
        }

    },

    tearDown: function(cb) {
        var self = this;
        cb();

    },

    testCreateStripeCustomer: function(test) {
        var self = this;
        test.expect(1);
        _log.info('>>testCreateStripeCustomer');
        stripeDao.createStripeCustomer(null, testContext.contact, '0', function(err, contact){
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
        _log.info('>> testListStripeCustomers');
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
        _log.info('>> testGetStripeCustomer');
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
        _log.info('>> testUpdateStripeCustomer');
        test.expect(2);
        stripeDao.getStripeCustomer(testContext.customerId, function(err, customer){
            if (err) {
                test.ok(false, err);
                return test.done();
            }
            _log.info('get customer');
            console.dir(customer);
            var params = {};
            params.description = 'New Description!';
            var card = {
                'number': '4242424242424242',
                'exp_month': '12',
                'exp_year':'2015'

            };

            stripeDao.updateStripeCustomer(testContext.customerId, null, card, null, null, 'New Description!', null, null, function(err, updatedCustomer){
                if (err) {
                    test.ok(false, err);
                    return test.done();
                }
                _log.info('updated customer');
                test.equals('New Description!', updatedCustomer.description, "Description was not updated.");
                test.equals(customer.email, updatedCustomer.email, "Email was updated (and should not have been.)");
                test.done();
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

        var self = this;
        _log.info('>> testCreateStripePlanForAccount');
        var planId = "plan_" + Date.now();
        test.expect(9);
        stripeDao.createStripePlan(planId, 100, "usd", "month", 1, "Plan ID For Account", 0, {}, "Stmt Desc", testAccessToken,
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
                test.equals('Plan ID For Account', plan.name);
                test.equals(null, plan.trial_period_days);
                test.equals('Stmt Desc', plan.statement_description);
                //now delete it
                stripeDao.deleteStripePlan(plan.id, testAccessToken, function(err, value){
                    test.ok(value);
                    test.done();
                });
                //testContext.plans.push(planId);
                //test.done();
            });

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
    },


    testCreateStripeSubscription: function(test) {
        var self = this;
        test.expect(1);
        //create a plan for subscriptions
        var accountId = testContext.accountId;
        var customerId = testContext.customerId;
        var contactId = testContext.contact.id();
        var planId = 'test_sub_plan';
        stripeDao.createStripePlan(planId, 100, "usd", "month", 1, "Plan ID For Account", 0, {}, "Stmt Desc",
            null, function(err, plan){
                if(err) {
                    if(err.toString().indexOf('Plan already exists') != -1) {
                        //already exists... we're cool
                    } else {
                        test.ok(false, err);
                        test.done();
                    }
                }
                stripeDao.createStripeSubscription(customerId, planId, null, null, null, 1,
                    null, null, accountId, contactId, null, function(err, sub){
                        if(err) {
                            test.ok(false, err);
                            test.done();
                        } else {
                            _log.debug('got subscription: ' + sub.id);
                            console.dir(sub);
                            testContext.subscriptionId = sub.id;
                            test.ok(sub);
                            test.done();
                        }
                    });
            });
    },

    testGetStripeSubscription: function(test) {
        var self = this;
        stripeDao.getStripeSubscription(testContext.customerId, testContext.subscriptionId, null, function(err, sub){
            if(err) {
                test.ok(false, err);
                test.done();
            } else {
                _log.debug('retrieved subscription.');
                test.done();
            }
        });

    },

    testUpdateStripeSubscription: function(test) {
        var accountId = testContext.accountId;
        var customerId = testContext.customerId;
        var contactId = testContext.contact.id();
        var planId = 'test_sub_plan';
        var subscriptionId = testContext.subscriptionId;
        stripeDao.updateStripeSubscription(customerId, subscriptionId, null, null, null, null, null, 2, null, null,
            null, function(err, sub){
                if(err) {
                    test.ok(false, err);
                    test.done();
                } else {
                    _log.debug('updated subscription.');
                    test.done();
                }
            });
    },

    testCancelStripeSubscription: function(test) {
        var customerId = testContext.customerId;
        var subscriptionId = testContext.subscriptionId;
        var accountId = testContext.accountId;

        stripeDao.cancelStripeSubscription(accountId, customerId, subscriptionId, false, null, function(err, sub){
            if(err) {
                test.ok(false, err);
                test.done();
            } else {
                _log.debug('cancelled subscription.');
                test.done();
            }
        });
    },

    testListStripeSubscriptions: function(test) {
        test.done();
    },

    testCreateStripeCard: function(test) {
        test.done();
    },

    testGetStripeCard: function(test) {
        test.done();
    },

    testUpdateStripeCard: function(test) {
        test.done();
    },

    testDeleteStripeCard: function(test) {
        test.done();
    },

    testListStripeCards: function(test) {
        test.done();
    },

    testCreateStripeCharge: function(test) {
        test.done();
    },

    testGetStripeCharge: function(test) {
        test.done();
    },

    testUpdateStripeCharge: function(test) {
        test.done();
    },

    testCaptureStripeCharge: function(test) {
        test.done();
    },

    testListStripeCharges: function(test) {
        test.done();
    },

    testCreateInvoiceItem: function(test) {
        test.done();
    },

    testGetInvoiceItem: function(test) {
        test.done();
    },

    testUpdateInvoiceItem: function(test) {
        test.done();
    },

    testDeleteInvoiceItem: function(test) {
        test.done();
    },

    testListInvoiceItems: function(test) {
        test.done();
    },

    testCreateInvoice: function(test) {
        test.done();
    },

    testGetInvoice: function(test) {
        test.done();
    },

    testGetUpcomingInvoice: function(test) {
        test.done();
    },

    testPayInvoice: function(test) {
        test.done();
    },

    testUpdateInvoice: function(test) {
        test.done();
    },

    testListInvoices: function(test) {
        test.done();
    },

    testCreateToken: function(test) {
        test.done();
    },

    testGetToken: function(test) {
        test.done();
    },

    testGetEvent: function(test) {
        test.done();
    },

    testListEvents: function(test) {
        test.done();
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

    cleanupAfterTests: function(test) {
        var self = this;
        contactDao.remove(testContext.contact, function(err, value){
            if (err) {
                throw Error("Failed to delete test contact");
            }
            _log.info('deleted test contact.');
            testContext.contact = null;
            test.done();
        });
    }
};