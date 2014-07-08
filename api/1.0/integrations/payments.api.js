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
        app.get(this.url('plans'), this.isAuthApi, this.listPlans.bind(this));
        app.get(this.url('plans/:id'), this.isAuthApi, this.getPlan.bind(this));
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

        //Charges - CRUDL & Capture
        app.get(this.url('customers/:id/charges'), this.isAuthApi, this.listCharges.bind(this));
        app.get(this.url('customers/:id/charges/:chargeId'), this.isAuthApi, this.getCharge.bind(this));
        app.post(this.url('customers/:id/charges'), this.isAuthApi, this.createCharge.bind(this));
        app.post(this.url('customers/:id/charges/:chargeId'), this.isAuthApi, this.updateCharge.bind(this));
        app.post(this.url('customers/:id/charges/:chargeId/capture'), this.isAuthApi, this.captureCharge.bind(this));
        app.delete(this.url('customers/:id/charges/:chargeId'), this.isAuthApi, this.deleteCharge.bind(this));

        //InvoiceItems
        //Invoices
        //Coupons
        //Discounts
        //Tokens
        //Events
    },

    listCustomers: function(req, resp) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> listCustomers');
        var accountId = self.accountId(req);
        var limit = req.body.limit;

        stripeDao.listStripeCustomers(accountId, limit, function(err, customers){

            if(accountId > 0) {
                customerLinkDao.getLinksByAccountId(accountId, function(err, accounts){
                    if(err) {
                        self.wrapError(resp, null, 500, 'Error building customer list.');
                    }
                    //verify customer/account relationship
                    var customerIDs = _.map(accounts, function(account){return account.get('customerId');});
                    var results = [];
                    _.each(customers.data, function(elem, key, list){
                        if(_.contains(customerIDs, elem.id)) {
                            results.push(elem);
                        }
                    });
                    self.log.debug('<< listCustomers');
                    self.sendResultOrError(resp, err, results, "Error listing Stripe Customers");
                });

            } else {
                //accountId ==0; return ALL customers
                self.log.debug('<< listCustomers');
                self.sendResultOrError(resp, err, customers.data, "Error listing Stripe Customers");
            }

            self = customers = null;
        });

    },

    getCustomer: function(req, resp) {
        var self = this;
        self.log.debug('>> getCustomer');
        var customerId = req.params.id;
        var accountId = self.accountId(req);

        var p1 = $.Deferred();
        customerLinkDao.getLinkByAccountAndCustomer(accountId, customerId, function(err, link){
            if(err) {
                p1.reject();
                self.sendResultOrError(resp, err, null, "Error validating customerId.");
            }
            //a result here means this is a valid customer/account link.
            p1.resolve();
        });

        $.when(p1).done(function(){
            stripeDao.getStripeCustomer(customerId, function(err, value){
                self.log.debug('<< getCustomer');
                self.sendResultOrError(resp, err, value, "Error retrieving Stripe Customer");
                self = value = null;
            });
        });

    },

    createCustomer: function(req, resp) {
        var self = this;
        self.log.debug('>> createCustomer');
        //TODO: security
        var cardToken = req.body.cardToken;
        var contact = req.body.contact;
        var _accountId = self.accountId(req);
        //validate arguments
        if(cardToken && cardToken.length ===0) {
            return this.wrapError(resp, 400, null, "Invalid parameter for cardToken.");
        }
        if (!contact) {
            return this.wrapError(resp, 400, null, "Invalid parameter for contact.");
        }
        if(contact.stripeId && contact.stripeId.length > 0) {
            return this.wrapError(resp, 409, null, "Customer already exists.");
        }

        stripeDao.createStripeCustomer(cardToken, contact, _accountId, function(err, value){
            self.log.debug('<< createCustomer');
            self.sendResultOrError(resp, err, value, "Error creating Stripe Customer");
            self = value = null;
        });
    },

    updateCustomer: function(req, resp) {
        var self = this;
        self.log.debug('>> updateCustomer');
        //TODO: security
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
                self = value = params = null;
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
        //TODO: security

        var accountId = self.accountId(req);
        var customerId = req.params.id;
        if(accountId > 0) {
            customerLinkDao.removeLinkByAccountAndCustomer(accountId, customerId, function(err, value){
                self.log.debug('<< deleteCustomer');
                self.sendResultOrError(resp, err, value, "Error removing Stripe Customer");
            });
        } else {
            var contactId = req.body.contactId;//TODO: Is this the right way to do it?
            //delete Stripe Customer AND all links
            stripeDao.deleteStripeCustomer(customerId, contactId, function(err, value){
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
        self = value = null;

    },

    listPlans: function(req, resp) {
        var self = this;
        self.log.debug('>> listPlans');
        //TODO: Security
        var accessToken = self._getAccessToken(req);
        stripeDao.listStripePlans(accessToken, function(err, value){
            self.log.debug('<< listPlans');
            return self.sendResultOrError(resp, err, value, "Error listing Stripe Plans");
            self = value = null;
        });
    },

    getPlan: function(req, resp) {
        var self = this;
        self.log.debug('>> getPlan');
        //TODO: Security
        var planId = req.params.id;
        var accessToken = self._getAccessToken(req);
        stripeDao.getStripePlan(planId, accessToken, function(err, value){
            self.log.debug('<< getPlan');
            return self.sendResultOrError(resp, err, value, "Error retrieving Stripe Plan");
            self = value = null;
        });
    },

    createPlan: function(req, resp) {
        //TODO - Security
        var self = this;
        self.log.debug('>> createPlan');
        var accessToken = self._getAccessToken(req);

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
                self = value = null;
            });
    },

    updatePlan: function(req, resp) {
        //TODO - Security
        var self = this;
        self.log.debug('>> updatePlan');
        var accessToken = self._getAccessToken(req);
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
            self = value = null;
        });
    },

    deletePlan: function(req, resp) {
        //TODO - Security
        var self = this;
        self.log.debug('>> deletePlan');
        var accessToken = self._getAccessToken(req);
        //validate params
        var planId = req.params.id;//REQUIRED
        if(!planId || planId.length < 1) {
            return self.wrapError(resp, 400, null, "Invalid planId parameter.");
        }

        stripeDao.deleteStripePlan(planId, accessToken, function(err, value){
            self.log.debug('<< deletePlan');
            return self.sendResultOrError(resp, err, value, "Error updating Stripe Plan");
            self = value = null;
        });
    },

    listSubscriptions: function(req, resp) {
        //TODO - Security
        var self = this;
        self.log.debug('>> listSubscriptions');
        var accessToken = self._getAccessToken(req);
        var customerId = req.params.id;
        var limit = req.body.limit;

        stripeDao.listStripeSubscriptions(customerId, limit, function(err, value){
            self.log.debug('<< listSubscriptions');
            return self.sendResultOrError(resp, err, value, "Error listing subscriptions");
            self = value = null;
        });
    },

    createSubscription: function(req, resp) {
        //TODO - Security
        var self = this;
        self.log.debug('>> createSubscription');
        var accessToken = self._getAccessToken(req);
        var customerId = req.params.id;
        var planId = req.body.planId;//REQUIRED
        var coupon = req.body.coupon;
        var trial_end = req.body.trial_end;
        var card = req.body.card;//this will overwrite customer default card if specified
        var quantity = req.body.quanity;
        var application_fee_percent = req.body.application_fee_percent;
        var metadata = req.body.metadata;
        var accountId = self.accountId(req);
        var contactId = req.body.contactId;//TODO: determine if this is best way

        if(!planId || planId.length < 1) {
            return self.wrapError(resp, 400, null, "Invalid planId parameter.");
        }

        stripeDao.createStripeSubscription(customerId, planId, coupon, trial_end, card, quantity,
                    application_fee_percent, metadata, accountId, contactId, accessToken, function(err, value){
                self.log.debug('<< createSubscription');
                return self.sendResultOrError(resp, err, value, "Error creating subscription");
                self = value = null;
            });
    },

    getSubscription: function(req, resp) {
        //TODO - Security
        var self = this;
        self.log.debug('>> getSubscription');
        var accessToken = self._getAccessToken(req);
        var customerId = req.params.id;
        var subscriptionId = req.params.subId;

        stripeDao.getStripeSubscription(customerId, subscriptionId, accessToken, function(err, value){
            self.log.debug('<< getSubscription');
            return self.sendResultOrError(resp, err, value, "Error retrieving subscription");
            self = value = null;
        });
    },

    updateSubscription: function(req, resp) {
        //TODO - Security
        var self = this;
        self.log.debug('>> updateSubscription');
        var accessToken = self._getAccessToken(req);
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

        stripeDao.updateStripeSubscription(customerId, subscriptionId, planId, coupon, prorate, trial_end, card,
            quantity, application_fee_percent, metadata, accessToken, function(err, value){
                self.log.debug('<< updateSubscription');
                return self.sendResultOrError(resp, err, value, "Error updating subscription");
                self = value = null;
            });
    },

    cancelSubscription: function(req, resp) {
        //TODO - Security
        var self = this;
        self.log.debug('>> cancelSubscription');
        var accessToken = self._getAccessToken(req);
        var customerId = req.params.id;
        var subscriptionId = req.params.subId;
        var at_period_end = req.body.at_period_end;

        stripeDao.cancelStripeSubscription(customerId, subscriptionId, at_period_end, accessToken, function(err, value){
            self.log.debug('<< cancelSubscription');
            return self.sendResultOrError(resp, err, value, "Error cancelling subscription");
            self = value = null;
        });
    },

    createCard: function(req, resp) {
        //TODO
    },

    getCard: function(req, resp) {
        //TODO
    },

    updateCard: function(req, resp) {
        //TODO
    },

    listCards: function(req, resp) {
        //TODO
    },

    deleteCard: function(req, resp) {
        //TODO
    },

    //CHARGES
    listCharges: function(req, resp) {
        //TODO
    },

    createCharge: function(req, resp) {
        //TODO
    },

    getCharge: function(req, resp) {
        //TODO
    },

    updateCharge: function(req, resp) {
        //TODO
    },

    captureCharge: function(req, resp) {
        //TODO
    },

    deleteCharge: function(req, resp) {
        //TODO
    },


    _getAccessToken: function(req) {
        var self = this;
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