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

        app.post(this.url(''), this.isAuthApi, this.createProduct.bind(this));
        app.get(this.url('/:id'), this.isAuthApi, this.getProduct.bind(this));
        app.get(this.url(''), this.isAuthApi, this.listProducts.bind(this));
        app.post(this.url('/:id'), this.isAuthApi, this.updateProduct.bind(this));
        app.delete(this.url('/:id'), this.isAuthApi, this.deleteProduct.bind(this));

    },

    createProduct: function(req, res) {
        var self = this;
        self.log.debug('>> createProduct');

        var product = req.body;
        var accountId = parseInt(self.accountId(req));
        //TODO: security - MODIFY_PRODUCT
        product.accountId = self.accountId(req);

        productManager.createProduct(product, function(err, value){
            self.log.debug('<< createProduct');
            self.sendResultOrError(res, err, value, "Error creating product");
        });

    },

    getProduct: function(req, res) {
        var self = this;
        self.log.debug('>> getProduct');

        var productId = req.params.id;

        productManager.getProduct(productId, function(err, value){
            if(!err && value != null) {
                var accountId = value.get('accountId');
                //TODO: security - VIEW_PRODUCT
            }
            self.log.debug('<< getProduct');
            self.sendResultOrError(res, err, value, "Error retrieving product");
        });
    },

    listProducts: function(req, res) {
        var self = this;
        self.log.debug('>> listProducts');

        var skip = req.query['skip'];
        var limit = req.query['limit'];
        var accountId = parseInt(self.accountId(req));
        //TODO: security - VIEW_PRODUCT

        productManager.listProducts(accountId, limit, skip, function(err, list){
            self.log.debug('<< listProducts');
            self.sendResultOrError(res, err, list, 'Error listing products');
        });


    },

    updateProduct: function(req, res) {
        var self = this;
        self.log.debug('>> updateProduct');

        var product = req.body;
        var productId = req.params.id;
        product._id = productId;

        //TODO: security

        productManager.updateProduct(product, function(err, value){
            //TODO: get accountId from value
            //TODO: security - MODIFY_PRODUCT
            self.log.debug('<< updateProduct');
            self.sendResultOrError(res, err, value, 'Error updating product');
        });
    },

    deleteProduct: function(req, res) {
        var self = this;
        self.log.debug('>> deleteProduct');
        var productId = req.params.id;

        //TODO: get accountId from product
        //TODO: security - MODIFY_PRODUCT
        productManager.deleteProduct(productId, function(err, value){
            self.log.debug('<< deleteProduct');
            self.sendResultOrError(res, err, value, 'Error deleting product');
        });
    }
});

module.exports = new api();
