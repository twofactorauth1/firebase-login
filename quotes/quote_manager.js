/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var quoteDao = require('./dao/quote.dao.js');
var log = $$.g.getLogger("quote_manager");
var async = require('async');
var s3dao = require('../dao/integrations/s3.dao.js');
var awsConfig = require('../configs/aws.config');
var appConfig = require('../configs/app.config');
var notificationConfig = require('../configs/notification.config');
var userDao = require('../dao/user.dao');
var emailMessageManager = require('../emailmessages/emailMessageManager');
var userManager = require('../dao/user.manager');
require('./model/quote');
var ziManager = require('../zedinterconnect/zi_manager');

var accountDao = require('../dao/account.dao');
var quoteCartItemDao = require('./dao/quote_cart_item.dao.js');

module.exports = {
	
    listQuoteItems: function(accountId, userId, fn) {
        var self = this;
        self.log = log;
        log.debug(accountId, userId, '>> listQuoteItems');
        var query = {
            'accountId':accountId,
            'userId': userId
        };

        quoteCartItemDao.findMany(query, $$.m.QuoteCartItem, function(err, list){
            if(err) {
                log.error('Exception listing quotes: ' + err);
                fn(err, null);
            } else {
    			log.debug(accountId, userId, '<< listQuoteItems');
                fn(null, list);
            }
        });
    },

    saveUpdateCartQuoteItems: function(accountId, userId, quoteCartItem, fn) {
        var self = this;
        log.debug(accountId, userId, '>> saveUpdateCartQuoteItems');
        quoteCartItemDao.saveOrUpdate(quoteCartItem, function(err, value){
            if(err) {
                self.log.error('Error saving quoteCartItem: ' + err);
                return fn(err, null);
            } else {
                log.debug(accountId, userId, '<< saveUpdateCartQuoteItems');
                fn(null, value);
            }
        });
    },


    deleteCartQuoteItem: function(accountId, userId, cartId, fn){
        var self = this;
        log.debug(accountId, userId, '>> deleteCartQuoteItem');
        var query = {userId: userId};
        
        quoteCartItemDao.removeByQuery(query, $$.m.QuoteCartItem, function(err, value){
            if(err) {
                self.log.error('Error deleting cart item: ' + err);
                return fn(err, null);
            } else {
                log.debug(accountId, userId, '<< deleteCartQuoteItem');
                fn(null, value);
            }
        });
    },

    createQuote: function(accountId, userId, quote, fn) {
        var self = this;
        log.debug(accountId, userId, '>> createQuote');
        quoteDao.saveOrUpdate(quote, function(err, value){
            if(err) {
                self.log.error('Error saving quote: ' + err);
                return fn(err, null);
            } else {
                log.debug(accountId, userId, '<< createQuote');
                fn(null, value);
            }
        });
    },

    updateQuoteAttachment: function(file, quoteId, accountId, userId, fn) {
        var self = this;
        self.log = log;
        self.log.debug(accountId, userId, '>> updateQuoteAttachment');

        var uploadPromise = $.Deferred();

        var attachment = {
            name: file.name,
            size: file.size,
            mimeType: file.mimeType
        };

        if(file.path) {
            // Need to update bucket
            var bucket = awsConfig.BUCKETS.PROMOTIONS;
            //var bucket = awsConfig.BUCKETS.QUOTES;
            var subdir = 'account_' + accountId;
            if(appConfig.nonProduction === true) {
                subdir = 'test_' + subdir;
            }
            
            s3dao.uploadToS3(bucket, subdir, file, true, function(err, value){
                if(err) {
                    self.log.error('Error from S3: ' + err);
                    uploadPromise.reject();
                    fn(err, null);
                } else {
                    self.log.debug('S3 upload complete');
                    console.dir(value);
            
                    if(value && value.url) {
                        value.url = value.url.replace("s3.amazonaws.com", "s3-us-west-1.amazonaws.com");
                    }

                    if (value.url.substring(0, 5) == 'http:') {
                      attachment.url = value.url.substring(5, value.url.length);
                    } else {
                      attachment.url = value.url;
                    }
                   
                    uploadPromise.resolve(value);
                }
            });

        } else {
            uploadPromise.resolve();
        }
        //update attachment
        $.when(uploadPromise).done(function(file){
            console.log(quoteId);
            quoteDao.getById(quoteId, $$.m.Quote, function(err, quote){
                if(err) {
                    log.error(accountId, userId, 'Exception getting quote: ' + err);
                    fn(err, null);
                } else {
                    quote.set("attachment", attachment);
                    quoteDao.saveOrUpdate(quote, function(err, savedQuote){
                        if(err) {
                            self.log.error('Exception during quote creation: ' + err);
                            fn(err, null);
                        } else {
                            self.log.debug(accountId, userId, '<< updateQuoteAttachment');
                            fn(null, savedQuote, file);
                        }
                    });
                }
            });
        });

    }
    
};
