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
var shipmentDao = require('./dao/shipment.dao.js');

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

    listPromotions: function(accountId, userId, cardCodeAry, vendorFilter, fn) {
        var self = this;
        log.debug('>> listPromotions');
        var query = {
            'accountId':accountId
        };
        if(cardCodeAry && cardCodeAry.length > 0) {
            var optRegexp = [];
            cardCodeAry.forEach(function(opt){
                optRegexp.push(  new RegExp(opt, "i") );
            });
            query = {
                'accountId':accountId,
                'participants.cardCode': {$in:optRegexp}
            };
        }
        if(vendorFilter){
            query.vendor = new RegExp(vendorFilter, "i");
        };
        console.log(query)
        promotionDao.findMany(query, $$.m.Promotion, function(err, list){
            if(err) {
                log.error('Exception listing promotions: ' + err);
                fn(err, null);
            } else {
                log.debug('<< listPromotions');
                //fn(null, list);
                async.eachSeries(list, function(promotion, cb){
                    shipmentDao.findCount({promotionId: promotion.id(), accountId: accountId}, $$.m.Shipment, function(err, value){
                        if(err) {
                            cb(err);
                        } else {
                            promotion.set("shipmentCount", value);
                            cb();
                        }
                    })
                }, function(err){
                    if(err) {
                        self.log.error('Error getting shipments:', err);
                        return fn(err);
                    } else {
                        fn(null, list);
                    }
                });
            }
        });
    },


    getPromotionDetails: function(accountId, userId, promotionId, cardCodeAry, vendorFilter, fn) {
        var self = this;
        log.debug('>> getPromotionDetails');
        var query = {_id: promotionId};
        if(cardCodeAry && cardCodeAry.length > 0 ) {
            var optRegexp = [];
            cardCodeAry.forEach(function(opt){
                optRegexp.push(  new RegExp(opt, "i") );
            });
            query = {
                'accountId':accountId,
                'participants.cardCode': {$in:optRegexp}
            }; 
        }
        
        if(vendorFilter){
            query.vendor = new RegExp(vendorFilter, "i");
        };
        console.log(query)
        promotionDao.findOne(query, $$.m.Promotion, function(err, value){
            if(err) {
                log.error('Exception getting promotion: ' + err);
                fn(err, null);
            } else {
                log.debug('<< getPromotionDetails');
                fn(null, value);
            }
        });    
    },

    deletePromotion: function(accountId, userId, promotionId, fn){
        var self = this;
        log.debug(accountId, userId, '>> deletePromotion');
        var query = {_id: promotionId};
        
        promotionDao.removeByQuery(query, $$.m.Promotion, function(err, value){
            if(err) {
                self.log.error('Error deleting promotion: ' + err);
                return fn(err, null);
            } else {
                log.debug(accountId, userId, '<< deletePromotion');
                fn(null, value);
            }
        });
    },

    saveOrUpdatePromotion: function(accountId, userId, promotion, promotionId, fn) {
        var self = this;
        log.debug(accountId, userId, '>> saveOrUpdatePromotion');
        promotionDao.saveOrUpdate(promotion, function(err, value){
            if(err) {
                self.log.error('Error saving promotion: ' + err);
                return fn(err, null);
            } else {
                log.debug(accountId, userId, '<< saveOrUpdatePromotion');
                fn(null, value);
            }
        });
    },

    updatePromotionAttachment: function(file, promotionId, accountId, userId, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> updatePromotionAttachment');

        var uploadPromise = $.Deferred();

        var attachment = {
            name: file.name,
            size: file.size,
            mimeType: file.mimeType
        };

        if(file.path) {
            // to do-  need to change bucket
            var bucket = awsConfig.BUCKETS.PROMOTIONS;
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
            console.log(promotionId);
            promotionDao.getById(promotionId, $$.m.Promotion, function(err, promotion){
                if(err) {
                    log.error('Exception getting promotion: ' + err);
                    fn(err, null);
                } else {
                    promotion.set("attachment", attachment);
                    console.log(promotion);
                    promotionDao.saveOrUpdate(promotion, function(err, savedPromotion){
                        if(err) {
                            self.log.error('Exception during promotion creation: ' + err);
                            fn(err, null);
                        } else {
                            self.log.debug('<< updatePromotionAttachment');
                            fn(null, savedPromotion, file);
                        }
                    });
                }
            });
            
            
        });

    },

    saveOrUpdateShipment: function(accountId, userId, shipment, shipmentId, fn) {
        var self = this;
        log.debug(accountId, userId, '>> saveOrUpdateShipment');
        shipmentDao.saveOrUpdate(shipment, function(err, value){
            if(err) {
                self.log.error('Error saving shipment: ' + err);
                return fn(err, null);
            } else {
                log.debug(accountId, userId, '<< saveOrUpdateShipment');
                fn(null, value);
            }
        });
    },

    updateShipmentAttachment: function(file, shipmentId, accountId, userId, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> updateShipmentAttachment');

        var uploadPromise = $.Deferred();

        var attachment = {
            name: file.name,
            size: file.size,
            mimeType: file.mimeType
        };

        if(file.path) {
            // to do-  need to change bucket
            var bucket = awsConfig.BUCKETS.PROMOTIONS;
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
            console.log(shipmentId);
            shipmentDao.getById(shipmentId, $$.m.Shipment, function(err, shipment){
                if(err) {
                    log.error('Exception getting shipment: ' + err);
                    fn(err, null);
                } else {
                    shipment.set("attachment", attachment);
                    console.log(shipment);
                    promotionDao.saveOrUpdate(shipment, function(err, savedShipment){
                        if(err) {
                            self.log.error('Exception during shipment creation: ' + err);
                            fn(err, null);
                        } else {
                            self.log.debug('<< updateShipmentAttachment');
                            fn(null, savedShipment, file);
                        }
                    });
                }
            });            
            
        });

    },

    listShipments: function(accountId, userId, promotionId, cardCodeAry, fn) {
        var self = this;
        console.log(promotionId);
        log.debug('>> listShipments');
        var query = {
            'promotionId':promotionId
        };
        if(cardCodeAry && cardCodeAry.length > 0) {
            var optRegexp = [];
            cardCodeAry.forEach(function(opt){
                optRegexp.push(  new RegExp(opt, "i") );
            });
            query = {
                'promotionId':promotionId,
                'cardCode': {$in:optRegexp}
            };
        } 
        shipmentDao.findMany(query, $$.m.Shipment, function(err, list){
            if(err) {
                log.error('Exception listing shipments: ' + err);
                fn(err, null);
            } else {
                log.debug('<< listShipments');
                fn(null, list);
            }
        });
    },

    deleteShipment: function(accountId, userId, shipmentId, fn){
        var self = this;
        log.debug(accountId, userId, '>> deleteShipment');
        var query = {_id: shipmentId};
        
        shipmentDao.removeByQuery(query, $$.m.Shipment, function(err, value){
            if(err) {
                self.log.error('Error deleting shipment: ' + err);
                return fn(err, null);
            } else {
                log.debug(accountId, userId, '<< deleteShipment');
                fn(null, value);
            }
        });
    }

    
};
