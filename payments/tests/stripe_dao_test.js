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

        stripeDao.listStripeSubscriptions(testContext.customerId, 0, function(err, subs){
            if(err) {
                test.ok(false, err);
                test.done();
            } else {
                _log.debug('listing subscriptions.');
                console.dir(subs);
                test.done();
            }
        });

    },

    testCreateStripeCard: function(test) {
        var self = this;
        test.expect(1);
        var customerId = testContext.customerId;
        var card = {
            'number': '5555555555554444',
            'exp_month': '12',
            'exp_year':'2015',
            'cvc': '111'
        };

        stripeDao.createStripeCard(customerId, card, function(err, _card){
            if(err) {
                test.ok(false, err);
                test.done();
            } else {
                _log.debug('added card.');
                console.dir(_card);
                testContext.cardId = _card['id'];
                test.ok(testContext.cardId);
                test.done();
            }
        });
    },

    testGetStripeCard: function(test) {
        test.expect(1);
        stripeDao.getStripeCard(testContext.customerId, testContext.cardId, function(err, card){
                if(err) {
                    test.ok(false, err);
                    test.done();
                } else {
                    _log.debug('retrieved card');
                    console.dir(card);
                    test.equals(testContext.cardId, card['id']);
                    _log.debug('testContext is now: ');
                    console.dir(testContext);
                    test.done();
                }
        });
    },

    testUpdateStripeCard: function(test) {
        var self = this;
        test.expect(4);
        var customerId = testContext.customerId;
        var cardId = testContext.cardId;
        var name = 'New Name';
        var newMonth = '12';
        var newYear = '2017';

        stripeDao.updateStripeCard(customerId, cardId, name, null, null, null, null, null, null,newMonth, newYear,
            function(err, card){
                if(err) {
                    test.ok(false, err);
                    test.done();
                } else {
                    _log.debug('updated card');
                    test.equals(name, card.name);
                    test.equals(newMonth, card.exp_month);
                    test.equals(newYear, card.exp_year);
                    test.equals('4444', card.last4);
                    test.done();
                }
            });

    },

    testListStripeCards: function(test) {
        stripeDao.listStripeCards(testContext.customerId, function(err, cards){
                if(err) {
                    test.ok(false, err);
                    test.done();
                } else {
                    _log.debug('listing cards');
                    console.dir(cards);
                    test.done();
                }
        });
    },

    testCreateStripeChargeWithCustomerId: function(test) {
        var self = this;
        test.expect(1);
        var amount = 100;
        var currency = 'usd';
        var customerId = testContext.customerId;
        var contactId = testContext.contact.id();
        var description = 'test charge';
        var metadata = null;
        var capture = true;
        var statement_description = 'Test Charge';

        stripeDao.createStripeCharge(amount, currency, null, customerId, contactId, description, metadata, capture,
            statement_description, null, null, null, function(err, charge){
                if(err) {
                    test.ok(false, err);
                    test.done();
                } else {
                    _log.debug('created charge');
                    console.dir(charge);
                    test.ok(charge.charge.paid);
                    testContext.capturedChargeId= charge.charge.id;
                    test.done();
                }
            });
    },

    testCreateStripeChargeWithCustomerAndCardId: function(test) {
        var self = this;
        var amount = 100;
        var currency = 'usd';
        var customerId = testContext.customerId;
        var card = testContext.cardId;
        var contactId = testContext.contact.id();
        var description = 'test charge';
        var metadata = null;
        var capture = false;
        var statement_description = 'Test Charge';

        stripeDao.createStripeCharge(amount, currency, card, customerId, contactId, description, metadata, capture,
            statement_description, null, null, null, function(err, charge){
                if(err) {
                    test.ok(false, err);
                    test.done();
                } else {
                    _log.debug('created uncaptured charge');
                    console.dir(charge);
                    testContext.uncapturedChargeId = charge.charge.id;
                    test.done();
                }
            });
    },

    testGetStripeCharge: function(test) {
        test.expect(1);
        stripeDao.getStripeCharge(testContext.capturedChargeId, null, function(err, charge){
            if(err) {
                test.ok(false, err);
                test.done();
            } else {
                _log.debug('retrieved charge');
                console.dir(charge);
                test.ok(charge);
                test.done();
            }
        });

    },

    testUpdateStripeCharge: function(test) {
        test.expect(1);
        stripeDao.updateStripeCharge(testContext.uncapturedChargeId, 'updatedDesc', null, null, function(err, charge){
            if(err) {
                test.ok(false, err);
                test.done();
            } else {
                _log.debug('updated charge');
                console.dir(charge);
                test.equals('updatedDesc', charge.description);
                test.done();
            }
        });
    },

    testCaptureStripeCharge: function(test) {

        test.expect(1);
        stripeDao.captureStripeCharge(testContext.uncapturedChargeId, 75, null, null, null, function(err, charge){
            if(err) {
                test.ok(false, err);
                test.done();
            } else {
                _log.debug('captured charge');
                console.dir(charge);
                test.equals(25, charge.charge.amount_refunded);//updated from 100
                test.done();
            }
        });

    },

    testListStripeCharges: function(test) {

        stripeDao.listStripeCharges(null, testContext.customerId, null, 10, null, null, function(err, charges){
            if(err) {
                test.ok(false, err);
                test.done();
            } else {
                _log.debug('listing charges');
                console.dir(charges);
                test.done();
            }
        });
    },

    testCreateInvoiceItem: function(test) {
        var customerId = testContext.customerId;
        var amount = 500;
        var currency = 'usd';
        var description = 'Setup Fee';

        stripeDao.createInvoiceItem(customerId, amount, currency, null, null, description, null, null,
            function(err, item){
                if(err) {
                    test.ok(false, err);
                    test.done();
                } else {
                    _log.debug('created invoiceItem');
                    console.dir(item);
                    testContext.invoiceItem = item.id;
                    test.done();
                }
            });
    },

    testGetInvoiceItem: function(test) {
        test.expect(1);
        stripeDao.getInvoiceItem(testContext.invoiceItem, null, function(err, item){
            if(err) {
                test.ok(false, err);
                test.done();
            } else {
                _log.debug('retrieved invoiceItem');
                console.dir(item);
                test.equals(500, item.amount);
                test.done();
            }
        });
    },

    testUpdateInvoiceItem: function(test) {
        test.expect(1);
        stripeDao.updateInvoiceItem(testContext.invoiceItem, 750, null, null, null, function(err, item){
            if(err) {
                test.ok(false, err);
                test.done();
            } else {
                _log.debug('retrieved invoiceItem');
                console.dir(item);
                test.equals(750, item.amount);
                test.done();
            }
        });
    },

    testListInvoiceItems: function(test) {
        stripeDao.listInvoiceItems(null,  null, null, null, null, null, function(err, items){
            if(err) {
                test.ok(false, err);
                test.done();
            } else {
                _log.debug('listing invoiceItems');
                console.dir(items);
                test.done();
            }
        });
    },

    testCreateInvoice: function(test) {
        var self = this;
        var customerId = testContext.customerId;
        var description = 'description';
        var statement_description = 'statement';

        stripeDao.createInvoice(customerId, null, description, null, statement_description, null, null,
            function(err, invoice){
                if(err) {
                    test.ok(false, err);
                    test.done();
                } else {
                    _log.debug('created invoice');
                    console.dir(invoice);
                    testContext.invoiceId = invoice.id;
                    test.done();
                }
            });
    },

    testGetInvoice: function(test) {
        test.expect(1);
        stripeDao.getInvoice(testContext.invoiceId, null, function(err, invoice){
            if(err) {
                test.ok(false, err);
                test.done();
            } else {
                _log.debug('retrieved invoice');
                console.dir(invoice);
                test.equals(testContext.invoiceId, invoice.id);
                test.done();
            }
        });
    },

    testGetUpcomingInvoice: function(test) {
        stripeDao.getUpcomingInvoice(testContext.customerId, null, null, function(err, invoices){
            if(err) {
                if(err.toString().indexOf('No upcoming invoices for customer') !=-1) {
                    //that's an OK error message.
                    _log.info('The previous error was expected.');
                    test.done();
                } else {
                    test.ok(false, err);
                    test.done();
                }
            } else {
                _log.debug('retrieved upcoming invoice');
                console.dir(invoices);
                test.done();
            }
        });
    },

    testPayInvoice: function(test) {

        stripeDao.payInvoice(testContext.invoiceId, null, function(err, invoice){
            if(err) {
                test.ok(false, err);
                test.done();
            } else {
                _log.debug('paid invoice');
                console.dir(invoice);
                test.done();
            }
        });
    },

    testUpdateInvoice: function(test) {

        stripeDao.updateInvoice(testContext.invoiceId, null, null, 'Updated description', null, null, null, null,
            function(err, invoice){
                if(err) {
                    test.ok(false, err);
                    test.done();
                } else {
                    _log.debug('updated invoice');
                    console.dir(invoice);
                    test.done();
                }
            });
    },

    testListInvoices: function(test) {
        stripeDao.listInvoices(testContext.customerId, null, null, 10, null, null, function(err, invoices){
            if(err) {
                test.ok(false, err);
                test.done();
            } else {
                _log.debug('listing invoices');
                console.dir(invoices);
                test.done();
            }
        });
    },

    testCreateToken: function(test) {

        stripeDao.createToken(testContext.cardId, testContext.customerId, testAccessToken, function(err, token){
            if(err) {
                test.ok(false, err);
                test.done();
            } else {
                _log.debug('created token');
                console.dir(token);
                testContext.tokenId = token.id;
                test.done();
            }
        });
    },

    testGetToken: function(test) {
        stripeDao.getToken(testContext.tokenId, testAccessToken, function(err, token){
            if(err) {
                test.ok(false, err);
                test.done();
            } else {
                _log.debug('retrieved token');
                console.dir(token);
                test.done();
            }
        });
    },

    testListEvents: function(test) {
        stripeDao.listEvents(null, null, null, null, null, null, function(err, events){
            if(err) {
                test.ok(false, err);
                test.done();
            } else {
                _log.debug('listing events');
                console.dir(events);
                testContext.eventId = events.data[0].id;
                test.done();
            }
        });
    },

    testGetEvent: function(test) {
        stripeDao.getEvent(testContext.eventId, null, function(err, event){
            if(err) {
                test.ok(false, err);
                test.done();
            } else {
                _log.debug('retrieved event');
                console.dir(event);
                test.done();
            }
        });
    },



    testDeleteInvoiceItem: function(test) {
        //create a new invoiceItem to delete
        test.expect(1);
        var customerId = testContext.customerId;
        var amount = 500;
        var currency = 'usd';
        var description = 'Setup Fee';

        stripeDao.createInvoiceItem(customerId, amount, currency, null, null, description, null, null,
            function(err, item){
                if(err) {
                    test.ok(false, err);
                    test.done();
                } else {
                    _log.debug('created invoiceItem');
                    stripeDao.deleteInvoiceItem(item.id, null, function(err, result){
                        if(err) {
                            test.ok(false, err);
                            test.done();
                        } else {
                            _log.debug('deleted invoice item');
                            console.dir(result);
                            test.ok(result);
                            test.done();
                        }
                    });

                }
            });

    },

    testDeleteStripeCard: function(test) {

        stripeDao.deleteStripeCard(testContext.customerId, testContext.cardId, function(err, value){
            if(err) {
                test.ok(false, err);
                test.done();
            } else {
                _log.debug('deleted card');
                console.dir(value);
                test.done();
            }
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