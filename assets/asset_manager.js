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
            asset.set('source', 'S3');
            s3dao.uploadToS3(bucket, subdir, file, true, function(err, value){
                if(err) {
                    self.log.error('Error from S3: ' + err);
                    uploadPromise.reject();
                    fn(err, null);
                } else {
                    self.log.debug('S3 upload complete');
                    console.dir(value);
                    asset.set('url', value.url);
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

    updateAsset: function(asset, fn) {
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
        });
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

    findBySource: function(accountId, source, skip, limit, fn) {
        var self = this;
        self.log = log;

        self.log.debug('>> findBySource');
        var query = {
            'accountId': accountId,
            'source': source
        };
        assetDao.findAllWithFieldsAndLimit(query, skip, limit, null, null, $$.m.Asset, function(err, list){
            if(err) {
                self.log.error('Exception in findBySource: ' + err);
                fn(err, null);
            } else {
                self.log.debug('<< findBySource');
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
    }

};