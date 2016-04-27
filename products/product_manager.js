/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('./dao/product.dao.js');
var productDao = require('./dao/product.dao.js');
var log = $$.g.getLogger("product_manager");
var request = require('request');

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

    getTax: function(postcode, fn) {
        var self = this;
        log.debug('>> getTax ', postcode);
        var apiUrl = 'http://api.zip-tax.com/request/v20?key=CWVPBQ9&postalcode='+postcode+'&format=JSON';
        request.get(apiUrl, function(err, resp, body){
            if(err) {
                log.error('Error updating product: ' + err);
                fn(err, null);
            } else {
                log.debug('<< getTax');
                fn(null, JSON.parse(body));
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

    listProducts: function(accountId, limit, skip, sort, fn) {
        var self = this;
        log.debug('>> listProducts');
        productDao.findAllWithFieldsSortAndLimit({'accountId':accountId}, skip, limit, sort, null, $$.m.Product, function(err, list){
            if(err) {
                log.error('Exception listing products: ' + err);
                fn(err, null);
            } else {
                log.debug('<< listProducts');
                fn(null, list);
            }
        });
    },

    listActiveProducts: function(accountId, limit, skip, fn) {
        var self = this;
        log.debug('>> listActiveProducts');
        productDao.findAllWithFieldsAndLimit({'accountId':accountId, status:'active'}, skip, limit, null, null, $$.m.Product, function(err, list){
            if(err) {
                log.error('Exception listing products: ' + err);
                fn(err, null);
            } else {
                log.debug('<< listActiveProducts');
                fn(null, list);
            }
        });
    },

    listActivePublicProducts: function(accountId, limit, skip, fn) {
        var self = this;
        log.debug(accountId, null, '>> listActivePublicProducts');
        productDao.findAllWithFieldsAndLimit({'accountId':accountId, status:'active', public:true}, skip, limit, null, null, $$.m.Product, function(err, list){
            if(err) {
                log.error('Exception listing products: ' + err);
                fn(err, null);
            } else {
                log.debug('<< listActivePublicProducts');
                fn(null, list);
            }
        });
    },

    getProductsByType: function(accountId, productType, fn) {
        var self = this;
        log.debug('>> getProductsByType');
        productDao.findMany({'accountId': accountId, 'type':productType}, $$.m.Product, function(err, list){
            if(err) {
                log.error('Exception listing products: ' + err);
                fn(err, null);
            } else {
                log.debug('<< getProductsByType');
                fn(null, list);
            }
        });
    }
};
