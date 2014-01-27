/**
 * Order
 *
 * @module      :: Model
 * @description :: Order / transaction DB represetation.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    attributes: {
        organization: {
            type: 'string', 
            required: true, 
            unique: true
        },
        totalAmount: {
            type: 'float', 
            required: true
        },
        stripeChargeId: {
            type: 'string',
            required: false
        },
        getOrderItems: function (callback) {
            var id = this._id;
            OrderProduct.find({order: id}).done(function (err, orderProducts) {
                if (err) {
                    callback(err, null);
                }
                else {
                    if (orderProducts) {
                        callback(null, orderProducts);
                    }
                    else {
                        callback(null, null);
                    }
                }
            });
        }
    }
};
