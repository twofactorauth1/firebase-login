/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var purchaseOrderdao = require('./dao/purchase_order.dao.js');
var log = $$.g.getLogger("purchase_order_manager");
var async = require('async');
var s3dao = require('../dao/integrations/s3.dao.js');
var awsConfig = require('../configs/aws.config');
var appConfig = require('../configs/app.config');

require('./model/purchase_order');


var accountDao = require('../dao/account.dao');




module.exports = {

	listPurchaseOrders: function (accountId, userId, fn) {
        
        log.debug(accountId, userId, '>> listPurchaseOrders');
        var query = {
            account_id: accountId
        };

        purchaseOrderdao.findMany(query, $$.m.PurchaseOrder, function (err, orders) {
            if (err) {
                log.error(accountId, userId, 'Error listing orders: ', err);
                return fn(err, null);
            } else {
        		log.debug(accountId, userId, '<< listPurchaseOrders');
                return fn(null, orders);
            }
        });
    },

    createPO: function(file, po, accountId, userId, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> createPO');

        var uploadPromise = $.Deferred();

        var attachment = {
            name: file.name,
            size: file.size,
            mimeType: file.type
        }
        

        if(file.path) {
            // to do-  need to change bucket
            //var bucket = awsConfig.BUCKETS.PURCHASE_ORDERS;
            var bucket = awsConfig.BUCKETS.ASSETS;
            var subdir = 'account_' + po.get('accountId');
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
            if (value.url.substring(0, 5) == 'http:') {
              attachment.url = value.url.substring(5, value.url.length);
            } else {
              attachment.url = value.url;
            }
            po.set("attachment", attachment);
            console.log(po);
                    uploadPromise.resolve(value);
                }
            });

        } else {
            uploadPromise.resolve();
        }
        //create record
        $.when(uploadPromise).done(function(file){
            purchaseOrderdao.saveOrUpdate(po, function(err, value){
                if(err) {
                    self.log.error('Exception during po creation: ' + err);
                    fn(err, null);
                } else {
                    self.log.debug('<< createPO');
                    fn(null, value, file);
                }
            });
        });

    }
    
};
