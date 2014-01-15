var sails = require('sails');
var stripe = require('stripe')(sails.config.stripe.secret_key);


exports.charge = function (email, amount, card, orderId) {
    var charge = {
        amount: amount,
        currency: 'usd',
        card: card,
        description: 'Charge for ' + email ' orderId:' + orderId,
        metadata: {
            email: email,
            orderId: orderId
        }
    };
    stripe.charges.create(charge, function (err, chargeRes) {
        console.log(err, chargeRes);
    });
};
