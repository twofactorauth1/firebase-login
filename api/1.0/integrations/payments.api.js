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
var paymentsManager = require('../../../payments/payments_manager');
var contactActivityManager = require('../../../contactactivities/contactactivity_manager');
var orderManager = require('../../../orders/order_manager');
var productManager = require('../../../products/product_manager');
var contactDao = require('../../../dao/contact.dao');
var async = require('async');
var affiliates_manager = require('../../../affiliates/affiliate_manager');
var moment = require('moment');
var orgDao = require('../../../organizations/dao/organization.dao');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "integrations/payments",

    dao: stripeDao,



    initialize: function () {

        //Contacts
        app.post(this.url('contacts/:id/charge'), this.setup.bind(this), this.createChargeForContact.bind(this));

        //Customers
        app.get(this.url('customers'), this.isAuthApi.bind(this), this.listCustomers.bind(this));
        app.get(this.url('customers/:id'), this.isAuthApi.bind(this), this.getCustomer.bind(this));
        app.post(this.url('customers'), this.isAuthApi.bind(this), this.createCustomer.bind(this));
        app.post(this.url('customers/:id'), this.isAuthApi.bind(this), this.updateCustomer.bind(this));
        app.delete(this.url('customers/:id'), this.isAuthApi.bind(this), this.deleteCustomer.bind(this));

        //Plans
        app.get(this.url('plans'), this.setup.bind(this), this.listPlans.bind(this));
        app.get(this.url('plans/:id'), this.setup.bind(this), this.getPlan.bind(this));
        app.post(this.url('plans'), this.isAuthApi.bind(this), this.createPlan.bind(this));
        app.post(this.url('plans/:id'), this.isAuthApi.bind(this), this.updatePlan.bind(this));
        app.delete(this.url('plans/:id'), this.isAuthApi.bind(this), this.deletePlan.bind(this));

        //Subscriptions
        app.get(this.url('customers/:id/subscriptions'), this.isAuthApi.bind(this), this.listSubscriptions.bind(this));
        app.post(this.url('customers/:id/subscriptions'), this.isAuthApi.bind(this), this.createSubscription.bind(this));
        app.post(this.url('customers/:id/subscriptions/:subId'), this.isAuthApi.bind(this), this.updateSubscription.bind(this));
        app.get(this.url('customers/:id/subscriptions/:subId'), this.isAuthApi.bind(this), this.getSubscription.bind(this));
        app.delete(this.url('customers/:id/subscriptions/:subId'), this.isAuthApi.bind(this), this.cancelSubscription.bind(this));


        //Cards
        app.put(this.url('customers/:id/cards/:cardToken'), this.isAuthApi.bind(this), this.createCard.bind(this));
        app.get(this.url('customers/:id/cards/:cardId'), this.isAuthApi.bind(this), this.getCard.bind(this));
        app.post(this.url('customers/:id/cards/:cardId'), this.isAuthApi.bind(this), this.updateCard.bind(this));
        app.get(this.url('customers/:id/cards'), this.isAuthApi.bind(this), this.listCards.bind(this));
        app.delete(this.url('customers/:id/cards/:cardId'), this.isAuthApi.bind(this), this.deleteCard.bind(this));

        //Charges - CRUL & Capture
        app.get(this.url('charges'), this.isAuthApi.bind(this), this.listCharges.bind(this));
        app.get(this.url('charges/:chargeId'), this.isAuthApi.bind(this), this.getCharge.bind(this));
        app.post(this.url('charges'), this.isAuthApi.bind(this), this.createCharge.bind(this));
        app.post(this.url('charges/:chargeId'), this.isAuthApi.bind(this), this.updateCharge.bind(this));
        app.post(this.url('charges/:chargeId/capture'), this.isAuthApi.bind(this), this.captureCharge.bind(this));

        //InvoiceItems - CRUDL
        app.post(this.url('customers/:id/invoiceItems'), this.isAuthApi.bind(this), this.createInvoiceItem.bind(this));
        app.get(this.url('customers/:id/invoiceItems'), this.isAuthApi.bind(this), this.listInvoiceItems.bind(this));
        app.get(this.url('customers/:id/invoiceItems/:itemId'), this.isAuthApi.bind(this), this.getInvoiceItem.bind(this));
        app.post(this.url('customers/:id/invoiceItems/:itemId'), this.isAuthApi.bind(this), this.updateInvoiceItem.bind(this));
        app.delete(this.url('customers/:id/invoiceItems/:itemId'), this.isAuthApi.bind(this), this.deleteInvoiceItem.bind(this));

        //Invoices - CRUL & getUpcoming & pay
        app.post(this.url('customers/:id/invoices'), this.isAuthApi.bind(this), this.createInvoice.bind(this));
        app.get(this.url('customers/:id/invoices/:invoiceId'), this.isAuthApi.bind(this), this.getInvoice.bind(this));
        app.get(this.url('customers/:id/upcomingInvoice'), this.isAuthApi.bind(this), this.getUpcomingInvoice.bind(this));
        app.post(this.url('customers/:id/invoices/:invoiceId'), this.isAuthApi.bind(this), this.updateInvoice.bind(this));
        app.get(this.url('customers/all/invoices'), this.isAuthApi.bind(this), this.listAllInvoices.bind(this));
        app.get(this.url('customers/:id/invoices'), this.isAuthApi.bind(this), this.listInvoices.bind(this));

        app.post(this.url('customers/:id/invoices/:invoiceId/pay'), this.isAuthApi.bind(this), this.payInvoice.bind(this));

        //Special operations for main account
        app.get(this.url('upcomingInvoice'), this.isAuthApi.bind(this), this.getMyUpcomingInvoice.bind(this));
        app.get(this.url('invoices'), this.isAuthApi.bind(this), this.getMyInvoices.bind(this));
        app.get(this.url('account/invoices'), this.isAuthApi.bind(this), this.getInvoicesForAccount.bind(this));
        app.get(this.url('account/charges'), this.isAuthApi.bind(this), this.getChargesForAccount.bind(this));//TODO this
        app.get(this.url('account/charges/:chargeId'), this.isAuthApi.bind(this), this.getAccountCharge.bind(this));
        app.get(this.url('indigenous/plans'), this.listIndigenousPlans.bind(this));
        app.get(this.url('indigenous/plans/:planId'), this.getIndigenousPlan.bind(this));
        app.post(this.url('indigenous/plans/:planId/subscribe'), this.subscribeToIndigenous.bind(this));
        app.get(this.url('indigenous/coupons/:name/validate'), this.setup.bind(this), this.validateIndigenousCoupon.bind(this));
        app.get(this.url('org/coupons/:name/validate'), this.setup.bind(this), this.validateOrgCoupon.bind(this));

        //Coupons
        app.get(this.url('coupons'), this.isAuthApi.bind(this), this.listCoupons.bind(this));
        app.get(this.url('coupon/:name/validate'), this.setup.bind(this), this.validateCoupon.bind(this));
        app.get(this.url('coupon/:name'), this.isAuthApi.bind(this), this.getCouponByName.bind(this));
        app.post(this.url('coupons'), this.isAuthApi.bind(this), this.createCoupon.bind(this));
        //stripe coupons cannot be updated
        app.delete(this.url('coupon/:name'), this.isAuthApi.bind(this), this.deleteCoupon.bind(this));

        //Discounts

        //Tokens - CG
        app.post(this.url('customers/:id/cards/:cardId'), this.isAuthApi.bind(this), this.createToken.bind(this));
        app.get(this.url('tokens/:id'), this.isAuthApi.bind(this), this.getToken.bind(this));

        //Events - GL
        app.get(this.url('events/:id'), this.isAuthApi.bind(this), this.getEvent.bind(this));
        app.get(this.url('events'), this.isAuthApi.bind(this), this.listEvents.bind(this));

        //Account
        app.get(this.url('account'), this.isAuthApi.bind(this), this.getStripeAccount.bind(this));

        // ------------------------------------------------
        //  Webhook
        // ------------------------------------------------
        app.post(this.url('stripe/webhook'), this.verifyEvent.bind(this), this.handleEvent.bind(this));
        app.get(this.url('revenue'),this.isAuthApi.bind(this),   this.listChargesForAccount.bind(this));      

       
    },

    listChargesForAccount: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> listChargesForAccount');


        var start = req.query.start;
        var end = req.query.end;
        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }
        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }
        self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                accountDao.getAccountByID(accountId, function(err, account) {
                    if (err) {
                        self.log.error('Error getting account by ID:', err);
                        return self.wrapError(resp, 500, 'Error getting invoice', 'There was an error getting upcoming invoices', '');
                    } else {
                        
                        var created = {
                            gte:Math.round(start.getTime() / 1000) || null,//req.query.from OR today-30days as a timestamp (1492095302)
                            lte:Math.round(end.getTime() / 1000) || null//req.query.to OR today as a timestamp
                        };
                        var limit = req.query.limit || 0;

                        /*
                         * Leave these blank for now.  They are used for pagination within Stripe's list.  According to Stripe's docs:
                         *
                         * A cursor for use in pagination. ending_before is an object ID that defines your place in the list.
                         * For instance, if you make a list request and receive 100 objects, starting with obj_bar, your
                         * subsequent call can include ending_before=obj_bar in order to fetch the previous page of the list.
                         */
                        var endingBefore = null;
                        var startingAfter = null;

                        var customerId = account.get('billing').stripeCustomerId;

                        paymentsManager.listChargesForAccount(account, created, endingBefore, limit, startingAfter, userId, function(err, charges){
                            if(err) {
                                self.log.error(accountId, userId, 'Error getting charges:', err);
                                return self.wrapError(resp, 500, 'Error listing revenue', 'There was an error listing revenue.');
                            } else if(!charges) {
                                charges = {totalrevenue:0};
                                self.log.debug(accountId, userId, '<< listChargesForAccount');
                                return self.sendResultOrError(resp, err, charges, "Error listing revenue");
                            } else {
                                var totalrevenue = 0;
                                _.each(charges.data, function(charge){
                                    totalrevenue+= (charge.amount - charge.amount_refunded);
                                });
                                totalrevenue = totalrevenue / 100;

                                charges.totalrevenue=totalrevenue;
                                self.log.debug(accountId, userId, '<< listChargesForAccount');
                                return self.sendResultOrError(resp, err, charges, "Error listing revenue");
                            }

                        });
                    }   
                });
            }
        });

    },

    listIndigenousPlans: function(req, resp) {
        var self = this;
        self.log.debug('>> listIndigenousPlans');
        stripeDao.listStripePlans(null, function(err, value){
            var planAry = value.data;
            value.data = _.sortBy(planAry, 'amount');

            self.log.debug('<< listIndigenousPlans');
            return self.sendResultOrError(resp, err, value, "Error listing Stripe Plans");
        });

    },

    getIndigenousPlan: function(req, resp) {
        var self = this;
        self.log.debug('>> getIndigenousPlan');
        stripeDao.getStripePlan(req.params.planId, null, function(err, value){
            self.log.debug('<< getIndigenousPlan');
            return self.sendResultOrError(resp, err, value, "Error getting Indigenous Plan");
        });
    },

    /**
     * This method creates a subscription to an indigenous plan, and then updates the account billing information
     * @param req
     * @param resp
     */
    subscribeToIndigenous: function(req, resp) {
        var self = this;
        var accountId = parseInt(req.body.accountId) || parseInt(self.accountId(req));//REQUIRED
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> subscribeToIndigenous');
        /*

         - createStripeSubscription
         - update billingObj (plan, coupon, setupFee, subscriptionId)
         - sendWelcomeEmail (conversion)
         - remove account lock
         - create contact activity
         - create order
         - create user activity
         */


        var planId = req.params.planId;//REQUIRED
        var coupon = req.body.coupon;


        //these may be unused
        var trial_end = req.body.trial_end;
        var card = req.body.card;//this will overwrite customer default card if specified
        var quantity = req.body.quantity;
        var application_fee_percent = req.body.application_fee_percent;
        var metadata = req.body.metadata;
        var addOnArray = req.body.addOns;
        self.log.debug(accountId, userId, 'Received arguments coupon [' + coupon + '] and addOnArray:', addOnArray);


        var setupFee = 0;
        if(req.body.setupFee) {
            setupFee = parseInt(req.body.setupFee);
        }

        if(!planId || planId.length < 1) {
            return self.wrapError(resp, 400, null, "Invalid planId parameter.");
        }

        if(!accountId || accountId===0) {
            return self.wrapError(resp, 400, null, 'Invalid accountId parameter');
        }

        var stripeSubscription = null;
        var account = null;
        var customerId = null;
        var userEmail = null;
        var purchaseAmount = null;
        var invoiceItems = [];

        async.waterfall([
            function getAccount(cb) {
                accountDao.getAccountByID(accountId, function(err, _account) {
                    if (err) {
                        self.log.error(accountId, userId, 'Error fetching account:', err);
                        cb(err);
                    } else {
                        account = _account;
                        customerId = _account.get('billing').stripeCustomerId;
                        cb(null);
                    }
                });
            },
            function handleSetupFee(cb){
                if(setupFee > 0) {
                    stripeDao.createInvoiceItem(customerId, setupFee, 'usd', null, null, 'Signup Fee',
                        null, null, function(err, value){
                            if(err) {
                                self.log.error(accountId, userId, 'Error creating signup fee as invoice item:', err);
                                cb(err);
                            } else {
                                invoiceItems.push(value);
                                cb();
                            }
                        });
                } else {
                    cb();
                }
            },
            function handleAddons(cb) {
                if(addOnArray && addOnArray.length > 0) {
                    /*
                     * fetch the product, add an invoice item
                     */
                    async.each(addOnArray, function(addOn, done){
                        productManager.getProduct(addOn, function(err, product){
                            if(err) {
                                self.log.error(accountId, userId, 'Error fetching products:', err);
                                done(err);
                            } else {
                                //TODO: handle sales
                                var price = product.get('regular_price')*100;
                                var description = product.get('name');
                                stripeDao.createInvoiceItem(customerId, price, 'usd', null, null, description, null, null, function(err, value){
                                    if(err) {
                                        self.log.error(accountId, userId, 'Error creating Stripe Invoice Item:', err);
                                        done(err);
                                    } else {
                                        invoiceItems.push(value);
                                        done();
                                    }
                                });
                            }
                        });
                    }, function (err){
                        if(err) {
                            self.log.error(accountId, userId, 'Error handling the addOns:', err);
                            cb(err);
                        } else {
                            cb();
                        }
                    });
                } else {
                    cb();
                }
            },
            function createSubscription(cb){
                paymentsManager.createStripeSubscription(customerId, planId, accountId, userId, coupon, setupFee, null, function(err, sub) {
                    if(err) {
                        invoiceItems.forEach(function(item, index) {
                            stripeDao.deleteInvoiceItem(item.id, null, function(err, confirmation) {
                                if (err) {
                                    self.log.error(accountId, userId, 'Error deleting invoice item: ' + err);
                                }
                            });
                        });
                        self.log.error(accountId, userId, 'Error subscribing to Indigenous: ' + err);
                        cb(err);
                    } else {
                        self.sm.addBillingInfoToAccount(accountId, customerId, sub.id, planId, userId, function(err, subPrivs){
                            if(err) {
                                self.log.error(accountId, userId, 'Error adding billing info to account: ' + err);
                                cb(err);
                            }
                            stripeSubscription = sub;
                            cb(null, sub.id);
                        });
                    }
                });

            },
            function updateAccount(subscriptionId, cb){
                var billingObj = account.get('billing');
                billingObj.plan = planId;
                billingObj.coupon = coupon;
                billingObj.setupFee = setupFee;
                billingObj.conversionDate = new Date();
                billingObj.subscriptionId = subscriptionId;

                account.set('locked_sub', false);
                req.session.locked_sub = false;
                accountDao.saveOrUpdate(account, function(err, savedAccount){
                    if(err) {
                        self.log.error(accountId, userId, 'Error saving account:', err);
                        cb(err);
                    } else {
                        cb(null, savedAccount);
                    }

                });
            },
            function sendConversionEmail(account, cb){
                //TODO: if we need a conversion email, add it here
                cb(null, account);
            },
            function findContactForUser(account, cb){
                var email = null;
                userDao.getById(userId, $$.m.User, function(err, user){
                    if(err) {
                        self.log.error('Error fetching user:', err);
                        cb(err);
                    } else {
                        email = user.get('username');
                        userEmail = email;
                        contactDao.findContactsByEmail(appConfig.mainAccountID, email, function(err, contacts){
                            if(err) {
                                self.log.error(accountId, userId, 'Error finding contact for user:', err);
                                cb(err);
                            } else if (!contacts || contacts.length < 1) {
                                self.log.warn(accountId, userId, 'Could not find contact for user with email [' + email + ']');
                                var fingerprint = req.body.fingerprint || '';
                                var ip = self.ip(req);
                                contactDao.createCustomerContact(user, appConfig.mainAccountID, fingerprint, ip, function(err, value){
                                    if(err || !value) {
                                        self.log.error(accountId, userId, 'Error creating contact for user:', err);
                                        cb(err);
                                    } else {
                                        self.log.debug(accountId, userId, 'Created contact.');
                                        cb(null, account, value);
                                    }
                                });
                                //cb('Error finding contact for user (null)');
                            } else {
                                var contact = contacts[0];
                                cb(null, account, contact);
                            }
                        });
                    }
                });

            },
            function createContactActivity(account, contact, cb){
                var subdomain = account.get('subdomain');
                //amount: (sub.plan.amount / 100),
                //plan_name: sub.plan.name
                purchaseAmount = (stripeSubscription.plan.amount / 100);
                var activity = new $$.m.ContactActivity({
                    accountId: appConfig.mainAccountID,
                    contactId: contact.id(),
                    activityType: "TRIAL_CONVERSION",
                    detail : "Account for "+ subdomain + ' [' + accountId + '] has converted to paying customer.',
                    start: new Date(),
                    extraFields: {accountId:accountId, plan_name:stripeSubscription.plan.name, amount:purchaseAmount}
                });
                contactActivityManager.createActivity(activity, function(err, value){
                    if(err) {
                        self.log.error(accountId, userId, 'Error creating contactActivity:', err);
                        cb(err);
                    } else {
                        cb(null, account, contact);
                    }
                });
            },
            function createUserActivity(account, contact, cb){
                self.createUserActivityWithParams(accountId, userId, 'SUBSCRIBE', null,
                    "Congratulations, your subscription was successfully created.", function(){
                        cb(null, account, contact);
                    });
            },
            function createOrder(account, contact, cb){
                var stripeCustomerId = account.get('billing').stripeCustomerId;
                var subscriptionId = account.get('billing').subscriptionId;
                var contactId = contact.id();

                paymentsManager.getInvoiceForSubscription(stripeCustomerId, subscriptionId, null, function(err, invoice){
                    if(err) {
                        self.log.error(accountId, userId, 'Error getting invoice for subscription: ' + err);
                        cb(err);
                    } else {
                        orderManager.createOrderFromStripeInvoice(invoice, appConfig.mainAccountID, contactId, accountId, function(err, order){
                            if(err) {
                                self.log.error(accountId, userId, 'Error creating order for invoice: ' + err);
                                cb(err);
                            } else {
                                self.log.debug(accountId, userId, 'Order created.');
                                cb(null, account, order, userEmail, purchaseAmount);
                            }
                        });
                    }
                });
            },
            function addOrderNote(account, order, email, amount, cb){
                var note = 'order for new account id:' + account.id();
                orderManager.addOrderNote(appConfig.mainAccountID, order.id(), note, 'admin', function(err, order){
                    if(err) {
                        self.log.error(accountId, userId, 'Error adding order note: ', err);
                        cb(err);
                    } else {
                        cb(null, email, amount);
                    }
                });
            },
            function recordAffiliatePurchase(email, amount, cb) {
                affiliates_manager.recordPurchase(email, amount, function(err, value){
                    if(err) {
                        self.log.error(accountId, userId, 'Error recording affiliate purchase:', err);
                        //return anyway
                        cb(null);
                    } else {
                        self.log.debug(accountId, userId, 'Recorded affiliate purchase:', value);
                        cb(null);
                    }
                });
            }
        ], function done(err){
            self.log.debug(accountId, userId, '<< subscribeToIndigenous');
            return self.sendResultOrError(resp, err, stripeSubscription, "Error creating subscription");
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
                self.getStripeTokenFromAccount(req, function(err, accessToken){
                    stripeDao.listStripeCustomers(accountId, limit, accessToken, function(err, customers){
                        self.log.debug('<< listCustomers');
                        self.sendResultOrError(resp, err, customers.data, "Error listing Stripe Customers");
                    });
                });
            }
        });
    },

    /*
     * COUPONS
     */

    listCoupons: function(req, resp) {
        var self = this;
        self.log.debug('>> listCoupons');
        self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                self.getStripeTokenFromAccount(req, function(err, accessToken){
                    var accountId = parseInt(self.accountId(req));
                    if(accessToken === null && accountId != appConfig.mainAccountID) {
                        return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                    }
                    paymentsManager.listStripeCoupons(accessToken, function(err, coupons){
                        self.log.debug('<< listCoupons');
                        self.sendResultOrError(resp, err, coupons, "Error listing Stripe Coupons");
                    });
                });
            }
        });

    },

    validateCoupon: function(req, resp) {
        var self = this;
        self.log.debug('>> validateCoupon');
        self.getStripeTokenFromAccount(req, function(err, accessToken){
            var accountId = parseInt(self.currentAccountId(req));
            var couponName = req.params.name;
            if(accessToken === null && accountId != appConfig.mainAccountID) {
                return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
            }
            paymentsManager.getStripeCouponByName(couponName, accessToken, function(err, coupon){
                self.log.debug('<< validateCoupon');
                if(err) {
                    self.sendResult(resp, {valid:false});
                } else {
                    self.sendResult(resp, coupon);
                }

            });
        });
    },

    validateIndigenousCoupon: function(req, resp) {
        var self = this;
        self.log.debug('>> validateIndigenousCoupon');
        var accountId = parseInt(self.currentAccountId(req));
        self._getOrgAccessTokenFromAccountId(accountId, function(err, accessToken){
            var couponName = req.params.name;

            paymentsManager.getStripeCouponByName(couponName, accessToken, function(err, coupon){
                self.log.debug('<< validateIndigenousCoupon');
                if(err) {
                    self.sendResult(resp, {valid:false});
                } else {
                    self.sendResult(resp, coupon);
                }

            });
        });

    },

    validateOrgCoupon: function(req, resp) {
        var self = this;
        self.log.debug('>> validateOrgCoupon');
        var accountId = parseInt(self.currentAccountId(req));
        accountDao.getAccountByID(accountId, function(err, account){
            if(err) {
                self.log.error('Error getting account:', err);
                self.sendResult(resp, {valid:false});
            } else {
                if(account.get('orgId') && account.get('orgId') !== 0) {
                    self._getOrgAccessToken(account.get('orgId'), function(err, accessToken){
                        var couponName = req.params.name;
                        paymentsManager.getStripeCouponByName(couponName, accessToken, function(err, coupon){
                            self.log.debug('<< validateOrgCoupon [' + account.get('orgId') + ']');
                            if(err) {
                                self.sendResult(resp, {valid:false});
                            } else {
                                self.sendResult(resp, coupon);
                            }
                        });
                    });
                } else {
                    var couponName = req.params.name;
                    paymentsManager.getStripeCouponByName(couponName, null, function(err, coupon){
                        self.log.debug('<< validateOrgCoupon [0]');
                        if(err) {
                            self.sendResult(resp, {valid:false});
                        } else {
                            self.sendResult(resp, coupon);
                        }
                    });
                }
            }
        });
    },

    getCouponByName: function(req, resp) {
        var self = this;
        self.log.debug('>> getCouponByName');
        self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                self.getStripeTokenFromAccount(req, function(err, accessToken){
                    var accountId = parseInt(self.accountId(req));
                    var couponName = req.params.name;
                    if(accessToken === null && accountId != appConfig.mainAccountID) {
                        return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                    }
                    paymentsManager.getStripeCouponByName(couponName, accessToken, function(err, coupon){
                        self.log.debug('<< getCouponByName');
                        self.sendResultOrError(resp, err, coupon, "Error getting Stripe Coupon");
                    });
                });
            }
        });
    },

    createCoupon: function(req, resp) {
        var self = this;
        self.log.debug('>> createCoupon');

        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                self.getStripeTokenFromAccount(req, function(err, accessToken){
                    var accountId = parseInt(self.accountId(req));
                    if (accessToken === null && accountId != appConfig.mainAccountID) {
                        return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                    }
                    paymentsManager.createStripeCoupon(req.body, accessToken, function(err, coupon){
                        self.log.debug('<< createCoupon');
                        self.sendResultOrError(resp, err, coupon, "Error creating Stripe Coupon");
                    });
                });
            }
        });
    },

    deleteCoupon: function(req, resp) {
        var self = this;
        self.log.debug('>> deleteCoupon');
        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                self.getStripeTokenFromAccount(req, function(err, accessToken){
                    var accountId = parseInt(self.accountId(req));
                    var couponName = req.params.name;
                    if(accessToken === null && accountId != appConfig.mainAccountID) {
                        return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                    }
                    paymentsManager.deleteStripeCoupon(couponName, accessToken, function(err, coupon){
                        self.log.debug('<< deleteCoupon');
                        self.sendResultOrError(resp, err, coupon, "Error deleting Stripe Coupon");
                    });
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
                    self.getStripeTokenFromAccount(req, function(err, accessToken){
                        stripeDao.getStripeCustomer(customerId, accessToken, function(err, value){
                            self.log.debug('<< getCustomer');
                            self.sendResultOrError(resp, err, value, "Error retrieving Stripe Customer");
                        });
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
        var orgId = req.body.orgId || 0;

        /*
         * This can be called before we have a subscription
         */

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
        self.createUserActivityWithParams(_accountId, user.id(), 'CREATE_STRIPE_CUSTOMER', null, null, function(){});
        self.getStripeTokenFromAccount(req, function(err, accessToken){
            if(contact) {
                stripeDao.createStripeCustomer(cardToken, contact, _accountId, _accountId, accessToken, function(err, value){
                    self.log.debug('<< createCustomer');
                    self.sendResultOrError(resp, err, value, "Error creating Stripe Customer");
                    self = value = null;
                });
            } else {
                //TODO: this
                stripeDao.createStripeCustomerForUser(cardToken, user, _accountId, 0, _accountId, accessToken, orgId, function(err, value){
                    self.log.debug('<< createCustomer');
                    self.sendResultOrError(resp, err, value, "Error creating Stripe Customer");
                });
            }
        });

    },

    updateCustomer: function(req, resp) {
        var self = this;
        self.log.debug('>> updateCustomer');

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
                self.getStripeTokenFromAccount(req, function(err, accessToken){
                    stripeDao.updateStripeCustomer(customerId, params.account_balance, params.cardToken, params.coupon, params.default_card,
                            params.description, params.email, params.metadata, accessToken, function(err, value){
                        self.log.debug('<< updateCustomer');
                        self.sendResultOrError(resp, err, value, "Error updating Stripe Customer");
                        self.createUserActivity(req, 'UPDATE_STRIPE_CUSTOMER', null, {customerId: customerId}, function(){});
                        return;
                    });
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
                    self.getStripeTokenFromAccount(req, function(err, accessToken){
                        //delete Stripe Customer AND all links
                        stripeDao.deleteStripeCustomer(customerId, contactId, userId, accessToken, function(err, value){
                            if(err) {
                                self.log.error('Error deleting customer from Stripe: ' + err);
                                return self.wrapError(resp, null, 500, 'Error removing Stripe Customer');
                            }
                            self.createUserActivity(req, 'DELETE_STRIPE_CUSTOMER', null, {customerId: customerId}, function(){});
                            customerLinkDao.removeLinksByCustomer(customerId, function(err, value){
                                self.log.debug('<< deleteCustomer');
                                return self.sendResultOrError(resp, err, value, "Error removing Stripe Customer");
                            });
                        });
                    });
                }
            }
        });


    },

    listPlans: function(req, resp) {
        var self = this;
        self.log.debug('>> listPlans');
        var accountId = parseInt(self.currentAccountId(req));

        self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                self.getStripeTokenFromAccount(req, function(err, accessToken){
                    if(accessToken === null && accountId != appConfig.mainAccountID) {
                        return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                    }
                    stripeDao.listStripePlans(accessToken, function(err, value){
                        self.log.debug('<< listPlans');
                        return self.sendResultOrError(resp, err, value, "Error listing Stripe Plans");
                    });
                });

            }
        });

    },

    getPlan: function(req, resp) {
        var self = this;
        self.log.debug('>> getPlan');
        var accountId = parseInt(self.currentAccountId(req));

        var planId = req.params.id;
        self.getStripeTokenFromAccount(req, function(err, accessToken){
            if(accessToken === null && accountId != appConfig.mainAccountID) {
                return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
            }
            stripeDao.getStripePlan(planId, accessToken, function(err, value){
                self.log.debug('<< getPlan');
                return self.sendResultOrError(resp, err, value, "Error retrieving Stripe Plan");
            });
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
                self.getStripeTokenFromAccount(req, function(err, accessToken){
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
                        planId = $$.u.idutils.generateUniqueAlphaNumericShort();
                        //return self.wrapError(resp, 400, null, "Invalid parameter for planId.");
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
                            self.sendResultOrError(resp, err, value, "Error creating Stripe Plan");
                            self.createUserActivity(req, 'CREATE_STRIPE_PLAN', null, {planId: planId}, function(){});
                            return;
                    });
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
                self.getStripeTokenFromAccount(req, function(err, accessToken){
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
                        self.sendResultOrError(resp, err, value, "Error updating Stripe Plan");
                        self.createUserActivity(req, 'UPDATE_STRIPE_PLAN', null, {planId: planId}, function(){});
                        return;
                    });
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
                self.getStripeTokenFromAccount(req, function(err, accessToken){
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
                        self.sendResultOrError(resp, err, value, "Error updating Stripe Plan");
                        self.createUserActivity(req, 'DELETE_STRIPE_PLAN', null, {planId: planId}, function(){});
                        return;
                    });
                });
            }
        });

    },

    listSubscriptions: function(req, resp) {

        var self = this;
        self.log.debug('>> listSubscriptions');
        var accountId = parseInt(self.accountId(req));

        /*
         * list subscriptions are on the customer... which belongs to the main account.
         * there is no need to use an accessToken.
         */
        /*
        var accessToken = self._getAccessToken(req);
        if(accessToken === null && accountId != appConfig.mainAccountID) {
            return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
        }
        */

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
        var accountId = parseInt(self.accountId(req));
        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                self.getStripeTokenFromAccount(req, function(err, accessToken){
                    if(accessToken === null && accountId != appConfig.mainAccountID) {
                        return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                    }
                    var customerId = req.params.id;
                    var planId = req.body.plan;//REQUIRED
                    var coupon = req.body.coupon;
                    var trial_end = req.body.trial_end;
                    var card = req.body.card;//this will overwrite customer default card if specified
                    var quantity = req.body.quantity;
                    var application_fee_percent = req.body.application_fee_percent;
                    var metadata = req.body.metadata;

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
                            self.sendResultOrError(resp, err, value, "Error creating subscription");
                            self.createUserActivity(req, 'CREATE_STRIPE_SUB', null, {id: value.id, planId: planId, customerId: customerId, contactId: contactId, userId: userId}, function(){});
                            return;
                    });
                });

            }
        });


    },

    getSubscription: function(req, resp) {

        var self = this;
        self.log.debug('>> getSubscription');
        var accountId = parseInt(self.accountId(req));

        /*
         * subscriptions are on the customer which belong to the main account.
         * No delegation is needed.
         */
        var customerId = req.params.id;
        var subscriptionId = req.params.subId;
        self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                self._getOrgAccessTokenFromAccountId(accountId, function(err, accessToken){
                    stripeDao.getStripeSubscription(customerId, subscriptionId, accessToken, function(err, value){
                        self.log.debug('<< getSubscription');
                        if(err && err.toString().indexOf('does not have a subscription with ID') != -1) {
                            return self.sendResultOrError(resp, err, value, "Error retrieving subscription", 404);
                        } else {
                            return self.sendResultOrError(resp, err, value, "Error retrieving subscription");
                        }

                    });
                });

            }
        });

    },

    updateSubscription: function(req, resp) {

        var self = this;
        self.log.debug('>> updateSubscription');
        var accountId = parseInt(self.accountId(req));
        self.getStripeTokenFromAccount(req, function(err, accessToken){
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
                            self.sendResultOrError(resp, err, value, "Error updating subscription");
                            self.createUserActivity(req, 'UPDATE_STRIPE_SUB', null, {id: subscriptionId}, function(){});
                            return;
                    });
                }
            });
        });
    },

    cancelSubscription: function(req, resp) {

        var self = this;
        self.log.debug('>> cancelSubscription');
        var accountId = parseInt(self.accountId(req));
        self.getStripeTokenFromAccount(req, function(err, accessToken){
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
                        self.sendResultOrError(resp, err, value, "Error cancelling subscription");
                        self.createUserActivity(req, 'CANCEL_STRIPE_SUB', null, {id: subscriptionId}, function(){});
                        return;
                    });
                }
            });
        });
    },

    createCard: function(req, resp) {

        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> createCard');
        /*
         * Customers are stored on the main account.  No accessToken needed.
         */



        var customerId = req.params.id;

        var cardToken = req.params.cardToken;
        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                if(!cardToken || cardToken.length < 1) {
                    return self.wrapError(resp, 400, null, "Invalid cardToken parameter.");
                }
                self.getStripeTokenFromAccount(req, function(err, accessToken){
                    stripeDao.updateStripeCustomer(customerId, null, cardToken, null, null, null, null, null, accessToken, function(err, value){
                        self.log.debug(accountId, userId, '<< createCard');
                        self.sendResultOrError(resp, err, value, "Error creating card");
                        self.createUserActivity(req, 'CREATE_STRIPE_CARD', null, {customerId: customerId}, function(){});
                        return;
                    });
                    /*
                    stripeDao.createStripeCard(customerId, cardToken, accessToken, function(err, value){
                        self.log.debug('<< createCard');
                        self.sendResultOrError(resp, err, value, "Error creating card");
                        self.createUserActivity(req, 'CREATE_STRIPE_CARD', null, {customerId: customerId}, function(){});
                        return;
                    });
                    */
                });
            }
        });

    },

    getCard: function(req, resp) {

        var self = this;
        self.log.debug('>> getCard');
        var accountId = parseInt(self.accountId(req));
        self.getStripeTokenFromAccount(req, function(err, accessToken){
            var customerId = req.params.id;
            var cardId = req.params.cardId;

            self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed) {
                if (isAllowed !== true) {
                    return self.send403(resp);
                } else {
                    stripeDao.getStripeCard(customerId, cardId, accessToken, function(err, value){
                        self.log.debug('<< getCard');
                        return self.sendResultOrError(resp, err, value, "Error creating card");
                    });
                }
            });
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
                self.getStripeTokenFromAccount(req, function(err, accessToken){
                    stripeDao.updateStripeCard(customerId, cardId, name, address_city, address_country, address_line1,
                            address_line2, address_state, address_zip, exp_month, exp_year, accessToken, function(err, value){
                        self.log.debug('<< updateCard');
                        self.sendResultOrError(resp, err, value, "Error updating card");
                        self.createUserActivity(req, 'UPDATE_STRIPE_CARD', null, {customerId: customerId, cardId: cardId}, function(){});
                        return;
                    });
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

                var customerId = req.params.id;
                self._getOrgAccessTokenFromAccountId(accountId, function(err, accessToken){
                    stripeDao.listStripeCards(customerId, accessToken, function(err, value){
                        self.log.debug('<< listCards');
                        var errCode = 500;

                        if(err && err.message.indexOf('No such customer') != -1) {
                            errCode = 404;
                        }
                        return self.sendResultOrError(resp, err, value, "Error listing cards", errCode);
                    });
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

                var customerId = req.params.id;
                var cardId = req.params.cardId;
                self.getStripeTokenFromAccount(req, function(err, accessToken){
                    stripeDao.deleteStripeCard(customerId, cardId, accessToken, function(err, value){
                        self.log.debug('<< deleteCard');
                        self.sendResultOrError(resp, err, value, "Error listing cards");
                        self.createUserActivity(req, 'DELETE_STRIPE_CARD', null, {customerId: customerId, cardId: cardId}, function(){});
                        return;
                    });
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
                self.getStripeTokenFromAccount(req, function(err, accessToken){
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
                self.getStripeTokenFromAccount(req, function(err, accessToken){
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
                            self.sendResultOrError(resp, err, value, "Error creating a charge.");
                            self.createUserActivity(req, 'CREATE_STRIPE_CHARGE', null, {card: card, customerId: customerId, contactId: contactId, userId: userId}, function(){});
                    });
                });

            }
        });

    },

    /**
     * This method is used to charge an unauthenticated user.
     * @param req
     * @param resp
     */
    createChargeForContact: function(req, resp) {
        var self = this;
        self.log.debug('>> createChargeForContact');

        /*
         * Get the access token based on the accountId of the session
         */
        var accessToken = null;
        var p1 = $.Deferred();

        var accountId = self.currentAccountId(req);
        if(accountId === appConfig.mainAccountID) {
            //no need to use an access token
        } else if(req.session.stripeAccessToken) {
            accessToken = req.session.stripeAccessToken;
            p1.resolve();
        } else {
            accountDao.getAccountByID(accountId, function(err, account){
                if(err) {
                    self.log.error('Error getting account: ' + err);
                    return self.wrapError(resp, 500, null, err);
                }

                var credentials = account.get('credentials');
                var accountBilling = {};
                credentials.forEach(function(value, index) {
                  if (value.type == 'stripe') {
                    accountBilling = value;
                  }
                });
                if(!accountBilling.accessToken || accountBilling.accessToken.length < 1) {
                    self.log.warn('Account has not been connected to Stripe');
                    return self.wrapError(resp, 400, 'Bad Request', 'No Stripe accessToken found.');
                }
                req.session.stripeAccessToken = accountBilling.accessToken;
                accessToken = req.session.stripeAccessToken;
                p1.resolve();
            });
        }

        $.when(p1).done(function(){
            var amount = req.body.amount;//REQUIRED
            var currency = req.body.currency || 'usd';//REQUIRED
            var card = req.body.card; //card or customer REQUIRED
            var customerId = req.body.customerId; //card or customer REQUIRED
            var contactId = req.params.id;
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

            if(!contactId) {
                return self.wrapError(resp, 400, null, "Invalid contact parameter.");
            }

            stripeDao.createStripeCharge(amount, currency, card, customerId, contactId, description, metadata, capture,
                statement_description, receipt_email, application_fee, null, accessToken, function(err, value){
                    self.log.debug('<< createChargeForContact');
                    return self.sendResultOrError(resp, err, value, "Error creating a charge.");
                });
        });

    },

    getCharge: function(req, resp) {

        var self = this;
        self.log.debug('>> getCharge');
        self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                self.getStripeTokenFromAccount(req, function(err, accessToken){
                    var accountId = parseInt(self.accountId(req));
                    if(accessToken === null && accountId != appConfig.mainAccountID) {
                        return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                    }
                    var chargeId = req.params.chargeId;

                    stripeDao.getStripeCharge(chargeId, accessToken, function(err, value){
                        self.log.debug('<< getCharge');
                        return self.sendResultOrError(resp, err, value, "Error retrieving a charge.");
                    });
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
                self.getStripeTokenFromAccount(req, function(err, accessToken){
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
                        self.sendResultOrError(resp, err, value, "Error updating a charge.");
                        self.createUserActivity(req, 'UPDATE_STRIPE_CHARGE', null, {chargeId: chargeId}, function(){});
                        return;
                    });
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
                self.getStripeTokenFromAccount(req, function(err, accessToken){
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
                            self.sendResultOrError(resp, err, value, "Error capturing a charge.");
                            self.createUserActivity(req, 'CAPTURE_STRIPE_CHARGE', null, {chargeId: chargeId}, function(){});
                            return;
                    });
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
                self.getStripeTokenFromAccount(req, function(err, accessToken){
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
                            self.sendResultOrError(resp, err, value, "Error creating an invoice item.");
                            self.createUserActivity(req, 'CREATE_STRIPE_INVOICEITEM', null, {customerId: customerId}, function(){});
                            return;
                    });
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
                self.getStripeTokenFromAccount(req, function(err, accessToken){
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
                self.getStripeTokenFromAccount(req, function(err, accessToken){
                    var accountId = parseInt(self.accountId(req));
                    if(accessToken === null && accountId != appConfig.mainAccountID) {
                        return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                    }
                    var invoiceItemId = req.params.itemId;

                    stripeDao.getInvoiceItem(invoiceItemId, accessToken, function(err, value){
                        self.log.debug('<< getInvoiceItem');
                        return self.sendResultOrError(resp, err, value, "Error retrieving invoice item.");
                    });
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
                self.getStripeTokenFromAccount(req, function(err, accessToken){
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
                        self.sendResultOrError(resp, err, value, "Error retrieving invoice item.");
                        self.createUserActivity(req, 'UPDATE_STRIPE_INVOICEITEM', null, {id: invoiceItemId}, function(){});
                        return;
                    });
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
                self.getStripeTokenFromAccount(req, function(err, accessToken){
                    var accountId = parseInt(self.accountId(req));
                    if(accessToken === null && accountId != appConfig.mainAccountID) {
                        return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                    }
                    var invoiceItemId = req.params.itemId;

                    stripeDao.deleteInvoiceItem(invoiceItemId, accessToken, function(err, value){
                        self.log.debug('<< deleteInvoiceItem');
                        self.sendResultOrError(resp, err, value, "Error deleting invoice item.");
                        self.createUserActivity(req, 'DELETE_STRIPE_INVOICEITEM', null, {id: invoiceItemId}, function(){});
                        return;
                    });
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
                self.getStripeTokenFromAccount(req, function(err, accessToken){
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
                            self.sendResultOrError(resp, err, value, "Error creating invoice.");
                            self.createUserActivity(req, 'CREATE_STRIPE_INVOICE', null, {customerId: customerId}, function(){});
                            return;
                    });
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
                self.getStripeTokenFromAccount(req, function(err, accessToken){
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
                });

            }
        });

    },

    getUpcomingInvoice: function(req, resp) {

        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getUpcomingInvoice');
        self.checkPermission(req, self.sc.privs.VIEW_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                accountDao.getAccountByID(accountId, function(err, account){
                    if(err) {
                        self.log.error(accountId, userId, 'Error getting account:', err);
                        return self.sendResultOrError(resp, err, null, "Error retrieving upcoming invoice.", 404);
                    } else {
                        self.getStripeTokenFromAccountObject(account, req, function(err, accessToken){
                            if(accessToken === null && accountId != appConfig.mainAccountID) {
                                return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                            }
                            var customerId = req.params.id;
                            var subscriptionId = account.get('billing').subscriptionId;

                            stripeDao.getUpcomingInvoice(customerId, subscriptionId, accessToken, function(err, value){

                                self.log.debug('<< getUpcomingInvoice');
                                return self.sendResultOrError(resp, err, value, "Error retrieving upcoming invoice.", 404);
                            });
                        });
                    }
                });


            }
        });

    },

    getMyUpcomingInvoice: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getMyUpcomingInvoice');

        accountDao.getAccountByID(accountId, function(err, account){
            if(err) {
                self.log.error('Error getting account by ID:', err);
                return self.wrapError(resp, 500, 'Error getting invoice', 'There was an error getting upcoming invoices', '');
            } else {
                var customerId = account.get('billing').stripeCustomerId;
                var subscriptionId = account.get('billing').subscriptionId;
                if(account.get('orgId') && account.get('orgId')===1 && account.get('billing').stripeParent !== 6) {
                    self._getOrgAccessToken(account.get('orgId'), function(err, accessToken){
                        stripeDao.getUpcomingInvoice(customerId, subscriptionId, accessToken, function(err, value){
                            self.log.debug(accountId, userId, '<< getMyUpcomingInvoice');
                            return self.sendResultOrError(resp, err, value, "Error retrieving upcoming invoice.", 404);
                        });
                    });
                } else {
                    stripeDao.getUpcomingInvoice(customerId, subscriptionId, null, function(err, value){
                        self.log.debug(accountId, userId, '<< getMyUpcomingInvoice');
                        return self.sendResultOrError(resp, err, value, "Error retrieving upcoming invoice.", 404);
                    });
                }


            }
        });

    },

    getMyInvoices: function(req, resp) {
        var self = this;
        self.log.debug('>> getMyInvoices');
        var accountId = parseInt(self.accountId(req));
        accountDao.getAccountByID(accountId, function(err, account) {
            if (err) {
                self.log.error('Error getting account by ID:', err);
                return self.wrapError(resp, 500, 'Error getting invoice', 'There was an error getting upcoming invoices', '');
            } else {
                var customerId = account.get('billing').stripeCustomerId;
                var dateFilter = req.body.dateFilter;
                var ending_before = req.body.ending_before;
                var limit = req.body.limit;
                var starting_after = req.body.starting_after;
                if(account.get('orgId') && account.get('orgId') === 1 && account.get('billing').stripeParent !== 6) {
                    self._getOrgAccessToken(account.get('orgId'), function(err, accessToken){
                        stripeDao.listInvoices(customerId, dateFilter, ending_before, limit, starting_after, accessToken,
                            function(err, value){
                                self.log.debug('<< getMyInvoices');
                                return self.sendResultOrError(resp, err, value, "Error listing invoices.");
                            });
                    });
                } else {
                    stripeDao.listInvoices(customerId, dateFilter, ending_before, limit, starting_after, null,
                        function(err, value){
                            self.log.debug('<< getMyInvoices');
                            return self.sendResultOrError(resp, err, value, "Error listing invoices.");
                        });
                }

            }
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
            paymentsManager.listInvoicesForAccount(account, dateFilter, ending_before, limit, starting_after, self.userId(req), function(err, invoices){
                self.log.debug('<< getInvoicesForAccount');
                return self.sendResultOrError(resp, err, invoices, "Error listing invoices.");
            });
        });

    },

    getChargesForAccount: function(req, resp) {
        var self = this;
        self.log.debug('>> getChargesForAccount');
        accountDao.getAccountByHost(req.host, function(err, account) {
            if (err || account == null) {
                self.log.error('Error getting account: ' + err);
                return self.wrapError(resp, 500, 'Could not find account.');
            }
            var billing = account.get('billing');
            var customerId = billing.stripeCustomerId;
            if (!customerId || customerId === '') {
                self.log.error('No stripe customerId found for account: ' + account.id());
                return self.wrapError(resp, 400, 'No Stripe CustomerId found for account.');
            }

            var created = req.query.created;
            var ending_before = req.query.ending_before;
            var limit = req.query.limit || 100;
            var starting_after = req.query.starting_after;


            if(billing.stripeParent && billing.stripeParent !== 6) {
                self._getAccessTokenFromAccountId(billing.stripeParent, function(err, accessToken){
                    stripeDao.listStripeCharges(created, customerId, ending_before, limit, starting_after, accessToken, function(err, charges){
                        self.log.debug('<< getChargesForAccount');
                        return self.sendResultOrError(resp, err, charges, "Error listing charges.");
                    });
                });
            } else if(account.get('orgId') && account.get('orgId') === 1 && billing.stripeParent !== 6) {
                self._getOrgAccessToken(account.get('orgId'), function(err, accessToken){
                    stripeDao.listStripeCharges(created, customerId, ending_before, limit, starting_after, accessToken, function(err, charges){
                        self.log.debug('<< getChargesForAccount');
                        return self.sendResultOrError(resp, err, charges, "Error listing charges.");
                    });
                });
            } else {
                stripeDao.listStripeCharges(created, customerId, ending_before, limit, starting_after, null, function(err, charges){
                    self.log.debug('<< getChargesForAccount');
                    return self.sendResultOrError(resp, err, charges, "Error listing charges.");
                });
            }


        });
    },

    getAccountCharge: function(req, resp) {
        var self = this;
        self.log.debug('>> getAccountCharge');

        var chargeId = req.params.chargeId;

        stripeDao.getStripeCharge(chargeId, null, function(err, charge){
            self.log.debug('<< getAccountCharge');
            return self.sendResultOrError(resp, err, charge, "Error listing charges.");
        });
    },

    updateInvoice: function(req, resp) {

        var self = this;
        self.log.debug('>> updateInvoice');
        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                self.getStripeTokenFromAccount(req, function(err, accessToken){
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
                            self.sendResultOrError(resp, err, value, "Error updating invoice.");
                            self.createUserActivity(req, 'UPDATE_STRIPE_INVOICE', null, {id: invoiceId}, function(){});
                            return;
                    });
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
        self.getStripeTokenFromAccount(req, function(err, accessToken){
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
            });
        });

    },

    payInvoice: function(req, resp) {

        var self = this;
        self.log.debug('>> payInvoice');
        self.checkPermission(req, self.sc.privs.MODIFY_PAYMENTS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                self.getStripeTokenFromAccount(req, function(err, accessToken){
                    var accountId = parseInt(self.accountId(req));
                    if(accessToken === null && accountId != appConfig.mainAccountID) {
                        return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                    }
                    var customerId = req.params.id;
                    var invoiceId = req.params.invoiceId;

                    stripeDao.payInvoice(invoiceId, accessToken, function(err, value){
                        self.log.debug('<< payInvoice');
                        self.sendResultOrError(resp, err, value, "Error paying invoice.");
                        self.createUserActivity(req, 'PAY_STRIPE_INVOICE', null, {customerId: customerId, invoiceId:invoiceId}, function(){});
                        return;
                    });
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

                var customerId = req.params.id;
                var cardId = req.params.cardId;
                self.getStripeTokenFromAccount(req, function(err, accessToken){
                    stripeDao.createToken(cardId, customerId, accessToken, function(err, value){
                        self.log.debug('<< createToken');
                        self.sendResultOrError(resp, err, value, "Error creating token.");
                        self.createUserActivity(req, 'CREATE_STRIPE_TOKEN', null, {customerId: customerId, cardId: cardId}, function(){});
                        return;
                    });
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
                self.getStripeTokenFromAccount(req, function(err, accessToken){
                    var accountId = parseInt(self.accountId(req));
                    if(accessToken === null && accountId != appConfig.mainAccountID) {
                        return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                    }
                    var tokenId = req.params.id;

                    stripeDao.getToken(tokenId, function(err, value){
                        self.log.debug('<< getToken');
                        return self.sendResultOrError(resp, err, value, "Error retrieving token.");
                    });
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
                self.getStripeTokenFromAccount(req, function(err, accessToken){
                    var accountId = parseInt(self.accountId(req));
                    if(accessToken === null && accountId != appConfig.mainAccountID) {
                        return self.wrapError(resp, 403, 'Unauthenticated', 'Stripe Account has not been connected', 'Connect the Stripe account and retry this operation.');
                    }
                    var eventId = req.params.id;

                    stripeDao.getEvent(eventId, accessToken, function(err, value){
                        self.log.debug('<< getEvent');
                        return self.sendResultOrError(resp, err, value, "Error retrieving event.");
                    });
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
                self.getStripeTokenFromAccount(req, function(err, accessToken){
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



    getStripeAccount: function(req, resp) {
        var self = this;
        self.log.debug('>> getStripeAccount');

        self.getStripeTokenFromAccount(req, function(err, accessToken){
            stripeDao.getStripeAccount(accessToken, function(err, value){
                self.log.debug('<< getStripeAccount');
                return self.sendResultOrError(resp, err, value, "Error listing events.");
            });
        });

    },

    _getOrgAccessToken: function(orgId, fn) {
        var self = this;
        self.log.debug('>> getOrgAccessToken(' + orgId + ')');
        orgDao.getById(orgId, $$.m.Organization, function(err, organization){
            if(organization) {
                accountDao.getAccountByID(organization.get('adminAccount'), function(err, account){
                    if(account) {
                        var credentials = account.get('credentials');
                        var creds = null;
                        _.each(credentials, function (cred) {
                            if (cred.type === 'stripe') {
                                creds = cred;
                            }
                        });
                        if(creds && creds.accessToken) {
                            self.log.debug('Returning:', creds.accessToken);
                            return fn(null, creds.accessToken);
                        } else {
                            self.log.debug('Returning null');
                            return fn(null, null);
                        }
                    } else {
                        fn(err);
                    }
                });
            } else {
                fn(err);
            }
        });
    },

    _getOrgAccessTokenFromAccountId: function(accountId, fn) {
        var self = this;
        self.log.debug('>> getOrgAccessTokenFromAccountId(' + accountId + ')');
        accountDao.getAccountByID(accountId, function(err, account){
            if(err || !account) {
                fn(err);
            } else {
                var billing = account.get('billing');
                var orgId = account.get('orgId');
                if(billing.stripeParent && billing.stripeParent !== 6) {
                    self._getAccessTokenFromAccountId(billing.stripeParent, fn);
                } else if(orgId && billing.stripeParent !== 6) {
                    self._getOrgAccessToken(orgId, fn);
                } else {
                    fn();
                }
            }
        });
    },

    _getAccessTokenFromAccountId: function(accountId, fn) {
        var self = this;
        accountDao.getAccountByID(accountId, function(err, account){
            if(account) {
                var credentials = account.get('credentials');
                var creds = null;
                _.each(credentials, function (cred) {
                    if (cred.type === 'stripe') {
                        creds = cred;
                    }
                });
                if(creds && creds.accessToken) {
                    self.log.debug('Returning:', creds.accessToken);
                    return fn(null, creds.accessToken);
                } else {
                    self.log.debug('Returning null');
                    return fn(null, null);
                }
            } else {
                fn(err);
            }
        });

    }
});

return new api();
