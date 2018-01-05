/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var disabled = true;

var log = $$.g.getLogger("sm");
var dao = require('./dao/privilege.dao.js');
var subscriptionPrivilegeDao = require('./dao/subscription.privilege.dao');
var accountDao = require('../dao/account.dao');
var stripeDao = require('../payments/dao/stripe.dao');
var appConfig = require('../configs/app.config');
var moment = require('moment');
var orgManager = require('../organizations/organization_manager');

var defaultPrivileges = [
    'VIEW_ACCOUNT',
    'VIEW_USER',
    'MODIFY_ACCOUNT',
    'MODIFY_USER',
    'VIEW_READINGS',
    'VIEW_CAMPAIGN',
    'MODIFY_CAMPAIGN',
    'VIEW_ANALYTICS',
    'MODIFY_ANALYTICS',
    'VIEW_WEBSITE',
    'MODIFY_WEBSITE',
    'VIEW_THEME',
    'MODIFY_THEME',
    'VIEW_TEMPLATE',
    'MODIFY_TEMPLATE',
    'VIEW_CONTACT',
    'MODIFY_CONTACT',
    'VIEW_COURSE',
    'MODIFY_COURSE',
    'VIEW_EMAIL_SOURCE',
    'MODIFY_EMAIL_SOURCE',
    'VIEW_EMAIL_MESSAGE',
    'MODIFY_PRODUCT',
    'VIEW_PRODUCT',
    'VIEW_PAYMENTS',
    'MODIFY_PAYMENTS',
    'VIEW_ASSET',
    'MODIFY_ASSET',
    'VIEW_DASHBOARD',
    'MODIFY_DASHBOARD',
    'VIEW_SOCIALCONFIG',
    'MODIFY_SOCIALCONFIG',
    'VIEW_ORDER',
    'MODIFY_ORDER',
    'MODIFY_PO',
    'VIEW_PO',
    'MODIFY_PROMOTION',
    'VIEW_PROMOTION',
    'VIEW_QUOTE',
    'MODIFY_QUOTE',
    'ALL'

];

var defaultSubscriptionPrivs = [
    'integrations/payments',
    'account',
    'analytics',
    'assets',
    'authentication',
    'campaign',
    'cms',
    'contact',
    'courses',
    'dashboard',
    'emaildata',
    'products',
    'user',
    'social/socialconfig',
    'order',
    'all'
];

var securityManager = {

    initializeUserPrivileges: function(userId, userName, rolesAry, accountId, cb) {
        var self = this;
        log.debug('>> initializeUserPrivileges');
        self.getPrivilegesByUserAndAccount(userId, accountId, function(err, value){
            if(err) {
                log.error('Exception while getting privileges: ' + err);
                cb(err, null);
            } else if(value === null){
                var priv = new $$.m.Privilege({
                    'userId': userId,
                    'userName': userName,
                    'roles': rolesAry,
                    'accountId': accountId,
                    'privs': defaultPrivileges
                });
                dao.saveOrUpdate(priv, function(err, privilege){
                    if(err) {
                        log.error('Exception while saving privilege: ' + err);
                        cb(err, null);
                    } else {
                        log.debug('<< initializeUserPrivileges');
                        cb(null, privilege);
                    }
                });

            } else {
                log.warn('attempting to reinitialize a privilege for user [' + userId + '] and account [' + accountId + ']');
                cb(null, value);
            }
        });
    },

    getPrivilegesByUserId: function(userId, cb) {
        var self = this;
        log.debug('>> getPrivilegesByUserId');
        dao.findMany({'userId': userId}, $$.m.Privilege, function(err, privList){
            if(err) {
                log.error('Exception while finding privilege by userId[' + userId + ']: ' + err );
                cb(err, null);
            } else {
                log.debug('<< getPrivilegesByUserId');
                cb(null, privList);
            }
        });
    },

    getPrivilegesByUserAndAccount: function(userId, accountId, cb) {
        var self = this;
        log.trace('>> getPrivilegesByUserAndAccount(' + userId + ',' + accountId + ')');
        dao.findOne({'userId': userId, accountId: accountId}, $$.m.Privilege, function(err, privilege){
            if(err) {
                log.error('Exception while finding privilege by userId[' + userId + '] and account[' + accountId + ']: ' + err );
                cb(err, null);
            } else {
                log.trace('<< getPrivilegesByUserAndAccount');
                cb(null, privilege);
            }
        });
    },

    hasPermission: function(userId, accountId, priv, cb) {
        var self = this;
        log.trace('>> hasPermission');
        if(disabled === true) {
            log.debug('<< hasPermission (disabled)');
            return cb(null, true);
        }
        self.getPrivilegesByUserAndAccount(userId, accountId, function(err, privilege){
            if(err) {
                log.error('Exception while finding privilege by userId[' + userId + '] and account[' + accountId + ']: ' + err );
                cb(null, false);
            } else {
                if(privilege != null && _.contains(privilege.get('privs'), priv)) {
                    log.trace('<< hasPermission(true)');
                    cb(null, true);
                } else {
                    log.debug('<< hasPermission(false)');
                    log.debug('... looking for [' + priv + '] and the privilege object is:', privilege);
                    cb(null, false);
                }
            }
        });


    },

    /**
     * Returns true if subscription is valid.  Sets subscriptionprivs in session.  Sets subscription name in session.
     * //if subscription ID and lastVerified within 24rs, set subName and privs

     //if subscription ID and lastVerified > 24hrs
     //verify sub with Stripe
     //update lastVerified
     //set subName and privs
     * @param req
     * @param cb
     */
    verifySubscription: function(req, cb) {
        var self = this;
        log.trace('>> verifySubscription');
        if(disabled === true) {
            req.session.subprivs = defaultSubscriptionPrivs;
            log.debug('<< verifySubscription (disabled)');
            return cb(null, true);
        }

        //check if session has property(subName) --> return if present
        if(req.session.subName !== undefined && req.session.subprivs) {
            log.trace('<< verifySubscription(true[' + req.session.subName + '])');
            return cb(null, true);
        }

        //get account by ID from session req.session.accountId
        accountDao.getAccountByID(req.session.accountId, function(err, account){
            if(err) {
                log.error('Error getting account: ' + err);
                return cb(err, null);
            }
            if(account === null) {
                log.warn('Could not find account for id: ' + req.session.accountId);
                return cb(null, false);
            }
            var billing = account.get('billing');
            if(self._isEvergreen(billing)) {
                req.session.subprivs = defaultSubscriptionPrivs;
                log.trace('<< verifySubscription(evergreen: ' + req.session.accountId + ')');
                return cb(null, true);
            }
            if(self.isWithinTrial(billing)) {
                req.session.subprivs = defaultSubscriptionPrivs;
                log.trace('<< verifySubscription(freetrial: ' + req.session.accountId + ')');
                return cb(null, true);
            }

            if(!billing.subscriptionId) {
                log.debug('No subscription found for account: ' + req.session.accountId);
                return cb(null, false);
            }
            //if no verification OR verification older than 24 hours
            var accessToken = null;
            if(billing.stripeParent && billing.stripeParent !== 6) {
                accountDao.getAccountByID(billing.stripeParent, function(err, adminAccount){
                    if(err) {
                        log.error('Error getting org stripe credentials:', err);
                        return cb(null, false);
                    } else {
                        var credentials = adminAccount.get('credentials');
                        var creds = null;
                        _.each(credentials, function (cred) {
                            if (cred.type === 'stripe') {
                                creds = cred;
                            }
                        });
                        if(creds && creds.accessToken) {
                            //log.info('using accessToken:', creds.accessToken);
                            //log.info('from adminAccount:', adminAccount);
                            accessToken = creds.accessToken;
                        }
                        if(!billing.lastVerified || moment().diff(billing.lastVerified, 'hours') >24) {
                            self._verifyAndSetSessionPrivs(billing, accessToken, account, req, cb);
                        } else {
                            self._setSessionPrivs(billing, accessToken, req, cb);
                        }
                    }
                });
            } else if(account.get('orgId') && account.get('orgId') > 0 && billing.stripeParent !== 6) {
                orgManager.getAdminAccountByOrgId(account.id(), null, account.get('orgId'), function(err, adminAccount){
                    if(err) {
                        log.error('Error getting org stripe credentials:', err);
                        return cb(null, false);
                    } else {
                        var credentials = adminAccount.get('credentials');
                        var creds = null;
                        _.each(credentials, function (cred) {
                            if (cred.type === 'stripe') {
                                creds = cred;
                            }
                        });
                        if(creds && creds.accessToken) {
                            //log.info('using accessToken:', creds.accessToken);
                            //log.info('from adminAccount:', adminAccount);
                            accessToken = creds.accessToken;
                        }
                        if(!billing.lastVerified || moment().diff(billing.lastVerified, 'hours') >24) {
                            self._verifyAndSetSessionPrivs(billing, accessToken, account, req, cb);
                        } else {
                            self._setSessionPrivs(billing, accessToken, req, cb);
                        }
                    }
                });
            } else {
                if(!billing.lastVerified || moment().diff(billing.lastVerified, 'hours') >24) {
                    self._verifyAndSetSessionPrivs(billing, accessToken, account, req, cb);
                } else {
                    self._setSessionPrivs(billing, accessToken, req, cb);
                }
            }
        });

    },

    _verifyAndSetSessionPrivs: function(billing, accessToken, account, req, cb) {
        stripeDao.getStripeSubscription(billing.stripeCustomerId, billing.subscriptionId, accessToken, function(err, subscription){
            if(err || !subscription) {
                log.error('Error getting stripe subscription: ' + err);
                return cb(err, false);
            } else if(subscription.status === 'active' || subscription.status === 'trialing') {
                billing.lastVerified = new Date();
                account.set('billing', billing);
                //do this asynchronously...we don't care about the result
                accountDao.saveOrUpdate(account, function(err, value){if(err){log.error('Error storing account lastVerified.: ' + err)}});
                var planId = subscription.plan.id;
                var planName = subscription.plan.name;
                subscriptionPrivilegeDao.getByPlanId(req.session.accountId, planId, function(err, subPrivs){
                    if(err || !subPrivs) {
                        log.error('Error getting subscription privileges for plan [' + planId + ']: ' + err);
                        return cb(err, false);
                    }
                    req.session.subName = planName;
                    req.session.subprivs = subPrivs.get('activePrivs');
                    log.trace('<< verifySubscription(true)');
                    return cb(null, true);
                });
            } else {
                //TODO: If the sub is expired, put in privs here
                log.warn('The subscription for account ' + req.session.accountId + ' appears to be expired.');
                return cb(null, false);
            }
        });
    },

    _setSessionPrivs: function(billing, accessToken, req, cb) {
        stripeDao.getStripeSubscription(billing.stripeCustomerId, billing.subscriptionId, accessToken, function(err, subscription){
            if(err) {
                log.error('Error getting stripe subscription: ' + err);
                return cb(err, false);
            } else if(subscription && (subscription.status === 'active' || subscription.status === 'trialing')) {

                var planId = subscription.plan.id;
                var planName = subscription.plan.name;
                subscriptionPrivilegeDao.getByPlanId(req.session.accountId, planId, function(err, subPrivs){
                    if(err || !subPrivs) {
                        log.error('Error getting subscription privileges for plan [' + planId + ']: ' + err);
                        return cb(err, false);
                    }
                    req.session.subName = planName;
                    req.session.subprivs = subPrivs.get('activePrivs');
                    log.trace('<< verifySubscription');
                    return cb(null, true);
                });
            } else {
                //TODO: If the sub is expired, put in privs here
                log.warn('The subscription for account ' + req.session.accountId + ' appears to be expired.');
                return cb(null, false);
            }
        });
    },

    verifySubscriptionWithoutSettingSessionVariables: function(req, accountId, cb) {
        var self = this;
        log.trace('>> verifySubscriptionWithoutSettingSessionVariables');
        if(disabled === true) {
            //req.session.subprivs = defaultSubscriptionPrivs;
            log.debug('<< verifySubscriptionWithoutSettingSessionVariables (disabled)');
            return cb(null, true);
        }

        //check if session has property(subName) --> return if present
        if(req.session.subName !== undefined && req.session.subprivs) {
            log.trace('<< verifySubscriptionWithoutSettingSessionVariables(true[' + req.session.subName + '])');
            return cb(null, true);
        }

        //get account by ID from session req.session.accountId
        accountDao.getAccountByID(accountId, function(err, account){
            if(err) {
                log.error('Error getting account: ' + err);
                return cb(err, null);
            }
            if(account === null) {
                log.warn('Could not find account for id: ' + accountId);
                return cb(null, false);
            }
            var billing = account.get('billing');
            if(self._isEvergreen(billing)) {
                log.trace('<< verifySubscriptionWithoutSettingSessionVariables(evergreen: ' + accountId + ')');
                return cb(null, true);
            }

            if(self.isCancelled(billing)){
                log.trace('<< verifySubscriptionWithoutSettingSessionVariables(Cancelled: ' + accountId + ')');
                return cb(null, false);
            }

            if(self.isWithinTrial(billing)) {
                log.trace('<< verifySubscriptionWithoutSettingSessionVariables(freetrial: ' + accountId + ')');
                return cb(null, true);
            }

            if(!billing.subscriptionId) {
                log.debug('No subscription found for account: ' + accountId);
                return cb(null, false);
            }
            //if no verification OR verification older than 24 hours

            var accessToken = null;
            if(billing.stripeParent && billing.stripeParent !== 6) {
                accountDao.getAccountByID(billing.stripeParent, function(err, adminAccount){
                    if(err) {
                        log.error('Error getting org stripe credentials:', err);
                        return cb(null, false);
                    } else {
                        var credentials = adminAccount.get('credentials');
                        var creds = null;
                        _.each(credentials, function (cred) {
                            if (cred.type === 'stripe') {
                                creds = cred;
                            }
                        });
                        if(creds && creds.accessToken) {
                            //log.info('using accessToken:', creds.accessToken);
                            //log.info('from adminAccount:', adminAccount);
                            accessToken = creds.accessToken;
                        }
                        if(!billing.lastVerified || moment().diff(billing.lastVerified, 'hours') >24) {
                            self._verifyAndSetSessionPrivs(billing, accessToken, account, req, cb);
                        } else {
                            self._setSessionPrivs(billing, accessToken, req, cb);
                        }
                    }
                });
            } else if(account.get('orgId') && account.get('orgId') > 0 && billing.stripeParent !== 6) {
                orgManager.getAdminAccountByOrgId(account.id(), null, account.get('orgId'), function (err, adminAccount) {
                    if (err) {
                        log.error('Error getting org stripe credentials:', err);
                        return cb(null, false);
                    } else {
                        var credentials = adminAccount.get('credentials');
                        var creds = null;
                        _.each(credentials, function (cred) {
                            if (cred.type === 'stripe') {
                                creds = cred;
                            }
                        });
                        if (creds && creds.accessToken) {
                            //log.info('using accessToken:', creds.accessToken);
                            accessToken = creds.accessToken;
                        }
                        if(billing.stripeCustomerId && billing.subscriptionId) {
                            stripeDao.getStripeSubscription(billing.stripeCustomerId, billing.subscriptionId, accessToken, function(err, subscription){
                                if(err || !subscription) {
                                    log.error('Error getting stripe subscription: ' + err);
                                    return cb(err, false);
                                } else if(subscription.status === 'active' || subscription.status === 'trialing') {

                                    var planId = subscription.plan.id;
                                    var planName = subscription.plan.name;
                                    subscriptionPrivilegeDao.getByPlanId(accountId, planId, function(err, subPrivs){
                                        if(err || !subPrivs) {
                                            log.error('Error getting subscription privileges for plan [' + planId + '] with accountId [' + accountId + ']: ' + err);
                                            return cb(err, false);
                                        }

                                        log.trace('<< verifySubscriptionWithoutSettingSessionVariables(true)');
                                        return cb(null, true);
                                    });
                                } else {
                                    //TODO: If the sub is expired, put in privs here
                                    log.warn('The subscription for account ' + accountId + ' appears to be expired.');
                                    return cb(null, false);
                                }
                            });
                        } else {
                            log.warn('Expired trial and no Stripe account.');
                            cb(null, false);
                        }

                    }
                });
            } else {
                stripeDao.getStripeSubscription(billing.stripeCustomerId, billing.subscriptionId, accessToken, function(err, subscription){
                    if(err || !subscription) {
                        log.error('Error getting stripe subscription: ' + err);
                        return cb(err, false);
                    } else if(subscription.status === 'active' || subscription.status === 'trialing') {

                        var planId = subscription.plan.id;
                        var planName = subscription.plan.name;
                        subscriptionPrivilegeDao.getByPlanId(accountId, planId, function(err, subPrivs){
                            if(err || !subPrivs) {
                                log.error('Error getting subscription privileges for plan [' + planId + '] with accountId [' + accountId + ']: ' + err);
                                return cb(err, false);
                            }

                            log.trace('<< verifySubscriptionWithoutSettingSessionVariables(true)');
                            return cb(null, true);
                        });
                    } else {
                        //TODO: If the sub is expired, put in privs here
                        log.warn('The subscription for account ' + accountId + ' appears to be expired.');
                        return cb(null, false);
                    }
                });
            }
        });

    },

    addBillingInfoToAccount: function(accountId, customerId, subscriptionId, planId, userId, fn) {
        var self = this;
        log.debug('>> addBillingInfoToAccount');
        accountDao.updateAccountBilling(accountId, customerId, subscriptionId, function(err, account){
            if(err) {
                log.error('Error adding subscription to account: ' + err);
                return fn(err, null);
            }
            accountDao.removeSubscriptionLockFromAccount(accountId, function(err, value){});
            var subpriv = new $$.m.SubscriptionPrivilege({
                accountId: accountId,
                subscriptionId: planId,
                activePrivs: defaultSubscriptionPrivs,
                created: {
                    date: new Date(),
                    by: userId
                }
            });
            subscriptionPrivilegeDao.saveOrUpdate(subpriv, function(err, savedSubPriv){
                if(err) {
                    log.error('Error saving subscription privileges: ' + err);
                    return fn(err, null);
                } else {
                    log.debug('<< addBillingInfoToAccount');
                    return fn(null, savedSubPriv);
                }
            });
        });
    },

    setPlanAndSubOnAccount: function(accountId, subscriptionId, planId, userId, fn) {
        var self = this;
        log.debug('>> setPlanAndSubOnAccount');
        accountDao.addSubscriptionAndPlanToAccount(accountId, subscriptionId, planId, userId, function(err, account){
            if(err) {
                log.error('Error adding subscription to account: ' + err);
                return fn(err, null);
            }
            accountDao.removeSubscriptionLockFromAccount(accountId, function(err, savedAccount){
                savedAccount.set('activated', true);
                accountDao.saveOrUpdate(savedAccount, function(err, updatedAccount){
                    var subpriv = new $$.m.SubscriptionPrivilege({
                        accountId: accountId,
                        subscriptionId: planId,
                        activePrivs: defaultSubscriptionPrivs,
                        created: {
                            date: new Date(),
                            by: userId
                        }
                    });
                    subscriptionPrivilegeDao.saveOrUpdate(subpriv, function(err, savedSubPriv){
                        if(err) {
                            log.error('Error saving subscription privileges: ' + err);
                            return fn(err, null);
                        } else {
                            log.debug('<< addBillingInfoToAccount');
                            return fn(null, savedSubPriv);
                        }
                    });
                });
            });

        });
    },

    addSubscriptionToAccount: function(accountId, subscriptionId, planId, userId, fn){
        var self = this;
        log.debug('>> addSubscriptionToAccount');
        accountDao.addSubscriptionToAccount(accountId, subscriptionId, function(err, value){
            if(err) {
                log.error('Error adding subscription to account: ' + err);
                return fn(err, null);
            }
            accountDao.removeSubscriptionLockFromAccount(accountId, function(err, savedAccount){

            });
            var subpriv = new $$.m.SubscriptionPrivilege({
                accountId: accountId,
                subscriptionId: planId,
                activePrivs: defaultSubscriptionPrivs,
                created: {
                    date: new Date(),
                    by: userId
                }
            });
            subscriptionPrivilegeDao.saveOrUpdate(subpriv, function(err, savedSubPriv){
                if(err) {
                    log.error('Error saving subscription privileges: ' + err);
                    return fn(err, null);
                } else {
                    log.debug('<< addSubscriptionToAccount');
                    return fn(null, savedSubPriv);
                }
            });
        });
    },

    isCancelled: function(billing) {
        var cancellationReason = billing.cancellationReason;
        return cancellationReason=="immediately"?true:false;
    },

    isWithinTrial: function(billing) {
        var trialDays = billing.trialLength || appConfig.trialLength;//using 15 instead of 14 to give 14 FULL days
        var endDate = moment(billing.signupDate).add(trialDays, 'days');

        var trialDaysRemaining = endDate.diff(moment(), 'days');
        return trialDaysRemaining > 0;
    },

    _isEvergreen: function(billing) {
        return (billing.subscriptionId === appConfig.internalSubscription
            || _.contains(appConfig.orgInternalSubscriptions, billing.subscriptionId));
    },

    isValidSub: function(accountId, billing, cb) {

        accountDao.getAccountByID(accountId, function(err, account){
            var accessToken = null;
            if(account && account.get('orgId') && account.get('orgId') > 0 && billing.stripeParent !== 6) {
                orgManager.getAdminAccountByOrgId(account.id(), null, account.get('orgId'), function (err, adminAccount) {
                    if (err) {
                        log.error('Error getting org stripe credentials:', err);
                        return cb(null, false);
                    } else {
                        var credentials = adminAccount.get('credentials');
                        var creds = null;
                        _.each(credentials, function (cred) {
                            if (cred.type === 'stripe') {
                                creds = cred;
                            }
                        });
                        if (creds && creds.accessToken) {
                            //log.info('using accessToken:', creds.accessToken);
                            accessToken = creds.accessToken;
                        }
                        stripeDao.getStripeSubscription(billing.stripeCustomerId, billing.subscriptionId, accessToken, function(err, subscription){
                            if(err || !subscription) {
                                log.error('Error getting stripe subscription: ' + err);
                                return cb(err, false);
                            } else if(subscription.status === 'active' || subscription.status === 'trialing') {

                                var planId = subscription.plan.id;
                                var planName = subscription.plan.name;
                                subscriptionPrivilegeDao.getByPlanId(accountId, planId, function(err, subPrivs){
                                    if(err || !subPrivs) {
                                        log.error('Error getting subscription privileges for plan [' + planId + '] with accountId [' + accountId + ']: ' + err);
                                        return cb(err, false);
                                    }
                                    log.trace('<< _isValidSub(true)');
                                    return cb(null, true);
                                });
                            } else {
                                //TODO: If the sub is expired, put in privs here
                                log.warn('The subscription for account ' + accountId + ' appears to be expired.');
                                return cb(null, false);
                            }
                        });
                    }
                });

            } else {
                stripeDao.getStripeSubscription(billing.stripeCustomerId, billing.subscriptionId, accessToken, function(err, subscription){
                    if(err || !subscription) {
                        log.error('Error getting stripe subscription: ' + err);
                        return cb(err, false);
                    } else if(subscription.status === 'active' || subscription.status === 'trialing') {

                        var planId = subscription.plan.id;
                        var planName = subscription.plan.name;
                        subscriptionPrivilegeDao.getByPlanId(accountId, planId, function(err, subPrivs){
                            if(err || !subPrivs) {
                                log.error('Error getting subscription privileges for plan [' + planId + '] with accountId [' + accountId + ']: ' + err);
                                return cb(err, false);
                            }
                            log.trace('<< _isValidSub(true)');
                            return cb(null, true);
                        });
                    } else {
                        //TODO: If the sub is expired, put in privs here
                        log.warn('The subscription for account ' + accountId + ' appears to be expired.');
                        return cb(null, false);
                    }
                });
            }

        });

    }


};

$$.s = $$.s || {};
$$.s.securityManager = $$.sm = securityManager;

module.exports = function(isDisabled){
    if(isDisabled !== true) {
        disabled = false;
    }
    return securityManager;
};
