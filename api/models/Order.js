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
        }
    }
};
