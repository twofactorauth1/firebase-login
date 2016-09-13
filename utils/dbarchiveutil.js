var mongoConfig = require('../configs/mongodb.config');
var _ = require('underscore');
var mongoskin = require('mongoskin');
var async = require('async');

var utils = require('./commonutils');
require('../configs/log4js.config').configure();
var UUID = require('node-uuid');
var moment = require('moment');
var deferred = require("jquery-deferred");
var exec = require('child_process').exec;
if (typeof $ == 'undefined') {
    $ = {};
}
_.extend($, deferred);
var s3Config = require('../configs/aws.config');

var archiveUtil = {

    log: $$.g.getLogger("archiveUtil"),


    archiveDB: function(cb) {
        var self = this;
        self.log.debug('>> archiveDB');
        /*
         * Test Config
         */
        //var dbConnect = mongoConfig.TEST_MONGODB_CONNECT;
        //var dbName = 'test_indigenous';
        //var dbHost = mongoConfig.TEST_HOST;
        //var dbPort = mongoConfig.TEST_PORT;
        //var dbUser = mongoConfig.TEST_USER;
        //var dbPass = mongoConfig.TEST_PASS;

        /*
         * Prod Config
         */
        var dbConnect = mongoConfig.PROD_MONGODB_CONNECT;
        var dbName = 'prod_indigenous';
        var dbHost = mongoConfig.PROD_HOST;
        var dbPort = mongoConfig.PROD_PORT;
        var dbUser = mongoConfig.PROD_USER;
        var dbPass = mongoConfig.PROD_PASS;

        var last3Months = moment().add(-3, 'months').toDate();
        var last6Months = moment().add(-6, 'months').toDate();
        var last12Months = moment().add(-12, 'months').toDate();

        async.waterfall([
            function archiveErrors(callback){
                self.log.debug('archiving the errors collection');
                //keep the last three months;
                var query = {date: {$lt:last3Months}};
                var collectionName = 'errors';
                self.archiveCollection(collectionName, query, dbConnect, function(err, archiveCollectionName){
                    if(err) {
                        self.log.error('Error archiving collection:', err);
                        callback(err);
                    } else {
                        if(archiveCollectionName) {
                            self.callMongoDump(archiveCollectionName, dbName, dbHost, dbPort, dbUser, dbPass, 'archive', function(err, value){
                                if(err) {
                                    self.log.error('Error calling mongodump:', err);
                                    callback(err);
                                } else {
                                    if(archiveCollectionName) {
                                        self.dropCollection(archiveCollectionName, dbConnect, function(err, value){
                                            if(err) {
                                                self.log.error('Error dropping collection:', err);
                                                callback(err);
                                            } else {
                                                callback();
                                            }
                                        });
                                    } else {
                                        callback();
                                    }

                                }
                            });
                        } else {
                            callback();
                        }

                    }
                });
            },
            function archiveEmailMessages(callback){
                self.log.debug('archiving the emailmessages collection');
                //keep the last three months;
                var query = {'created.date': {$lt:last3Months}};
                var collectionName = 'emailmessages';
                self.archiveCollection(collectionName, query, dbConnect, function(err, archiveCollectionName){
                    if(err) {
                        self.log.error('Error archiving collection:', err);
                        callback(err);
                    } else {
                        if(archiveCollectionName) {
                            self.callMongoDump(archiveCollectionName, dbName, dbHost, dbPort, dbUser, dbPass, 'archive', function(err, value){
                                if(err) {
                                    self.log.error('Error calling mongodump:', err);
                                    callback(err);
                                } else {
                                    if(archiveCollectionName) {
                                        self.dropCollection(archiveCollectionName, dbConnect, function(err, value){
                                            if(err) {
                                                self.log.error('Error dropping collection:', err);
                                                callback(err);
                                            } else {
                                                callback();
                                            }
                                        });
                                    } else {
                                        callback();
                                    }

                                }
                            });
                        } else {
                            callback();
                        }
                    }
                });
            },
            function purgePingEvents(callback) {
                self.log.debug('purging the ping_events collection');
                var query = {server_time: {$lt: last3Months.getTime()}};
                self.purgeCollection('ping_events', query, dbConnect, function(err, value){
                    callback();
                });
            },
            function archivePageEvents(callback) {
                self.log.debug('archiving the page_events collection');
                //keep the last three months;
                var query = {'server_date': {$lt:last12Months.getTime()}};
                var collectionName = 'page_events';
                self.archiveCollection(collectionName, query, dbConnect, function(err, archiveCollectionName){
                    if(err) {
                        self.log.error('Error archiving collection:', err);
                        callback(err);
                    } else {
                        if(archiveCollectionName) {
                            self.callMongoDump(archiveCollectionName, dbName, dbHost, dbPort, dbUser, dbPass, 'archive', function(err, value){
                                if(err) {
                                    self.log.error('Error calling mongodump:', err);
                                    callback(err);
                                } else {
                                    if(archiveCollectionName) {
                                        self.dropCollection(archiveCollectionName, dbConnect, function(err, value){
                                            if(err) {
                                                self.log.error('Error dropping collection:', err);
                                                callback(err);
                                            } else {
                                                callback();
                                            }
                                        });
                                    } else {
                                        callback();
                                    }

                                }
                            });
                        } else {
                            callback();
                        }

                    }
                });
            },
            function archiveCampaignFlow(callback) {
                self.log.debug('archiving the campaign_flow collection');

                var query = {'created.date': {$lt:last12Months}};
                var collectionName = 'campaign_flow';
                self.archiveCollection(collectionName, query, dbConnect, function(err, archiveCollectionName){
                    if(err) {
                        self.log.error('Error archiving collection:', err);
                        callback(err);
                    } else {
                        if(archiveCollectionName) {
                            self.callMongoDump(archiveCollectionName, dbName, dbHost, dbPort, dbUser, dbPass, 'archive', function(err, value){
                                if(err) {
                                    self.log.error('Error calling mongodump:', err);
                                    callback(err);
                                } else {
                                    if(archiveCollectionName) {
                                        self.dropCollection(archiveCollectionName, dbConnect, function(err, value){
                                            if(err) {
                                                self.log.error('Error dropping collection:', err);
                                                callback(err);
                                            } else {
                                                callback();
                                            }
                                        });
                                    } else {
                                        callback();
                                    }
                                }
                            });
                        } else {
                            callback();
                        }
                    }
                });
            },
            function save(callback) {
                self.log.debug('Uploading to s3...');
                self.uploadToS3('archive', s3Config.AWS_ACCESS_KEY, s3Config.AWS_SECRET_ACCESS_KEY, s3Config.AWS_REGION, s3Config.BUCKETS.DB_ARCHIVES,callback);
            }
        ], function(err){
            self.log.debug('<< archiveDB');
            cb();
        });
    },

    purgeCollection: function(collectionName, queryForDocsToPurge, dbConnect, cb) {
        var self = this;
        self.log.debug('>> purgeCollection');
        var db = mongoskin.db(dbConnect, {safe:true});
        var sourceCollection = db.collection(collectionName);
        sourceCollection.remove(queryForDocsToPurge, function(err, result){
            self.log.debug('<< purgeCollection');
            cb(err, result);
        });
    },

    archiveCollection: function(collectionName, queryForDocsToArchive, dbConnect, cb) {
        var self = this;
        self.log.debug('>> archiveCollection(' + collectionName + ')');
        var db = mongoskin.db(dbConnect, {safe:true});

        var sourceCollection = db.collection(collectionName);
        var targetCollectionName = collectionName + '_archive' + moment().format('YYYYMMDD');
        var targetCollection = db.collection(targetCollectionName);

        var x = 10000;
        var counter = 0;
        var docArray = [];
        var idArray = [];
        sourceCollection.find(queryForDocsToArchive).toArray(function(err, docs){
            //console.log('Found:', docs);
            if(err) {
                self.log.error('Error during query:', err);
                cb(err);
            } else {
                self.log.debug('found ' + docs.length + ' records to archive');
                if(docs.length === 0) {
                    cb(null);
                } else {
                    async.each(docs, function(doc, callback){
                        docArray.push(doc);
                        idArray.push(doc._id);

                        counter ++;
                        if( counter % x == 0){
                            targetCollection.insert(docArray, function(err, result){
                                if(err) {
                                    self.log.error('error inserting:', err);
                                }
                                //console.log('inserted array:', result);
                                docArray = [];
                                sourceCollection.remove({_id: {$in:idArray}}, function(err, result){
                                    if(err) {
                                        self.log.error('error removing:', err);
                                    }
                                    //console.log('removed array:', result);
                                    idArray = [];
                                    callback();
                                });
                            });
                        } else {
                            callback();
                        }
                    }, function(err){
                        self.log.debug('done:', err);
                        if(docArray && docArray.length > 0) {
                            targetCollection.insert(docArray, function(err, result){
                                if(err) {
                                    self.log.error('error inserting:', err);
                                }
                                //console.log('inserted array:', result);
                                docArray = [];
                                sourceCollection.remove({_id: {$in:idArray}}, function(err, result){
                                    if(err) {
                                        self.log.error('error removing:', err);
                                    }
                                    //console.log('removed array:', result);
                                    cb(null, targetCollectionName);
                                });
                            });
                        } else {
                            self.log.debug('nothing to do here.');
                            cb(null, targetCollectionName);
                        }

                    });
                }

            }
        });
    },

    callMongoDump: function(collectionName, dbName, host, port, username, password, outputDir, cb) {
        var self = this;
        self.log.debug('>> callMongoDump(' + collectionName + ')');
        var cmd = 'mongodump --host ' + host + ' --port ' + port + ' --username ' + username +
            ' --password ' + password + ' --collection ' + collectionName + ' --db ' + dbName + ' --out ' + outputDir;

        exec(cmd, function(err, stout, stderr){
            //console.log(stout);
            self.log.debug('<< callMongoDump');
            cb();
        });
    },

    dropCollection: function(collectionName, dbConnect, cb) {
        var self = this;
        self.log.debug('>> dropCollection(' + collectionName + ')');
        var db = mongoskin.db(dbConnect, {safe:true});
        db.dropCollection(collectionName, function(err, value){
            if(err) {
                self.log.error('Error:', err);
            }
            self.log.debug('<< dropCollection');
            cb();
        });
    },

    uploadToS3: function(dirName, s3Key, s3Secret, s3Region, s3Bucket, cb) {
        var s3 = require('s3');

        var client = s3.createClient({
            maxAsyncS3: 20,     // this is the default
            s3RetryCount: 3,    // this is the default
            s3RetryDelay: 1000, // this is the default
            multipartUploadThreshold: 20971520, // this is the default (20 MB)
            multipartUploadSize: 15728640, // this is the default (15 MB)
            s3Options: {
                accessKeyId: s3Key,
                secretAccessKey: s3Secret,
                region: s3Region
                // endpoint: 's3.yourdomain.com',
                // sslEnabled: false
                // any other options are passed to new AWS.S3()
                // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
            }
        });

        var params = {
            localDir: dirName,
            deleteRemoved: false, // default false, whether to remove s3 objects
            // that have no corresponding local file.

            s3Params: {
                Bucket: s3Bucket,
                Prefix: ""
                // other options supported by putObject, except Body and ContentLength.
                // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
            }
        };
        var uploader = client.uploadDir(params);
        uploader.on('error', function(err) {
            console.error("unable to sync:", err.stack);
        });
        uploader.on('progress', function() {
            console.log("progress", uploader.progressAmount, uploader.progressTotal);
        });
        uploader.on('end', function() {
            console.log("done uploading");
            cb();
        });
    }


};

module.exports = archiveUtil;
