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
var subscriptionDao = require('./subscription.dao.js');
var paymentDao = require('./payment.dao.js');

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
                                       metadata, accountId, contactId, accessToken, fn) {
        var self = this;
        self.log.debug('>> createStripeSubscription');
        var params = {};
        params.planId = planId;
        if(coupon && coupon.length>0) {params.coupon = coupon;}
        if(trial_end && trial_end.length>0){params.trial_end = trial_end;}
        if(card) {params.card = card;}
        if(quantity && quantity.length > 0) {params.quantity = quantity;}
        if(application_fee_percent && application_fee_percent.length>0) {params.application_fee_percent = application_fee_percent;}
        if(metadata) {params.metadata = metadata;} else {params.metadata = {};}
        params.metadata.accountId = accountId;

        if(accessToken && accessToken.length > 0) {
            stripe.customers.createSubscription(customerId, params, accessToken, function(err, subscription) {
                    if(err) {
                        self.log.error('error: ' + err);
                        return fn(err, subscription);
                    }
                    //create subscription record...NEED accountId and contactId
                    var sub = new $$.m.Subscription({
                        accountId: accountId,
                        contactId: contactId,
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
        } else {
            stripe.customers.createSubscription(customerId, params, function(err, subscription) {
                    if(err) {
                        self.log.error('error: ' + err);
                        return fn(err, subscription);
                    }
                    //create subscription record...NEED accountId and contactId
                    var sub = new $$.m.Subscription({
                        accountId: accountId,
                        contactId: contactId,
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
        }
    },

    getStripeSubscription: function(customerId, subscriptionId, accessToken, fn) {
        var self = this;
        self.log.debug('>> getStripeSubscription');
        if(accessToken && accessToken.length>0) {
            stripe.customers.retrieveSubscription( customerId, subscriptionId, accessToken,
                function(err, subscription) {
                    if(err) {
                        self.log.error('error: ' + err);
                        return fn(err, subscription);
                    }
                    self.log.debug('<< getStripeSubscription');
                    return fn(err, subscription);
                }
            );
        } else {
            stripe.customers.retrieveSubscription( customerId, subscriptionId,
                function(err, subscription) {
                    if(err) {
                        self.log.error('error: ' + err);
                        return fn(err, subscription);
                    }
                    self.log.debug('<< getStripeSubscription');
                    return fn(err, subscription);
                }
            );
        }

    },

    updateStripeSubscription: function(customerId, subscriptionId, planId, coupon, prorate, trial_end, card, quantity,
                                       application_fee_percent, metadata, accessToken, fn) {
        var self = this;
        self.log.debug('>> updateStripeSubscription');
        var params = {};
        var updateLocal = false;
        if(planId && planId.length>0){params.planId = planId; updateLocal=true;}
        if(coupon && coupon.length>0) {params.coupon = coupon;}
        if(trial_end && trial_end.length>0){params.trial_end = trial_end;}
        if(card) {params.card = card;}
        if(quantity && quantity.length > 0) {params.quantity = quantity;}
        if(application_fee_percent && application_fee_percent.length>0) {params.application_fee_percent = application_fee_percent;}
        if(metadata) {params.metadata = metadata;}

        if(accessToken && accessToken.length>0) {
            stripe.customers.updateSubscription( customerId, subscriptionId, params, accessToken,
                function(err, subscription) {
                    if(err) {
                        self.log.error('error: ' + err);
                        return fn(err, subscription);
                    }
                    subscriptionDao.getSubscriptionByAccountAndId(accountId, subscriptionId, function(err, sub){
                        if(err) {
                            self.log.error('error: ' + err);
                            return fn(err, subscription);
                        }
                        sub.set('planId', planId);
                        subscriptionDao.saveOrUpdate(sub, function(err, sub){
                            if(err) {
                                self.log.error('error: ' + err);
                                return fn(err, subscription);
                            }
                            self.log.debug('<< updateStripeSubscription');
                            return fn(err, subscription);
                        });
                    });
                }
            );
        } else {
            stripe.customers.updateSubscription( customerId, subscriptionId, params,
                function(err, subscription) {
                    if(err) {
                        self.log.error('error: ' + err);
                        return fn(err, subscription);
                    }
                    self.log.debug('<< updateStripeSubscription');
                    return fn(err, subscription);
                }
            );
        }

    },

    /**
     * Cancels the subscription in Stripe and updates the local record of it.
     * Can be cancelled immediately or at the end of the the current period
     * @param customerId
     * @param subscriptionId
     * @param at_period_end     Boolean defaults to false.
     * @param accessToken
     * @param fn
     */
    cancelStripeSubscription: function(customerId, subscriptionId, at_period_end, accessToken, fn) {
        var self = this;
        self.log.debug('>> updateStripeSubscription');
        var params = {};
        if(at_period_end === true) {
            params.at_period_end = true;
        }
        if(accessToken && accessToken.length > 0) {
            //TODO: handle connect
        } else {
            stripe.customers.cancelSubscription(customerId, subscriptionId, params, function(err, confirmation) {
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
        }
    },

    /**
     * Lists all subscriptions for a Stripe customer.  *Note* This may return subscriptions for multiple accounts.
     * Care should be taken to filter out non-relevant subs.  Additionally, a limit may be applied to limit the number
     * of results.  If it is not specified, the default (from Stripe) of 10 is applied.  If the limit is set to 0,
     * all results will be returned.
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
        stripe.customers.listCards('cu_104IiK4tCaXTUYFG4OC3wcV2', function(err, cards) {
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
                                 statement_description, receipt_email, application_fee, accessToken, fn) {
        var self = this;
        self.log.debug('>> createStripeCharge');
        var paymentId = $$.u.idutils.generateUUID();//create the id for the local object
        var stripe_bkup = null;
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

        if(accessToken && accessToken.length > 0) {
            self.log.debug('delegating stripe to ' + accessToken);
            stripe_bkup = stripe;
            stripe = require("stripe")( accessToken);
        }

        stripe.charges.create(params, function(err, charge) {
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
                failure_code: charge.failure_code,
                failure_message: charge.failure_message,
                invoiceId: charge.invoice,
                _id:paymentId

            });
            paymentDao.saveOrUpdate(payment, $$.m.Payment, function(err, payment){
                if(err) {
                    self.log.error('error creating payment record for charge: ' + err);
                    return fn(err, charge);
                }
                self.log.debug('<< createStripeCharge');
                var result = {charge: charge, payment: payment};
                return fn(err, result);
            });

        });

        if(stripe_bkup) {
            self.log.debug('undelegating stripe');
            stripe = stripe_bkup;
            stripe_bkup = null;
        }

    },

    getStripeCharge: function(chargeId, accessToken, fn) {
        var self = this;
        self.log.debug('>> getStripeCharge');
        var stripe_bkup = null;

        if(accessToken && accessToken.length > 0) {
            self.log.debug('delegating stripe to ' + accessToken);
            stripe_bkup = stripe;
            stripe = require("stripe")( accessToken);
        }

        stripe.charges.retrieve(chargeId, function(err, charge) {
                if(err) {
                    self.log.error('error: ' + err);
                    return fn(err, charge);
                }
                self.log.debug('<< getStripeCharge');
                return fn(err, charge);
            }
        );
        if(stripe_bkup) {
            self.log.debug('undelegating stripe');
            stripe = stripe_bkup;
            stripe_bkup = null;
        }
    },

    updateStripeCharge: function(chargeId, description, metadata, accessToken, fn) {
        var self = this;
        self.log.debug('>> getStripeCharge');
        var stripe_bkup = null;
        var params = {};

        if(description && description.length>0) {params.description = description;}
        if(metadata) {params.metadata = metadata;}

        if(accessToken && accessToken.length > 0) {
            self.log.debug('delegating stripe to ' + accessToken);
            stripe_bkup = stripe;
            stripe = require("stripe")( accessToken);
        }

        stripe.charges.update( chargeId, params,  function(err, charge) {
                if(err) {
                    self.log.error('error: ' + err);
                    return fn(err, charge);
                }
                self.log.debug('<< updateStripeCharge');
                return fn(err, charge);
            }
        );

        if(stripe_bkup) {
            self.log.debug('undelegating stripe');
            stripe = stripe_bkup;
            stripe_bkup = null;
        }
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
        var stripe_bkup = null;
        var params = {};
        if(amount) {params.amount = amount;}
        if(application_fee) {params.application_fee = application_fee;}
        if(receipt_email && receipt_email.length>0) {params.receipt_email = receipt_email;}


        if(accessToken && accessToken.length > 0) {
            self.log.debug('delegating stripe to ' + accessToken);
            stripe_bkup = stripe;
            stripe = require("stripe")( accessToken);
        }

        stripe.charges.capture(chargeId, params, function(err, charge) {
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

        if(stripe_bkup) {
            self.log.debug('undelegating stripe');
            stripe = stripe_bkup;
            stripe_bkup = null;
        }

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
        var stripe_bkup = null;
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

        if(accessToken && accessToken.length > 0) {
            self.log.debug('delegating stripe to ' + accessToken);
            stripe_bkup = stripe;
            stripe = require("stripe")( accessToken);
        }

        stripe.charges.list(params, function(err, charges) {
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
                self._getAllStripeCharges(params, _charges, require("stripe")( accessToken), p1);
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

        if(stripe_bkup) {
            self.log.debug('undelegating stripe');
            stripe = stripe_bkup;
            stripe_bkup = null;
        }
    },

    _getAllStripeCharges: function(params, _charges, delegatedStripe, deferred) {
        self.log.debug('>> _getAllStripeCharges ... adding more charges.');
        delegatedStripe.charges.list(params, function(err, charges) {
            if (err) {
                self.log.error('error: ' + err);
                deferred.reject();
                return deferred.promise;
            }

            _charges.push(charges.data);
            if(charges.has_more === true) {
                params.starting_after = charges.data[charges.data.length-1].id;
                self._getAllStripeCharges(params, _charges, delegatedStripe, deferred);
            } else {
                //we're done.
                deferred.resolve();
                self.log.debug('<< _getAllStripeCharges returning.');
                return deferred.promise;
            }
        });
        return deferred.promise;
    }

    //invoice items

    //invoices

    //coupons

    //discounts

    //tokens

    //events

};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.StripeDao = dao;

module.exports = dao;