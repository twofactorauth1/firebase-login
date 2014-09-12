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
        app.get(this.url('/:id'), this.isAuthApi, this.getAsset.bind(this));
        app.get(this.url(''), this.isAuthApi, this.listAssets.bind(this));
        app.post(this.url('/:id'), this.isAuthApi, this.updateAsset.bind(this));
        app.delete(this.url('/:id'), this.isAuthApi, this.deleteAsset.bind(this));

        app.get(this.url('/type/:type'), this.isAuthApi, this.getAssetsByType.bind(this));
        app.get(this.url('/tag/:tag'), this.isAuthApi, this.getAssetsByTag.bind(this));
        app.get(this.url('/source/:source'), this.isAuthApi, this.getAssetsBySource.bind(this));
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
            assetManager.createAsset(file.path, asset, function(err, value){
                self.log.debug('<< createAsset');
                self.sendResultOrError(res, err, value, "Error creating Asset");
            });

        });
    },

    getAsset: function(req, res) {
        var self = this;
        self.log.debug('>> getAsset');

        var assetId = req.params.id;
        assetManager.getAsset(assetId, function(err, value){
            self.log.debug('<< getAsset');
            self.sendResultOrError(res, err, value, "Error retrieving Asset");
        });
    },

    listAssets: function(req, res) {
        var self = this;
        self.log.debug('>> listAssets');

        var accountId = parseInt(self.accountId(req));
        var skip = req.query['skip'];
        var limit = req.query['limit'];
        assetManager.listAssets(accountId, skip, limit, function(err, value){
            self.log.debug('<< listAssets');
            self.sendResultOrError(res, err, value, "Error listing Asset");
        });
    },

    updateAsset: function(req, res) {

    },

    deleteAsset: function(req, res) {

    },

    getAssetsByType: function(req, res) {

    },

    getAssetsBySource: function(req, res) {

    },

    getAssetsByTag: function(req, res) {

    }
});

module.exports = new api();
