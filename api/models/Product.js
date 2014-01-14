/**
 * Product
 *
 * @module      :: Model
 * @description :: DB representation of the subsription product.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */
var slug = require('slugg');

module.exports = {
    attributes: {
        name: {
            type: 'string', 
            required: true
        },
        slug: {
            type: 'string', 
            required: true, 
            unique: true
        },
        description: {
            type: 'text', 
            required: true
        },
        isAddon: {
            type: 'boolean', 
            defaultsTo: false
        },
       amount: {
           type: 'float',
           required: true
       }
    },
    beforeCreate: function (product, callback) {
        product.slug = slug(product.name);
        callback(null, product);
    }
};
