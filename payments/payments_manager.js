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
        //check for customer first.
        var customerId = user.get('stripeId');
        if(customerId && customerId.length >0){
            stripeDao.getStripeCustomer(customerId, fn);
        } else {
            stripeDao.createStripeCustomerForUser(cardToken, user, accountId, 0, fn);
        }
    },

    createStripeSubscription: function(customerId, planId, accountId, userId, coupon, setupFee, fn) {
        log.debug('>> createStripeSubscription(' + customerId + ',' + planId +',' + accountId + ',' + userId + ',' + coupon + ','+ setupFee + ',callback)');
        if(setupFee && setupFee > 0) {
            stripeDao.createInvoiceItem(customerId, setupFee, 'usd', null, null, 'Signup Fee', null, null, function(err, value){
                if(err) {
                    log.error('Error creating signup fee invoice item: ' + err);
                    return fn(err, null);
                } else {
                    log.debug('Created signup fee invoice item.');
                    stripeDao.createStripeSubscription(customerId, planId, coupon, null, null, null, null, null, accountId, null, userId, null, fn);
                }
            });
        }

    }
};