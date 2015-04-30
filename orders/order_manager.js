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
var mandrillHelper = require('../utils/mandrillhelper');
var accountDao = require('../dao/account.dao');
var cmsManager = require('../cms/cms_manager');

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
                                //set the status of the order to failed
                                savedOrder.set('status', savedOrder.status.FAILED);
                                savedOrder.set('note', savedOrder.get('note') + '\n Payment error: ' + err);
                                var modified = {
                                    date: new Date(),
                                    by: userId
                                };
                                savedOrder.set('modified', modified);
                                dao.saveOrUpdate(savedOrder, function(err, updatedSavedOrder){
                                    callback(err);
                                });
                            } else {
                                callback(null, savedOrder, charge, contact);
                            }
                        });
                } else {
                    log.warn('unsupported payment method: ' + paymentDetails.method_id);
                    callback('unpaid', null);
                }
            },
            //update
            function(savedOrder, charge, contact, callback){
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
                paymentDetails.charge = charge;
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
                        callback(null, updatedOrder, contact);
                    }
                });

            },
            //send new order email
            function(updatedOrder, contact, callback) {
                log.debug('Sending new order email');
                var toAddress = contact.getEmails()[0];
                var toName = contact.get('first') + ' ' + contact.get('last');
                var subject = 'New Order';
                var accountId = updatedOrder.get('account_id');
                var orderId = updatedOrder.id();
                var vars = [];

                accountDao.getAccountByID(accountId, function(err, account){
                    if(err) {
                        callback(err);
                    } else {
                        var business = account.get('business');
                        if(!business || !business.emails || !business.emails[0].email) {
                            log.warn('No account email.  No NEW_ORDER email sent');
                            callback(null, updatedOrder);
                        }
                        var fromAddress = business.emails[0].email;
                        var fromName = business.name;
                        
                        cmsManager.getEmailPage(accountId, 'new_order', function(err, page){
                            if(err || !page) {
                                log.warn('No NEW_ORDER email sent: ' + err);
                                callback(null, updatedOrder);
                            } else {
                                var component = page.get('components')[0];
                                log.debug('Using this for data', component);
                                app.render('emails/base_email_order', component, function(err, html) {
                                    mandrillHelper.sendOrderEmail(fromAddress, fromName, toAddress, toName, subject, html, accountId, orderId, vars, function(){
                                        callback(null, updatedOrder);
                                    });
                                });

                            }
                        });

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


    completeOrder: function(accountId, orderId, note, userId, fn) {
        log.debug('>> completeOrder ');
        log.debug('>> note ', note);
        var query = {
            _id: orderId,
            account_id: accountId
        };
        dao.findOne(query, $$.m.Order, function(err, order){
            log.debug('retrieved order >>> ', order);
            if(err) {
                log.error('Error getting order: ' + err);
                return fn(err, null);
            }

            var notes = [];
            if (order.get('notes')) {
                notes = order.get('notes');
            }
            if (note) {
                var noteObj = {
                    note: note,
                    user_id: userId,
                    date: new Date()
                };
                notes.push(noteObj);
            }
            order.set('notes', notes);
            order.set('completed_at', new Date());
            order.set('status', $$.m.Order.status.COMPLETED);
            var modified = {
                date: new Date(),
                by: userId
            };
            order.set('modified', modified);
            dao.saveOrUpdate(order, function(err, updatedOrder){
                if(err) {
                    log.error('Error updating order: ' + err);
                    return fn(err, null);
                }
                log.debug('<< completeOrder');
                return fn(null, updatedOrder);
            });

        });

    },

    /**
     * This method marks an order cancelled without refunding any charges or making any other changes to the order.
     * @param orderId
     * @param note
     * @param userId
     * @param fn
     */
    cancelOrder: function(accountId, orderId, note, userId, fn) {
        var self = this;
        log.debug('>> cancelOrder');
        var query = {
            _id: orderId,
            accountId: accountId
        };
        dao.findOne(query, $$.m.Order, function(err, order) {
            if (err) {
                log.error('Error getting order: ' + err);
                return fn(err, null);
            }
            order.set('note', order.get('note') + '\n' + note);
            order.set('status', order.status.CANCELLED);
            var modified = {
                date: new Date(),
                by: userId
            };
            order.set('modified', modified);

            dao.saveOrUpdate(order, function(err, updatedOrder){
                if(err) {
                    log.error('Error updating order: ' + err);
                    return fn(err, null);
                }
                log.debug('<< cancelOrder');
                return fn(null, updatedOrder);
            });
        });
    },

    /**
     * This method marks an order refunded and attempts to return charges.
     * @param orderId
     * @param note
     * @param userId
     * @param amount
     * @param accessToken
     * @param reason (duplicate|fraudulent|requested_by_customer)
     * @param fn
     */
    refundOrder: function(accountId, orderId, note, userId, amount, reason, accessToken, fn) {
        var self = this;
        log.debug('>> refundOrder');
        var query = {
            _id: orderId,
            accountId: accountId
        };
        dao.findOne(query, $$.m.Order, function(err, order) {
            if (err) {
                log.error('Error getting order: ' + err);
                return fn(err, null);
            }
            var paymentDetails = order.get('payment_details');
            if(!paymentDetails.charge) {
                log.error('Error creating refund.  No charge found.');
                return fn('No charge found', null);
            }

            var chargeId = paymentDetails.charge.id;
            var refundAmount = paymentDetails.charge.amount;
            if(amount) {
                refundAmount = amount;
            }
            var metadata = null;
            stripeDao.createRefund(chargeId, refundAmount, false, reason, metadata, accessToken, function(err, refund){
                if(err) {
                    log.error('Error creating refund: ' + err);
                    return fn(err, null);
                }
                paymentDetails.refund = refund;
                order.set('note', order.get('note') + '\n' + note);
                order.set('status', order.status.REFUNDED);
                order.set('updated_at', new Date());
                var modified = {
                    date: new Date(),
                    by: userId
                };
                order.set('modified', modified);

                dao.saveOrUpdate(order, function(err, updatedOrder){
                    if(err) {
                        log.error('Error updating order: ' + err);
                        return fn(err, null);
                    }
                    log.debug('<< refundOrder');
                    return fn(null, updatedOrder);
                });
            });
        });

    },

    /**
     * This method marks an order on_hold without making any other changes to the order.
     * @param orderId
     * @param note
     * @param userId
     * @param fn
     */
    holdOrder: function(accountId, orderId, note, userId, fn) {
        var self = this;
        log.debug('>> holdOrder');
        var query = {
            _id: orderId,
            accountId: accountId
        };
        dao.findOne(query, $$.m.Order, function(err, order) {
            if (err) {
                log.error('Error getting order: ' + err);
                return fn(err, null);
            }
            order.set('note', order.get('note') + '\n' + note);
            order.set('status', order.status.ON_HOLD);
            var modified = {
                date: new Date(),
                by: userId
            };
            order.set('modified', modified);

            dao.saveOrUpdate(order, function(err, updatedOrder){
                if(err) {
                    log.error('Error updating order: ' + err);
                    return fn(err, null);
                }
                log.debug('<< holdOrder');
                return fn(null, updatedOrder);
            });
        });
    },

    /**
     * This method marks an order failed without making any other changes to the order.
     * @param orderId
     * @param note
     * @param userId
     * @param fn
     */
    failOrder: function(accountId, orderId, note, userId, fn) {
        var self = this;
        log.debug('>> failOrder');
        var query = {
            _id: orderId,
            accountId: accountId
        };
        dao.findOne(query, $$.m.Order, function(err, order) {
            if (err) {
                log.error('Error getting order: ' + err);
                return fn(err, null);
            }
            order.set('note', order.get('note') + '\n' + note);
            order.set('status', order.status.FAILED);
            var modified = {
                date: new Date(),
                by: userId
            };
            order.set('modified', modified);

            dao.saveOrUpdate(order, function(err, updatedOrder){
                if(err) {
                    log.error('Error updating order: ' + err);
                    return fn(err, null);
                }
                log.debug('<< failOrder');
                return fn(null, updatedOrder);
            });
        });
    },

    addOrderNote: function(accountId, orderId, note, userId, fn) {
        log.debug('>> addOrderNote ');
        var query = {
            _id: orderId,
            account_id: accountId
        };
        dao.findOne(query, $$.m.Order, function(err, order){
            if(err) {
                log.error('Error getting order: ' + err);
                return fn(err, null);
            }

            var notes = [];
            if (order.get('notes')) {
                notes = order.get('notes');
            }
            if (note) {
                var noteObj = {
                    note: note,
                    user_id: userId,
                    date: new Date()
                };
                notes.push(noteObj);
            }
            order.set('notes', notes);
            var modified = {
                date: new Date(),
                by: userId
            };
            order.set('modified', modified);
            dao.saveOrUpdate(order, function(err, updatedOrder){
                if(err) {
                    log.error('Error updating order: ' + err);
                    return fn(err, null);
                }
                log.debug('<< addOrderNote');
                return fn(null, updatedOrder);
            });

        });

    },

    getOrderById: function(orderId, fn) {
        var self = this;
        log.debug('>> getOrderById');
        dao.getById(orderId, $$.m.Order, function(err, order){
            if(err) {
                log.error('Error getting order: ' + err);
                return fn(err, null);
            } else {
                //also fetch customer
                contactDao.getById(order.get('customer_id'), $$.m.Contact, function(err, contact){
                    if(err) {
                        log.error('Error getting contact: ' + err);
                        return fn(err, order);
                    } else {
                        order.set('customer', contact);
                        log.debug('<< getOrderById');
                        return fn(null, order);
                    }
                });

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
                async.each(orders, function(order, cb){
                    contactDao.getById(order.get('customer_id'), $$.m.Contact, function(err, contact){
                        if(err) {
                            log.error('Error getting contact: ' + err);
                            cb(err);
                        } else {
                            order.set('customer', contact);
                            cb();
                        }
                    });
                }, function(err){
                    if(err) {
                        log.error('Error fetching customers for orders: ' + err);
                        return fn(err, orders);
                    } else {
                        log.debug('<< listOrdersByAccount');
                        return fn(null, orders);
                    }
                });

            }
        });
    }
};