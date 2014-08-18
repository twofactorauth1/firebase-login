/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('./dao/product.dao.js');
var productDao = require('./dao/product.dao.js');
var log = $$.g.getLogger("product_manager");


module.exports = {
    createProduct: function(productObj, fn){
        var self = this;
        log.debug('>> createProduct');
        productDao.saveOrUpdate(productObj, function(err, value){
            if(err) {
                log.error('Error creating product: ' + err);
                fn(err, null);
            } else {
                log.debug('<< createProduct');
                fn(null, value);
            }
        });
    },

    getProduct: function(productId, fn) {
        var self = this;
        log.debug('>> getProduct');
        productDao.getById(productId, $$.m.Product, function(err, value){
            if(err) {
                log.error('Error getting product: ' + err);
                fn(err, null);
            } else {
                log.debug('<< getProduct');
                fn(null, value);
            }
        });
    },

    updateProduct: function(product, fn) {
        var self = this;
        log.debug('>> updateProduct');
        productDao.saveOrUpdate(product, function(err, value){
            if(err) {
                log.error('Error updating product: ' + err);
                fn(err, null);
            } else {
                log.debug('<< updateProduct');
                fn(null, value);
            }
        });
    },

    updateProductFields: function(productId, fieldsObj, fn) {
        var self = this;
        fn('Not Implemented.', 'Not Implemented');
    },

    deleteProduct: function(productId, fn) {
        var self = this;
        log.debug('>> deleteProduct');
        productDao.removeById(productId, $$.m.Product, function(err, value){
            if(err) {
                log.error('Error deleting product: ' + err);
                fn(err, null);
            } else {
                log.debug('<< deleteProduct');
                fn(null, value);
            }
        });
    },

    listProducts: function(limit, skip, fn) {
        var self = this;
        log.debug('>> listProducts');
        productDao.findAllWithFieldsAndLimit({}, skip, limit, null, null, $$.m.Product, function(err, list){
            if(err) {
                log.error('Exception listing products: ' + err);
                fn(err, null);
            } else {
                log.debug('<< listProducts');
                fn(null, list);
            }
        });
    }
};