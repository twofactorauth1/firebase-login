var util = require('util');
var sails = require('sails');
var stripe = require('stripe')(sails.config.stripe.secret_key);

exports.createPlan = function (product) {
    stripe.plans.create({
        amount: product.amount,
        interval: product.interval,
        name: product.name,
        currency: "usd",
        id: product.id
    }, function (err, plan) {
        if (err) {
            sails.log.error(err.message);
        }
        else {
            if (plan) {
                sails.log.info('plan ' + plan.id + ' created.');
            }
            else {
                sails.log.warn('plan for ' + product.id + ' failed.');
            }
        }
    });
};

exports.planUpdate = function (product) {
    stripe.plans.update(product.id, {
        name: product.name
    }, function (err, plan) {
        if (err) {
            sails.log.error(err);
        }
        else {
            if (plan) {
                sails.log.info('plan ' + plan.id + ' updated.');
            }
            else {
                sails.log.warn('plan for ' + product.id + ' failed.');
            }
        }
    });
};

exports.planDelete = function (criteria) {
    var id = criteria.where.id;
    stripe.plans.del(id, function (err, confirmation) {
        if (err) {
            sails.log.error(err);
        }
        else {
            if (confirmation) {
                sails.log.info('plan ' + id + ' deleted.');
            }
            else {
                sails.log.warn('plan ' + id + ' not deleted.');
            }
        }
    });
};

exports.createCustomer = function (email, card, callback) {
    var customer = {
        description: 'Customer ' + email,
        card: card,
        meta: {
            email: email
        }
    };
    stripe.customers.create(customer, function (err, customerObj) {
        if (err) {
            sails.log.error(err.message);
        }
        else {
            if (customerObj) {
                AuthUser.update({username: email}, {stripeUserId: customerObj.id}, function (err, users) {
                    if (err) {
                        callback(err, null);
                        sails.log.error(err);
                    }
                    else {
                        if (users) {
                            callback(null, customerObj.id);
                        }
                        else {
                            callback(null, null);
                            sails.log.error('Auth user not updated ' + email);
                        }
                    }
                });
            }
            else {
                callback(null, null);
                sails.log.error('customer not created for ' + email);
            }
        }
    });
};

exports.subscribeCustomer = function (customerId, productId, prorate) {
    stripe.customers.updateSubscription(customerObj.id, 
                                        {plan: productId, prorate: prorate}, 
                                        function (err, confirmation) {
                                            if (err) {
                                                sails.log.err(err.message);
                                            }
                                            else {
                                                if (confirmation) {
                                                    sails.log.info('customer %s subscribed to %s', 
                                                                   customerId, 
                                                                   productId);
                                                }
                                                else {
                                                    sails.log.error('customer %s subscription failed', customerId);
                                                }
                                            }
                                        });
};

exports.unSubscribeCustomer = function (customerId) {
    stripe.customers.cancelSubscription(customerId, function (err, confirmation) {
        if (err) {
            sails.log.err(err.message);
        }
        else {
            if (confirmation) {
                sails.log.info('customer %s unsubscribed', customerId);
            }
            else {
                sails.log.error('customer %s unsubscribe failed', customerId);
            }
        }
    });
};

exports.orderCharge = function (email, amount, customerId, orderId) {
    var charge = {
        amount: amount,
        currency: 'usd',
        customer: customerId,
        description: util.format('charge for %s orderId: %d', email, orderId),
        metadata: {
            email: email,
            orderId: orderId
        }
    };
    stripe.charges.create(charge, function (err, chargeRes) {
        if (err) {
            sails.log.error(err.message);
        }
        else {
            if (chargeRes) {
                Order.update(orderId, {stripeChargeId: chargeRes.id}, function (err, orders) {
                    if (err) {
                        sails.log.error(err.message);
                    }
                    else {
                        if (orders) {
                            sails.log.info('OrderID: %s charged', orderId);
                        }
                        else {
                            sails.log.error('orderID: %s failed to update', orderId);
                        }
                    }
                });
            }
            else {
                sails.log.error('charge failed for customerID: %s orderID: %s', customerId, orderId);
            }
        }
    });
};
