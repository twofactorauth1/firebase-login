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

exports.charge = function (email, amount, card, orderId) {
    var charge = {
        amount: amount,
        currency: 'usd',
        card: card,
        description: 'Charge for ' + email + ' orderId:' + orderId,
        metadata: {
            email: email,
            orderId: orderId
        }
    };
    stripe.charges.create(charge, function (err, chargeRes) {
        console.log(err, chargeRes);
    });
};

exports.subscribeCustomer = function (email, card, productId) {
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
                //TODO: create a entry in user table
                stripe.customers.updateSubscription(customerObj.id, {plan: productId});
            }
            else {
                sails.log.warn('customer not created for ' + email);
            }
        }
    });
};
