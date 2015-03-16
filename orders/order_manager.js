/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var dao = require('./dao/order.dao.js');
var log = $$.g.getLogger("order_manager");
var async = require('async');
var stripeDao = require('../payments/dao/stripe.dao');
var contactDao = require('../dao/contact.dao');
require('./model/order');

module.exports = {

    createOrder: function(order, accessToken, userId, fn) {
        var self = this;
        log.debug('>> createOrder');
        /*
         * Validation
         *
         * - Assumption: total = sum(line_items.total) - cart_discount - total_discount + total_tax + total_shipping
         * - Assumption: customer_id = contact_id with a stripeId
         * - Assumption: total_line_items_quantity = sum(line_items.quantity)
         */
        async.waterfall([
            //validate
            function(callback){
                log.debug('validating order');
                //calculate total amount and number line items
                var totalAmount = 0;
                var totalLineItemsQuantity = 0;
                _.each(order.get('line_items'), function(line_item){
                    totalAmount += line_item.total;
                    totalLineItemsQuantity += line_item.quantity;
                });
                log.debug('subtotal: ' + totalAmount);
                if(order.get('cart_discount')) {
                    totalAmount -= order.get('cart_discount');
                    log.debug('subtracting cart_discount of ' + order.get('cart_discount'));
                }
                if(order.get('total_discount')) {
                    totalAmount -= order.get('total_discount');
                    log.debug('subtracting total_discount of ' + order.get('total_discount'));
                }
                if(order.get('total_tax')) {
                    totalAmount += order.get('total_tax');
                    log.debug('adding tax of ' + order.get('total_tax'));
                }
                if(order.get('total_shipping')) {
                    totalAmount += order.get('total_shipping');
                    log.debug('adding shipping of ' + order.get('total_shipping'));
                }
                order.set('total', totalAmount);
                log.debug('total is now: ' + order.get('total'));
                order.set('total_line_items_quantity', totalLineItemsQuantity);
                callback(null, order);

            },
            //save
            function(validatedOrder, callback){
                log.debug('saving validated order');
                dao.saveOrUpdate(validatedOrder, function(err, savedOrder){
                    if(err) {
                        log.error('Error saving order: ' + err);
                        callback(err);
                    } else {
                        callback(null, savedOrder);
                    }
                });
            },
            //get contact
            function(savedOrder, callback) {
                log.debug('getting contact');
                contactDao.getById(savedOrder.get('customer_id'), $$.m.Contact, function(err, contact){
                    if(err) {
                        log.error('Error getting contact: ' + err);
                        callback(err);
                    } else if(contact === null) {
                        log.error('Could not find contact for id: ' + savedOrder.get('customer_id'));
                        callback('contact not found');
                    } else {
                        callback(null, savedOrder, contact);
                    }
                });
            },
            //charge
            function(savedOrder, contact, callback){
                log.debug('attempting to charge order');
                var paymentDetails = savedOrder.get('payment_details');
                if(paymentDetails.method_id === 'cc') {
                    var card = paymentDetails.card_token;
                    //total is a double but amount needs to be in cents (integer)
                    var amount = savedOrder.get('total') * 100;
                    var currency = savedOrder.get('currency');
                    var customerId = contact.get('stripeId');
                    var contactId = savedOrder.get('customer_id');
                    var description = "Charge for order " + savedOrder.id();
                    if(paymentDetails.charge_description) {
                        description = paymentDetails.charge_description;
                    }
                    var metadata = {
                        orderId: savedOrder.id(),
                        accountId: savedOrder.get('account_id')
                    };
                    var capture = true;
                    var statement_description = 'INDIGENOUS CHARGE';
                    if(paymentDetails.statement_description) {
                        statement_description = paymentDetails.statement_description;
                    }
                    var application_fee = 0;
                    var userId = null;
                    var receipt_email = contact.getEmails()[0];
                    log.debug('Setting receipt_email to ' + receipt_email);

                    stripeDao.createStripeCharge(amount, currency, card, customerId, contactId, description, metadata,
                        capture, statement_description, receipt_email, application_fee, userId, accessToken,
                        function(err, charge){
                            if(err) {
                                log.error('Error creating Stripe Charge: ' + err);
                                callback(err);
                            } else {
                                callback(null, savedOrder, charge);
                            }
                        });
                } else {
                    log.warn('unsupported payment method: ' + paymentDetails.method_id);
                    callback('unpaid', null);
                }
            },
            //update
            function(savedOrder, charge, callback){
                log.debug('updating saved order');
                /*
                 * need to set:
                 * paid:true
                 * status:pending
                 * updated_at:new Date()
                 * modified.date: new Date()
                 * modified.by: userId
                 */
                savedOrder.set('updated_at', new Date());
                savedOrder.set('status', savedOrder.status.PENDING);
                var paymentDetails = savedOrder.get('payment_details');
                paymentDetails.paid = true;
                savedOrder.set('payment_details', paymentDetails);
                var modified = {
                    date: new Date(),
                    by: userId
                };
                savedOrder.set('modified', modified);
                dao.saveOrUpdate(savedOrder, function(err, updatedOrder){
                    if(err) {
                        log.error('Error updating order: ' + err);
                        callback(err);
                    } else {
                        callback(null, updatedOrder);
                    }
                });

            }
        ], function(err, result){
            if(err) {
                log.error('Error creating order: ' + err);
                return fn(err, null);
            } else {
                log.debug('<< createOrder');
                return fn(null, result);
            }
        });

    },


    completeOrder: function(orderId, note, fn) {
        //TODO
    },

    cancelOrder: function(orderId, note, fn) {
        //TODO
    },

    refundOrder: function(orderId, note, fn) {
        //TODO
    },

    holdOrder: function(orderId, note, fn) {
        //TODO
    },

    failOrder: function(orderId, note, fn) {
        //TODO
    },

    getOrderById: function(orderId, fn) {
        log.debug('>> getOrderById');
        dao.getById(orderId, $$.m.Order, function(err, order){
            if(err) {
                log.error('Error getting order: ' + order);
                return fn(err, null);
            } else {
                log.debug('<< getOrderById');
                return fn(null, order);
            }
        });
    },

    listOrdersByAccount: function(accountId, fn) {
        log.debug('>> listOrdersByAccount');
        var query = {
            account_id: accountId
        };

        dao.findMany(query, $$.m.Order, function(err, orders){
            if(err) {
                log.error('Error listing orders: ', err);
                return fn(err, null);
            } else {
                log.debug('<< listOrdersByAccount');
                return fn(null, orders);
            }
        });
    }
};