var sails = require('sails');
var stripe = require('stripe')(sails.config.stripe.secret_key);

exports.createPlan = function (product) {
    stripe.plans.create({
        amount: product.amount,
        interval: product.interval,
        name: product.name,
        currency: "usd",
        id: product._id
    }, function (err, plan) {
        if (err) {
            sails.log.error(err);
        }
        else {
            if (plan) {
                sails.log.info('plan ' + plan.id + ' created.');
            }
            else {
                sails.log.info('plan for ' + product._id + ' failed.');
            }
        }
    });
};

exports.planUpdate = function (product) {
    stripe.plans.update(product._id, {
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
                sails.log.warn('plan for ' + product._id + ' failed.');
            }
        }
    });
};

exports.planDelete = function (product) {
    stripe.plans.del(product._id, function (err, confirmation) {
        if (err) {
            sails.log.error(err);
        }
        else {
            if (confirmation) {
                sails.log.info('plan ' + product._id + ' deleted.');
            }
            else {
                sails.log.warn('plan ' + product._id + ' not deleted.');
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
