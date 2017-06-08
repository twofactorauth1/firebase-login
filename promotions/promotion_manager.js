/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var promotionDao = require('./dao/promotion.dao.js');
var log = $$.g.getLogger("promotion_manager");
var async = require('async');
var s3dao = require('../dao/integrations/s3.dao.js');
var awsConfig = require('../configs/aws.config');
var appConfig = require('../configs/app.config');

var accountDao = require('../dao/account.dao');


module.exports = {
	
	createPromotion: function(file, adminUrl, promotion, accountId, userId, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> createPromotion');

        var uploadPromise = $.Deferred();

        var attachment = {
            name: file.name,
            size: file.size,
            mimeType: file.mimeType
        };
        

        if(file.path) {
            // to do-  need to change bucket
            var bucket = awsConfig.BUCKETS.PROMOTIONS;
            var bucket = awsConfig.BUCKETS.PURCHASE_ORDERS;
            var subdir = 'account_' + promotion.get('accountId');
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

                    promotion.set("attachment", attachment);
                    console.log(promotion);
                    uploadPromise.resolve(value);
                }
            });

        } else {
            uploadPromise.resolve();
        }
        //create record
        $.when(uploadPromise).done(function(file){
            
            promotionDao.saveOrUpdate(promotion, function(err, savedPromotion){
                if(err) {
                    self.log.error('Exception during promotion creation: ' + err);
                    fn(err, null);
                } else {
                    self.log.debug('<< createPromotion');
                    fn(null, savedPromotion, file);
                }
            });

        });

    },

    listPromotions: function(accountId, userId, fn) {
        var self = this;
        log.debug('>> listPromotions');
        promotionDao.findMany({'accountId':accountId}, $$.m.Promotion, function(err, list){
            if(err) {
                log.error('Exception listing promotions: ' + err);
                fn(err, null);
            } else {
                log.debug('<< listPromotions');
                fn(null, list);
            }
        });
    }
    
};