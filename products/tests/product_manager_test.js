/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
process.env.NODE_ENV = "testing";
var app = require('../../app');
var manager = require('../product_manager.js');
var productDao = require('../dao/product.dao.js');
var async = require('async');

var _log = $$.g.getLogger("product_manager_test");
var testContext = {};
var initialized = false;

exports.subscription_dao_test = {
    setUp: function (cb) {
        var self = this;
        //delete all objects
        if(!initialized) {
            productDao.findMany({}, $$.m.Product, function(err, list){
                if(err) {
                    _log.error('Exception removing events.  Tests may not be accurate.');
                } else {
                    async.each(list,
                        function(product, callback){
                            productDao.remove(product, function(err, value){
                                callback();
                            });
                        }, function(err){
                            initialized = true;
                            cb();
                        });
                }
            });
        } else {
            cb();
        }
    },

    tearDown: function (cb) {
        var self = this;
        cb();
    },

    testCreateProduct: function(test) {
        test.expect(2);
        var product = new $$.m.Product({
            accountId: 1,
            websiteId: 'bogusID',
            sku: 'sku-0001',
            product_name: 'Test Product',
            product_type: 'digital',
            regular_price: 100,
            sales_price: 90
        });

        manager.createProduct(product, function(err, value){
            if(err) {
                test.ok(false, 'Error creating product');
                test.done();
            } else {
                testContext.productId = value.id();
                test.equals('bogusID', value.get('websiteId'));
                test.equals(100, value.get('regular_price'));
                test.done();
            }
        });
    },

    testGetProduct: function(test) {
        test.expect(2);
        manager.getProduct(testContext.productId, function(err, value){
            if(err) {
                test.ok(false, 'Error getting product');
                test.done();
            } else {
                testContext.product = value;
                test.equals('bogusID', value.get('websiteId'));
                test.equals(100, value.get('regular_price'));
                test.done();
            }
        });
    },

    testUpdateProduct: function(test) {
        test.expect(2);
        testContext.product.set('regular_price', 200);
        manager.updateProduct(testContext.product, function(err, value){
            if(err) {
                test.ok(false, 'Error updating product');
                test.done();
            } else {
                test.equals('bogusID', value.get('websiteId'));
                test.equals(200, value.get('regular_price'));
                test.done();
            }
        });
    },

    testListProducts: function(test) {
        test.expect(2);
        manager.listProducts(null, null, function(err, list){
            if(err) {
                test.ok(false, 'Error listing products');
                test.done();
            } else {
                test.equals(1, list.length);
                test.equals(200, list[0].get('regular_price'));
                test.done();
            }
        });
    },

    testDeleteProduct: function(test) {
        test.expect(1);
        manager.deleteProduct(testContext.productId, function(err, value){
            if(err) {
                test.ok(false, 'Error deleting products');
                test.done();
            } else {
                //TODO: verify delete
                test.ok(true);
                test.done();
            }
        });
    }

}
