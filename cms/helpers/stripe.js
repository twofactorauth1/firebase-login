var util = require('util');
var constants = require('../constants');
var stripe = require('stripe')(constants.STRIPE_SECRET_KEY);

exports.createPlan = function (product) {
    stripe.plans.create({
        amount: product.amount,
        interval: product.interval,
        name: product.name,
        currency: "usd",
        id: product.id
    }, function (err, plan) {
        if (err) {
            console.error(err.message);
        }
        else {
            if (plan) {
                console.info(util.format('plan %d created', plan.id));
            }
            else {
                console.warn(util.format('plan for %d failed', product.id));
            }
        }
    });
};

exports.planUpdate = function (product) {
    stripe.plans.update(product.id, {
        name: product.name
    }, function (err, plan) {
        if (err) {
            console.error(err.message);
        }
        else {
            if (plan) {
                console.info(util.format('plan %d updated', plan.id));
            }
            else {
                console.warn(util.format('plan for %d failed', product.id));
            }
        }
    });
};

exports.planDelete = function (criteria) {
    var id = criteria.where.id;
    stripe.plans.del(id, function (err, confirmation) {
        if (err) {
            console.error(err.message);
        }
        else {
            if (confirmation) {
                console.info(util.format('plan %d deleted', id));
            }
            else {
                console.warn(util.format('plan %d not deleted', id));
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
            console.error(err.message);
        }
        else {
            if (customerObj) {
                AuthUser.update({username: email}, {stripeUserId: customerObj.id}, function (err, users) {
                    if (err) {
                        callback(err, null);
                        console.error(err.message);
                    }
                    else {
                        if (users) {
                            callback(null, customerObj.id);
                        }
                        else {
                            callback(null, null);
                            console.error(util.format('auth user not updated %s', email));
                        }
                    }
                });
            }
            else {
                callback(null, null);
                console.error('customer not created for %s', email);
            }
        }
    });
};

exports.subscribeCustomer = function (customerId, productId, prorate) {
    stripe.customers.updateSubscription(customerObj.id,
                                        {plan: productId, prorate: prorate},
                                        function (err, confirmation) {
                                            if (err) {
                                                console.error(err.message);
                                            }
                                            else {
                                                if (confirmation) {
                                                    console.info(util.format('customer %s subscribed to %s', customerId, productId));
                                                }
                                                else {
                                                    console.error(util.format('customer %s subscription failed', customerId));
                                                }
                                            }
                                        });
};

exports.unSubscribeCustomer = function (customerId) {
    stripe.customers.cancelSubscription(customerId, function (err, confirmation) {
        if (err) {
            console.error(err.message);
        }
        else {
            if (confirmation) {
                console.info(util.format('customer %s unsubscribed', customerId));
            }
            else {
                console.error(util.format('customer %s unsubscribe failed', customerId));
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
            console.error(err.message);
        }
        else {
            if (chargeRes) {
                Order.update(orderId, {stripeChargeId: chargeRes.id}, function (err, orders) {
                    if (err) {
                        console.error(err.message);
                    }
                    else {
                        if (orders) {
                            console.info(util.format('order ID: %s charged', orderId));
                        }
                        else {
                            console.error(util.format('order ID: %s failed to update', orderId));
                        }
                    }
                });
            }
            else {
                console.error(util.format('charge failed for customerID: %s orderID: %s', customerId, orderId));
            }
        }
    });
};
