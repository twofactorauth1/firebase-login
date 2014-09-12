/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var assetManager = require('../../assets/asset_manager.js');
var formidable = require('formidable'),
    http = require('http'),
    util = require('util');
require('../../assets/model/asset');


var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "assets",

    log: $$.g.getLogger("assets.api"),

    initialize: function () {

        app.post(this.url(''), this.isAuthApi, this.createAsset.bind(this));
        /*app.get(this.url('/:id'), this.isAuthApi, this.getAsset.bind(this));
        app.get(this.url(''), this.isAuthApi, this.listAssets.bind(this));
        app.post(this.url('/:id'), this.isAuthApi, this.updateAsset.bind(this));
        app.delete(this.url('/:id'), this.isAuthApi, this.deleteAsset.bind(this));

        app.get(this.url('/type/:type'), this.isAuthApi, this.getAssetsByType.bind(this));
        app.get(this.url('/tag/:tag'), this.isAuthApi, this.getAssetsByTag.bind(this));
        app.get(this.url('/source/:source'), this.isAuthApi, this.getAssetsBySource.bind(this));*/
    },

    //file must be uploaded using the 'file' input name
    createAsset: function(req, res) {
        var self = this;
        self.log.debug('>> createAsset');
        var form = new formidable.IncomingForm();
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);

        form.parse(req, function(err, fields, files) {
            if(err) {
                self.wrapError(res, 500, 'fail', 'The upload failed', err);
                self = null;
            } else {

                var file = files['file'];
                var source = fields['source'] || 'S3';
                var tagAry = fields['tag'].split(',') || [];
                var asset = new $$.m.Asset({
                    accountId: accountId,
                    mimeType: file.type,
                    size: file.size,
                    filename: file.name,
                    url: '',
                    source: source,
                    tags: tagAry,
                    created: {
                        date: new Date(),
                        by: userId
                    }

                });
            }
            console.dir(asset);

            res.writeHead(200, {'content-type': 'text/plain'});
            res.write('received upload:\n\n');
            res.end(util.inspect({fields: fields, files: files}));
        });
    },

    createProduct: function(req, res) {
        var self = this;
        self.log.debug('>> createProduct');

        var product = req.body;
        product.accountId = self.accountId(req);
        //TODO: security
        productManager.createProduct(product, function(err, value){
            self.log.debug('<< createProduct');
            self.sendResultOrError(res, err, value, "Error creating product");
        });

    },

    getProduct: function(req, res) {
        var self = this;
        self.log.debug('>> getProduct');

        var productId = req.params.id;
        //TODO: security

        productManager.getProduct(productId, function(err, value){
            self.log.debug('<< getProduct');
            self.sendResultOrError(res, err, value, "Error retrieving product");
        });
    },

    listProducts: function(req, res) {
        var self = this;
        self.log.debug('>> listProducts');

        var skip = req.query['skip'];
        var limit = req.query['limit'];
        var accountId = self.accountId(req);

        //TODO: security

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
            self.log.debug('<< updateProduct');
            self.sendResultOrError(res, err, value, 'Error updating product');
        });
    },

    deleteProduct: function(req, res) {
        var self = this;
        self.log.debug('>> deleteProduct');
        var productId = req.params.id;

        //TODO: security
        productManager.deleteProduct(productId, function(err, value){
            self.log.debug('<< deleteProduct');
            self.sendResultOrError(res, err, value, 'Error deleting product');
        });
    },

    getProductsByType: function(req, res) {
        var self = this;
        self.log.debug('>> getProductsByType');
        var type = req.params.type;
        var accountId = parseInt(self.accountId(req));
        //TODO: security

        productManager.getProductsByType(accountId, type, function(err, list){
            self.log.debug('<< getProductsByType');
            self.sendResultOrError(res, err, value, 'Error listing products by type');
        });

    }
});

module.exports = new api();
