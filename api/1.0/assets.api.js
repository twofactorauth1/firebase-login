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

        app.post(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.createAsset.bind(this));
        app.get(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.getAsset.bind(this));
        app.get(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.listAssets.bind(this));
        app.post(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.updateAsset.bind(this));
        app.delete(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.deleteAsset.bind(this));

        app.get(this.url('type/:type'), this.isAuthAndSubscribedApi.bind(this), this.getAssetsByType.bind(this));
        app.get(this.url('tag/:tag'), this.isAuthAndSubscribedApi.bind(this), this.getAssetsByTag.bind(this));
        app.get(this.url('source/:source'), this.isAuthAndSubscribedApi.bind(this), this.getAssetsBySource.bind(this));
    },

    //file must be uploaded using the 'file' input name
    createAsset: function(req, res) {
        var self = this;
        self.log.debug('>> createAsset');
        var form = new formidable.IncomingForm();
        var accountId = parseInt(self.accountId(req));

        self.checkPermission(req, self.sc.privs.MODIFY_ASSET, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(res);
            } else {
                var userId = self.userId(req);

                form.parse(req, function(err, fields, files) {
                    if(err) {
                        self.wrapError(res, 500, 'fail', 'The upload failed', err);
                        self = null;
                    } else {

                        var file = files['file'];
                        //var file = files["files[]"];
                        var source = fields['source'] || 'S3';
                        var tagAry = (fields['tag'] && fields['tag'].split(','))  || [];
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
                    assetManager.createAsset(file.path, asset, function(err, value, file){
                        self.log.debug('<< createAsset');
                        file._id = value.get("_id");
                        file.date = value.get("created").date;
                        //self.sendResultOrError(res, err, value, "Error creating Asset");
                        self.sendFileUploadResult(res, err, file);
                    });

                });
            }
        });



    },

    getAsset: function(req, res) {
        var self = this;
        self.log.debug('>> getAsset');

        var assetId = req.params.id;
        assetManager.getAsset(assetId, function(err, value){

            self.log.debug('<< getAsset');
            if(value != null) {
                self.checkPermissionForAccount(req, self.sc.privs.VIEW_ASSET, value.get('account'), function(err, isAllowed){
                    if(isAllowed !== true) {
                        return self.send403(res);
                    } else {
                        return self.sendResultOrError(res, err, value, "Error retrieving Asset");
                    }
                });
            }
            //error if we got here

            self.sendResultOrError(res, err, value, "Error retrieving Asset");
        });
    },

    listAssets: function(req, res) {
        var self = this;
        self.log.debug('>> listAssets');

        var accountId = parseInt(self.accountId(req));
        self.checkPermission(req, self.sc.privs.VIEW_ASSET, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var skip = req.query['skip'];
                var limit = req.query['limit'];
                assetManager.listAssets(accountId, skip, limit, function(err, value){
                    self.log.debug('<< listAssets');
                    self.sendResultOrError(res, err, value, "Error listing Asset");
                });
            }
        });

    },

    updateAsset: function(req, res) {
        var self = this;
        self.log.debug('>> updateAsset');

        var assetId = req.params.id;
        var accountId = parseInt(self.accountId(req));
        assetManager.getAsset(assetId, function(err, savedAsset){
            if(err) {
                return self.wrapError(res, 404, 'Asset not found', 'Could not find asset with id [' + assetId + '].');
            }
            self.checkPermissionForAccount(req, self.sc.privs.MODIFY_ASSET, savedAsset.get('accountId'), function(err, isAllowed){
                if(isAllowed !== true) {
                    return self.send403(res);
                } else {
                    var asset = new $$.m.Asset(req.body);
                    asset.set('_id', assetId);
                    assetManager.updateAsset(asset, function(err, value) {
                        self.log.debug('<< updateAsset');
                        self.sendResultOrError(res, err, value, "Error updating Asset");
                    });
                }
            });
        });

    },

    /**
     * This method returns a result before the asset is deleted.
     * @param req
     * @param res
     */
    deleteAsset: function(req, res) {
        var self = this;
        self.log.debug('>> deleteAsset');

        var assetId = req.params.id;
        var accountId = parseInt(self.accountId(req));

        assetManager.getAsset(assetId, function(err, savedAsset){
            if(err || savedAsset === null) {
                return self.wrapError(res, 404, 'Asset not found', 'Could not find asset with id [' + assetId + '].');
            }
            self.log.debug('Got asset: ', savedAsset);
            self.checkPermissionForAccount(req, self.sc.privs.MODIFY_ASSET, savedAsset.get('accountId'), function(err, isAllowed) {
                if (isAllowed !== true) {
                    return self.send403(res);
                } else {
                    assetManager.deleteAsset(assetId, function(err, value){
                        if(err) {
                            self.log.error('Error deleting asset: ' + err);
                        } else {
                            self.log.debug('Asset was deleted');
                        }
                    });
                    self.log.debug('<< deleteAsset');
                    return self.sendResult(res, "Deleted");
                }
            });
        });


    },

    getAssetsByType: function(req, res) {
        var self = this;
        self.log.debug('>> getAssetsByType');

        var accountId = parseInt(self.accountId(req));
        self.checkPermission(req, self.sc.privs.VIEW_ASSET, function(err, isAllowed){
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var skip = req.query['skip'];
                var limit = req.query['limit'];
                var type = req.params.type;

                assetManager.findByType(accountId, type, skip, limit, function(err, list){
                    self.log.debug('<< getAssetsByType');
                    self.sendResultOrError(res, err, list, "Error getting Assets by type");
                });
            }
        });

    },

    getAssetsBySource: function(req, res) {
        var self = this;
        self.log.debug('getAssetsBySource');

        var accountId = parseInt(self.accountId(req));
        self.checkPermission(req, self.sc.privs.VIEW_ASSET, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var skip = req.query['skip'];
                var limit = req.query['limit'];
                var source = req.params.source;

                assetManager.findBySource(accountId, source, skip, limit, function(err, list){
                    self.log.debug('<< getAssetsBySource');
                    self.sendResultOrError(res, err, list, "Error getting Assets by source");
                });
            }
        });

    },

    getAssetsByTag: function(req, res) {
        var self = this;
        self.log.debug('getAssetsByTag');

        var accountId = parseInt(self.accountId(req));
        self.checkPermission(req, self.sc.privs.VIEW_ASSET, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var skip = req.query['skip'];
                var limit = req.query['limit'];
                var tag = req.params.tag;

                assetManager.findByTag(accountId, tag, skip, limit, function(err, list){
                    self.log.debug('<< getAssetsByTag');
                    self.sendResultOrError(res, err, list, "Error getting Assets by tag");
                });
            }
        });

    },

    sendFileUploadResult: function (resp, err, value) {
        var result = {};
        result.files = [];

        if (!err) {
            var file = {
                filename: value.name,
                size: value.size,
                url: value.url,
                resource: value.resource,
                created: {
                    date: value.date
                },
                _id: value._id
            };

            result.files.push(file);
        } else {
            file = {
                name: value.name,
                error: err.toString()
            };

            result.files.push(file);
        }

        resp.send(result);
    }
});

module.exports = new api();
