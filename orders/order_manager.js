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
var productManager = require('../products/product_manager');
require('moment');

module.exports = {

    createPaidOrder: function(order, fn) {
        var self = this;
        log.debug('>> createPaidOrder');

        //set order_id based on orders length for the account
        var query = {
            account_id: order.get('account_id')
        };

        dao.findMany(query, $$.m.Order, function(err, orders){
            order.set('order_id', orders.length);
            dao.saveOrUpdate(order, function(err, savedOrder){
                if(err) {
                    log.error('Error saving order: ' + err);
                    return fn(err, null);
                } else {
                    log.debug('<< createPaidOrder');
                    return fn(null, savedOrder);
                }
            });
        });


    },

    createOrderFromStripeInvoice: function(invoice, accountId, contactId, fn) {
        var self = this;
        log.debug('>> createOrderFromStripeInvoice');
        //set order_id based on orders length for the account
        var query = {
            account_id: accountId
        };

        dao.findMany(query, $$.m.Order, function(err, orders){
            var orderId = orders.length;
            var total = invoice.total / 100;
            var subtotal = invoice.subtotal / 100;
            var discount = subtotal - total;
            var order = new $$.m.Order({
                "account_id": accountId,
                "customer_id" : contactId,
                "session_id" : null,
                "order_id" : orderId,
                "completed_at" : new Date(),
                "updated_at" : null,
                "created_at" : new Date(),
                "status" : "completed",
                "total" : total,
                "cart_discount" : 0.0,
                "total_discount" : discount,
                "total_shipping" : 0.0,
                "total_tax" : 0.0,
                "subtotal" : subtotal,
                "shipping_tax" : 0.0,
                "cart_tax" : 0.0,
                "currency" : "usd",
                "line_items" : [

                ],
                "total_line_items_quantity" : 0,
                "payment_details" : {
                    "method_title" : 'Credit Card Payment',//Check Payment, Credit Card Payment
                    "method_id" : 'cc',//check, cc
                    "card_token": null,//Stripe card token if applicable
                    "charge_description": null, //description of charge if applicable
                    "statement_description": null,//22char string for cc statement if applicable
                    "paid" : true
                },

                "notes" : [
                    /*
                     {
                     "note" : "Order status changed from processing to completed",
                     "user_id" : 1,
                     "date" : ISODate("2015-04-13T12:02:18.055Z")
                     }
                     */
                ],
                created: {
                    date: new Date(),
                    by: null
                },
                modified: {
                    date: null,
                    by: null
                }
            });

            var line_items = [];
            _.each(invoice.lines.data, function(invoiceItem){
                var total = invoiceItem.amount /100;
                var name = invoiceItem.description;
                if(invoiceItem.plan !== null) {
                    name = invoiceItem.plan.name;
                }
                var obj = {
                    name: name,
                    total:total
                };
                line_items.push(obj);
            });
            order.set('line_items', line_items);
            order.set('total_line_items_quantity', line_items.length);

            dao.saveOrUpdate(order, function(err, savedOrder){
                if(err) {
                    log.error('Error saving order: ' + err);
                    return fn(err, null);
                } else {
                    log.debug('<< createOrderFromStripeInvoice');
                    return fn(null, savedOrder);
                }
            });
        });

    },

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
            //get the account
            function(callback) {
                log.debug('fetching account ' + order.get('account_id'));
                var accountId = parseInt(order.get('account_id'));
                accountDao.getAccountByID(accountId, function(err, account){
                    callback(err, account);
                });
            },
            //get the products
            function(account, callback) {
                log.debug('fetching products');
                var productAry = [];
                async.each(order.get('line_items'), function iterator(item, cb){
                    productManager.getProduct(item.product_id, function(err, product){
                        if(err) {
                            cb(err);
                        } else {
                            productAry.push(product);
                            item.sku = product.get('sku');
                            item.name = product.get('name');
                            cb();
                        }
                    });
                }, function done(err){
                    callback(err, account, productAry);
                });
            },
            //determine tax rate
            function(account, productAry, callback) {
                var commerceSettings = account.get('commerceSettings');
                if(commerceSettings && commerceSettings.taxes === true) {
                    //figure out the rate
                    var zip = 0;
                    if(commerceSettings.taxbased === 'customer_shipping') {
                        zip = order.get('shipping_address').postcode;
                    } else if(commerceSettings.taxbased === 'customer_billing') {
                        zip = order.get('billing_address').postcode;
                    } else if(commerceSettings.taxbased === 'business_location') {
                        zip = account.get('business').addresses &&  account.get('business').addresses[0] ? account.get('business').addresses[0].zip : 0;
                    } else {
                        log.warn('Unable to determine tax rate based on ', commerceSettings);
                    }
                    if(zip !== 0) {
                        productManager.getTax(zip, function(err, rate){
                            log.debug('Using rate:', rate);
                            if(rate && rate.results && rate.results.length > 0) {
                                callback(err, account, productAry, rate.results[0].taxSales);
                            } else {
                                callback(err, account, productAry, 0);
                            }
                        });
                    }
                } else {
                    callback(null, account, productAry, 0);
                }
            },
            //validate
            function(account, productAry, taxPercent, callback){
                log.debug('validating order on account ' + order.get('account_id'));
                log.debug('using a tax rate of ', taxPercent);
                //calculate total amount and number line items
                var totalAmount = 0;
                var subTotal = 0;
                var totalLineItemsQuantity = 0;
                var taxAdded = 0;

                /*
                 * loop through line items
                 *   based on quantity and id, get lineItemSubtotal
                 *   if item is taxable, get tax rate and add to lineItemTax
                 *   sum
                 *
                 *
                 */
                _.each(order.get('line_items'), function iterator(item, index){
                    var product = _.find(productAry, function(currentProduct){
                        if(currentProduct.id() === item.product_id) {
                            return true;
                        }
                    });
                    log.debug('found product ', product);
                    var lineItemSubtotal = item.quantity * product.get('regular_price');
                    if(product.get('on_sale') === true) {
                        var startDate = product.get('sale_date_from', 'day');
                        var endDate = product.get('sale_date_to', 'day');
                        var rightNow = new Date();
                        if(moment(rightNow).isBefore(endDate) && moment(rightNow).isAfter(startDate)) {
                            lineItemSubtotal = item.quantity * product.get('sale_price');
                            item.sale_price = product.get('sale_price').toFixed(2);
                            //TODO: Should not need this line.  Receipt template currently needs it.
                            item.regular_price = product.get('sale_price').toFixed(2);
                            item.total = lineItemSubtotal.toFixed(2);
                        }
                    }
                    if(product.get('taxable') === true) {
                        taxAdded += (lineItemSubtotal * taxPercent);
                    }
                    subTotal += lineItemSubtotal;
                    totalLineItemsQuantity += parseFloat(item.quantity);
                });
                log.debug('Calculated subtotal: ' + subTotal + ' with tax: ' + taxAdded);
                /*
                 * We have to ignore discounts and shipping for now.  They *must* come from a validated code server
                 * side to avoid shenanigans.
                 */
                totalAmount = subTotal + taxAdded;


                /*
                 * Ignoring client side params

                _.each(order.get('line_items'), function (line_item) {
                    totalAmount += parseFloat(line_item.total);
                    subTotal += parseFloat(line_item.total);
                    totalLineItemsQuantity += parseFloat(line_item.quantity);
                });
                log.debug('subtotal: ' + totalAmount);
                if (order.get('cart_discount')) {
                    totalAmount -= parseFloat(order.get('cart_discount'));
                    log.debug('subtracting cart_discount of ' + order.get('cart_discount'));
                }
                if (order.get('total_discount')) {
                    totalAmount -= parseFloat(order.get('total_discount'));
                    log.debug('subtracting total_discount of ' + order.get('total_discount'));
                }
                if (order.get('total_tax') && order.get('total_tax') > 0) {
                    totalAmount += parseFloat(order.get('total_tax'));
                    log.debug('adding tax of ' + order.get('total_tax'));
                }
                else {
                    totalAmount += parseFloat(totalAmount * taxPercent);
                    log.debug('adding tax of ' + order.get('total_tax'));
                }
                if (order.get('total_shipping')) {
                    totalAmount += parseFloat(order.get('total_shipping'));
                    log.debug('adding shipping of ' + order.get('total_shipping'));
                }
                */

                order.set('tax_rate', taxPercent);
                order.set('subtotal', subTotal.toFixed(2));
                order.set('total', totalAmount.toFixed(2));
                log.debug('total is now: ' + order.get('total'));
                order.set('total_line_items_quantity', totalLineItemsQuantity);
                callback(null, order);

            },
            //save
            function(validatedOrder, callback){
                //look for customer instead of customer_id
                if(validatedOrder.get('customer') && validatedOrder.get('customer_id')) {
                    log.warn('request contains BOTH customer and customer_id.  Dropping customer.');
                    validatedOrder.set('customer', null);
                    callback(null, validatedOrder);
                } else if(validatedOrder.get('customer') === null && validatedOrder.get('customer_id') === null) {
                    //return an error.
                    callback('Either a customer or customer_id is required.');
                } else if(validatedOrder.get('customer')) {
                    var contact = new $$.m.Contact(validatedOrder.get('customer'));
                    contact.set('accountId', parseInt(validatedOrder.get('account_id')));
                    contact.createdBy(userId, $$.constants.social.types.LOCAL);
                    contactDao.saveOrUpdateContact(contact, function(err, savedContact){
                        if(err) {
                            log.error('Error creating contact for new order', err);
                            callback(err);
                        } else {
                            validatedOrder.set('customer_id', savedContact.id());
                            validatedOrder.set('customer', null);
                            callback(null, validatedOrder);
                        }
                    });
                } else {
                    //we have the id.
                    callback(null, validatedOrder);
                }
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

                        //set order_id based on orders length for the account
                        var query = {
                            account_id: savedOrder.get('account_id')
                        };
                        dao.getMaxValue(query, 'order_id', $$.m.Order, function(err, value){
                            if(err ) {
                                log.warn('Could not find order_id:', err);
                                callback(err);
                            } else {
                                var max = 1;
                                if(value) {
                                    max = parseInt(value) + 1;
                                }

                                savedOrder.set('order_id', max);
                                dao.saveOrUpdate(savedOrder, function(err, updatedOrder){
                                    callback(err, updatedOrder, contact);
                                });
                            }
                        });

                    }
                });
            },
            //charge
            function(savedOrder, contact, callback){
                log.debug('attempting to charge order');
                var paymentDetails = savedOrder.get('payment_details');
                if (savedOrder.get('total') > 0) {
                    if(paymentDetails.method_id === 'cc') {
                        var card = paymentDetails.card_token;
                        //total is a double but amount needs to be in cents (integer)
                        var amount = Math.round(savedOrder.get('total') * 100);
                        log.debug('amount ', savedOrder.get('total'));
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
                        log.debug('contact ', contact);
                        var receipt_email = contact.getEmails()[0].email;
                        log.debug('Setting receipt_email to ' + receipt_email);

                        stripeDao.createStripeCharge(amount, currency, card, customerId, contactId, description, metadata,
                            capture, statement_description, receipt_email, application_fee, userId, accessToken,
                            function(err, charge){
                                if(err) {
                                    log.error('Error creating Stripe Charge: ' + err);
                                    //set the status of the order to failed
                                    savedOrder.set('status', $$.m.Order.status.FAILED);
                                    savedOrder.set('note', savedOrder.get('note') + '\n Payment error: ' + err);
                                    var modified = {
                                        date: new Date(),
                                        by: userId
                                    };
                                    savedOrder.set('modified', modified);
                                    dao.saveOrUpdate(savedOrder, function(_err, updatedSavedOrder){
                                        callback(err);
                                    });
                                } else {
                                    callback(null, savedOrder, charge, contact);
                                }
                            });
                    } else {
                        log.warn('unsupported payment method: ' + paymentDetails.method_id);
                        callback(null, savedOrder, null, contact);
                    }
                } else {
                    callback(null, savedOrder, null, contact);
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
                // savedOrder.set('status', savedOrder.status.PENDING);
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
                var toAddress = "";
                if(contact.getEmails()[0])
                    toAddress = contact.getEmails()[0].email;
                var toName = contact.get('first') + ' ' + contact.get('last');
                var accountId = updatedOrder.get('account_id');
                var orderId = updatedOrder.id();
                var vars = [];

                log.debug('toAddress ', toAddress);
                log.debug('toName ', toName);
                log.debug('toAddress ', toAddress);

                accountDao.getAccountByID(accountId, function(err, account){
                    if(err) {
                        callback(err);
                    } else {
                        var business = account.get('business');
                        var emailPreferences = account.get('email_preferences');
                        if(!business || !business.emails || !business.emails[0].email) {
                            log.warn('No account email.  No NEW_ORDER email sent');
                            callback(null, updatedOrder);
                        }
                        var subject = 'Your '+business.name+' order receipt from '+moment().format('MMM Do, YYYY');
                        var fromAddress = business.emails[0].email;
                        var fromName = business.name;

                        cmsManager.getEmailPage(accountId, 'new-order', function(err, email){
                            if(err || !email) {
                                log.warn('No NEW_ORDER email sent: ' + err);
                                callback(null, updatedOrder);
                            } else {
                                var component = email.get('components')[0];
                                component.order = updatedOrder.attributes;
                                log.debug('Using this for data', component);
                                app.render('emails/base_email_order', component, function(err, html) {
                                    mandrillHelper.sendOrderEmail(fromAddress, fromName, toAddress, toName, subject, html, accountId, orderId, vars, email._id, function(){
                                        callback(null, updatedOrder);
                                    });

                                    if(emailPreferences.new_orders === true) {
                                        //Send additional details
                                        mandrillHelper.sendOrderEmail(fromAddress, fromName, fromAddress, fromName, subject, html, accountId, orderId, vars, email._id, function(){
                                            log.debug('Admin Notification Sent');
                                        });
                                    }

                                });

                            }
                        });

                    }
                });


            }
        ], function(err, result){
            if(err) {
                log.error('Error creating order: ' + err);
                return fn(err.message, null);
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
        log.debug('>> refundOrder ', orderId);
        var query = {
            _id: orderId,
            account_id: accountId
        };
        log.debug('>> query ', query);
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
            log.debug('>> chargeId ', chargeId);
            if(!chargeId) {
                log.error('Error creating refund.  No charge found.');
                return fn('No charge found', null);
            }
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

    updateOrderById: function(order, fn) {
        var self = this;
        log.debug('>> updateOrderById');
        dao.getById(order._id, $$.m.Order, function(err, ord){
            if(err) {
                log.error('Error getting order: ' + err);
                return fn(err, null);
            } else {
                var totalAmount = 0;
                var subTotal = 0;
                var totalLineItemsQuantity = 0;
                var taxPercent = 0.08;
                //accountDao.getAccountByID(order.get('account_id'), function(acc) {
                //
                //    var bizAddr = acc.business.addresses[0];
                //
                //    log.debug('updateOrderById: business address');
                //    log.debug(bizAddr);
                //
                //    productManager.getTax(bizAddr.zip, function(err, taxPercent) {
                //        log.debug('updateOrderById: taxPercent=' + taxPercent);

                    _.each(order.get('line_items'), function(line_item){
                        totalAmount += parseFloat(line_item.total);
                        subTotal += parseFloat(line_item.total);
                        totalLineItemsQuantity += parseFloat(line_item.quantity);
                    });
                    log.debug('subtotal: ' + totalAmount);
                    if(order.get('cart_discount')) {
                        totalAmount -= parseFloat(order.get('cart_discount'));
                        log.debug('subtracting cart_discount of ' + order.get('cart_discount'));
                    }
                    if(order.get('total_discount')) {
                        totalAmount -= parseFloat(order.get('total_discount'));
                        log.debug('subtracting total_discount of ' + order.get('total_discount'));
                    }
                    if(order.get('total_tax') && order.get('total_tax') > 0) {
                        totalAmount += parseFloat(order.get('total_tax'));
                        log.debug('adding tax of ' + order.get('total_tax'));
                    }
                    else
                    {
                        totalAmount += parseFloat(totalAmount * taxPercent);
                        log.debug('adding tax of ' + order.get('total_tax'));
                    }
                    if(order.get('total_shipping')) {
                        totalAmount += parseFloat(order.get('total_shipping'));
                        log.debug('adding shipping of ' + order.get('total_shipping'));
                    }

                    order.set('subtotal', subTotal.toFixed(2));
                    order.set('total', totalAmount.toFixed(2));
                    log.debug('total is now: ' + order.get('total'));
                    order.set('total_line_items_quantity', totalLineItemsQuantity);
                    dao.saveOrUpdate(order, function(err, updatedOrder){
                    if(err) {
                        log.error('Error updating order: ' + err);
                        return fn(err, null);
                    }
                    log.debug('<< updateOrderById');
                    return fn(null, updatedOrder);
                });

        //    });
        //});

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
    },

    listOrdersByCustomer: function(customerId, accountId, fn) {
        log.debug('>> listOrdersByCustomer ', customerId, accountId);
        var query = {
            'customer_id': customerId,
            'account_id': accountId
        };

        dao.findMany(query, $$.m.Order, function(err, orders){
            log.debug('>> listOrdersByCustomer ', orders);
            if(err) {
                log.error('Error listing orders: ', err);
                return fn(err, null);
            } else {
                return fn(null, orders);
            }
        });
    }
};