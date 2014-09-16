/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
process.env.NODE_ENV = "testing";
var app = require('../../app');
var manager = require('../asset_manager.js');
var assetDao = require('../dao/asset.dao.js');
var async = require('async');

var _log = $$.g.getLogger("asset_manager_test");
var testContext = {};
var initialized = false;

exports.subscription_dao_test = {
    setUp: function (cb) {
        var self = this;
        //delete all objects
        if(!initialized) {
            assetDao.findMany({}, $$.m.Asset, function(err, list){
                if(err) {
                    _log.error('Exception removing events.  Tests may not be accurate.');
                } else {
                    async.each(list,
                        function(asset, callback){
                            assetDao.remove(asset, function(err, value){
                                callback();
                            });
                        }, function(err){
                            initialized = true;
                            cb();
                        });
                }
            });
        } else {
            cb();
        }
    },

    tearDown: function (cb) {
        var self = this;
        cb();
    },

    testCreateAssetWithUpload: function(test) {
        test.expect(1);
        var asset = new $$.m.Asset({
            accountId: 0,
            mimeType: 'text/plain',
            size: 0,//bytes
            filename: 'asset.js',//original filename
            source: 'S3',// S3, Dropbox, GoogleDrive
            tags:['tag1', 'tag2', 'tag3', 'TESTASSET']
        });

        manager.createAsset('../model/asset.js', asset, function(err, value){
            if(err) {
                test.ok(false, 'error creating asset: ' + err);
                test.done();
            } else {
                testContext.asset = value;
                test.ok(value.get('url') !== null);
                test.done();
            }
        });
    },

    testCreateAssetWithoutUpload: function(test) {
        test.expect(1);
        var asset = new $$.m.Asset({
            accountId: 0,
            mimeType: 'text/plain',
            size: 0,//bytes
            filename: 'asset.js',//original filename
            source: 'S3',// S3, Dropbox, GoogleDrive
            tags:['tag1', 'tag2', 'tag3', 'TESTASSET'],
            url: testContext.asset.get('url')
        });

        manager.createAsset(null, asset, function(err, value){
            if(err) {
                test.ok(false, 'error creating asset: ' + err);
                test.done();
            } else {
                testContext.asset = value;
                test.ok(value.get('url') !== null);
                test.done();

            }
        });
    },

    testGetAsset: function(test) {
        test.expect(1);
        manager.getAsset(testContext.asset.id(), function(err, value){
            if(err) {
                test.ok(false, 'error getting asset');
                test.done();
            } else {
                test.ok(value !== null);
                test.done();
            }
        });
    },

    testListAssets: function(test) {
        test.expect(1);
        manager.listAssets(0, 0, 0, function(err, list){
            if(err) {
                test.ok(false, 'error listing assets');
                test.done();
            } else {
                test.ok(list.length > 0);
                test.done();
            }
        });
    },

    testUpdateAsset: function(test) {
        test.expect(1);
        var asset = testContext.asset;
        asset.set('size', 100);
        manager.updateAsset(asset, function(err, value){
            if(err) {
                test.ok(false, 'error updating asset');
                test.done();
            } else {
                test.ok(value.get('size') === 100);
                test.done()
            }
        });
    },

    testFindByType: function(test) {
        test.expect(1);
        manager.findByType(0, 'text/plain', 0, 0, function(err, list){
            if(err) {
                test.ok(false, 'error listing by type');
                test.done();
            } else {
                test.ok(list.length > 0);
                test.done();
            }
        });
    },

    testFindBySource: function(test) {
        test.expect(1);
        manager.findBySource(0, 'S3', 0, 0, function(err, list){
            if(err) {
                test.ok(false, 'error listing by source');
                test.done();
            } else {
                test.ok(list.length > 0);
                test.done();
            }
        });
    },

    testFindByTag: function(test) {
        test.expect(1);
        manager.findByTag(0, 'TESTASSET', 0, 0, function(err, list){
            if(err) {
                test.ok(false, 'error listing by tag');
                test.done();
            } else {
                test.ok(list.length > 0);
                test.done();
            }
        });
    },

    testDeleteAsset: function(test) {
        var assetId = testContext.asset.id();
        manager.deleteAsset(assetId, function(err, value){
            if(err) {
                test.ok(false, 'error deleting asset');
                test.done();
            } else {
                console.dir(value);
                test.done();
            }
        });
    }



}
