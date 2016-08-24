/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var productManager = require('../../products/product_manager');
var orderManager = require('../../orders/order_manager');
var appConfig = require('../../configs/app.config');
var emailMessageManager = require('../../emailmessages/emailMessageManager');

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
        app.get(this.url(':id/orders'), this.setup.bind(this), this.getProductOrders.bind(this));
        app.get(this.url('tax/:postcode'), this.setup.bind(this), this.getTax.bind(this));
        app.post(this.url(':id/clone'), this.isAuthAndSubscribedApi.bind(this), this.cloneProduct.bind(this));
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
        var postcode = req.params.postcode;

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
        var sortFields = req.query['sortFields'];
        var sortDirections = req.query['sortDirections'];

        if (sortFields && ! _.isArray(sortFields)) {
            sortFields = [sortFields];
            sortDirections = [sortDirections];
        }
        var sortValue = {};

        if (sortFields) {
            sortFields.forEach(function(field, index) {
                sortValue[field] = parseInt(sortDirections[index]);
            });
        }

        var accountId = parseInt(self.currentAccountId(req));
        productManager.listProducts(accountId, limit, skip, sortValue, function(err, list){
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
        self.log.debug(accountId, null, '>> listIndigenousProducts');
        var skip,limit;
        if(req.query.skip) {
            skip = parseInt(req.query.skip);
        }
        if(req.query.limit) {
            limit = parseInt(req.query.limit);
        }
        productManager.listActivePublicProducts(accountId, limit, skip, function(err, list){
            self.log.debug('<< listIndigenousProducts');
            self.sendResultOrError(res, err, list, 'Error listing Indigenous products');
        });

    },

    updateProduct: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> updateProduct');

        console.dir(req.body);
        var product = new $$.m.Product(req.body);
        /*
         * Add some debugging for product issue
         */
        if(product.get('status') !== 'active') {
            self.log.warn(accountId, userId, 'Product status not active');
            var text = 'The following product was modified:';
            var data = {
                accountId: accountId,
                userId: userId,
                req:req.body,
                product:product,
                date: new Date()
            };
            emailMessageManager.notifyAdmin('productapi@indigenous.io', 'kyle@indigenous.io', null, 'Product Status change', text, data, function(err, value){

            });
        }
        var productId = req.params.id;
        product.set('_id', productId);

        product.attributes.modified.date = new Date();
        product.attributes.modified.by = userId;
        productManager.getProduct(productId, function(err, savedProduct){

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

    },

    getProductOrders: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.currentAccountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getProductOrders');

        var productId = req.params.id;
        var results = {};
        orderManager.listOrdersByProduct(accountId, userId, productId, function(err, list){
            self.log.debug(accountId, userId, '<< getProductOrders');
            if(err) {
                self.sendResultOrError(resp, err, list, 'Error listing orders by product');
            } else {
                //format results?
                results.count = list.length;
                results.total = 0;
                _.each(list, function(order){
                    if (order.get('status') !== 'pending_payment') {
                        results.total += parseFloat(order.get('total'));
                    }
                });
                results.results = list;
                self.sendResultOrError(resp, err, results, 'Error listing orders by product');
            }
        });
    },

    cloneProduct: function(req, res) {
        var self = this;
        self.log.debug('>> cloneProduct');
        var productId = req.params.id;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_PRODUCT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                productManager.cloneProduct(userId, productId, function(err, clone){
                    self.log.debug('<< cloneProduct');
                    self.sendResultOrError(res, err, clone, 'Error cloning product');
                    self.createUserActivity(req, 'CLONE_PRODUCT', null, {id: clone.id()}, function(){});
                });
            }
        });
    }
});

module.exports = new api();
