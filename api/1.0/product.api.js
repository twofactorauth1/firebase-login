/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var productManager = require('../../products/product_manager');
var appConfig = require('../../configs/app.config');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "products",

    log: $$.g.getLogger("products.api"),

    initialize: function () {

        app.get(this.url('indigenous'), this.setup.bind(this), this.listIndigenousProducts.bind(this));
        app.get(this.url('active'), this.setup.bind(this), this.listActiveProducts.bind(this));
        app.post(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.createProduct.bind(this));
        app.get(this.url(':id'), this.setup.bind(this), this.getProduct.bind(this));
        app.get(this.url(''), this.setup.bind(this), this.listProducts.bind(this));
        app.post(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.updateProduct.bind(this));
        app.delete(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.deleteProduct.bind(this));
        app.get(this.url('type/:type'), this.isAuthApi.bind(this), this.getProductsByType.bind(this));

        app.get(this.url('tax/:postcode'), this.setup.bind(this), this.getTax.bind(this));



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
                    self.createUserActivity(req, 'CREATE_PRODUCT', null, {id: value.id()}, function(){});
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
                return self.sendResult(res, value);
            } else {
                self.log.debug('<< getProduct');
                self.sendResultOrError(res, err, value, "Error retrieving product");
            }

        });
    },

    getTax: function(req, res) {
        var self = this;
        self.log.debug('>> getTax');

        var postcode = parseFloat(req.params.postcode);

        productManager.getTax(postcode, function(err, value){
            self.log.debug('tax value ', value);
            if(!err && value != null) {
                return self.sendResult(res, value);
            } else {
                self.log.debug('<< getTax');
                self.sendResultOrError(res, err, value, "Error retrieving tax");
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
        var accountId = parseInt(self.currentAccountId(req));
        productManager.listProducts(accountId, limit, skip, function(err, list){
            self.log.debug('<< listProducts');
            self.sendResultOrError(res, err, list, 'Error listing products');
        });

    },


    /**
     * No security necessary.  Anyone can list products.
     * @param req
     * @param res
     */
    listActiveProducts: function(req, res) {
        var self = this;
        self.log.debug('>> listActiveProducts');

        var skip = req.query['skip'];
        var limit = req.query['limit'];
        var accountId = parseInt(self.currentAccountId(req));
        productManager.listActiveProducts(accountId, limit, skip, function(err, list){
            self.log.debug('<< listActiveProducts');
            self.sendResultOrError(res, err, list, 'Error listing products');
        });

    },

    listIndigenousProducts: function(req, res) {
        var self = this;
        self.log.debug('>> listIndigenousProducts');

        var accountId = appConfig.mainAccountID;
        var skip,limit;
        if(req.query.skip) {
            skip = parseInt(req.query.skip);
        }
        if(req.query.limit) {
            limit = parseInt(req.query.limit);
        }
        productManager.listProducts(accountId, limit, skip, function(err, list){
            self.log.debug('<< listIndigenousProducts');
            self.sendResultOrError(res, err, list, 'Error listing Indigenous products');
        });
    },

    updateProduct: function(req, res) {
        var self = this;
        self.log.debug('>> updateProduct');

        console.dir(req.body);
        var product = new $$.m.Product(req.body);
        var productId = req.params.id;
        product.set('_id', productId);
       
        product.attributes.modified.date = new Date();
        productManager.getProduct(productId, function(err, savedProduct){
            var accountId = savedProduct.get('accountId');
            self.checkPermissionForAccount(req, self.sc.privs.MODIFY_PRODUCT, accountId, function(err, isAllowed) {
                if (isAllowed !== true) {
                    return self.send403(res);
                } else {
                    productManager.updateProduct(product, function(err, value){
                        self.log.debug('<< updateProduct');
                        self.sendResultOrError(res, err, value, 'Error updating product');
                        self.createUserActivity(req, 'UPDATE_PRODUCT', null, {id: value.id()}, function(){});
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
                        if (!err && value != null) {
                            self.sendResult(res, {deleted:true});                            
                            self.createUserActivity(req, 'DELETE_PRODUCT', null, {id: productId}, function(){});
                        } else {
                            self.wrapError(res, 401, null, err, value);
                        }  
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
