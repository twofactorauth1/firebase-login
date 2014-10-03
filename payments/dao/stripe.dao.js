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
var userDao = require('../../dao/user.dao.js');
var subscriptionDao = require('./subscription.dao.js');
var paymentDao = require('./payment.dao.js');
var customerLinkDao = require('./customer_link.dao.js');

/*-- for stripe api--*/
var stripe = require("stripe")( stripeConfigs.STRIPE_SECRET_KEY);//TODO: app config

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
        var params = {};
        params.email = contact.getEmails()[0];
        params.description = 'Customer for ' + contact.getEmails()[0];
        params.metadata = {};
        params.metadata.contactId = contact.get('id');
        params.metadata.accountId_0 = accountId;
        if(cardToken && cardToken.length > 0) {
            params.cardToken = cardToken;
        }

        stripe.customers.create(params, function(err, customer) {

            if(err) {
                fn(err, customer);
                fn = null;
            }
            contact.set('stripeId', customer.id);
            self.log.debug('Setting contact stripeId to ' + contact.get('stripeId'));
            var p1 = $.Deferred(), p2 = $.Deferred();
            var savedCustomer = customer;
            contactDao.saveOrMerge(contact, function(err, value){
                if (err) {
                    fn(err, value);
                    fn = null;
                }
                p1.resolve();
            });

            customerLinkDao.safeCreate(accountId, contact.get('_id'), customer.id, function(err, value){
                if (err) {
                    self.log.warn('attempted to create a customer link that already exists.');
                    //fn(err, value);
                    //fn = null;
                }
                p2.resolve();
            });

            $.when(p1,p2).done(function(){
                self.log.debug('<< createStripeCustomer');
                return fn(err, savedCustomer);
            });

        });
    },

    createStripeCustomerForUser: function(cardToken, user, accountId, fn) {
        //TODO: check if this is already a customer and add accountId
        var self = this;
        self.log.debug(">> createStripeCustomerForUser");
        var params = {};
        params.email = user.get('email');
        params.description = 'Customer for ' + user.get('email');
        params.metadata = {};
        params.metadata.contactId = user.id();
        params.metadata.accountId_0 = accountId;
        if(cardToken && cardToken.length > 0) {
            params.cardToken = cardToken;
        }

        stripe.customers.create(params, function(err, customer) {

            if(err) {
                fn(err, customer);
                fn = null;
                return;
            }
            user.set('stripeId', customer.id);
            self.log.debug('Setting user stripeId to ' + user.get('stripeId'));
            var p1 = $.Deferred(), p2 = $.Deferred();
            var savedCustomer = customer;
            userDao.saveOrUpdate(user, function(err, value){
                if (err) {
                    fn(err, value);
                    fn = null;
                    return;
                }
                p1.resolve();
            });


            customerLinkDao.safeCreateWithUser(accountId, user.id(), customer.id, function(err, value){
                if (err) {
                    if(err.toString() === 'The customer link already exists.') {
                        //that's ok.
                    } else {
                        fn(err, value);
                        fn = null;
                        return;
                    }
                }
                p2.resolve();
            });

            $.when(p1,p2).done(function(){
                self.log.debug('<< createStripeCustomerForUser');
                return fn(err, savedCustomer);
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
        var _limit = limit ||10;
        stripe.customers.list({ limit: _limit }, function(err, customers) {
            // asynchronously called
            if (err) {
                fn(err, customers);
                fn = null;
                return;
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
                return;
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
    updateStripeCustomer: function(stripeCustomerId, account_balance, cardToken, coupon, default_card, description,
                                   email, metadata, fn) {
        var self = this;
        self.log.debug('>> updateStripeCustomer');
        var params = {};
        if(account_balance) {params.account_balance = account_balance;}
        if(cardToken) {params.card = cardToken;}
        if(coupon) {params.coupon = coupon;}
        if(default_card) {params.default_card = default_card;}
        if(description) {params.description = description;}
        if(email) {params.email = email;}
        if(metadata) {params.metadata = metadata;}

        stripe.customers.update(stripeCustomerId, params, function(err, customer){
            if (err) {
                self.log.error('error updating customer: ' + err);
                fn(err, customer);
                fn = null;
                return;
            }
            self.log.debug('<< updateStripeCustomer');
            return fn(err, customer);
        });

    },

    /**
     * This permanently removes customer payment info from Stripe and cancels any subscriptions.
     * It cannot be undone.  Care must be taken to ensure that no other account has a reference
     * to this customer.  Additionally, this removes the stripeId from the contact or user object.
     * @param stripeCustomerId
     * @param contactId
     * @param userId
     * @param fn
     */
        //TODO: handle customers on a user
    deleteStripeCustomer: function(stripeCustomerId, contactId, userId, fn) {
        var self = this;
        self.log.debug('>> deleteStripeCustomer');
        if(fn === null) {
            fn = userId;
            userId = null;
        }


        stripe.customers.del(stripeCustomerId, function(err, confirmation){
            if(err) {
                fn(err, confirmation);
                fn = null;
            }
            if(contactId && contactId.length > 0) {
                self.log.debug('removing stripeId from contact.');
                contactDao.getById(contactId, $$.m.Contact, function(err, contact){
                    if(err) {
                        self.log.error('Error removing stripeId from contact: ' + err);
                        fn(err, contact);
                        fn = null;
                        return;
                    }
                    contact.set('stripeId', null);
                    contactDao.saveOrMerge(contact, function(err, contact){
                        if(err) {
                            self.log.error('Error removing stripeId from contact: ' + err);
                            fn(err, contact);
                            fn = null;
                            return;
                        }
                        return fn(null, confirmation);
                    });
                });
            } else if(userId && userId.length > 0) {
                self.log.debug('removing stripeId from user.');
                userDao.getById(userId, $$.m.User, function(err, user){
                    if(err) {
                        self.log.error('Error removing stripeId from user: ' + err);
                        fn(err, user);
                        fn = null;
                        return;
                    }
                    user.set('stripeId', null);
                    userDao.saveOrUpdate(user, function(err, value){
                        if(err) {
                            self.log.error('Error removing stripeId from user: ' + err);
                            fn(err, value);
                            fn = null;
                            return;
                        }
                        return fn(null, value);
                    });
                });
            } else {
                return fn(null, confirmation);
            }

        });
    },

    /**
     *
     * @param id - Unique Plan ID string (required)
     * @param amount (required)
     * @param currency (usd) (required)
     * @param interval (week, month, year) (required)
     * @param interval_count default is 1
     * @param name Name of plan to be displayed on invoices. (required)
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

        var apiToken = self.delegateStripe(accessToken);

        stripe.plans.create(params, apiToken, function(err, plan) {
            if(err) {
                self.log.error('error: ' + err);
                return fn(err, plan);

            }
            self.log.debug('<< createStripePlan');
            return fn(err, plan);
        });

    },

    getStripePlan : function(planId, accessToken, fn) {
        var self = this;
        self.log.debug('>> getStripePlan');
        var apiToken = self.delegateStripe(accessToken);

        stripe.plans.retrieve(planId, apiToken, function(err, plan) {
            if(err) {
                self.log.error('error: ' + err);
                return fn(err, plan);
            }
            self.log.debug('<< getStripePlan');
            return fn(err, plan);
        });

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

        var apiToken = self.delegateStripe(accessToken);

        stripe.plans.update(planId, params, apiToken, function(err, plan) {
            if(err) {
                self.log.error('error: ' + err);
                return fn(err, plan);
            }
            self.log.debug('<< updateStripePlan');
            return fn(err, plan);
        });

    },

    deleteStripePlan: function(planId, accessToken, fn) {
        var self = this;
        self.log.debug('>> deleteStripePlan');

        var apiToken = self.delegateStripe(accessToken);

        stripe.plans.del(planId, apiToken, function(err, confirmation) {
                if(err) {
                    self.log.error('error: ' + err);
                    return fn(err, confirmation);
                }
                self.log.debug('<< deleteStripePlan');
                return fn(err, confirmation);
            }
        );
    },

    listStripePlans: function(accessToken, fn) {
        var self = this;
        self.log.debug('>> listStripePlans');
        var apiToken = self.delegateStripe(accessToken);

        stripe.plans.list(apiToken, function(err, plans) {
            if(err) {
                self.log.error('error: ' + err);
                return fn(err, plans);
            }
            self.log.debug('<< listStripePlans');
            return fn(err, plans);
        });
    },

    /**
     * The arguments customerId and planId are required.  Passing in a card will overwrite customer's current card settings.
     * Passing an accessToken will create the subscription on behalf of the account to which it applies.  The metadata
     * object allows for custom name/value pair properties.
     * @param customerId
     * @param planId
     * @param coupon
     * @param trial_end
     * @param card
     * @param quantity
     * @param application_fee_percent
     * @param metadata
     * @param accessToken
     * @param fn
     *
     * Returns Stripe Subscription object.  *Note* An internal subscription object has also been created.
     */
    createStripeSubscription: function(customerId, planId, coupon, trial_end, card, quantity, application_fee_percent,
                                       metadata, accountId, contactId, userId, accessToken, fn) {
        var self = this;
        self.log.debug('>> createStripeSubscription');
        var params = {};
        params.plan = planId;
        if(coupon && coupon.length>0) {params.coupon = coupon;}
        if(trial_end && trial_end.length>0){params.trial_end = trial_end;}
        if(card) {params.card = card;}
        if(quantity && quantity.length > 0) {params.quantity = quantity;}
        if(application_fee_percent && application_fee_percent.length>0) {params.application_fee_percent = application_fee_percent;}
        if(metadata) {params.metadata = metadata;} else {params.metadata = {};}
        params.metadata.accountId = accountId;

        var apiToken = self.delegateStripe(accessToken);

        stripe.customers.createSubscription(customerId, params, apiToken, function(err, subscription) {
                if(err) {
                    self.log.error('error: ' + err);
                    return fn(err, subscription);
                }
                //create subscription record...NEED accountId and contactId
                var sub = new $$.m.Subscription({
                    accountId: accountId,
                    contactId: contactId,
                    userId: userId,
                    stripeCustomerId: customerId,
                    stripeSubscriptionId: subscription.id,
                    stripePlanId: planId
                });
                subscriptionDao.saveOrUpdate(sub, function(err, _sub){
                    if(err) {
                        self.log.error('error: ' + err);
                        return fn(err, subscription);
                    }
                    self.log.debug('<< createStripeSubscription');
                    return fn(err, subscription);
                });
            }
        );

    },

    getStripeSubscription: function(customerId, subscriptionId, accessToken, fn) {
        var self = this;
        self.log.debug('>> getStripeSubscription');
        var apiToken = self.delegateStripe(accessToken);

        stripe.customers.retrieveSubscription( customerId, subscriptionId, apiToken,
            function(err, subscription) {
                if(err) {
                    self.log.error('error: ' + err);
                    return fn(err, subscription);
                }
                self.log.debug('<< getStripeSubscription');
                return fn(err, subscription);
            }
        );

    },

    updateStripeSubscription: function(customerId, subscriptionId, planId, coupon, prorate, trial_end, card, quantity,
                                       application_fee_percent, metadata, accessToken, fn) {
        var self = this;
        self.log.debug('>> updateStripeSubscription');
        var params = {};
        var updateLocal = false;
        if(planId && planId.length>0){params.plan = planId; updateLocal=true;}
        if(coupon && coupon.length>0) {params.coupon = coupon;}
        if(trial_end && trial_end.length>0){params.trial_end = trial_end;}
        if(card) {params.card = card;}
        if(quantity && quantity.length > 0) {params.quantity = quantity;}
        if(application_fee_percent && application_fee_percent.length>0) {params.application_fee_percent = application_fee_percent;}
        if(metadata) {params.metadata = metadata;}

        var apiToken = self.delegateStripe(accessToken);

        stripe.customers.updateSubscription( customerId, subscriptionId, params, apiToken,
            function(err, subscription) {
                if(err) {
                    self.log.error('error: ' + err);
                    return fn(err, subscription);
                }
                self.log.debug('<< updateStripeSubscription');
                return fn(err, subscription);
            }
        );

    },

    /**
     * Cancels the subscription in Stripe and updates the local record of it.
     * Can be cancelled immediately or at the end of the the current period
     * @param accountId
     * @param customerId
     * @param subscriptionId
     * @param at_period_end     Boolean defaults to false.
     * @param accessToken
     * @param fn
     */
    cancelStripeSubscription: function(accountId, customerId, subscriptionId, at_period_end, accessToken, fn) {
        var self = this;
        self.log.debug('>> cancelStripeSubscription');
        var params = {};
        if(at_period_end === true) {
            params.at_period_end = true;
        }
        var apiToken = self.delegateStripe(accessToken);

        stripe.customers.cancelSubscription(customerId, subscriptionId, params, apiToken, function(err, confirmation) {
                if(err) {
                    self.log.error('error: ' + err);
                    return fn(err, confirmation);
                }
                /*
                    If at_period_end then we leave the local sub active and change the status upon webhook.
                 */
                if(at_period_end !== true) {
                    subscriptionDao.getSubscriptionByAccountAndId(accountId, subscriptionId, function(err, sub){
                        if(err) {
                            self.log.error('error: ' + err);
                            return fn(err, confirmation);
                        }
                        sub.set('isActive', false);
                        subscriptionDao.saveOrUpdate(sub, function(err, sub){
                            if(err) {
                                self.log.error('error: ' + err);
                                return fn(err, confirmation);
                            }
                            self.log.debug('<< cancelStripeSubscription');
                            return fn(err, confirmation);
                        });
                    });
                } else {
                    self.log.debug('<< cancelStripeSubscription');
                    return fn(err, confirmation);
                }
            }
        );
    },

    /**
     * Lists all subscriptions for a Stripe customer.  *Note* This may return subscriptions for multiple accounts.
     * Care should be taken to filter out non-relevant subs.  Additionally, a limit may be applied to limit the number
     * of results.  If it is not specified, the default (from Stripe) of 10 is applied.  If the limit is set to 0,
     * all results will be returned.  Additionally, this is an operation on a customer... no accessToken is needed.
     * @param customerId
     * @param limit
     * @param fn
     */
    listStripeSubscriptions: function(customerId, limit, fn) {
        var self = this;
        self.log.debug('>> listStripeSubscriptions');
        var params = {};
        if(limit) {
            if(limit === 0) {
                params.limit = 100;
            } else {
                params.limit = params;
            }

        }
        stripe.customers.listSubscriptions(customerId, params, function(err, subscriptions) {
            if(err) {
                self.log.error('error: ' + err);
                return fn(err, subscriptions);
            }
            if(limit === 0 && subscriptions.has_more === true) {
                /*
                    Get ALL the subscriptions
                 */
                params.starting_after = subscriptions.data[subscriptions.data.length-1].id;
                params.limit = 100;
                var subs = [];
                var p1 = $.Deferred();
                subs.push(subscriptions.data);
                self._getAllStripeSubscriptions(customerId, params, subs, p1);
                $.when(p1).done(function() {
                   subscriptions.data = subs;
                   self.log.debug('<< listStripeSubscriptions');
                   return fn(err, subscriptions);
                });
            } else {
                self.log.debug('<< listStripeSubscriptions');
                return fn(err, subscriptions);
            }
        });
    },

    _getAllStripeSubscriptions: function(customerId, params, subs, deferred) {
        self.log.debug('>> _getAllStripeSubscriptions ... adding more subscriptions.');
        stripe.customers.listSubscriptions(customerId, params, function(err, subscriptions) {
            if (err) {
                self.log.error('error: ' + err);
                deferred.reject();
                return deferred.promise;
            }

            subs.push(subscriptions.data);
            if(subscriptions.has_more === true) {
                params.starting_after = subscriptions.data[subscriptions.data.length-1].id;
                self._getAllStripeSubscriptions(customerId, params, subs, p1);
            } else {
                //we're done.
                deferred.resolve();
                self.log.debug('<< _getAllStripeSubscriptions returning.');
                return deferred.promise;
            }
        });
        return deferred.promise;
    },

    //cards
    /**
     * This is an operation on a customer.  No accessToken is needed, because customers are stored on the app account.
     * @param customerId
     * @param card - can be a token or a card object.
     * @param fn
     */
    createStripeCard: function(customerId, card, fn) {
        var self = this;
        self.log.debug('>> createStripeCard');
        var params = {};
        params.card = card;
        stripe.customers.createCard( customerId, params, function(err, card) {
                if(err) {
                    self.log.error('error: ' + err);
                    return fn(err, card);
                }
                self.log.debug('<< createStripeCard');
                return fn(err, card);
            }
        );
    },

    getStripeCard: function(customerId, cardId, fn) {
        var self = this;
        self.log.debug('>> getStripeCard');
        stripe.customers.retrieveCard(customerId, cardId, function(err, card) {
                if(err) {
                    self.log.error('error: ' + err);
                    return fn(err, card);
                }
                self.log.debug('<< getStripeCard');
                return fn(err, card);
            }
        );
    },

    updateStripeCard: function(customerId, cardId, name, address_city, address_country, address_line1, address_line2,
        address_state, address_zip, exp_month, exp_year, fn) {
        var self = this;
        self.log.debug('>> updateStripeCard');
        var params = {};
        if(name && name.length>0) {params.name = name;}
        if(address_city && address_city.length>0){params.address_city = address_city;}
        if(address_country && address_country.length>0) {params.address_country = address_country;}
        if(address_line1 && address_line1.length>0) {params.address_line1 = address_line1;}
        if(address_line2 && address_line2.length>0) {params.address_line2 = address_line2;}
        if(address_state && address_state.length>0) {params.address_state = address_state;}
        if(address_zip && address_zip.length>0) {params.address_zip = address_zip;}
        if(exp_month && exp_month.length>0) {params.exp_month = exp_month;}
        if(exp_year && exp_year.length>0) {params.exp_year = exp_year;}

        stripe.customers.updateCard(customerId, cardId, params, function(err, card) {
                if(err) {
                    self.log.error('error: ' + err);
                    return fn(err, card);
                }
                self.log.debug('<< updateStripeCard');
                return fn(err, card);
            }
        );
    },

    deleteStripeCard: function(customerId, cardId, fn) {
        var self = this;
        self.log.debug('>> deleteStripeCard');
        stripe.customers.deleteCard(customerId, cardId, function(err, confirmation) {
                if(err) {
                    self.log.error('error: ' + err);
                    return fn(err, confirmation);
                }
                self.log.debug('<< deleteStripeCard');
                return fn(err, confirmation);
            }
        );
    },

    listStripeCards: function(customerId, fn) {
        var self = this;
        self.log.debug('>> listStripeCards');
        stripe.customers.listCards(customerId, function(err, cards) {
            if(err) {
                self.log.error('error: ' + err);
                return fn(err, cards);
            }
            self.log.debug('<< listStripeCards');
            return fn(err, cards);
        });
    },

    //charges
    /**
     *
     * @param amount                    required
     * @param currency                  required (usd)
     * @param card                      (must have card or customer)
     * @param customerId                (must have card or customer)
     * @param contactId
     * @param description
     * @param metadata
     * @param capture
     * @param statement_description
     * @param receipt_email
     * @param application_fee
     * @param accessToken
     * @param fn
     *
     * @return result object containing charge and payment objects
     */

    createStripeCharge: function(amount, currency, card, customerId, contactId, description, metadata, capture,
                                 statement_description, receipt_email, application_fee, userId, accessToken, fn) {
        var self = this;
        self.log.debug('>> createStripeCharge');
        var paymentId = $$.u.idutils.generateUUID();//create the id for the local object
        var apiToken = self.delegateStripe(accessToken);
        var params = {};


        params.amount = amount;
        params.currency = currency;
        if(card) {params.card = card;}
        if(customerId) {params.customer = customerId;}
        if(description && description.length>0) {params.description = description;}
        if(!metadata) {
            metadata = {};
        }
        metadata.paymentId = paymentId;
        params.capture = capture || false;
        if(statement_description && statement_description.length>0) {params.statement_description = statement_description;}
        if(receipt_email && receipt_email.length>0) {params.receipt_email = receipt_email;}
        if(application_fee && application_fee > 0) {params.application_fee = application_fee;}

        stripe.charges.create(params, apiToken, function(err, charge) {
            if(err) {
                self.log.error('error: ' + err);
                return fn(err, charge);
            }
            self.log.debug('created charge in Stripe.');
            //create payment object
            var payment = new $$.m.Payment({
                chargeId: charge.id,
                amount: amount,
                isCaptured: charge.captured,
                cardId: charge.card.id,
                fingerprint: charge.card.fingerprint,
                last4: charge.card.last4,
                cvc_check: charge.card.cvc_check,
                created: charge.created,
                paid: charge.paid,
                refunded: charge.refunded,
                amount_refunded: charge.amount_refunded,
                balance_transaction: charge.balance_transaction,
                customerId: customerId,
                contactId: contactId,
                userId: userId,
                failure_code: charge.failure_code,
                failure_message: charge.failure_message,
                invoiceId: charge.invoice,
                _id:paymentId

            });
            paymentDao.saveOrUpdate(payment, function(err, payment){
                if(err) {
                    self.log.error('error creating payment record for charge: ' + err);
                    return fn(err, charge);
                }
                self.log.debug('<< createStripeCharge');
                var result = {charge: charge, payment: payment};
                return fn(err, result);
            });

        });

    },

    getStripeCharge: function(chargeId, accessToken, fn) {
        var self = this;
        self.log.debug('>> getStripeCharge');
        var apiToken = self.delegateStripe(accessToken);

        stripe.charges.retrieve(chargeId, apiToken, function(err, charge) {
                if(err) {
                    self.log.error('error: ' + err);
                    return fn(err, charge);
                }
                self.log.debug('<< getStripeCharge');
                return fn(err, charge);
            }
        );
    },

    updateStripeCharge: function(chargeId, description, metadata, accessToken, fn) {
        var self = this;
        self.log.debug('>> getStripeCharge');
        var apiToken = self.delegateStripe(accessToken);
        var params = {};

        if(description && description.length>0) {params.description = description;}
        if(metadata) {params.metadata = metadata;}

        stripe.charges.update( chargeId, params, apiToken, function(err, charge) {
                if(err) {
                    self.log.error('error: ' + err);
                    return fn(err, charge);
                }
                self.log.debug('<< updateStripeCharge');
                return fn(err, charge);
            }
        );

    },

    /**
     *
     * @param chargeId
     * @param amount
     * @param application_fee
     * @param receipt_email
     * @param accessToken
     * @param fn
     */
    captureStripeCharge: function(chargeId, amount, application_fee, receipt_email, accessToken, fn) {
        var self = this;
        self.log.debug('>> captureStripeCharge');
        var apiToken = self.delegateStripe(accessToken);
        var params = {};
        if(amount) {params.amount = amount;}
        if(application_fee) {params.application_fee = application_fee;}
        if(receipt_email && receipt_email.length>0) {params.receipt_email = receipt_email;}

        stripe.charges.capture(chargeId, params, apiToken, function(err, charge) {
            if(err) {
                self.log.error('error: ' + err);
                return fn(err, charge);
            }
            self.log.debug('Captured charge.  Updating payment record.');
            paymentDao.getPaymentByChargeId(chargeId, function(err, payment){
                if(err) {
                    self.log.error('error retrieving payment for charge with id:' + chargeId + ": " + err);
                    return fn(err, charge);
                }
                /*
                    Capture properties that may have changed.
                 */
                payment.isCaptured = true;
                payment.capture_date = Date.now();
                payment.amount = charge.amount;
                payment.paid=charge.paid;
                payment.refunded=charge.refunded;
                payment.amount_refunded=charge.amount_refunded;
                paymentDao.saveOrUpdate(payment, function(err, payment){
                    if(err) {
                        self.log.error('error updating payment: ' + err);
                        return fn(err, payment);
                    }
                    var result = {charge: charge, payment: payment};
                    return fn(err, result);
                });
            });
        });

    },


    /**
     *
     * @param created
     * @param customerId
     * @param ending_before
     * @param limit
     * @param starting_after
     * @param accessToken
     * @param fn
     */
    listStripeCharges: function(created, customerId, ending_before, limit, starting_after, accessToken, fn) {
        var self = this;
        self.log.debug('>> listStripeCharges');
        var apiToken = self.delegateStripe(accessToken);
        var params = {};

        if(created) {params.created = created;}
        if(customerId && customerId.length>0) {params.customer = customerId;}
        if(ending_before) {params.ending_before = ending_before;}
        if(limit) {
            if(limit === 0) {
                params.limit = 100;
            } else {
                params.limit = limit;
            }
        }
        if(starting_after && starting_after.length>0) {params.starting_after = starting_after;}

        stripe.charges.list(params, apiToken, function(err, charges) {
            if(err) {
                self.log.error('error: ' + err);
                return fn(err, charges);
            }
            if(limit === 0 && charges.has_more === true) {
                /*
                 Get ALL the charges
                 */
                params.starting_after = charges.data[charges.data.length-1].id;

                var _charges = [];
                var p1 = $.Deferred();
                _charges.push(charges.data);
                self._getAllStripeCharges(params, _charges, apiToken, p1);
                $.when(p1).done(function() {
                    charges.data = _charges;
                    self.log.debug('<< listStripeCharges');
                    return fn(err, charges);
                });
            } else {
                self.log.debug('<< listStripeCharges');
                return fn(err, charges);
            }
        });

    },

    _getAllStripeCharges: function(params, _charges, apiToken, deferred) {
        self.log.debug('>> _getAllStripeCharges ... adding more charges.');
        stripe.charges.list(params, apiToken, function(err, charges) {
            if (err) {
                self.log.error('error: ' + err);
                deferred.reject();
                return deferred.promise;
            }

            _charges.push(charges.data);
            if(charges.has_more === true) {
                params.starting_after = charges.data[charges.data.length-1].id;
                self._getAllStripeCharges(params, _charges, apiToken, deferred);
            } else {
                //we're done.
                deferred.resolve();
                self.log.debug('<< _getAllStripeCharges returning.');
                return deferred.promise;
            }
        });
        return deferred.promise;
    },

    //invoice items
    /**
     *
     * @param customerId - REQUIRED
     * @param amount - REQUIRED
     * @param currency - 'usd' REQUIRED
     * @param invoiceId
     * @param subscriptionId
     * @param description
     * @param metadata
     * @param accessToken
     * @param fn
     */
    createInvoiceItem: function(customerId, amount, currency, invoiceId, subscriptionId, description, metadata, accessToken, fn) {
        var self = this;
        self.log.debug('>> createInvoiceItem');
        var apiToken = self.delegateStripe(accessToken);
        var params = {};

        params.customer = customerId;
        params.amount = amount;
        params.currency = currency;
        if(invoiceId && invoiceId.length > 0) {params.invoice = invoiceId;}
        if(subscriptionId && subscriptionId.length > 0) {params.subscription = subscriptionId;}
        if(description && description.length > 0) {params.description = description;}
        if(metadata) {params.metadata = metadata;}

        stripe.invoiceItems.create(params, apiToken, function(err, invoiceItem) {
            if(err) {
                self.log.error('error: ' + err);
                return fn(err, invoiceItem);
            }
            self.log.debug('<< createInvoiceItem');
            return fn(err, invoiceItem);
        });

    },

    getInvoiceItem: function(invoiceItemId, accessToken, fn) {
        var self = this;
        self.log.debug('>> getInvoiceItem');
        var apiToken = self.delegateStripe(accessToken);

        stripe.invoiceItems.retrieve(invoiceItemId, apiToken, function(err, invoiceItem) {
            if(err) {
                self.log.error('error: ' + err);
                return fn(err, invoiceItem);
            }
            self.log.debug('<< getInvoiceItem');
            return fn(err, invoiceItem);
        });

    },

    updateInvoiceItem: function(invoiceItemId, amount, description, metadata, accessToken, fn) {
        var self = this;
        self.log.debug('>> updateInvoiceItem');
        var apiToken = self.delegateStripe(accessToken);
        var params = {};
        if(amount) {params.amount = amount;}
        if(description) {params.description=description;}
        if(metadata) {params.metadata = metadata;}

        stripe.invoiceItems.update( invoiceItemId, params, apiToken, function(err, invoiceItem) {
            if(err) {
                self.log.error('error: ' + err);
                return fn(err, invoiceItem);
            }
            self.log.debug('<< updateInvoiceItem');
            return fn(err, invoiceItem);
        });
    },

    deleteInvoiceItem: function(invoiceItemId, accessToken, fn) {
        var self = this;
        self.log.debug('>> deleteInvoiceItem');
        var apiToken = self.delegateStripe(accessToken);

        stripe.invoiceItems.del(invoiceItemId, apiToken, function(err, confirmation) {
            if(err) {
                self.log.error('error: ' + err);
                return fn(err, confirmation);
            }
            self.log.debug('<< deleteInvoiceItem');
            return fn(err, confirmation);
        });
    },

    listInvoiceItems: function(created, customerId, ending_before, limit, starting_after, accessToken, fn) {
        var self = this;
        self.log.debug('>> listInvoiceItems');
        var apiToken = self.delegateStripe(accessToken);
        var params = {};

        if(created) {params.created = created;}
        if(customerId) {params.customer = customerId;}
        if(ending_before) {params.ending_before = ending_before;}
        if(limit) {params.limit = limit;}
        if(starting_after) {params.starting_after = starting_after;}

        stripe.invoiceItems.list(params, apiToken, function(err, invoiceItems) {
            if(err) {
                self.log.error('error: ' + err);
                return fn(err, invoiceItems);
            }
            self.log.debug('<< listInvoiceItems');
            return fn(err, invoiceItems);
        });
    },

    //invoices

    createInvoice: function(customerId, application_fee, description, metadata, statement_description, subscriptionId,
                            accessToken, fn) {
        var self = this;
        self.log.debug('>> createInvoice');
        var apiToken = self.delegateStripe(accessToken);
        var params = {};
        params.customer = customerId;
        if(application_fee) {params.application_fee = application_fee;}
        if(description) {params.description = description;}
        if(metadata) {params.metadata = metadata;}
        if(statement_description) {params.statement_description = statement_description;}
        if(subscriptionId) {params.subscription = subscriptionId;}

        stripe.invoices.create(params, apiToken, function(err, invoice) {
            if(err) {
                self.log.error('error: ' + err);
                return fn(err, invoice);
            }
            self.log.debug('<< createInvoice');
            return fn(err, invoice);
        });
    },

    getInvoice: function(invoiceId, accessToken, fn) {
        var self = this;
        self.log.debug('>> getInvoice');
        var apiToken = self.delegateStripe(accessToken);

        stripe.invoices.retrieve(invoiceId, apiToken, function(err, invoice) {
            if(err) {
                self.log.error('error: ' + err);
                return fn(err, invoice);
            }
            self.log.debug('<< getInvoice');
            return fn(err, invoice);
        });
    },

    getUpcomingInvoice: function(customerId, subscriptionId, accessToken, fn) {
        var self = this;
        self.log.debug('>> getUpcomingInvoice');
        var apiToken = self.delegateStripe(accessToken);
        var params = {};
        if(subscriptionId) {
            params.subscription = subscriptionId;
        }

        stripe.invoices.retrieveUpcoming(customerId, params, apiToken, function(err, invoice) {
            if(err) {
                self.log.error('error: ' + err);
                return fn(err, invoice);
            }
            self.log.debug('<< getUpcomingInvoice');
            return fn(err, invoice);
        });
    },

    payInvoice: function(invoiceId, accessToken, fn) {
        var self = this;
        self.log.debug('>> payInvoice');
        var apiToken = self.delegateStripe(accessToken);

        stripe.invoices.pay(invoiceId, apiToken, function(err, invoice) {
            if(err) {
                self.log.error('error: ' + err);
                return fn(err, invoice);
            }
            self.log.debug('<< payInvoice');
            return fn(err, invoice);
        });
    },

    updateInvoice: function(invoiceId, application_fee, closed, description, forgiven, metadata, statement_description,
                            accessToken, fn) {
        var self = this;
        self.log.debug('>> updateInvoice');
        var apiToken = self.delegateStripe(accessToken);
        var params = {};
        if(application_fee) {params.application_fee = application_fee;}
        if(closed !== null) {params.closed = closed;}
        if(description) {params.description = description;}
        if(forgiven !== null) {params.forgiven = forgiven;}
        if(metadata) {params.metadata = metadata;}
        if(statement_description) {params.statement_description = statement_description;}

        stripe.invoices.update(invoiceId, params, apiToken, function(err, invoice) {
            if(err) {
                self.log.error('error: ' + err);
                return fn(err, invoice);
            }
            self.log.debug('<< updateInvoice');
            return fn(err, invoice);
        });
    },

    listInvoices: function(customerId, dateFilter, ending_before, limit, starting_after, accessToken, fn) {
        var self = this;
        self.log.debug('>> listInvoices');
        var apiToken = self.delegateStripe(accessToken);
        var params = {};

        if(customerId) {params.customer = customerId;}
        if(dateFilter) {params.date = dateFilter;}
        if(ending_before) {params.ending_before = ending_before;}
        if(limit) {params.limit = limit;}
        if(starting_after) {params.starting_after = starting_after;}


        stripe.invoices.list(params, apiToken, function(err, invoices){
            if(err) {
                self.log.error('error: ' + err);
                return fn(err, invoices);
            }
            self.log.debug('<< listInvoices');
            return fn(err, invoices);
        });


    },

    //coupons

    //discounts

    //tokens

    /**
     *
     * @param cardId - Stripe cardId of a card already attached to a customer
     * @param customerId - Stripe customerId
     * @param accessToken - delegated access Token is REQUIRED
     * @param fn
     */
    createToken: function(cardId, customerId, accessToken, fn) {
        var self = this;
        self.log.debug('>> createToken');
        var apiToken = self.delegateStripe(accessToken);
        var params = {};
        params.card = cardId;
        params.customer = customerId;

        stripe.tokens.create(params, apiToken, function(err, token) {
            if(err) {
                self.log.error('error: ' + err);
                return fn(err, token);
            }
            self.log.debug('<< createToken');
            return fn(err, token);
        });

    },

    getToken: function(tokenId, accessToken, fn) {
        var self = this;
        self.log.debug('>> getToken');
        var apiToken = self.delegateStripe(accessToken);
        stripe.tokens.retrieve(tokenId, apiToken, function(err, token) {
            if(err) {
                self.log.error('error: ' + err);
                return fn(err, token);
            }
            self.log.debug('<< getToken');
            return fn(err, token);
        });
    },

    //events - getEvent, listEvents
    getEvent: function(eventId, accessToken, fn) {
        var self = this;
        self.log.debug('>> getEvent');
        var apiToken = self.delegateStripe(accessToken);

        stripe.events.retrieve(eventId, apiToken, function(err, event) {
            if(err) {
                self.log.error('error: ' + err);
                return fn(err, charges);
            }
            self.log.debug('<< getEvent');
            return fn(err, event);
        });

    },

    /**
     *
     * @param created - value (unix timestamp) or object containing 1 of the following options:
     *                          - gt: Return values where the created field is after this timestamp
     *                          - gte: Return values where the created field is after or equal to this timestamp.
     *                          - lt: Return values where the created field is before this timestamp.
     *                          - lte: Return values where the created field is before or equal to this timestamp.
     *
     * @param ending_before - A cursor for use in pagination. ending_before is an object ID that defines your place in the list
     * @param limit - between 1 and 100.  Default is 10
     * @param starting_after - A cursor for use in pagination. starting_after is an object ID that defines your place in the list.
     * @param type - A string containing a specific event name, or group of events using * as a wildcard.
     * @param accessToken
     * @param fn
     */
    listEvents: function(created, ending_before, limit, starting_after, type, accessToken, fn) {
        var self = this;
        self.log.debug('>> listEvents');
        var apiToken = self.delegateStripe(accessToken);
        var params = {};
        if(created) {params.created = created;}
        if(ending_before) {params.ending_before = ending_before;}
        if(limit && (limit > 0 || limit <=100)) {params.limit = limit;}
        if(starting_after) {params.starting_after = starting_after;}
        if(type) {params.type = type;}

        stripe.events.list(params, apiToken, function(err, events) {
            if(err) {
                self.log.error('error: ' + err);
                return fn(err, charges);
            }
            self.log.debug('<< listEvents');
            return fn(err, events);
        });

    },

    delegateStripe: function(accessToken) {
        var self = this;
        if(accessToken && accessToken.length > 0) {
            self.log.debug('delegating stripe to ' + accessToken);
            return accessToken;
        } else {
            //no accessToken, no delegation.
            return stripeConfigs.STRIPE_SECRET_KEY;
        }
    }


};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.StripeDao = dao;

module.exports = dao;