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
        } else {
            stripeDao.createStripeSubscription(customerId, planId, coupon, null, null, null, null, null, accountId, null, userId, null, fn);
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

    addCardToCustomer: function(cardToken, customerId, fn) {
        log.debug('>> addCardToCustomer');
        stripeDao.createStripeCard(customerId, cardToken, function(err, value){
            if(err) {
                log.error('error adding card: ' + err);
                return fn(err, null);
            } else {
                log.debug('<< addCardToCustomer');
                return fn(null, value);
            }
        });
    }


};