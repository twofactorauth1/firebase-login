/**
 * OrderProduct
 *
 * @module      :: Model
 * @description :: One to one order product relation.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    attributes: {
        order: {
            type: 'string', 
            required: true
        },
        product: {
            type: 'string', 
            required: true
        }
    }
};
