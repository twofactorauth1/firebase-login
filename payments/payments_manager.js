/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var stripeDao = require('./dao/stripe.dao.js');

var log = $$.g.getLogger("payments_manager");
var paypalClient = require('./paypal/paypal.client');
var async = require('async');
var appConfig = require('../configs/app.config');
var accountDao = require('../dao/account.dao');
var orgDao = require('../organizations/dao/organization.dao');

module.exports = {
    createStripeCustomerForUser: function(cardToken, user, accountId, newAccountId, accessToken, orgId, fn) {
        log.debug(accountId, user.id(), '>> createStripeCustomerForUser');
        //check for customer first.
        var customerId = user.getStripeIDByOrg(orgId);
        if(customerId && customerId.length >0){
            stripeDao.getStripeCustomer(customerId, accessToken, function(err, stripeCustomer){
                if(err) {
                    log.error(accountId, user.id(), 'Error fetching Stripe customer:',err);
                    return fn(err);
                } else {
                    log.debug(accountId, user.id(), 'got stripe customer:', stripeCustomer);
                    var accounts = [];
                    accounts.push(stripeCustomer.metadata.accounts ||'');
                    accounts.push(newAccountId);
                    stripeCustomer.metadata.accounts = accounts;
                    stripeDao.updateStripeCustomer(customerId, null, null, null, null, null, null,
                        stripeCustomer.metadata, accessToken, fn);
                }
            });
        } else {
            stripeDao.createStripeCustomerForUser(cardToken, user, accountId, 0, newAccountId, accessToken, orgId, fn);
        }
    },

    createStripeSubscription: function(customerId, planId, accountId, userId, coupon, setupFee, accessToken, fn) {
        log.debug(accountId, userId, '>> createStripeSubscription(' + customerId + ',' + planId +',' + accountId + ',' + userId + ',' + coupon + ','+ setupFee + ',' + accessToken + ',callback)');
        if(setupFee && setupFee > 0) {
            stripeDao.createInvoiceItem(customerId, setupFee, 'usd', null, null, 'Signup Fee', null, accessToken, function(err, value){
                if(err) {
                    log.error(accountId, userId, 'Error creating signup fee invoice item: ' + err);
                    return fn(err, null);
                } else {
                    log.debug(accountId, userId, 'Created signup fee invoice item.');
                    stripeDao.createStripeSubscription(customerId, planId, coupon, null, null, null, null, null, accountId, null, userId, accessToken, fn);
                }
            });
        } else {
            stripeDao.createStripeSubscription(customerId, planId, coupon, null, null, null, null, null, accountId, null, userId, accessToken, fn);
        }

    },

    listStripeCoupons: function(accessToken, fn) {
        log.debug('>> listStripeCoupons(' + accessToken + ',fn)');
        return stripeDao.listCoupons(accessToken, fn);
    },

    getStripeCouponByName: function(couponName, accessToken, fn) {
        log.debug('>> getStripeCouponByName(' + couponName + ',' + accessToken + ',fn)');
        return stripeDao.getCoupon(couponName, accessToken, fn);
    },

    createStripeCoupon: function(couponObj, accessToken, fn) {
        log.debug('>> createStripeCoupon');
        /**
         *  duration: (forever|once|repeating) required
         *  amount_off | percent_off required
         *  duration_in_months: required if duration is repeating
         */
        var id = couponObj.id;
        var duration = couponObj.duration;
        if(duration !== 'forever' && duration !== 'once' && duration !== ' repeating') {
            return fn('Validation Error: duration must be one of: duration, once, repeating', null);
        }
        var amount_off = couponObj.amount_off;
        var currency = couponObj.currency || 'usd';
        var duration_in_months = couponObj.duration_in_months;
        if(duration === 'repeating' && !duration_in_months) {
            return fn('Validation Error: duration_in_months must be a postive integer if duration is repeating', null);
        }
        var max_redemptions = couponObj.max_redemptions;
        var metadata = couponObj.metadata;
        var percent_off = couponObj.percent_off;
        if(!amount_off && !percent_off) {
            return fn('Validation Error: either amount_off or percent_off is required', null);
        }
        var redeem_by = couponObj.redeem_by;
        return stripeDao.createCoupon(id, duration, amount_off, currency, duration_in_months, max_redemptions,
            metadata, percent_off, redeem_by, accessToken, fn);

    },

    deleteStripeCoupon: function(couponName, accessToken, fn) {
        log.debug('>> deleteStripeCoupon');
        return stripeDao.deleteCoupon(couponName, accessToken, fn);
    },

    addCardToCustomer: function(cardToken, customerId, accessToken, fn) {
        log.debug('>> addCardToCustomer');
        stripeDao.createStripeCard(customerId, cardToken, accessToken, function(err, value){
            if(err) {
                log.error('error adding card: ' + err);
                return fn(err, null);
            } else {
                log.debug('<< addCardToCustomer');
                return fn(null, value);
            }
        });
    },

    addCardUpdateDefaultAndAttemptPayment: function(accountId, userId, cardToken, customerId, accessToken, fn) {
        var self = this;
        self.log = log;
        self.log.debug(accountId, userId, '>> addCardUpdateDefaultAndAttemptPayment');
        async.waterfall([
            function(cb) {
                stripeDao.createStripeCard(customerId, cardToken, accessToken, function(err, value){
                    if(err) {
                        self.log.error(accountId, userId, 'Error adding card:', err);
                        cb(err);
                    } else {
                        self.log.debug(accountId, userId, 'Added card:', value);
                        cb(null, value);
                    }
                });
            },
            function(card, cb) {
                stripeDao.updateStripeCustomer(customerId, null, null, null, card.id, null, null, null, accessToken, function(err, customer){
                    if(err) {
                        self.log.error(accountId, userId, 'Error updating default source:', err);
                        cb(err);
                    } else {
                        self.log.debug(accountId, userId, 'Updated customer default card:', customer);
                        cb(null);
                    }
                });
            },
            function(cb) {
                stripeDao.listInvoices(customerId, null, null, 1, null, accessToken, function(err, invoices){
                    if(err) {
                        self.log.error(accountId, userId, 'Error listing invoices:', err);
                        cb(err);
                    } else {
                        self.log.debug(accountId, userId, 'Got invoices:', invoices);
                        cb(null, invoices);
                    }
                });
            },
            function(invoices, cb) {
                if(invoices && invoices.data && invoices.data.length > 0) {
                    if(invoices.data[0].attempted === true && invoices.data[0].paid === false) {
                        stripeDao.payInvoice(invoices.data[0].id, accessToken, function(err, value){
                            if(err) {
                                self.log.error(accountId, userId, 'Error paying invoice:', err);
                                cb(err);
                            } else {
                                self.log.debug(accountId, userId, 'Paid invoice:', value);
                                cb(null, value);
                            }
                        });
                    } else {
                        cb(null);
                    }
                } else {
                    cb(null);
                }
            }
        ], function(err, invoice){
            if(err) {
                self.log.error(accountId, userId, 'Error from Stripe:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< addCardUpdateDefaultAndAttemptPayment');
                fn(null, invoice);
            }
        });
    },

    getInvoiceForSubscription: function(stripeCustomerId, subscriptionId, accessToken, fn) {
        log.debug('>> getInvoiceForSubscription');
        stripeDao.listInvoices(stripeCustomerId, null, null, 100, null, accessToken, function(err, invoiceListObj){
            if(err) {
                log.error('Error listing invoices: ' + err);
                return fn(err, null);
            } else {
                var invoiceObj = {};
                _.each(invoiceListObj.data, function(invoice){
                    if(invoice && invoice.subscription === subscriptionId) {
                        invoiceObj = invoice;
                    }
                });
                return fn(null, invoiceObj);
            }
        });
    },

    payWithPaypal: function(receiverEmail, amount, memo, cancelUrl, returnUrl, fn) {
        log.debug('>> payWithPaypal');
        paypalClient.pay(receiverEmail, amount, memo, cancelUrl, returnUrl, function(err, value){
            log.debug('<< payWithPaypal');
            return fn(err, value);
        });
    },

    listInvoicesForAccount: function(account, dateFilter, ending_before, limit, starting_after, userId, fn) {
        var self = this;
        self.log = log;
        var accountId = account.id();
        self.log.debug(accountId, userId, '>> listInvoicesForAccount');
        var customerId = account.get('billing').stripeCustomerId;
        var subscriptionId = account.get('billing').subscriptionId;
        if(!customerId || customerId === '') {
            self.log.warn(accountId, userId, 'No stripe customerId found for account: ' + accountId);
            return fn(null, {});
        }
        var billing = account.get('billing');
        if(account.get('orgId') && account.get('orgId') >= 1 && billing.stripeParent !== 6) {
            if(billing.stripeParent) {
                self._getStripeParentAccessToken(account, function(err, accessToken){
                    self.log.debug('using the accessToken:', accessToken);
                    stripeDao.listInvoices(customerId, dateFilter, ending_before, limit, starting_after, accessToken, function(err, invoices){
                        //need to filter based on subscriptionId
                        //TODO: if we ever keep track of subscription history, we will need to handle that as well
                        if(err) {
                            self.log.error(accountId, userId, 'Error listing invoices:', err);
                            return fn(err);
                        } else {
                            //self.log.debug('Filtering invoices by [' + subscriptionId + ']', invoices );

                            var filteredInvoices = [];
                            invoices = invoices || {};
                            _.each(invoices.data, function(invoice){
                                //self.log.debug('line:', invoice.lines.data[0]);
                                if(invoice.lines.data[0].id === subscriptionId || invoice.subscription === subscriptionId) {
                                    filteredInvoices.push(invoice);
                                } else {
                                    //self.log.debug(accountId, userId, 'filtering: ', invoice);
                                }
                            });
                            invoices.data = filteredInvoices;
                            invoices.count = filteredInvoices.length;
                            self.log.debug(accountId, userId, '<< listInvoicesForAccount');
                            return fn(null, invoices);
                        }

                    });
                });
            } else {
                self._getOrgAccessToken(account.get('orgId'), function(err, accessToken){
                    self.log.debug('using the accessToken:', accessToken);
                    stripeDao.listInvoices(customerId, dateFilter, ending_before, limit, starting_after, accessToken, function(err, invoices){
                        //need to filter based on subscriptionId
                        //TODO: if we ever keep track of subscription history, we will need to handle that as well
                        if(err) {
                            self.log.error(accountId, userId, 'Error listing invoices:', err);
                            return fn(err);
                        } else {
                            //self.log.debug('Filtering invoices by [' + subscriptionId + ']', invoices );

                            var filteredInvoices = [];
                            invoices = invoices || {};
                            _.each(invoices.data, function(invoice){
                                //self.log.debug('line:', invoice.lines.data[0]);
                                if(invoice.lines.data[0].id === subscriptionId || invoice.subscription === subscriptionId) {
                                    filteredInvoices.push(invoice);
                                } else {
                                    //self.log.debug(accountId, userId, 'filtering: ', invoice);
                                }
                            });
                            invoices.data = filteredInvoices;
                            invoices.count = filteredInvoices.length;
                            self.log.debug(accountId, userId, '<< listInvoicesForAccount');
                            return fn(null, invoices);
                        }

                    });
                });
            }

        } else {
            self.log.debug('No accessToken');
            stripeDao.listInvoices(customerId, dateFilter, ending_before, limit, starting_after, null, function(err, invoices){
                //need to filter based on subscriptionId
                //TODO: if we ever keep track of subscription history, we will need to handle that as well
                if(err) {
                    self.log.error(accountId, userId, 'Error listing invoices:', err);
                    return fn(err);
                } else {
                    //self.log.debug('Filtering invoices by [' + subscriptionId + ']', invoices );

                    var filteredInvoices = [];
                    invoices = invoices || {};
                    _.each(invoices.data, function(invoice){
                        //self.log.debug('line:', invoice.lines.data[0]);
                        if(invoice.lines.data[0].id === subscriptionId || invoice.subscription === subscriptionId) {
                            filteredInvoices.push(invoice);
                        } else {
                            //self.log.debug(accountId, userId, 'filtering: ', invoice);
                        }
                    });
                    invoices.data = filteredInvoices;
                    invoices.count = filteredInvoices.length;
                    self.log.debug(accountId, userId, '<< listInvoicesForAccount');
                    return fn(null, invoices);
                }

            });
        }

    },

    listChargesForAccount: function(account, created, endingBefore, limit, startingAfter, userId, fn) {
        var self = this;
        self.log = log;
        var accountId = account.id();
        self.log.debug(accountId, userId, '>> listChargesForAccount');

        //if no limit is passed, assume 0
        var _limit = limit || 0;
        var accessToken = null;
        if(accountId !== appConfig.mainAccountID) {
            var credentials = account.get('credentials');
            var creds = null;
            _.each(credentials, function (cred) {
                if (cred.type === 'stripe') {
                    creds = cred;
                }
            });

            if(creds && creds.accessToken) {
                accessToken = creds.accessToken;
            } else {
                var charges = {"object":"list","data":[],"has_more":false,"url":"/v1/charges","totalrevenue":0};
                self.log.debug(accountId, userId, '<< listChargesForAccount (no Stripe)');
                return fn(null, charges);
            }
        }

        stripeDao.listStripeCharges(created, null, endingBefore, _limit, startingAfter, accessToken, function(err, charges){
            if(err) {
                self.log.error(accountId, userId, 'Error listing charges:', err);
                return fn(err);
            } else {
                self.log.debug(accountId, userId, '<< listChargesForAccount');
                return fn(null, charges);
            }
        });
    },

    cancelAccountSubscription: function(accountId, userId, account, atPeriodEnd, fn) {
        var self = this;
        self.log = log;
        self.log.debug(accountId, userId, '>> cancelAccountSubscription');
        async.waterfall([
            function(cb) {
                if(account.get('billing').stripeParent && account.get('billing').stripeParent === 6) {
                    cb(null, null);
                } else if(account.get('billing').stripeParent) {
                    self._getStripeParentAccessToken(account, function(err, token){
                        if(err) {
                            self.log.error(accountId, userId, 'Error getting accessToken:', err);
                            cb(err);
                        } else {
                            cb(null, token);
                        }
                    });
                } else if(account.get('orgId') && account.get('orgId') > 0) {
                    self._getOrgAccessToken(account.get('orgId'), function(err, token){
                        if(err) {
                            self.log.error(accountId, userId, 'Error getting accessToken:', err);
                            cb(err);
                        } else {
                            cb(null, token);
                        }
                    });
                } else {
                    cb(null, null);
                }
            },
            function(accessToken, cb) {
                var billing = account.get('billing');
                var customerId = billing.stripeCustomerId;
                var subscriptionId = billing.subscriptionId;
                stripeDao.cancelStripeSubscription(accountId, customerId, subscriptionId, atPeriodEnd, accessToken, function(err, value){
                    if(err) {
                        self.log.error(accountId, userId, 'Error cancelling stripe subscription:', err);
                        cb(err);
                    } else {
                        cb(null, value);
                    }
                });
            }
        ], function(err, value){
            self.log.debug(accountId, userId, '<< cancelAccountSubscription');
            fn(err, value);
        });

    },

    _getStripeParentAccessToken: function(account, fn) {
        var self = this;
        var billing = account.get('billing');
        if(billing && billing.stripeParent) {
            self.log.debug('using stripeParent:', billing.stripeParent);
            //need to get the token from stripeParent account.
            accountDao.getAccountByID(billing.stripeParent, function(err, account){
                if(account) {
                    var credentials = account.get('credentials');
                    var creds = null;
                    _.each(credentials, function (cred) {
                        if (cred.type === 'stripe') {
                            creds = cred;
                        }
                    });
                    if(creds && creds.accessToken) {
                        return fn(null, creds.accessToken);
                    } else {
                        return fn(null, null);
                    }
                } else {
                    fn(err || 'No account found');
                }
            });
        } else {
            fn(null, null);
        }
    },

    _getOrgAccessToken: function(orgId, fn) {
        var self = this;
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
                            return fn(null, creds.accessToken);
                        } else {
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
    }


};