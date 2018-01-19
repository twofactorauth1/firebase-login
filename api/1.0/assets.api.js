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
        app.get(this.url('paged/list'), this.isAuthAndSubscribedApi.bind(this), this.listPagedAssets.bind(this));
        app.post(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.updateAsset.bind(this));
        app.post(this.url('cache/:id'), this.isAuthAndSubscribedApi.bind(this), this.updateAssetMetadata.bind(this));
        app.post(this.url('shareUnshare/:id'), this.isAuthAndSubscribedApi.bind(this), this.shareUnshare.bind(this));
        app.delete(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.deleteAsset.bind(this));

        app.get(this.url('type/:type'), this.isAuthAndSubscribedApi.bind(this), this.getAssetsByType.bind(this));
        app.get(this.url('custom/fonts'), this.isAuthAndSubscribedApi.bind(this), this.findByFontType.bind(this));
        app.get(this.url('tag/:tag'), this.isAuthAndSubscribedApi.bind(this), this.getAssetsByTag.bind(this));
        app.get(this.url('source/:source'), this.isAuthAndSubscribedApi.bind(this), this.getAssetsBySource.bind(this));
        app.post(this.url('editor/upload'), this.isAuthAndSubscribedApi.bind(this), this.uploadImage.bind(this));
        app.post(this.url('editor/image/upload'), this.isAuthAndSubscribedApi.bind(this), this.uploadEditorImage.bind(this));


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
                        return;
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
                        asset.set('_id', fields['assetToBeReplaced']);
                        var isReplacement = (fields['replace']=== 'true');
                        console.dir(asset);
                        if(isReplacement === true) {
                            assetManager.replaceS3Asset(accountId, userId, file.path, asset, function(err, value, file){
                                self.log.debug('<< createAsset');
                                file._id = value.get("_id");
                                file.date = value.get("created").date;
                                //self.sendResultOrError(res, err, value, "Error creating Asset");
                                self.sendFileUploadResult(res, err, file);
                                self.createUserActivity(req, 'CREATE_ASSET', null, null, function(){});
                            });

                        } else {
                            assetManager.createAsset(file.path, asset, function(err, value, file){
                                self.log.debug('<< createAsset');
                                file._id = value.get("_id");
                                file.date = value.get("created").date;
                                //self.sendResultOrError(res, err, value, "Error creating Asset");
                                self.sendFileUploadResult(res, err, file);
                                self.createUserActivity(req, 'CREATE_ASSET', null, null, function(){});
                            });
                        }

                    }


                });
            }
        });

    },

    uploadImage: function(req, res) {
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
                        self.sendEditorUploadResult(res, err, file);
                        self.createUserActivity(req, 'CREATE_ASSET', null, null, function(){});
                    });

                });
            }
        });
    },

    uploadEditorImage: function(req, res) {
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
                        
                        var t = file.name;
                        var extIndex = t.lastIndexOf(".");
                        var ext = t.substring(t.lastIndexOf("."), t.length);
                        var fName = t.substr(0, t.lastIndexOf("."));

                        fName = fName + "-" + moment().toDate().getTime();

                        fName += ext;
                        var asset = new $$.m.Asset({
                            accountId: accountId,
                            mimeType: file.type,
                            size: file.size,
                            filename: fName,
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
                        self.sendEditorUploadResult(res, err, file);
                        self.createUserActivity(req, 'CREATE_ASSET', null, null, function(){});
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


    listPagedAssets: function(req, res) {
        var self = this;
        self.log.debug('>> listPagedAssets');

        var accountId = parseInt(self.accountId(req));
        self.checkPermission(req, self.sc.privs.VIEW_ASSET, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var skip = parseInt(req.query['skip']);
                var limit = parseInt(req.query['limit']);
                var filterType = req.query['filterType'];
                var search = req.query['search'];

                assetManager.listPagedAssets(accountId, skip, limit, filterType,search, function(err, value){
                    self.log.debug('<< listPagedAssets');
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
        var userId = self.userId(req);
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
                    var created = asset.get('created');

                    if (created && _.isString(asset.get('created').date)) {
                        created.date = moment(asset.date).toDate();
                    }

                    assetManager.updateAssetChangeUrl(asset, userId, function(err, value) {
                        self.log.debug('<< updateAsset');
                        self.sendResultOrError(res, err, value, "Error updating Asset");
                        self.createUserActivity(req, 'UPDATE_ASSET', null, null, function(){});
                    });
                }
            });
        });
    },
     updateAssetMetadata: function(req, res) {
        var self = this;
        self.log.debug('>> updateAsset');

        var assetId = req.params.id;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
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
                    var created = asset.get('created');

                    if (created && _.isString(asset.get('created').date)) {
                        created.date = moment(asset.date).toDate();
                    }
                    self.log.debug('<< updateAsset metadata');
                    assetManager.metadataS3Asset( asset.get('accountId'), userId, asset,function(err, value) {
                        self.log.debug('<< updateAsset metadata');
                        if(err) {
                            return self.wrapError(res, 404, 'Asset not found', 'Could not find asset with id [' + assetId + '].');
                        }else{
                            self.sendResultOrError(res, err, value, "Error updating Asset");
                            self.createUserActivity(req, 'UPDATE_ASSET', null, null, function(){});
                        }
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
                    self.sendResult(res, "Deleted");
                    self.createUserActivity(req, 'DELETE_ASSET', null, null, function(){});
                    return;
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

    findByFontType: function(req, res) {
        var self = this;
        self.log.debug('>> findByFontType');

        var accountId = parseInt(self.accountId(req));
        self.checkPermission(req, self.sc.privs.VIEW_ASSET, function(err, isAllowed){
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var skip = req.query['skip'];
                var limit = req.query['limit'];

                assetManager.findByFontType(accountId, skip, limit, function(err, list){
                    self.log.debug('<< findByFontType');
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
    },

    sendEditorUploadResult: function (resp, err, value) {
        resp.send({'link':value.url});
    },
    shareUnshare :function(req, res) {
        var self = this;
        self.log.debug('>> shareUnshare'); 
        var assetId = req.params.id;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        assetManager.getAsset(assetId, function(err, savedAsset){
            if(err) {
                return self.wrapError(res, 404, 'Asset not found', 'Could not find asset with id [' + assetId + '].');
            }
            self.checkPermissionForAccount(req, self.sc.privs.MODIFY_ASSET, savedAsset.get('accountId'), function(err, isAllowed){
                if(isAllowed !== true) {
                    return self.send403(res);
                } else {
                    self.isOrgAdminUser(accountId, userId, req, function(err, isOrgAdminUser){
                        self.getOrgId(accountId, userId, req, function(err, orgId){
                            if(isOrgAdminUser === true) {
                                var asset = new $$.m.Asset(req.body);
                                asset.set('_id', assetId);
                                asset.set('orgId', orgId);
                                var created = asset.get('created'); 
                                if (created && _.isString(asset.get('created').date)) {
                                    created.date = moment(asset.date).toDate();
                                } 
                                assetManager.updateAsset(asset, userId, function(err, value) {
                                    self.log.debug('<< shareUnshare');
                                    self.sendResultOrError(res, err, value, "Error shareUnshare Asset");
                                    self.createUserActivity(req, 'UPDATE_ASSET', null, null, function(){});
                                });
                            }else{
                                return self.send403(res);
                            }
                        });
                    }); 
                }
            });
        });
    },
});

module.exports = new api();
