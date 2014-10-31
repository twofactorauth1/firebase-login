/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var productManager = require('../../products/product_manager');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "products",

    log: $$.g.getLogger("products.api"),

    initialize: function () {


        app.post(this.url(''), this.isAuthAndSubscribedApi, this.createProduct.bind(this));
        app.get(this.url(':id'), this.setup, this.getProduct.bind(this));
        app.get(this.url(''), this.setup, this.listProducts.bind(this));
        app.post(this.url(':id'), this.isAuthAndSubscribedApi, this.updateProduct.bind(this));
        app.delete(this.url(':id'), this.isAuthAndSubscribedApi, this.deleteProduct.bind(this));
        app.get(this.url('type/:type'), this.isAuthApi, this.getProductsByType.bind(this));

    },

    createProduct: function(req, res) {
        var self = this;
        self.log.debug('>> createProduct');

        var product = req.body;

        var accountId = parseInt(self.accountId(req));

        self.checkPermission(req, self.sc.privs.MODIFY_PRODUCT, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                product.accountId = accountId;
                var productObj = new $$.m.Product(product);

                productManager.createProduct(productObj, function(err, value){
                    self.log.debug('<< createProduct');
                    self.sendResultOrError(res, err, value, "Error creating product");
                });
            }

        });

    },

    getProduct: function(req, res) {
        var self = this;
        self.log.debug('>> getProduct');

        var productId = req.params.id;

        productManager.getProduct(productId, function(err, value){
            if(!err && value != null) {
                var accountId = value.get('accountId');

                self.checkPermissionForAccount(req, self.sc.privs.VIEW_PRODUCT, accountId, function(err, isAllowed){
                    if (isAllowed !== true) {
                        self.log.debug('<< getProduct');
                        return self.send403(res);
                    } else {
                        self.log.debug('<< getProduct');
                        return self.sendResult(res, value);
                    }
                });
            } else {
                self.log.debug('<< getProduct');
                self.sendResultOrError(res, err, value, "Error retrieving product");
            }

        });
    },

    /**
     * No security necessary.  Anyone can list products.
     * @param req
     * @param res
     */
    listProducts: function(req, res) {
        var self = this;
        self.log.debug('>> listProducts');

        var skip = req.query['skip'];
        var limit = req.query['limit'];
        var accountId = parseInt(self.accountId(req));
        productManager.listProducts(accountId, limit, skip, function(err, list){
            self.log.debug('<< listProducts');
            self.sendResultOrError(res, err, list, 'Error listing products');
        });

    },

    updateProduct: function(req, res) {
        var self = this;
        self.log.debug('>> updateProduct');

        console.dir(req.body);
        var product = new $$.m.Product(req.body);
        var productId = req.params.id;
        product.set('_id', productId);

        productManager.getProduct(productId, function(err, savedProduct){
            var accountId = savedProduct.get('accountId');
            self.checkPermissionForAccount(req, self.sc.privs.MODIFY_PRODUCT, accountId, function(err, isAllowed) {
                if (isAllowed !== true) {
                    return self.send403(res);
                } else {
                    productManager.updateProduct(product, function(err, value){
                        self.log.debug('<< updateProduct');
                        self.sendResultOrError(res, err, value, 'Error updating product');
                    });
                }
            });
        });


    },

    deleteProduct: function(req, res) {
        var self = this;
        self.log.debug('>> deleteProduct');
        var productId = req.params.id;

        productManager.getProduct(productId, function(err, savedProduct) {
            var accountId = savedProduct.get('accountId');
            self.checkPermissionForAccount(req, self.sc.privs.MODIFY_PRODUCT, accountId, function (err, isAllowed) {
                if (isAllowed !== true) {
                    return self.send403(res);
                } else {
                    productManager.deleteProduct(productId, function(err, value){
                        self.log.debug('<< deleteProduct');
                        self.sendResultOrError(res, err, value, 'Error deleting product');
                    });
                }
            });
        });

    },

    getProductsByType: function(req, res) {
        var self = this;
        self.log.debug('>> getProductsByType');
        var type = req.params.type;
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_PRODUCT, accountId, function (err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                productManager.getProductsByType(accountId, type, function(err, list){
                    self.log.debug('<< getProductsByType');
                    self.sendResultOrError(res, err, list, 'Error listing products by type');
                });
            }
        });

    }
});

module.exports = new api();
