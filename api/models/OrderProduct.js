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
        productId: {
            type: 'string', 
            required: true
        },
        productName: {
            type: 'string',
            required: true
        },
        productDescription: {
            type: 'text', 
            required: true
        },
        productIsAddon: {
            type: 'boolean',
            required: true
        },
        productAmount: {
            type: 'float', 
            required: true
        }
    }
};
