/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */


var assetDao = require('./dao/asset.dao.js');
var log = $$.g.getLogger("asset_manager");
var s3dao = require('../dao/integrations/s3.dao.js');
var awsConfig = require('../configs/aws.config');
var async = require('async');
var appConfig = require('../configs/app.config');

module.exports = {

    /**
     * This will upload to the 'source' based upon the asset if the temporaryPath is specified.
     * Otherwise, it will simply create an asset record.
     * @param temporaryPath
     * @param asset
     * @param fn
     */
    createAsset: function(temporaryPath, asset, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> createAsset');

        var uploadPromise = $.Deferred();

        if(temporaryPath) {
            //TODO: also determine source.
            var file = {};
            file.name = asset.get('filename');
            file.type = asset.get('mimeType');
            file.size = asset.get('size');
            file.path = temporaryPath;
            var bucket = awsConfig.BUCKETS.ASSETS;
            var subdir = 'account_' + asset.get('accountId');
            if(appConfig.nonProduction === true) {
                subdir = 'test_' + subdir;
            }
            asset.set('source', 'S3');
            s3dao.uploadToS3(bucket, subdir, file, true, function(err, value){
                if(err) {
                    self.log.error('Error from S3: ' + err);
                    uploadPromise.reject();
                    fn(err, null);
                } else {
                    self.log.debug('S3 upload complete');
                    console.dir(value);
                    if (value.url.substring(0, 5) == 'http:') {
                    asset.set('url', value.url.substring(5, value.url.length));
                    } else {
                    asset.set('url', value.url);
                    }

                    if(value.url && _.contains([".ttf", ".woff", ".woff2", ".eot", ".otf"], value.url.substr(value.url.lastIndexOf('.')))){
                        asset.set('type', 'fonts');
                    }
                    console.log(asset);                    

                    uploadPromise.resolve(value);
                }
            });

        } else {
            uploadPromise.resolve();
        }
        //create record
        $.when(uploadPromise).done(function(file){
            assetDao.saveOrUpdate(asset, function(err, value){
                if(err) {
                    self.log.error('Exception during asset creation: ' + err);
                    fn(err, null);
                } else {
                    self.log.debug('<< createAsset');
                    fn(null, value, file);
                }
            });
        });

    },

    replaceS3Asset: function(accountId, userId, temporaryPath, asset, fn) {
        var self = this;
        self.log = log;
        self.log.debug(accountId, userId, '>> replaceS3Asset');
        var file = {};

        async.waterfall([
            function(cb){
                assetDao.getById(asset.id(), function(err, dbAsset){
                    cb(err, dbAsset);
                });
            },
            function(existingAsset, cb) {

                //Keep the same filename in AWS                
                var fileName = existingAsset.get('filename');
                // get filename using image url 
                var _fileurl = existingAsset.get('url'); 
                if(_fileurl){
                    var fNameArr = _fileurl.split("/");
                    if(fNameArr.length){
                        fileName = fNameArr.pop();
                    }
                }
                file.name = fileName;
                file.type = asset.get('mimeType');
                file.size = asset.get('size');
                file.path = temporaryPath;
                file.isCache =existingAsset.get('isCached')==false?false:true;
                self.log.debug("old image cache status="+file.isCache);
                var bucket = awsConfig.BUCKETS.ASSETS;
                var subdir = 'account_' + asset.get('accountId');
                if(appConfig.nonProduction === true) {
                    subdir = 'test_' + subdir;
                }
                asset.set('source', 'S3');
                existingAsset.set('mimeType', file.type);
                existingAsset.set('size', file.size);
                existingAsset.set('modified', {modified:new Date(), by:userId});
                s3dao.uploadToS3(bucket, subdir, file, false, function(err, value){
                    if(err) {
                        self.log.error(accountId, userId, 'Error from S3: ' + err);
                        cb(err, null);
                    } else {
                        self.log.debug(accountId, userId, 'S3 upload complete');

                        if (value.url.substring(0, 5) == 'http:') {
                            existingAsset.set('url', value.url.substring(5, value.url.length));
                        } else {
                            existingAsset.set('url', value.url);
                        }
                        self.log.debug(accountId, userId, 'new url: ', existingAsset.get('url'));
                        cb(null, existingAsset);
                    }
                });
            }
        ], function(err, existingAsset){
            assetDao.saveOrUpdate(existingAsset, function(err, value){
                if(err) {
                    self.log.error(accountId, userId, 'Exception during asset replacement: ' + err);
                    fn(err, null);
                } else {
                    self.log.debug(accountId, userId, '<< replaceS3Asset');
                    //self.log.debug('new file: ', file);
                    file.url = existingAsset.get("url");
                    fn(null, value, file);
                }
            });
        });


    },

    metadataS3Asset: function(accountId, userId, asset, fn) {
        var self = this;
        self.log = log;
        self.log.debug(accountId, userId, '>> update metadata');
        var file = {};

        async.waterfall([
            function(cb){
                assetDao.getById(asset.id(), function(err, dbAsset){
                    cb(err, dbAsset);
                });
            },
            function(existingAsset, cb) {

                //Keep the same filename in AWS
                var fileName = existingAsset.get('filename');
                // get filename using image url
                var _fileurl = existingAsset.get('url');
                if(_fileurl){
                    var fNameArr = _fileurl.split("/");
                    if(fNameArr.length){
                        fileName = fNameArr.pop();
                    }
                }
                file.name = fileName;
                file.type = asset.get('mimeType');
                file.size = asset.get('size');
                if (asset.get("url").substring(0, 5) == 'http:') {
                    file.path=asset.get('url');
                } else {
                    file.path='http:'+asset.get('url');
                }
                var bucket = awsConfig.BUCKETS.ASSETS;
                var subdir = 'account_' + accountId;
                if(appConfig.nonProduction === true) {
                    subdir = 'test_' + subdir;
                }
                asset.set('source', 'S3');
                existingAsset.set('mimeType', file.type);
                existingAsset.set('size', file.size);
                existingAsset.set('isCached', asset.get("isCached"));
                existingAsset.set('modified', {modified:new Date(), by:userId});
                self.log.error(asset);
                s3dao.updateMetadataS3(bucket, subdir, file, asset.get("isCached"), function(err, value){
                    if(err) {
                        self.log.error(accountId, userId, 'Error from S3: ' + err);
                        cb(err, null);
                    } else {
                        self.log.debug(accountId, userId, 'S3 metadata complete');
                        cb(null, existingAsset);
                    }
                });
            }
        ], function(err, existingAsset){
            assetDao.saveOrUpdate(existingAsset, function(err, value){
                if(err) {
                    self.log.error(accountId, userId, 'Exception during asset replacement: ' + err);
                    fn(err, null);
                } else {
                    self.log.debug(accountId, userId, '<< replaceS3Asset');
                    //self.log.debug('new file: ', file);
                    fn(null, value);
                }
            });
        });


    },

    getAsset: function(assetId, fn) {
        var self = this;
        self.log = log;

        self.log.debug('>> getAsset');
        assetDao.getById(assetId, $$.m.Asset, function(err, value){
            if(err) {
                self.log.error('Exception during asset retrieval: ' + err);
                fn(err, null);
            } else {
                self.log.debug('<< getAsset');
                fn(null, value);
            }
        });
    },

    listAssets: function(accountId, skip, limit, fn) {
        var self = this;
        self.log = log;

        self.log.debug('>> listAssets');
        assetDao.findAllWithFieldsAndLimit({'accountId': accountId}, skip, limit, null, null, $$.m.Asset, function(err, list){
            if(err) {
                self.log.error('Exception in listAssets: ' + err);
                fn(err, null);
            } else {
                self.log.debug('<< listAssets');
                fn(null, list);
            }
        });
    },


    listPagedAssets: function(accountId, skip, limit, filterType, search, fn) {
        var self = this;
        self.log = log;
        
        var query = {
            'accountId': accountId
        };

        var andQuery = [];
        
        if(filterType){
            var typeMimes = {
                image: ['image/png', 'image/jpeg', 'image/gif', 'image/*' ,'image/x-ms-bmp','image/svg+xml'],
                video: ['video/mpeg', 'video/mp4', 'video/webm', 'video/x-flv', 'video/x-ms-wmv', 'video/*','video/quicktime' ],
                audio: ['audio/mpeg', 'audio/mp3', 'audio/*'],
                document: ['application/octet-stream', 'application/pdf', 'text/plain']
            };
            var mimeTypesArray = typeMimes[filterType];
            console.log(filterType)
            if(filterType === 'fonts'){
                andQuery.push({'type': 'fonts'}); 
            }
            else{
                andQuery.push({'mimeType': {$in: mimeTypesArray}});
            }       
        }

        if(search){
            search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');            
            var regex = new RegExp('\\.*'+search+'\.*', 'i');
            var searchQuery = {filename:regex};
            andQuery.push(searchQuery);
        }
        self.log.debug('>> listPagedAssets');
        if(andQuery.length){
             query["$and"] = andQuery;
        }
        assetDao.findWithFieldsLimitOrderAndTotal(query, skip, limit, 'created.date', null, $$.m.Asset, -1, function(err, list){
            if(err) {
                self.log.error('Exception in listPagedAssets: ' + err);
                fn(err, null);
            } else {
                self.log.debug('<< listPagedAssets');
                fn(null, list);
            }
        });
    },

    updateAssetChangeUrl: function(asset, userId, fn) {
        var self = this;
        self.log = log;
        var subdir = 'account_' + asset.get('accountId');
        if (appConfig.nonProduction === true) {
            subdir = 'test_' + subdir;
        }
        var oldUrl = asset.get("url");
        //append time in the end to avoid duplicate files.
        var filename=asset.get("filename").replace(/[^a-z0-9]+/gi, "_") ; 
        var newDestUrl = oldUrl
         .substring(0, oldUrl.indexOf(subdir) + subdir.length + 1) + filename + "_" + new Date().getTime();
         self.copyS3Asset(asset.get('accountId'), userId, oldUrl, newDestUrl, asset.get('mimeType'), function(err, value) {
             if (err) {
                self.log.error('Exception in updateAsset:copyS3Asset ' + err);
                fn(err, null);
            } else {
                self.log.debug('<< copyS3Asset');
                asset.set('url', newDestUrl);
                assetDao.saveOrUpdate(asset, function(err, value) {
                    if (err) {
                        self.log.error('Exception in updateAsset: ' + err);
                        fn(err, null);
                    } else {
                        self.log.debug('<<< updateAsset');
                        fn(null, value);
                    }
                });
            }
        });
    },
    updateAsset: function(asset, userId, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> updateAsset');
        assetDao.saveOrUpdate(asset, function(err, value){
            if(err) {
                self.log.error('Exception in updateAsset: ' + err);
                fn(err, null);
            } else {
                self.log.debug('<< updateAsset');
                fn(null, value);
            }
        })
    },
    checkResourceonS3:function(destUrl, fn){
       var self = this;
       var sourceBucket = 'indigenous-digital-assets';
       var sourceKey = destUrl.replace(/.*indigenous-digital-assets\//gi, '');
        s3dao.getObject(sourceBucket, sourceKey, function(fileExits){
            if(fileExits) {
                fn(destUrl+"_"+new Date().getTime())
            } else {
               fn(destUrl,fn);
            }
        })
    },
    deleteAsset: function(assetId, fn) {
        //TODO: delete from the source as well
        var self = this;
        self.log = log;

        self.log.debug('>> deleteAsset');
        assetDao.removeById(assetId, function(err, value){
            if(err) {
                self.log.error('Exception in deleteAsset: ' + err);
                fn(err, null);
            } else {
                self.log.debug('<< deleteAsset');
                fn(null, value);
            }
        });
    },

    findByType: function(accountId, type, skip, limit, fn) {
        var self = this;
        self.log = log;

        self.log.debug('>> findByType');
        var query = {
            'accountId': accountId,
            'mimeType': type
        };
        assetDao.findAllWithFieldsAndLimit(query, skip, limit, null, null, $$.m.Asset, function(err, list){
            if(err) {
                self.log.error('Exception in findByType: ' + err);
                fn(err, null);
            } else {
                self.log.debug('<< findByType');
                fn(null, list);
            }
        });
    },

    findByFontType: function(accountId, skip, limit, fn) {
        var self = this;
        self.log = log;

        self.log.debug('>> findByType');
        var query = {
            'accountId': accountId,
            'type': "fonts"
        };
        assetDao.findAllWithFieldsAndLimit(query, skip, limit, null, null, $$.m.Asset, function(err, list){
            if(err) {
                self.log.error('Exception in findByFontType: ' + err);
                fn(err, null);
            } else {
                self.log.debug('<< findByFontType');
                fn(null, list);
            }
        });
    },

    findBySource: function(accountId, source, skip, limit, fn) {
        var self = this;
        self.log = log;

        self.log.trace('>> findBySource');
        var query = {
            'accountId': accountId,
            'source': source
        };
        assetDao.findAllWithFieldsAndLimit(query, skip, limit, null, null, $$.m.Asset, function(err, list){
            if(err) {
                self.log.error('Exception in findBySource: ' + err);
                fn(err, null);
            } else {
                self.log.trace('<< findBySource');
                fn(null, list);
            }
        });
    },

    findByTag: function(accountId, tag, skip, limit, fn) {
        var self = this;
        self.log = log;

        self.log.debug('>> findByTag');
        var query = {
            'accountId': accountId,
            'tags': {$in: [tag]}
        };
        assetDao.findAllWithFieldsAndLimit(query, skip, limit, null, null, $$.m.Asset, function(err, list){
            if(err) {
                self.log.error('Exception in findByTag: ' + err);
                fn(err, null);
            } else {
                self.log.debug('<< findByTag');
                fn(null, list);
            }
        });
    },

    copyS3Asset: function(accountId, userId, sourceUrl, destUrl, contentType, fn) {
        var self = this;
        self.log = log;
        self.log.debug(accountId, userId, '>> copyS3Asset');

        var sourceBucket = 'indigenous-digital-assets';
        var sourceKey = sourceUrl.replace(/.*indigenous-digital-assets\//gi, '');
        var destBucket = 'indigenous-digital-assets';
        var destKey = destUrl.replace(/.*indigenous-digital-assets\//gi, '');

        self.log.debug(accountId, userId, 'sourceBucket:' + sourceBucket);
        self.log.debug(accountId, userId, 'sourceKey:' + sourceKey);
        self.log.debug(accountId, userId, 'destBucket:' + destBucket);
        self.log.debug(accountId, userId, 'destKey:' + destKey);

        s3dao.copyObject(sourceBucket, sourceKey, destBucket, destKey, contentType, function(err, value){
            if(err) {
                self.log.error(accountId, userId, 'Error copying object:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< copyS3Asset');
                fn(null, value);
            }
        });
    }

};
