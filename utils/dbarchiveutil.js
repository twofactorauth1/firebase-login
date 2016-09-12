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

        var dbConnect = mongoConfig.TEST_MONGODB_CONNECT;
        var dbName = 'test_indigenous';
        var dbHost = mongoConfig.TEST_HOST;
        var dbPort = mongoConfig.TEST_PORT;
        var dbUser = mongoConfig.TEST_USER;
        var dbPass = mongoConfig.TEST_PASS;

        var last3Months = moment().add(-3, 'months').toDate();

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
                        self.callMongoDump(archiveCollectionName, dbName, dbHost, dbPort, dbUser, dbPass, 'archive', function(err, value){
                            if(err) {
                                self.log.error('Error calling mongodump:', err);
                                callback(err);
                            } else {
                                self.dropCollection(archiveCollectionName, dbConnect, function(err, value){
                                    if(err) {
                                        self.log.error('Error dropping collection:', err);
                                        callback(err);
                                    } else {
                                        callback();
                                    }
                                });
                            }
                        });
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
                        self.callMongoDump(archiveCollectionName, dbName, dbHost, dbPort, dbUser, dbPass, 'archive', function(err, value){
                            if(err) {
                                self.log.error('Error calling mongodump:', err);
                                callback(err);
                            } else {
                                self.dropCollection(archiveCollectionName, dbConnect, function(err, value){
                                    if(err) {
                                        self.log.error('Error dropping collection:', err);
                                        callback(err);
                                    } else {
                                        callback();
                                    }
                                });
                            }
                        });
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


    archiveCollection: function(collectionName, queryForDocsToArchive, dbConnect, cb) {
        var self = this;
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
            async.each(docs, function(doc, callback){
                docArray.push(doc);
                idArray.push(doc._id);

                counter ++;
                if( counter % x == 0){
                    targetCollection.insert(docArray, function(err, result){
                        if(err) {
                            console.log('error inserting:', err);
                        }
                        //console.log('inserted array:', result);
                        docArray = [];
                        sourceCollection.remove({_id: {$in:idArray}}, function(err, result){
                            if(err) {
                                console.log('error removing:', err);
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
                console.log('done:', err);
                if(docArray && docArray.length > 0) {
                    targetCollection.insert(docArray, function(err, result){
                        if(err) {
                            console.log('error inserting:', err);
                        }
                        //console.log('inserted array:', result);
                        docArray = [];
                        sourceCollection.remove({_id: {$in:idArray}}, function(err, result){
                            if(err) {
                                console.log('error removing:', err);
                            }
                            //console.log('removed array:', result);
                            cb(null, targetCollectionName);
                        });
                    });
                } else {
                    console.log('nothing to do here.');
                    cb(null, targetCollectionName);
                }

            });



        });



        //mongodump the archive collection

        //drop the archive collection

        //upload the dumped collection to s3


    },

    callMongoDump: function(collectionName, dbName, host, port, username, password, outputDir, cb) {
        var cmd = 'mongodump --host ' + host + ' --port ' + port + ' --username ' + username +
            ' --password ' + password + ' --collection ' + collectionName + ' --db ' + dbName + ' --out ' + outputDir;

        exec(cmd, function(err, stout, stderr){
            console.log(stout);
            cb();
        });
    },

    dropCollection: function(collectionName, dbConnect, cb) {
        var db = mongoskin.db(dbConnect, {safe:true});
        db.dropCollection(collectionName, function(err, value){
            console.log('got error:', err);
            console.log('got value: ', value);
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
