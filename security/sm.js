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

var moment = require('moment');

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
    'MODIFY_DASHBOARD'
];

var defaultSubscriptionPrivs = [
    'integrations/payments',
    'account',
    'analytics',
    'assets',
    'authentication',
    'cms',
    'contact',
    'courses',
    'dashboard',
    'emaildata',
    'product',
    'user'
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
        log.debug('>> getPrivilegesByUserAndAccount');
        dao.findOne({'userId': userId, accountId: accountId}, $$.m.Privilege, function(err, privilege){
            if(err) {
                log.error('Exception while finding privilege by userId[' + userId + '] and account[' + accountId + ']: ' + err );
                cb(err, null);
            } else {
                log.debug('<< getPrivilegesByUserAndAccount');
                cb(null, privilege);
            }
        });
    },

    hasPermission: function(userId, accountId, priv, cb) {
        var self = this;
        log.debug('>> hasPermission');
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
                    log.debug('<< hasPermission(true)');
                    cb(null, true);
                } else {
                    log.debug('<< hasPermission(false)');
                    log.debug('... looking for [' + priv + '] and the privilege object is:');
                    console.dir(privilege);
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
        log.debug('>> verifySubscription');
        if(disabled === true) {
            req.session.subprivs = defaultSubscriptionPrivs;
            log.debug('<< verifySubscription (disabled)');
            return cb(null, true);
        }

        //check if session has property(subName) --> return if present
        if(req.session.subName !== undefined && req.session.subprivs) {
            log.debug('<< verifySubscription(true[' + req.session.subName + '])');
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
            if(!billing.subscriptionId) {
                log.debug('No subscription found for account: ' + req.session.accountId);
                return cb(null, false);
            }
            //if no verification OR verification older than 24 hours
            if(!billing.lastVerified || moment().diff(billing.lastVerified, 'hours') >24) {
                //TODO: handle accessToken
                stripeDao.getStripeSubscription(billing.stripeCustomerId, billing.subscriptionId, null, function(err, subscription){
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
                            log.debug('<< verifySubscription(true)');
                            return cb(null, true);
                        });
                    } else {
                        //TODO: If the sub is expired, put in privs here
                        log.warn('The subscription for account ' + req.session.accountId + ' appears to be expired.');
                        return cb(null, false);
                    }
                });
            } else {
                //verified within the last 24hrs... set the subname and privs
                //TODO: handle accessToken
                stripeDao.getStripeSubscription(billing.stripeCustomerId, billing.subscriptionId, null, function(err, subscription){
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
                            log.debug('<< verifySubscription');
                            return cb(null, true);
                        });
                    } else {
                        //TODO: If the sub is expired, put in privs here
                        log.warn('The subscription for account ' + req.session.accountId + ' appears to be expired.');
                        return cb(null, false);
                    }
                });
            }
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
    }


};

$$.s = $$.s || {};
$$.s.securityManager = $$.sm = securityManager;

module.exports = function(isDisabled){
    if(isDisabled !== true) {
        disabled = false;
    }
    return securityManager;
}
