/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('../../dao/base.dao.js');
var stripeConfigs = require('../../configs/stripe.config.js');
var appConfig = require('../../configs/app.config.js');
var contactDao = require('../../dao/contact.dao.js');

/*-- for stripe api--*/
var stripe = require("stripe")( stripeConfigs.KM_STRIPE_TEST_SECRET_KEY);//TODO: app config

var dao = {


    options: {
        name: "stripe.dao",
        defaultModel: null//TODO: maybe make this a payment?
    },

    createStripeCustomer: function(cardToken, contact, fn) {
        var self = this;
        stripe.customers.create({
            description: 'Customer for ' + contact.getEmails()[0],
            //card: cardToken, // obtained with Stripe.js
            email: contact.getEmails()[0],
            metadata: {
                contactId: contact._id
            }
        }, function(err, customer) {
            if(err) {
                fn(err, customer);
                fn = null;
            }
            contact.set('stripeId', customer.id);
            self.log.debug('Setting contact stripeId to ' + contact.get('stripeId'));
            contactDao.saveOrMerge(contact, function(err, value){
                if (err) {
                    fn(err, value);
                    fn = null;
                }
                self.log.debug('returning from saveOrMerge.');
                return fn(err, value);
            });
        });
    }



};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.StripeDao = dao;

module.exports = dao;