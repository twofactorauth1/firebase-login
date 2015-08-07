var mongoConfig = require('../configs/mongodb.config');
var _ = require('underscore');
var mongoskin = require('mongoskin');
var async = require('async');

var copyutil = {

    copyAccountFromTestToProd : function(accountId, cb) {
        var self = this;
        self._copyAccount(accountId, mongoConfig.TEST_MONGODB_CONNECT, mongoConfig.PROD_MONGODB_CONNECT, cb);
    },

    copyAccountFromProdToTest: function(accountId, cb) {
        var self = this;
        self._copyAccount(accountId, mongoConfig.PROD_MONGODB_CONNECT, mongoConfig.TEST_MONGODB_CONNECT, cb);
    },

    _copyAccount: function(accountId, srcDBUrl, destDBUrl, callback) {
        var srcMongo = mongoskin.db(srcDBUrl, {safe: true});
        var destMongo = mongoskin.db(destDBUrl, {safe: true});

        var accountToSave;
        var websiteToSave;
        var pagesToSaveArray = [];


        //get accountById
        //get websiteById
        //get pages by websiteId

        var accounts = srcMongo.collection('accounts');
        var websites = srcMongo.collection('websites');
        var pages = srcMongo.collection('pages');
        accounts.find({'_id': accountId}).toArray(function (err, items) {
            if(err) {
                console.log('Error getting account: ' + err);
                return callback(err);
            }
            console.log('retrieved account');
            //only going to do the first result.  Should only be one.
            accountToSave = items[0];
            var websiteId = accountToSave.website.websiteId;
            websites.find({'_id':websiteId}).toArray(function(err, websites){
                if(err) {
                    console.log('Error getting website: ' + err);
                    return callback(err);
                }
                console.log('retrieved website');
                websiteToSave = websites[0];
                pages.find({'websiteId':websiteId}).toArray(function(err, _pages){
                    if(err) {
                        console.log('Error getting pages: ' + err);
                        return callback(err);
                    }
                    console.log('retrieved pages');
                    pagesToSaveArray = _pages;
                    srcMongo.close();
                    destMongo.collection('accounts').save(accountToSave, function(err, savedAccount){
                        console.log('saved account [' + accountToSave._id + '].');
                        destMongo.collection('websites').save(websiteToSave, function(err, savedWebsite){
                            console.log('saved website [' + websiteToSave._id + ']');
                            var pagesCollection = destMongo.collection('pages');
                            async.eachSeries(pagesToSaveArray,
                                function(page, cb){
                                    pagesCollection.save(page, function(err, savedPage){
                                        if(err) {
                                            console.log('Error saving page: ' + page._id);
                                            cb(err);
                                        } else {
                                            console.log('saved page [' + page._id + ']');
                                            cb();
                                        }
                                    });
                                },
                                function(err){
                                    if(err) {
                                        console.log('Error during save: ' + err);
                                        destMongo.close();
                                        callback(err);
                                    } else {
                                        console.log('saved account, website, pages');
                                        destMongo.close();
                                        callback();
                                    }
                                });
                        });
                    });
                });
            });

        });
    },

    updateEmailCollection :function(fn) {
        var srcURL = mongoConfig.TEST_MONGODB_CONNECT;
        //var srcURL = mongoConfig.PROD_MONGODB_CONNECT
        var srcMongo = mongoskin.db(srcURL, {safe: true});

        var emails = srcMongo.collection('emails');
        var accounts = srcMongo.collection('accounts');
        //{_id:'1c7ed756-ad0b-4b5a-967b-47e794c5280d'}
        emails.find().toArray(function(err, emailAry){
            async.each(emailAry, function(email, cb){
                var accountId = parseInt(email.accountId);
                accounts.find({_id: accountId}).toArray(function(err, account){
                    //console.dir(account[0]);
                    if(account[0] && account[0].business && account[0].business.emails) {
                        console.log(account[0].business.name);
                        console.log(account[0].business.emails[0].email);
                        email.fromName = account[0].business.name;
                        email.fromEmail = account[0].business.emails[0].email;
                        email.replyTo = account[0].business.emails[0].email;
                        emails.save(email, function(){
                            cb();
                        });
                    } else {
                        cb();
                    }
                });

            }, function done(){
                console.log('done');
                fn();
            });
        });
    }


};

module.exports = copyutil;