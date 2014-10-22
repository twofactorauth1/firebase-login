/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
process.env.NODE_ENV = "testing";
var app = require('../../app');
var testHelpers = require('../../testhelpers/testhelpers.js');
var stripeDao = require('../dao/stripe.dao');
var customerLinkDao = require('../dao/customer_link.dao.js');
var userDao = require('../../dao/user.dao');

var log = $$.g.getLogger("payment.functional.test");
var testContext = {};
testContext.plans = [];

exports.preTest = function(test){
    log.debug('preTest');
    //create a plan
    var id = 'stripe_function_test_plan';
    var amount = 200;
    var currency = 'usd';
    var interval = 'month';
    var interval_count = 1;
    var name = 'Stripe Functional Test Plan';
    var trial_period_days = 0;
    var metadata = {};
    var statement_description = 'FTest Plan';
    var accessToken = null;

    stripeDao.createStripePlan(id, amount, currency, interval, interval_count, name, trial_period_days, metadata,
        statement_description, accessToken, function(err, plan) {
            if (err && err.toString() === 'Error: Plan already exists.') {
                log.debug('plan already exists.');
                var plan = {
                    id: id,
                    amount: amount,
                    currency: currency,
                    interval: interval,
                    interval_count: interval_count,
                    name: name,
                    trial_period_days: trial_period_days,
                    metadata: metadata,
                    statement_description: statement_description
                };
                testContext.plans.push(plan);
                testHelpers.createTestUser(testContext, function (err, user) {
                    if (err) {
                        test.ok(false, 'Error creating test user: ' + err);
                        test.done();
                    } else {
                        log.debug('created user: ' + user.id());
                        testContext.user = user;
                        test.done();
                    }
                });
            } else if (!err) {
                log.debug('created plan: ' + plan.id);
                testContext.plans.push(plan);
                testHelpers.createTestUser(testContext, function (err, user) {
                    if (err) {
                        test.ok(false, 'Error creating test user: ' + err);
                        test.done();
                    } else {
                        log.debug('created user: ' + user.id());
                        testContext.user = user;
                        test.done();
                    }
                });
            } else {
                test.ok(false, 'Error creating plan: ' + err);
                test.done();
            }
        });
};



exports.testGroup = {


    runTest: function(test) {
        log.debug('runTest');

        //create a stripe customer for a user
        stripeDao.createStripeCustomerForUser(null, testContext.user, testContext.accountId, function(err, value){
            if(err) {
                test.ok(false, 'Error creating Stripe Customer: ' + err);
                test.done();
            } else {
                log.debug('Created Stripe Customer: ' + value.id);
                testContext.stripeCustomer = value;

                //createStripeCard... although this should be done on the client side.
                var card = {
                    number: '4111111111111111',
                    exp_month: 11,
                    exp_year: 2020

                };
                stripeDao.createStripeCard(value.id, card, function(err, card){
                    if(err) {
                        test.ok(false, 'Error creating card for customer: ' + err);
                        test.done();
                    } else {
                        log.debug('added card [' + card + '] to customer [' + testContext.stripeCustomer.id+ ']');
                        //subscribe to a plan
                        stripeDao.createStripeSubscription(testContext.stripeCustomer.id, testContext.plans[0].id, null, null, null, null, null,
                            null, testContext.accountId, null, testContext.user.id(), null, function(err, value){
                                if(err) {
                                    test.ok(false, 'Error subscribing to a plan: ' + err);
                                    test.done();
                                } else {
                                    log.debug('subscribed.');
                                    testContext.subscription = value;
                                    test.ok(true);
                                    test.done();
                                }
                            });
                    }
                });

            }
        });

    },

    validate: function(test){
        log.debug('validate');
        test.expect(3);
        var p1 = $.Deferred(), p2 = $.Deferred(), p3 = $.Deferred();
        //user has stripeId
        userDao.getById(testContext.user.id(), $$.m.User, function(err, user){
            if(err) {
                test.ok(false, 'Error getting user by id: ' + err);
                test.done();
            } else {
                test.equals(user.get('stripeId'), testContext.stripeCustomer.id);
                p1.resolve();
            }
        });
        //user has subscription
        stripeDao.listStripeSubscriptions(testContext.stripeCustomer.id, 0, function(err, value){
            if(err) {
                test.ok(false, 'Error getting subscriptions: ' + err);
                test.done();
            } else {
                test.equals(1, value.data.length, "Wrong number of subscriptions.");
                p2.resolve();
            }
        });
        //user has customerLink
        customerLinkDao.getLinksByCustomerId(testContext.stripeCustomer.id, function(err, links){
            if(err) {
                test.ok(false, 'Error getting customer links: ' + err);
                test.done();
            } else {
                log.debug('returned link:');
                console.dir(links);
                test.equals(testContext.user.id(), links[0].get('userId'), 'UserIds did not match.');
                p3.resolve();
            }
        });

        $.when(p1,p2,p3).done(function(){
            log.debug('Done validating.');
            test.done();
        });

    }
}

exports.postTest = function(test){
    log.debug('postTest');
    //delete plan
    stripeDao.deleteStripePlan(testContext.plans[0].id, null, function(err, value){
        if(err) {
            test.ok(false, 'Error deleting plan: ' + err);
            test.done();
        } else {
            //delete user
            log.debug('deleted plan: ' + value);
            userDao.remove(testContext.user, function(err, value){
                if(err) {
                    test.ok(false, 'Error deleting user: ' + err);
                    test.done();
                } else {
                    log.debug('deleted user: ' + value);
                    stripeDao.deleteStripeCustomer(testContext.stripeCustomer.id, null, testContext.user.id(), function(err, value){
                        if(err) {
                            test.ok(false, 'Error deleting Stripe Customer: ' + err);
                            test.done();
                        } else {
                            log.debug('deleted Stripe Customer: ' + value);
                            test.done();
                        }
                    });

                }
            });
        }
    });

    //delete stripe customer

};