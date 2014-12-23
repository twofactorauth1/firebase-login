/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var stripeDao = require('./dao/stripe.dao.js');

var log = $$.g.getLogger("payments_manager");

module.exports = {
    createStripeCustomerForUser: function(cardToken, user, accountId, accountBalance, fn) {
        log.debug('>> createStripeCustomerForUser');
        //check for customer first.
        var customerId = user.get('stripeId');
        if(customerId && customerId.length >0){
            //TODO: create invoice item if the customer already exists.
            stripeDao.createInvoiceItem(customerId, accountBalance, 'usd', null, null, 'Setup Fee', null, null, function(err, value){
                if(err) {
                    log.error('Error creating invoice item for signup fee: ' + err);
                    fn(err, null);
                } else {
                    stripeDao.getStripeCustomer(customerId, fn);
                }

            });

        } else {
            //TODO: set the accountBalance.
            stripeDao.createStripeCustomerForUser(cardToken, user, accountId, accountBalance, fn);
        }
    },

    createStripeSubscription: function(customerId, planId, accountId, userId, coupon, fn) {    	
        log.debug('>> createStripeSubscription(' + customerId + ',' + planId +',' + accountId + ',' + userId + ',' + coupon + ',callback)');
        stripeDao.createStripeSubscription(customerId, planId, coupon, null, null, null, null, null, accountId, null, userId, null, fn);
    },

    deleteStripeCustomerForUser: function(customerId, userId, fn) {
        stripeDao.deleteStripeCustomer(customerId, null, userId, fn);
    },

    deleteStripeCustomerForContact: function(customerId, contactId, fn) {
        stripeDao.deleteStripeCustomer(customerId, contactId, null, fn);
    }
};