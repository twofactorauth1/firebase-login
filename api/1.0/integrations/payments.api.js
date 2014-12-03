/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../../base.api.js');
var stripeDao = require('../../../payments/dao/stripe.dao.js');
var userDao = require('../../../dao/user.dao.js');
var customerLinkDao = require('../../../payments/dao/customer_link.dao.js');
var stripeEventHandler = require('../../../payments/stripe.event.handler.js');
var appConfig = require('../../../configs/app.config');
var accountDao = require('../../../dao/account.dao');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "integrations/payments",

    dao: stripeDao,



    initialize: function () {

        //Customers
        app.get(this.url('customers'), this.isAuthApi, this.listCustomers.bind(this));
        app.get(this.url('customers/:id'), this.isAuthApi, this.getCustomer.bind(this));
        app.post(this.url('customers'), this.isAuthApi, this.createCustomer.bind(this));
        app.post(this.url('customers/:id'), this.isAuthApi, this.updateCustomer.bind(this));
        app.delete(this.url('customers/:id'), this.isAuthApi, this.deleteCustomer.bind(this));

        //Plans
        app.get(this.url('plans'), this.setup, this.listPlans.bind(this));
        app.get(this.url('plans/:id'), this.setup, this.getPlan.bind(this));
        app.post(this.url('plans'), this.isAuthApi, this.createPlan.bind(this));
        app.post(this.url('plans/:id'), this.isAuthApi, this.updatePlan.bind(this));
        app.delete(this.url('plans/:id'), this.isAuthApi, this.deletePlan.bind(this));

        //Subscriptions
        app.get(this.url('customers/:id/subscriptions'), this.isAuthApi, this.listSubscriptions.bind(this));
        app.post(this.url('customers/:id/subscriptions'), this.isAuthApi, this.createSubscription.bind(this));
        app.post(this.url('customers/:id/subscriptions/:subId'), this.isAuthApi, this.updateSubscription.bind(this));
        app.get(this.url('customers/:id/subscriptions/:subId'), this.isAuthApi, this.getSubscription.bind(this));
        app.delete(this.url('customers/:id/subscriptions/:subId'), this.isAuthApi, this.cancelSubscription.bind(this));


        //Cards
        app.put(this.url('customers/:id/cards/:cardToken'), this.isAuthApi, this.createCard.bind(this));
        app.get(this.url('customers/:id/cards/:cardId'), this.isAuthApi, this.getCard.bind(this));
        app.post(this.url('customers/:id/cards/:cardId'), this.isAuthApi, this.updateCard.bind(this));
        app.get(this.url('customers/:id/cards'), this.isAuthApi, this.listCards.bind(this));
        app.delete(this.url('customers/:id/cards/:cardId'), this.isAuthApi, this.deleteCard.bind(this));

        //Charges - CRUL & Capture
        app.get(this.url('charges'), this.isAuthApi, this.listCharges.bind(this));
        app.get(this.url('charges/:chargeId'), this.isAuthApi, this.getCharge.bind(this));
        app.post(this.url('charges'), this.isAuthApi, this.createCharge.bind(this));
        app.post(this.url('charges/:chargeId'), this.isAuthApi, this.updateCharge.bind(this));
        app.post(this.url('charges/:chargeId/capture'), this.isAuthApi, this.captureCharge.bind(this));

        //InvoiceItems - CRUDL
        app.post(this.url('customers/:id/invoiceItems'), this.isAuthApi, this.createInvoiceItem.bind(this));
        app.get(this.url('customers/:id/invoiceItems'), this.isAuthApi, this.listInvoiceItems.bind(this));
        app.get(this.url('customers/:id/invoiceItems/:itemId'), this.isAuthApi, this.getInvoiceItem.bind(this));
        app.post(this.url('customers/:id/invoiceItems/:itemId'), this.isAuthApi, this.updateInvoiceItem.bind(this));
        app.delete(this.url('customers/:id/invoiceItems/:itemId'), this.isAuthApi, this.deleteInvoiceItem.bind(this));

        //Invoices - CRUL & getUpcoming & pay
        app.post(this.url('customers/:id/invoices'), this.isAuthApi, this.createInvoice.bind(this));
        app.get(this.url('customers/:id/invoices/:invoiceId'), this.isAuthApi, this.getInvoice.bind(this));
        app.get(this.url('customers/:id/upcomingInvoice'), this.isAuthApi, this.getUpcomingInvoice.bind(this));
        app.post(this.url('customers/:id/invoices/:invoiceId'), this.isAuthApi, this.updateInvoice.bind(this));
        app.get(this.url('customers/all/invoices'), this.isAuthApi, this.listAllInvoices.bind(this));
        app.get(this.url('customers/:id/invoices'), this.isAuthApi, this.listInvoices.bind(this));

        app.post(this.url('customers/:id/invoices/:invoiceId/pay'), this.isAuthApi, this.payInvoice.bind(this));

        //Special operations for main account
        app.get(this.url('upcomingInvoice'), this.isAuthApi, this.getMyUpcomingInvoice.bind(this));
        app.get(this.url('invoices'), this.isAuthApi, this.getMyInvoices.bind(this));
        app.get(this.url('account/invoices'), this.isAuthApi, this.getInvoicesForAccount.bind(this));
        app.get(this.url('indigenous/plans'), this.listIndigenousPlans.bind(this));
        app.post(this.url('indigenous/plans/:planId/subscribe'), this.subscribeToIndigenous.bind(this));

        //Coupons
        //Discounts

        //Tokens - CG
        app.post(this.url('customers/:id/cards/:cardId'), this.isAuthApi, this.createToken.bind(this));
        app.get(this.url('tokens/:id'), this.isAuthApi, this.getToken.bind(this));

        //Events - GL
        app.get(this.url('events/:id'), this.isAuthApi, this.getEvent.bind(this));
        app.get(this.url('events'), this.isAuthApi, this.listEvents.bind(this));

        // ------------------------------------------------
        //  Webhook
        // ------------------------------------------------
        app.post('stripe/webhook', this.verifyEvent.bind(this), this.handleEvent.bind(this));

    },

    listIndigenousPlans: function(req, resp) {
        var self = this;
        self.log.debug('>> listIndigenousPlans');
        stripeDao.listStripePlans(null, function(err, value){
            self.log.debug('<< listIndigenousPlans');
            return self.sendResultOrError(resp, err, value, "Error listing Stripe Plans");
        });

    },

    /**
     * This method creates a subscription to an indigenous plan, and then updates the account billing information
     * @param req
     * @param resp
     */
    subscribeToIndigenous: function(req, resp) {
        var self = this;
        self.log.debug('>> subscribeToIndigenous');

        var customerId = req.body.customerId; //REQUIRED
        var planId = req.params.planId;//REQUIRED
        var coupon = req.body.coupon;
        var trial_end = req.body.trial_end;
        var card = req.body.card;//this will overwrite customer default card if specified
        var quantity = req.body.quanity;
        var application_fee_percent = req.body.application_fee_percent;
        var metadata = req.body.metadata;
        var accountId = parseInt(req.body.accountId) || parseInt(self.accountId(req));//REQUIRED
        var contactId = req.body.contactId;
        var userId = req.userId;

        if(!planId || planId.length < 1) {
            return self.wrapError(resp, 400, null, "Invalid planId parameter.");
        }

        if(!customerId || customerId.length < 1) {
            return self.wrapError(resp, 400, null, "Invalid customerId parameter.");
        }

        if(!accountId || accountId===0) {
            return self.wrapError(resp, 400, null, 'Invalid accountId parameter');
        }

        stripeDao.createStripeSubscription(customerId, planId, coupon, trial_end, card, quantity,
            application_fee_percent, metadata, accountId, contactId, userId, null, function(err, value){
                if(err) {
                    self.log.error('Error subscribing to Indigenous: ' + err);
                    return self.sendResultOrError(resp, err, value, 'Error creating subscription');
                } else {
                    self.sm.addBillingInfoToAccount(accountId, customerId, value.id, planId, userId, function(err, subPrivs){
                        if(err) {
                            self.log.error('Error adding billing info to account: ' + err);
                            return self.sendResultOrError(resp, err, value, 'Error creating subscription');
                        }
                        self.log.debug('<< subscribeToIndigenous');
                        return self.sendResultOrError(resp, err, value, "Error creating subscription");
                    });
                }

            });
    },

    listCustomers: function(req, resp) {

        var self = this;
        var accountId = self.accountId(req);
        var limit = req.body.limit;

        self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                stripeDao.listStripeCustomers(accountId, limit, function(err, customers){


                    if(accountId > 0) {//TODO: fix this logic.  We no longer assume mainAccountId === 0
//                        customerLinkDao.getLinksByAccountId(accountId, function(err, accounts){
//                            if(err) {
//                                self.wrapError(resp, null, 500, 'Error building customer list.');
//                            }
//                            //verify customer/account relationship
//                            var customerIDs = _.map(accounts, function(account){return account.get('customerId');});
//                            var results = [];
//                            if(customers && customers.data) {
//                                _.each(customers.data, function(elem){
//                                    if(_.contains(customerIDs, elem.id)) {
//                                        results.push(elem);
//                                    }
//                                });
//                            }
//
//                            self.log.debug('<< listCustomers');
//                            self.sendResultOrError(resp, err, results, "Error listing Stripe Customers");
//                        });
                            self.sendResultOrError(resp, err, customers.data, "Error listing Stripe Customers");

                    } else {
                        //accountId ==0; return ALL customers
                        self.log.debug('<< listCustomers');
                        self.sendResultOrError(resp, err, customers.data, "Error listing Stripe Customers");
                    }

                });

            }
        });



    },

    getCustomer: function(req, resp) {
        var self = this;
        self.log.debug('>> getCustomer');
        var customerId = req.params.id;
        var accountId = self.accountId(req);

        self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var p1 = $.Deferred();
                customerLinkDao.getLinkByAccountAndCustomer(accountId, customerId, function(err, link){
                    if(err) {
                        p1.reject();
                        self.sendResultOrError(resp, err, null, "Error validating customerId.");
                    }
                    //a result here means this is a valid customer/account link.
                    p1.resolve(link);
                });

                $.when(p1).done(function(){
                    stripeDao.getStripeCustomer(customerId, function(err, value){
                        self.log.debug('<< getCustomer');
                        self.sendResultOrError(resp, err, value, "Error retrieving Stripe Customer");
                    });
                });
            }
        });



    },

    createCustomer: function(req, resp) {
        var self = this;
        self.log.debug('>> createCustomer');


        var cardToken = req.body.cardToken;
        var contact = req.body.contact;

        if(contact) {
            contact = new $$.m.Contact(contact);
        }

        var user = req.body.user || req.user;

        if(req.body.user) {
            self.log.debug('>> user is obj');
            user = new $$.m.User(user);
        }

        var _accountId = req.body.accountId || self.accountId(req);

        self.checkPermissionForAccountAndUser(user.id(), _accountId, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                //validate arguments
                if(!cardToken && cardToken.length ===0) {
                    return this.wrapError(resp, 400, null, "Invalid parameter for cardToken.");
                }
                if (!contact && !user) {
                    return this.wrapError(resp, 400, null, "Must have either contact or user");
                }
                if(contact && contact.stripeId && contact.stripeId.length > 0) {
                    return this.wrapError(resp, 409, null, "Customer already exists.");
                }

                if(contact) {
                    stripeDao.createStripeCustomer(cardToken, contact, _accountId, function(err, value){
                        self.log.debug('<< createCustomer');
                        self.sendResultOrError(resp, err, value, "Error creating Stripe Customer");
                        self = value = null;
                    });
                } else {
                    stripeDao.createStripeCustomerForUser(cardToken, user, _accountId, function(err, value){
                        self.log.debug('<< createCustomer');
                        self.sendResultOrError(resp, err, value, "Error creating Stripe Customer");
                    });
                }
            }
        });


    },

    updateCustomer: function(req, resp) {
        var self = this;
        self.log.debug('>> updateCustomer');
        //var accountId = parseInt(self.accountId(req));

        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var hasUpdates = false;
                var customerId = req.params.id;
                var params = {};

                if(!customerId || customerId.length ===0) {
                    return this.wrapError(resp, 400, null, "Invalid parameter for customerId.");
                }
                if(req.body.account_balance) {
                    params.account_balance = req.body.account_balance;
                    hasUpdates = true;
                }
                if(req.body.cardToken) {
                    params.cardToken = req.body.cardToken;
                    hasUpdates = true;
                }
                if(req.body.coupon) {
                    params.coupon = req.body.coupon;
                    hasUpdates = true;
                }
                if(req.body.default_card) {
                    params.default_card = req.body.default_card;
                    hasUpdates = true;
                }
                if(req.body.description) {
                    params.description = req.body.description;
                    hasUpdates = true;
                }
                if(req.body.email) {
                    params.email = req.body.email;
                    hasUpdates = true;
                }
                if(req.body.metadata) {
                    params.metadata = req.body.metadata;
                    hasUpdates = true;
                }
                if(hasUpdates!==true) {
                    return this.wrapError(resp, 400, null, "Invalid parameters for updateCustomer.");
                }

                stripeDao.updateStripeCustomer(customerId, params.account_balance, params.cardToken, params.coupon, params.default_card,
                    params.description, params.email, params.metadata, function(err, value){
                        self.log.debug('<< updateCustomer');
                        return self.sendResultOrError(resp, err, value, "Error updating Stripe Customer");
                    });

            }
        });


    },

    /**
     * This will remove the customer from the account UNLESS we are in the main account... then it will delete the
     * customer information from Stripe.
     * @param req
     * @param resp
     */
    deleteCustomer: function(req, resp) {
        var self = this;
        self.log.debug('>> deleteCustomer');

        var accountId = self.accountId(req);

        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var customerId = req.params.id;
                if(accountId > 0) {
                    customerLinkDao.removeLinkByAccountAndCustomer(accountId, customerId, function(err, value){
                        self.log.debug('<< deleteCustomer');
                        self.sendResultOrError(resp, err, value, "Error removing Stripe Customer");
                    });
                } else {
                    var contactId = req.body.contactId;
                    var userId = req.body.userId;

                    //delete Stripe Customer AND all links
                    stripeDao.deleteStripeCustomer(customerId, contactId, userId, function(err, value){
                        if(err) {
                            self.log.error('Error deleting customer from Stripe: ' + err);
                            return self.wrapError(resp, null, 500, 'Error removing Stripe Customer');
                        }
                        customerLinkDao.removeLinksByCustomer(customerId, function(err, value){
                            self.log.debug('<< deleteCustomer');
                            return self.sendResultOrError(resp, err, value, "Error removing Stripe Customer");
                        });
                    });
                }
            }
        });


    },

    listPlans: function(req, resp) {
        var self = this;
        self.log.debug('>> listPlans');
        var accountId = parseInt(self.accountId(req));

        self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accessToken = self._getAccessToken(req);
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }
                stripeDao.listStripePlans(accessToken, function(err, value){
                    self.log.debug('<< listPlans');
                    return self.sendResultOrError(resp, err, value, "Error listing Stripe Plans");
                });
            }
        });

    },

    getPlan: function(req, resp) {
        var self = this;
        self.log.debug('>> getPlan');
        var accountId = parseInt(self.accountId(req));

        self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var planId = req.params.id;
                var accessToken = self._getAccessToken(req);
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }
                stripeDao.getStripePlan(planId, accessToken, function(err, value){
                    self.log.debug('<< getPlan');
                    return self.sendResultOrError(resp, err, value, "Error retrieving Stripe Plan");
                });
            }
        });

    },

    createPlan: function(req, resp) {

        var self = this;
        self.log.debug('>> createPlan');
        var accountId = parseInt(self.accountId(req));

        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accessToken = self._getAccessToken(req);
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }

                var planId = req.body.planId;
                var amount = req.body.amount;
                var currency = req.body.currency || 'usd';
                var interval = req.body.interval;
                var interval_count = req.body.interval_count;
                var name = req.body.name;
                var trial_period_days = req.body.trial_period_days;
                var metadata = req.body.metadata;
                var statement_description = req.body.statement_description;

                //validate params
                if(!planId || planId.length < 1) {
                    return self.wrapError(resp, 400, null, "Invalid parameter for planId.");
                }
                if(!amount) {
                    return self.wrapError(resp, 400, null, "Invalid parameter for amount.");
                }
                if(!currency || currency.length<1) {
                    return self.wrapError(resp, 400, null, "Invalid parameter for currency.");
                }
                if(!interval || !_.contains(['week', 'month', 'year'], interval)) {
                    return self.wrapError(resp, 400, null, "Invalid parameter for interval.");
                }
                if(!name || name.length<1) {
                    return self.wrapError(resp, 400, null, "Invalid parameter for name.");
                }

                stripeDao.createStripePlan(planId, amount, currency, interval, interval_count, name, trial_period_days, metadata,
                    statement_description, accessToken, function(err, value){
                        self.log.debug('<< createPlan');
                        return self.sendResultOrError(resp, err, value, "Error creating Stripe Plan");
                    });
            }
        });

    },

    updatePlan: function(req, resp) {

        var self = this;
        self.log.debug('>> updatePlan');
        var accountId = parseInt(self.accountId(req));

        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accessToken = self._getAccessToken(req);
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }
                //validate params
                var needsUpdate = false;
                var planId = req.params.id;//REQUIRED
                var name = req.body.name;
                var metadata = req.body.metadata;
                var statement_description = req.body.statement_description;
                if(!planId || planId.length < 1) {
                    return self.wrapError(resp, 400, null, "Invalid planId parameter.");
                }
                if(name || metadata || statement_description) {
                    needsUpdate = true;
                } else {
                    return self.wrapError(resp, 400, null, "Invalid update parameters.");
                }

                stripeDao.updateStripePlan(planId, name, metadata, statement_description, accessToken, function(err, value){
                    self.log.debug('<< updatePlan');
                    return self.sendResultOrError(resp, err, value, "Error updating Stripe Plan");
                });
            }
        });

    },

    deletePlan: function(req, resp) {

        var self = this;
        self.log.debug('>> deletePlan');
        var accountId = parseInt(self.accountId(req));

        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accessToken = self._getAccessToken(req);
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }
                //validate params
                var planId = req.params.id;//REQUIRED
                if(!planId || planId.length < 1) {
                    return self.wrapError(resp, 400, null, "Invalid planId parameter.");
                }

                stripeDao.deleteStripePlan(planId, accessToken, function(err, value){
                    self.log.debug('<< deletePlan');
                    return self.sendResultOrError(resp, err, value, "Error updating Stripe Plan");
                });
            }
        });

    },

    listSubscriptions: function(req, resp) {

        var self = this;
        self.log.debug('>> listSubscriptions');
        var accountId = parseInt(self.accountId(req));

        var accessToken = self._getAccessToken(req);
        if(accessToken === null && accountId != appConfig.mainAccountID) {
            return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
        }
        var customerId = req.params.id;
        var limit = req.body.limit;

        stripeDao.listStripeSubscriptions(customerId, limit, function(err, value){

            self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed) {
                if (isAllowed !== true) {
                    return self.send403(resp);
                } else {
                    //TODO: get accountId from subs
                    self.log.debug('<< listSubscriptions');
                    return self.sendResultOrError(resp, err, value, "Error listing subscriptions");
                }
            });

        });
    },

    createSubscription: function(req, resp) {

        var self = this;
        self.log.debug('>> createSubscription');

        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accessToken = self._getAccessToken(req);
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }
                var customerId = req.params.id;
                var planId = req.body.plan;//REQUIRED
                var coupon = req.body.coupon;
                var trial_end = req.body.trial_end;
                var card = req.body.card;//this will overwrite customer default card if specified
                var quantity = req.body.quanity;
                var application_fee_percent = req.body.application_fee_percent;
                var metadata = req.body.metadata;
                var accountId = parseInt(self.accountId(req));
                var contactId = req.body.contactId;
                var userId = req.userId;

                if(!planId || planId.length < 1) {
                    return self.wrapError(resp, 400, null, "Invalid planId parameter.");
                }

                stripeDao.createStripeSubscription(customerId, planId, coupon, trial_end, card, quantity,
                    application_fee_percent, metadata, accountId, contactId, userId, accessToken, function(err, value){
                        self.log.debug('<< createSubscription');
                        if(!err) {
                            self.sm.addSubscriptionToAccount(accountId, value.id, planId, userId, function(err, value){
                                if(err){
                                    self.log.error('Error adding subscription to account: ' + err);
                                }
                            });
                        }
                        return self.sendResultOrError(resp, err, value, "Error creating subscription");
                    });
            }
        });


    },

    getSubscription: function(req, resp) {

        var self = this;
        self.log.debug('>> getSubscription');
        var accountId = parseInt(self.accountId(req));
        var accessToken = self._getAccessToken(req);
        if(accessToken === null && accountId != appConfig.mainAccountID) {
            return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
        }
        var customerId = req.params.id;
        var subscriptionId = req.params.subId;
        self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                stripeDao.getStripeSubscription(customerId, subscriptionId, accessToken, function(err, value){
                    self.log.debug('<< getSubscription');
                    return self.sendResultOrError(resp, err, value, "Error retrieving subscription");
                });
            }
        });


    },

    updateSubscription: function(req, resp) {

        var self = this;
        self.log.debug('>> updateSubscription');
        var accountId = parseInt(self.accountId(req));
        var accessToken = self._getAccessToken(req);
        if(accessToken === null && accountId != appConfig.mainAccountID) {
            return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
        }
        var customerId = req.params.id;
        var subscriptionId = req.params.subId;

        var planId = req.body.planId;
        var coupon = req.body.coupon;
        var prorate = req.body.prorate;
        var trial_end = req.body.trial_end;
        var card = req.body.card;
        var quantity = req.body.quantity;
        var application_fee_percent = req.body.application_fee_percent;
        var metadata = req.body.metadata;

        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                stripeDao.updateStripeSubscription(customerId, subscriptionId, planId, coupon, prorate, trial_end, card,
                    quantity, application_fee_percent, metadata, accessToken, function(err, value){
                        self.log.debug('<< updateSubscription');
                        return self.sendResultOrError(resp, err, value, "Error updating subscription");
                    });
            }
        });

    },

    cancelSubscription: function(req, resp) {

        var self = this;
        self.log.debug('>> cancelSubscription');
        var accountId = parseInt(self.accountId(req));
        var accessToken = self._getAccessToken(req);
        if(accessToken === null && accountId != appConfig.mainAccountID) {
            return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
        }
        var customerId = req.params.id;
        var subscriptionId = req.params.subId;
        var at_period_end = req.body.at_period_end;

        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                stripeDao.cancelStripeSubscription(accountId, customerId, subscriptionId, at_period_end, accessToken, function(err, value){
                    self.log.debug('<< cancelSubscription');
                    return self.sendResultOrError(resp, err, value, "Error cancelling subscription");
                });
            }
        });

    },

    createCard: function(req, resp) {

        var self = this;
        self.log.debug('>> createCard');
        var accountId = parseInt(self.accountId(req));
        var accessToken = self._getAccessToken(req);
        if(accessToken === null && accountId != appConfig.mainAccountID) {
            return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
        }
        var customerId = req.params.id;

        var cardToken = req.params.cardToken;
        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                if(!cardToken || cardToken.length < 1) {
                    return self.wrapError(resp, 400, null, "Invalid cardToken parameter.");
                }
                stripeDao.createStripeCard(customerId, cardToken, function(err, value){
                    self.log.debug('<< createCard');
                    return self.sendResultOrError(resp, err, value, "Error creating card");
                });
            }
        });

    },

    getCard: function(req, resp) {

        var self = this;
        self.log.debug('>> getCard');
        var accountId = parseInt(self.accountId(req));
        var accessToken = self._getAccessToken(req);
        if(accessToken === null && accountId != appConfig.mainAccountID) {
            return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
        }
        var customerId = req.params.id;
        var cardId = req.params.cardId;

        self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                stripeDao.getStripeCard(customerId, cardId, function(err, value){
                    self.log.debug('<< getCard');
                    return self.sendResultOrError(resp, err, value, "Error creating card");
                });
            }
        });


    },

    updateCard: function(req, resp) {
        var self = this;
        self.log.debug('>> updateCard');
        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accountId = parseInt(self.accountId(req));
                var accessToken = self._getAccessToken(req);
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }
                var customerId = req.params.id;
                var cardId = req.params.cardId;

                var isUpdated = false;
                var name = req.body.name;
                var address_city = req.body.address_city;
                var address_country = req.body.address_country;
                var address_line1 = req.body.address_line1;
                var address_line2 = req.body.address_line2;
                var address_state = req.body.address_state;
                var address_zip = req.body.address_zip;
                var exp_month = req.body.exp_month;
                var exp_year = req.body.exp_year;

                //check that we have at least one parameter to update
                if(name || address_city || address_country || address_line1 || address_line2 || address_state || address_zip
                    || exp_month || exp_year) {
                    isUpdated = true;//in case we need to do anything else here
                } else {
                    self.log.error('No parameters passed to updateCard.');
                    return self.wrapError(resp, 400, null, "Invalid card parameters.");
                }

                stripeDao.updateStripeCard(customerId, cardId, name, address_city, address_country, address_line1,
                    address_line2, address_state, address_zip, exp_month, exp_year, function(err, value){
                        self.log.debug('<< updateCard');
                        return self.sendResultOrError(resp, err, value, "Error updating card");
                });
            }
        });

    },

    listCards: function(req, resp) {

        var self = this;
        self.log.debug('>> listCards');
        self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accountId = parseInt(self.accountId(req));
                var accessToken = self._getAccessToken(req);
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }
                var customerId = req.params.id;

                stripeDao.listStripeCards(customerId, function(err, value){
                    self.log.debug('<< listCards');
                    return self.sendResultOrError(resp, err, value, "Error listing cards");
                });
            }
        });

    },

    deleteCard: function(req, resp) {

        var self = this;
        self.log.debug('>> deleteCard');
        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accountId = parseInt(self.accountId(req));
                var accessToken = self._getAccessToken(req);
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }
                var customerId = req.params.id;
                var cardId = req.params.cardId;

                stripeDao.deleteStripeCard(customerId, cardId, function(err, value){
                    self.log.debug('<< deleteCard');
                    return self.sendResultOrError(resp, err, value, "Error listing cards");
                });
            }
        });

    },

    //CHARGES
    listCharges: function(req, resp) {

        var self = this;
        self.log.debug('>> listCharges');
        self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accessToken = self._getAccessToken(req);
                var accountId = parseInt(self.accountId(req));
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }
                var created = req.body.created;
                var customerId = req.body.customerId;
                var ending_before = req.body.ending_before;
                var limit = req.body.limit;
                var starting_after = req.body.starting_after;

                stripeDao.listStripeCharges(created, customerId, ending_before, limit, starting_after, accessToken,
                    function(err, value){
                        self.log.debug('<< listCharges');
                        return self.sendResultOrError(resp, err, value, "Error listing charges");
                    });
            }
        });

    },

    createCharge: function(req, resp) {

        var self = this;
        self.log.debug('>> createCharge');
        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accessToken = self._getAccessToken(req);
                var accountId = parseInt(self.accountId(req));
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }
                var amount = req.body.amount;//REQUIRED
                var currency = req.body.currency || 'usd';//REQUIRED
                var card = req.body.card; //card or customer REQUIRED
                var customerId = req.body.customerId; //card or customer REQUIRED
                var contactId = req.body.contactId;//contact or user REQUIRED
                var userId = req.body.userId || req.user.id();//contact or user REQUIRED
                var description = req.body.description;
                var metadata = req.body.metadata;
                var capture = req.body.capture;
                var statement_description = req.body.statement_description;
                var receipt_email = req.body.receipt_email;
                var application_fee = req.body.application_fee;

                //validate params
                if(!amount) {
                    return self.wrapError(resp, 400, null, "Invalid amount parameter.");
                }
                if(!currency) {
                    return self.wrapError(resp, 400, null, "Invalid currency parameter.");
                }
                if(!card && !customerId) {
                    return self.wrapError(resp, 400, null, "Missing card or customer parameter.");
                }

                if(!contactId && !userId) {
                    return self.wrapError(resp, 400, null, "Invalid contact or user parameter.");
                }

                stripeDao.createStripeCharge(amount, currency, card, customerId, contactId, description, metadata, capture,
                    statement_description, receipt_email, application_fee, userId, accessToken, function(err, value){
                        self.log.debug('<< createCharge');
                        return self.sendResultOrError(resp, err, value, "Error creating a charge.");
                    });
            }
        });

    },

    getCharge: function(req, resp) {

        var self = this;
        self.log.debug('>> getCharge');
        self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accessToken = self._getAccessToken(req);
                var accountId = parseInt(self.accountId(req));
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }
                var chargeId = req.params.chargeId;

                stripeDao.getStripeCharge(chargeId, accessToken, function(err, value){
                    self.log.debug('<< getCharge');
                    return self.sendResultOrError(resp, err, value, "Error retrieving a charge.");
                });
            }
        });

    },

    updateCharge: function(req, resp) {

        var self = this;
        self.log.debug('>> updateCharge');
        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accessToken = self._getAccessToken(req);
                var accountId = parseInt(self.accountId(req));
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }
                var chargeId = req.params.chargeId;
                var description = req.body.description;
                var metadata = req.body.metadata;
                if(!description && !metadata) {
                    return self.wrapError(resp, 400, null, "Missing update parameter.");
                }

                stripeDao.updateStripeCharge(chargeId, description, metadata, accessToken, function(err, value){
                    self.log.debug('<< updateCharge');
                    return self.sendResultOrError(resp, err, value, "Error updating a charge.");
                });
            }
        });

    },

    captureCharge: function(req, resp) {
        var self = this;
        self.log.debug('>> captureCharge');
        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accessToken = self._getAccessToken(req);
                var accountId = parseInt(self.accountId(req));
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }
                var chargeId = req.params.chargeId;
                var amount = req.body.amount;
                var application_fee = req.body.application_fee;
                var receipt_email = req.body.receipt_email;

                stripeDao.captureStripeCharge(chargeId, amount, application_fee, receipt_email, accessToken,
                    function(err, value){
                        self.log.debug('<< captureCharge');
                        return self.sendResultOrError(resp, err, value, "Error capturing a charge.");
                    });
            }
        });

    },

    //INVOICE ITEMS

    createInvoiceItem: function(req, resp) {

        var self = this;
        self.log.debug('>> createInvoiceItem');
        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accessToken = self._getAccessToken(req);
                var accountId = parseInt(self.accountId(req));
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }
                var customerId = req.params.id;
                var amount = req.body.amount;//REQUIRED
                var currency = req.body.currency || 'usd';//REQUIRED
                var invoiceId = req.body.invoiceId;
                var subscriptionId = req.body.subscriptionId;
                var description = req.body.description;
                var metadata = req.body.metaata;

                if(!amount) {
                    return self.wrapError(resp, 400, null, "Missing amount parameter.");
                }
                if(!currency) {
                    return self.wrapError(resp, 400, null, "Missing currency parameter.");
                }

                stripeDao.createInvoiceItem(customerId, amount, currency, invoiceId, subscriptionId, description, metadata,
                    accessToken, function(err, value){
                        self.log.debug('<< createInvoiceItem');
                        return self.sendResultOrError(resp, err, value, "Error creating an invoice item.");
                    });
            }
        });

    },

    listInvoiceItems: function(req, resp) {

        var self = this;
        self.log.debug('>> listInvoiceItems');
        self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accessToken = self._getAccessToken(req);
                var accountId = parseInt(self.accountId(req));
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }
                var created = req.body.created;
                var customerId = req.body.customerId;
                var ending_before = req.body.ending_before;
                var limit = req.body.limit;
                var starting_after = req.body.starting_after;

                stripeDao.listInvoiceItems(created, customerId, ending_before, limit, starting_after, accessToken,
                    function(err, value){
                        self.log.debug('<< listInvoiceItems');
                        return self.sendResultOrError(resp, err, value, "Error listing invoice items.");
                    });
            }
        });

    },

    getInvoiceItem: function(req, resp) {
        var self = this;
        self.log.debug('>> getInvoiceItem');
        self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accessToken = self._getAccessToken(req);
                var accountId = parseInt(self.accountId(req));
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }
                var invoiceItemId = req.params.itemId;

                stripeDao.getInvoiceItem(invoiceItemId, accessToken, function(err, value){
                    self.log.debug('<< getInvoiceItem');
                    return self.sendResultOrError(resp, err, value, "Error retrieving invoice item.");
                });
            }
        });

    },

    updateInvoiceItem: function(req, resp) {

        var self = this;
        self.log.debug('>> getInvoiceItem');
        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accessToken = self._getAccessToken(req);
                var accountId = parseInt(self.accountId(req));
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }
                var invoiceItemId = req.params.itemId;

                var amount = req.body.amount;
                var description = req.body.description;
                var metadata = req.body.metadata;


                stripeDao.updateInvoiceItem(invoiceItemId, amount, description, metadata, accessToken, function(err, value){
                    self.log.debug('<< getInvoiceItem');
                    return self.sendResultOrError(resp, err, value, "Error retrieving invoice item.");
                });
            }
        });

    },

    deleteInvoiceItem: function(req, resp) {
        var self = this;
        self.log.debug('>> deleteInvoiceItem');
        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accessToken = self._getAccessToken(req);
                var accountId = parseInt(self.accountId(req));
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }
                var invoiceItemId = req.params.itemId;

                stripeDao.deleteInvoiceItem(invoiceItemId, accessToken, function(err, value){
                    self.log.debug('<< deleteInvoiceItem');
                    return self.sendResultOrError(resp, err, value, "Error deleting invoice item.");
                });
            }
        });

    },

    //INVOICES

    createInvoice: function(req, resp) {

        var self = this;
        self.log.debug('>> createInvoice');
        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accessToken = self._getAccessToken(req);
                var accountId = parseInt(self.accountId(req));
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }
                var customerId = req.params.id;
                var application_fee = req.body.application_fee;
                var description = req.body.description;
                var metadata = req.body.metadata;
                var statement_description = req.body.statement_description;
                var subscriptionId = req.body.subscriptionId;

                stripeDao.createInvoice(customerId, application_fee, description, metadata, statement_description,
                    subscriptionId, accessToken, function(err, value){
                        self.log.debug('<< createInvoice');
                        return self.sendResultOrError(resp, err, value, "Error creating invoice.");
                    });
            }
        });

    },

    getInvoice: function(req, resp) {

        var self = this;
        self.log.debug('>> getInvoice');
        self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accessToken = self._getAccessToken(req);
                var accountId = parseInt(self.accountId(req));
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }
                var customerId = req.params.id;
                var invoiceId = req.params.invoiceId;

                stripeDao.getInvoice(invoiceId, accessToken, function(err, value){
                    self.log.debug('<< getInvoice');
                    return self.sendResultOrError(resp, err, value, "Error retrieving invoice.");
                });
            }
        });

    },

    getUpcomingInvoice: function(req, resp) {

        var self = this;
        self.log.debug('>> getUpcomingInvoice');
        self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accessToken = self._getAccessToken(req);
                var accountId = parseInt(self.accountId(req));
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }
                var customerId = req.params.id;
                var subscriptionId = req.body.subscriptionId;

                stripeDao.getUpcomingInvoice(customerId, subscriptionId, accessToken, function(err, value){
                    self.log.debug('<< getUpcomingInvoice');
                    return self.sendResultOrError(resp, err, value, "Error retrieving upcoming invoice.");
                });
            }
        });

    },

    getMyUpcomingInvoice: function(req, resp) {
        var self = this;
        self.log.debug('>> getMyUpcomingInvoice');
        var customerId = self.customerId(req);
        var subscriptionId = req.body.subscriptionId;
        stripeDao.getUpcomingInvoice(customerId, subscriptionId, null, function(err, value){
            self.log.debug('<< getMyUpcomingInvoice');
            return self.sendResultOrError(resp, err, value, "Error retrieving upcoming invoice.");
        });
    },

    getMyInvoices: function(req, resp) {
        var self = this;
        self.log.debug('>> getMyInvoices');
        var customerId = self.customerId(req);

        var dateFilter = req.body.dateFilter;
        var ending_before = req.body.ending_before;
        var limit = req.body.limit;
        var starting_after = req.body.starting_after;

        stripeDao.listInvoices(customerId, dateFilter, ending_before, limit, starting_after, null,
            function(err, value){
                self.log.debug('<< getMyInvoices');
                return self.sendResultOrError(resp, err, value, "Error listing invoices.");
            });

    },

    getInvoicesForAccount: function(req, resp) {
        var self = this;
        self.log.debug('>> getInvoicesForAccount');
        accountDao.getAccountByHost(req.host, function(err, account){
            if(err || account==null) {
                self.log.error('Error getting account: ' + err);
                return self.wrapError(resp, 500, 'Could not find account.');
            }
            var customerId = account.get('billing').stripeCustomerId;
            if(!customerId || customerId === '') {
                self.log.error('No stripe customerId found for account: ' + account.id());
                return self.wrapError(resp, 400, 'No Stripe CustomerId found for account.');
            }
            var dateFilter = req.body.dateFilter;
            var ending_before = req.body.ending_before;
            var limit = req.body.limit;
            var starting_after = req.body.starting_after;

            stripeDao.listInvoices(customerId, dateFilter, ending_before, limit, starting_after, null,
                function(err, value){
                    self.log.debug('<< getInvoicesForAccount');
                    return self.sendResultOrError(resp, err, value, "Error listing invoices.");
                });
        });

    },

    updateInvoice: function(req, resp) {

        var self = this;
        self.log.debug('>> updateInvoice');
        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accessToken = self._getAccessToken(req);
                var accountId = parseInt(self.accountId(req));
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }
                //var customerId = req.params.id;
                var invoiceId = req.params.invoiceId;

                var application_fee = req.body.application_fee;
                var closed = req.body.closed;
                var description = req.body.description;
                var forgiven = req.body.forgiven;
                var metadata = req.body.metadata;
                var statement_description = req.body.statement_description;

                if(application_fee || closed || description || forgiven || metadata || statement_description) {
                    //at least one param was passed.  Careful about the booleans
                } else {
                    return self.wrapError(resp, 400, null, "Missing invoice parameter.");
                }

                stripeDao.updateInvoice(invoiceId, application_fee, closed, description, forgiven, metadata,
                    statement_description, accessToken, function(err, value){
                        self.log.debug('<< updateInvoice');
                        return self.sendResultOrError(resp, err, value, "Error updating invoice.");
                    });
            }
        });

    },

    listInvoices: function(req, resp) {

        var self = this;
        self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var customerId = req.params.id;
                return self._listInvoices(customerId, 'listInvoices', req, resp);
            }
        });


    },

    listAllInvoices: function(req, resp) {

        var self = this;
        self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                self._listInvoices(null, 'listAllInvoices', req, resp);
            }
        });

    },

    _listInvoices: function(customerId, methodName, req, resp) {
        var self = this;
        self.log.debug('>> ' + methodName);
        var accessToken = self._getAccessToken(req);
        var accountId = parseInt(self.accountId(req));
        if(accessToken === null && accountId != appConfig.mainAccountID) {
            return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
        }
        var dateFilter = req.body.dateFilter;
        var ending_before = req.body.ending_before;
        var limit = req.body.limit;
        var starting_after = req.body.starting_after;

        stripeDao.listInvoices(customerId, dateFilter, ending_before, limit, starting_after, accessToken,
            function(err, value){
                self.log.debug('<< ' + methodName);
                return self.sendResultOrError(resp, err, value, "Error listing invoices.");
                self = value = null;
            });
    },

    payInvoice: function(req, resp) {

        var self = this;
        self.log.debug('>> payInvoice');
        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accessToken = self._getAccessToken(req);
                var accountId = parseInt(self.accountId(req));
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }
                var customerId = req.params.id;
                var invoiceId = req.params.invoiceId;

                stripeDao.payInvoice(invoiceId, accessToken, function(err, value){
                    self.log.debug('<< payInvoice');
                    return self.sendResultOrError(resp, err, value, "Error paying invoice.");
                });
            }
        });

    },

    createToken: function(req, resp) {

        var self = this;
        self.log.debug('>> createToken');
        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accessToken = self._getAccessToken(req);
                var accountId = parseInt(self.accountId(req));
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }
                var customerId = req.params.id;
                var cardId = req.params.cardId;

                stripeDao.createToken(cardId, customerId, accessToken, function(err, value){
                    self.log.debug('<< createToken');
                    return self.sendResultOrError(resp, err, value, "Error creating token.");
                });
            }
        });

    },

    getToken: function(req, resp) {

        var self = this;
        self.log.debug('>> getToken');
        self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accessToken = self._getAccessToken(req);
                var accountId = parseInt(self.accountId(req));
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }
                var tokenId = req.params.id;

                stripeDao.getToken(tokenId, function(err, value){
                    self.log.debug('<< getToken');
                    return self.sendResultOrError(resp, err, value, "Error retrieving token.");
                });
            }
        });

    },

    getEvent: function(req, resp) {

        var self = this;
        self.log.debug('>> getEvent');
        self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accessToken = self._getAccessToken(req);
                var accountId = parseInt(self.accountId(req));
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }
                var eventId = req.params.id;

                stripeDao.getEvent(eventId, accessToken, function(err, value){
                    self.log.debug('<< getEvent');
                    return self.sendResultOrError(resp, err, value, "Error retrieving event.");
                });
            }
        });

    },

    listEvents: function(req, resp) {

        var self = this;
        self.log.debug('>> listEvents');
        self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var accessToken = self._getAccessToken(req);
                var accountId = parseInt(self.accountId(req));
                if(accessToken === null && accountId != appConfig.mainAccountID) {
                    return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                }

                var created = req.body.created;
                var ending_before = req.body.ending_before;
                var limit = req.body.limit;
                var starting_after = req.body.starting_after;
                var type = req.body.type;

                stripeDao.listEvents(created, ending_before, limit, starting_after, type, accessToken, function(err, value){
                    self.log.debug('<< listEvents');
                    return self.sendResultOrError(resp, err, value, "Error listing events.");
                });
            }
        });

    },

    verifyEvent: function(req, res, next) {
        var self = this;
        self.log.debug('>> verifyEvent');
        // first, make sure the posted data looks like we expect
        if(req.body.object!=='event') {
            self.log.error('could not recognize event object');
            return res.send(400); // respond with HTTP bad request
        }

        // we only care about the event id - we use it to query the Stripe API
        var eventId = req.body.id;
        stripeDao.getEvent(eventId, null, function(err, value){
            // the request to Stripe was signed - so if the event id is invalid
            //  (eg it doesnt belong to our account), the API will respond with an error,
            //  & if there was a problem on Stripe's side, we might get no data.
            if(err || !event) {
                self.log.error('Error verifying event with stripe.');
                return res.send(401); // respond with HTTP forbidden
            }
            // store the validated, confirmed from Stripe event for use by our next middleware
            req.modeled.stripeEvent = event;
            self.log.debug('<< verifyEvent');
            next();
        });

    },

    handleEvent: function(req, res) {
        var self = this;
        self.log.debug('>> handleEvent');
        var stripeEvent = req.modeled.stripeEvent;
        stripeEventHandler.handleEvent(stripeEvent, function(err, value){
            if(err) {
                //determine response code.  It may not matter.  For now... 500?
                self.log.error('Error handling event: ' + err);
                res.send(500);
            } else {
                self.log.debug('<< handleEvent');
                res.send(200);
            }
        });

    },

    _getAccessToken: function(req) {

        var token = null;
        if(req.session.stripeAccessToken) {
            token = req.session.stripeAccessToken;
        } else if(req.user && req.user.get('credentials')){
            var credentials = req.user.get('credentials');
            for(var i=0; i<credentials.length; i++) {
                var cred = credentials[i];
                if(cred.socialId === 'stripe') {
                    req.session.stripeAccessToken = cred.accessToken;
                    return cred.accessToken;
                }
            }
        }
        //if the token is still null here, we need to connect with stripe still

        return token;
    }

});

return new api();