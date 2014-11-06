/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var stripeDao = require('./dao/stripe.dao.js');

var log = $$.g.getLogger("payments_manager");

module.exports = {
    createStripeCustomerForUser: function(cardToken, user, accountId, fn) {
        log.debug('>> createStripeCustomerForUser');
        stripeDao.createStripeCustomerForUser(cardToken, user, accountId, fn);
    },

    createStripeSubscription: function(customerId, planId, accountId, userId, fn) {
        log.debug('>> createStripeSubscription(' + customerId + ',' + planId +',' + accountId + ',' + userId + ',callback)');
        stripeDao.createStripeSubscription(customerId, planId, null, null, null, null, null, null, accountId, null, userId, null, fn);
    }
};