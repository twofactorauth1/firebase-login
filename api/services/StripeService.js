var sails = require('sails');
var stripe = require('stripe')(sails.config.stripe.secret_key);

exports.createPlan = function (product) {
    stripe.plan.create({
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
