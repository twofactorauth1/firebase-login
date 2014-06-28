/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('../../dao/base.dao.js');
var stripeConfigs = require('../../configs/stripe.config.js');
var appConfig = require('../../configs/app.config.js');
var contactDao = require('../../dao/contact.dao.js');

/*-- for stripe api--*/
var stripe = require("stripe")( stripeConfigs.KM_STRIPE_TEST_SECRET_KEY);//TODO: app config

var dao = {


    options: {
        name: "stripe.dao",
        defaultModel: null//TODO: maybe make this a payment?
    },

    /**
     * Customers are created on the application account
     * @param cardToken
     * @param contact
     * @param accountId
     * @param fn
     */
    createStripeCustomer: function(cardToken, contact, accountId, fn) {
        //TODO: check if this is already a customer and add accountId
        var self = this;
        self.log.debug(">> createStripeCustomer");
        var parms = {};
        parms.email = contact.getEmails()[0];
        parms.description = 'Customer for ' + contact.getEmails()[0];
        parms.metadata = {};
        parms.metadata.contactId = contact.get('id');
        parms.metadata.accountId_0 = accountId;
        if(cardToken && cardToken.length > 0) {
            parms.cardToken = cardToken;
        }
        /*stripe.customers.create({
            description: 'Customer for ' + contact.getEmails()[0],
            //card: cardToken, // obtained with Stripe.js
            email: contact.getEmails()[0],
            metadata: {
                contactId: contact.get('id'),
                accountId: accountId
            }
        }*/
        stripe.customers.create(parms, function(err, customer) {

            if(err) {
                fn(err, customer);
                fn = null;
            }
            contact.set('stripeId', customer.id);
            self.log.debug('Setting contact stripeId to ' + contact.get('stripeId'));
            contactDao.saveOrMerge(contact, function(err, value){
                if (err) {
                    fn(err, value);
                    fn = null;
                }
                self.log.debug('<< createStripeCustomer');
                return fn(err, value);
            });
        });
    },

    /*
     * Because we are sharing customers across accounts, all customers will be saved to the
     * main indigenous account.  When we list customers for a specific account, we will need
     * to filter them out.
     */
    listStripeCustomers: function(accountId, limit, fn) {
        var self = this;
        self.log.debug('>> listStripeCustomers');
        stripe.customers.list({ limit: 10 }, function(err, customers) {
            // asynchronously called
            if (err) {
                fn(err, customers);
                fn = null;
            }

            self.log.debug('<< listStripeCustomers');
            return fn(err, customers);
        });
    },

    /**
     * Security check is done in the API layer.
     * @param stripeCustomerId
     * @param fn
     */
    getStripeCustomer: function(stripeCustomerId, fn) {
        //stripe.customers.retrieve({CUSTOMER_ID});
        var self = this;
        self.log.debug('>> getStripeCustomer');
        stripe.customers.retrieve(stripeCustomerId, function(err, customer) {
            // asynchronously called
            if (err) {
                fn(err, customer);
                fn = null;
            }

            self.log.debug('<< getStripeCustomer');
            return fn(err, customer);
        });
    },

    /**
     * Values passed will replace existing values (any card data will replace all card data.)
     * Values not passed will be ignored.  To add additional card data (rather than replace)
     * use the card API.
     * @param stripeCustomerId
     * @param params
     * @param fn
     */
    updateStripeCustomer: function(stripeCustomerId, params, fn) {
        var self = this;
        self.log.debug('>> updateStripeCustomer');
        stripe.customers.update(stripeCustomerId, params, function(err, customer){
            if (err) {
                fn(err, customer);
                fn = null;
            }
            self.log.debug('<< updateStripeCustomer');
            return fn(err, customer);
        });

    },

    /**
     * This permanently removes customer payment info from Stripe and cancels any subscriptions.
     * It cannot be undone.  Care must be taken to ensure that no other account has a reference
     * to this customer.  Additionally, this removes the stripeId from the contact object.
     * @param stripeCustomerId
     * @param fn
     */
    deleteStripeCustomer: function(stripeCustomerId, contactId, fn) {
        var self = this;
        self.log.debug('>> deleteStripeCustomer');
        stripe.customers.del(stripeCustomerId, function(err, confirmation){
            if(err) {
                fn(err, confirmation);
                fn = null;
            }
            if(contactId && contactId.length > 0) {
                self.log.debug('removing stripId from contact.');
                contactDao.getById(contactId, $$.m.Contact, function(err, contact){
                    if(err) {
                        fn(err, contact);
                        fn = null;
                    }
                    contact.set('stripeId', null);
                    contactDao.saveOrMerge(contact, function(err, contact){
                        if(err) {
                            fn(err, contact);
                            fn = null;
                        }
                        return fn(null, confirmation);
                    });
                });
            } else {
                return fn(null, confirmation);
            }

        });
    },

    /**
     *
     * @param id
     * @param amount
     * @param currency (usd)
     * @param interval (week, month, year)
     * @param interval_count
     * @param name
     * @param trial_period_days
     * @param metadata
     * @param statement_description
     * @param accessToken
     * @param fn
     */
    createStripePlan : function(id, amount, currency, interval, interval_count, name, trial_period_days, metadata,
                                statement_description, accessToken, fn) {
        var self = this;
        self.log.debug('>> createStripePlan');
        var params = {};
        if(id) {params.id = id;}
        if(amount) {params.amount = amount;}
        if(currency) {params.currency = currency;}
        if(interval) {params.interval = interval;}
        if(interval_count) {params.interval_count = interval_count;}
        if(name) {params.name = name;}
        if(trial_period_days) {params.trial_period_days = trial_period_days;}
        if(metadata) {params.metadata = metadata;}
        if(statement_description) {params.statement_description = statement_description};

        /*
         * If the accessToken is specified, we need to send it as the second argument.
         * Let's see what happens if it is null.
         */
        if(accessToken && accessToken.length > 0) {
            self.log.debug('creating plan for accessToken: ' + accessToken);
            stripe.plans.create(params, accessToken, function(err, plan) {
                if(err) {
                    self.log.error('error: ' + err);
                    return fn(err, plan);

                }
                self.log.debug('<< createStripePlan');
                return fn(err, plan);
            });
        } else {
            self.log.debug('creating plan for main account');
            stripe.plans.create(params, function(err, plan) {
                if(err) {
                    self.log.error('error: ' + err);
                    return fn(err, plan);

                }
                self.log.debug('<< createStripePlan');
                return fn(err, plan);
            });
        }
    },

    getStripePlan : function(planId, accessToken, fn) {
        var self = this;
        self.log.debug('>> getStripePlan');
        if(accessToken && accessToken.length > 0) {
            stripe.plans.retrieve(planId, accessToken, function(err, plan) {
                if(err) {
                    self.log.error('error: ' + err);
                    return fn(err, plan);
                }
                self.log.debug('<< getStripePlan');
                return fn(err, plan);
            });
        } else {
            stripe.plans.retrieve(planId, function(err, plan) {
                if(err) {
                    self.log.error('error: ' + err);
                    return fn(err, plan);
                }
                self.log.debug('<< getStripePlan');
                return fn(err, plan);
            });
        }
    },

    /**
     * Updates name, metadata, or statment_description for the given planId.  PlanId and at least one
     * of the following arguments must be specified.
     * @param planId
     * @param name
     * @param metadata
     * @param statement_description
     * @param accessToken
     * @param fn
     */
    updateStripePlan : function(planId, name, metadata, statement_description, accessToken, fn) {
        var self = this;
        self.log.debug('>> updateStripePlan');
        var params = {};
        if(name && name.length > 0) {params.name = name;}
        if(metadata) {params.metadata = metadata;}
        if(statement_description && statement_description.length > 0) {params.statement_description = statement_description;}

        if(accessToken && accessToken.length > 0) {
            stripe.plans.update(planId, params, accessToken, function(err, plan) {
                if(err) {
                    self.log.error('error: ' + err);
                    return fn(err, plan);
                }
                self.log.debug('<< updateStripePlan');
                return fn(err, plan);
            });
        } else {
            stripe.plans.update(planId, params, function(err, plan) {
                if(err) {
                    self.log.error('error: ' + err);
                    return fn(err, plan);
                }
                self.log.debug('<< updateStripePlan');
                return fn(err, plan);
            });
        }

    },

    deleteStripePlan: function(planId, accessToken, fn) {
        var self = this;
        self.log.debug('>> deleteStripePlan');
        if(accessToken && accessToken.length > 0) {
            stripe.plans.del(planId, accessToken, function(err, confirmation) {
                    if(err) {
                        self.log.error('error: ' + err);
                        return fn(err, confirmation);
                    }
                    self.log.debug('<< deleteStripePlan');
                    return fn(err, confirmation);
                }
            );
        } else{
            stripe.plans.del(planId, function(err, confirmation) {
                    if(err) {
                        self.log.error('error: ' + err);
                        return fn(err, confirmation);
                    }
                    self.log.debug('<< deleteStripePlan');
                    return fn(err, confirmation);
                }
            );
        }

    },

    listStripePlans: function(accessToken, fn) {
        var self = this;
        self.log.debug('>> listStripePlans');
        if(accessToken && accessToken.length > 0) {
            stripe.plans.list(accessToken, function(err, plans) {
                if(err) {
                    self.log.error('error: ' + err);
                    return fn(err, plans);
                }
                self.log.debug('<< listStripePlans');
                return fn(err, plans);
            });
        } else {
            stripe.plans.list(function(err, plans) {
                if(err) {
                    self.log.error('error: ' + err);
                    return fn(err, plans);
                }
                self.log.debug('<< listStripePlans');
                return fn(err, plans);
            });
        }
    }



};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.StripeDao = dao;

module.exports = dao;