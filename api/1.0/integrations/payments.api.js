/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../../base.api.js');
var stripeDao = require('../../../payments/dao/stripe.dao.js');
var userDao = require('../../../dao/user.dao.js');

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

        //Charges

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

        stripeDao.listStripeCustomers(accountId, limit, function(err, value){
            //TODO: verify customer/account relationship
            self.log.debug('<< listCustomers');
            self.sendResultOrError(resp, err, value, "Error listing Stripe Customers");
            self = value = null;
        });

    },

    getCustomer: function(req, resp) {
        var self = this;
        self.log.debug('>> getCustomer');
        var customerId = req.params.id;
        //TODO: verify customer/account relationship
        stripeDao.getStripeCustomer(customerId, function(err, value){
            self.log.debug('<< getCustomer');
            self.sendResultOrError(resp, err, value, "Error retrieving Stripe Customer");
            self = value = null;
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
                self.sendResultOrError(resp, err, value, "Error updating Stripe Customer");
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
        stripeDao.deleteStripeCustomer(customerId, contactId, function(err, value){

        });
    },

    listPlans: function(req, resp) {
        var self = this;
        self.log.debug('>> listPlans');
        var accessToken = self._getAccessToken(req);
        stripeDao.listStripePlans(accessToken, function(err, value){
            self.log.debug('<< listPlans');
            self.sendResultOrError(resp, err, value, "Error listing Stripe Plans");
            self = value = null;
        });
    },

    getPlan: function(req, resp) {
        //TODO
    },

    createPlan: function(req, resp) {
        //TODO
    },

    updatePlan: function(req, resp) {
        //TODO
    },

    deletePlan: function(req, resp) {
        //TODO
    },

    listSubscriptions: function(req, resp) {
        //TODO
    },

    createSubscription: function(req, resp) {
        //TODO
    },

    getSubscription: function(req, resp) {
        //TODO
    },

    updateSubscription: function(req, resp) {
        //TODO
    },

    cancelSubscription: function(req, resp) {
        //TODO
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