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
var notificationConfig = require('../configs/notification.config');
var userDao = require('../dao/user.dao');
var emailMessageManager = require('../emailmessages/emailMessageManager');

require('./model/purchase_order');


var accountDao = require('../dao/account.dao');




module.exports = {
	
    listPurchaseOrders: function (accountId, userId, fn) {
        var userId = null;
        log.debug(accountId, userId, '>> listPurchaseOrders');
        var query = {
            accountId: accountId
        };

        purchaseOrderdao.findMany(query, $$.m.PurchaseOrder, function (err, orders) {
            if (err) {
                log.error(accountId, userId, 'Error listing orders: ', err);
                return fn(err, null);
            } else {
                async.each(orders, function (order, cb) {
                    userDao.getById(order.get('userId'), function (err, user) {
                        if (err) {
                            log.error(accountId, userId, 'Error getting user: ' + err);
                            cb(err);
                        } else {
                            var _user = {
                                _id: user.get("_id"),
                                username: user.get("username"),
                                first: user.get("first"),
                                last: user.get("last")
                            }
                            order.set("submitter", _user);
                            cb();
                        }
                    });
                }, function (err) {
                    if (err) {
                        log.error(accountId, userId, 'Error fetching users for orders: ' + err);
                        return fn(err, orders);
                    } else {
                        log.debug(accountId, userId, '<< listPurchaseOrders');
                        return fn(null, orders);
                    }
                });

            }
        });
    },

    createPO: function(file, adminUrl, po, accountId, userId, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> createPO');

        var uploadPromise = $.Deferred();

        var attachment = {
            name: file.name,
            size: file.size,
            mimeType: file.mimeType
        }
        

        if(file.path) {
            // to do-  need to change bucket
            var bucket = awsConfig.BUCKETS.PURCHASE_ORDERS;
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
            
            if(value && value.url)
                value.url = value.url.replace("s3.amazonaws.com", "s3-us-west-1.amazonaws.com");

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
            purchaseOrderdao.saveOrUpdate(po, function(err, order){
                if(err) {
                    self.log.error('Exception during po creation: ' + err);
                    fn(err, null);
                } else {
                    self.log.debug('<< createPO');
                    userDao.getById(order.get('userId'), function (err, user) {
                        if (err) {
                            log.error(accountId, userId, 'Error getting user: ' + err);
                            fn(err, null);
                        } else {
                            var _user = {
                                _id: user.get("_id"),
                                username: user.get("username"),
                                first: user.get("first"),
                                last: user.get("last")
                            }
                            order.set("submitter", _user);
                            self._sendEmailOnPOCreation(order, accountId, adminUrl);
                            fn(null, order, file);
                        }
                    });
                }
            });
        });

    },


    getPurchaseOrderById: function (orderId, fn) {
        var self = this;
        log.debug('>> getPurchaseOrderById');
        purchaseOrderdao.getById(orderId, $$.m.PurchaseOrder, function (err, order) {
            if (err) {
                log.error('Error getting purchase order: ' + err);
                return fn(err, null);
            } else {
                log.debug('<< getPurchaseOrderById');
                async.each(order.get("notes"), function (note, cb) {
                    userDao.getById(note.userId, function (err, user) {
                        if (err) {
                            log.error(accountId, userId, 'Error getting user: ' + err);
                            cb(err);
                        } else {
                            var _user = {
                                _id: user.get("_id"),
                                username: user.get("username"),
                                first: user.get("first"),
                                last: user.get("last"),
                                profilePhotos: user.get("profilePhotos")
                            }
                            note.user = _user;
                            cb();
                        }
                    });
                }, function (err) {
                    if (err) {
                        log.error('Error getting purchase order: ' + err);
                        return fn(err, null);
                    } else {
                        log.debug('<< getPurchaseOrderById');
                        return fn(null, order);
                    }
                });
            }
        });
    },

    addNotesToPurchaseOrder: function(accountId, userId, purchaseOrderId, note, fn){
        var self = this;
        log.debug('>> addNotesToPurchaseOrder');
        purchaseOrderdao.getById(purchaseOrderId, $$.m.PurchaseOrder, function (err, po) {
            if (err) {
                log.error('Error getting purchase order: ' + err);
                return fn(err, null);
            } else {
                log.debug('<< addNotesToPurchaseOrder');
                po.get("notes").push(note);
                purchaseOrderdao.saveOrUpdate(po, function(err, order){
                if(err) {
                    self.log.error('Exception during po creation: ' + err);
                    fn(err, null);
                } else {
                    userDao.getById(userId, function (err, user) {
                        if (err) {
                            log.error(accountId, userId, 'Error getting user: ' + err);
                            fn(err, null);
                        } else {
                            var _user = {
                                _id: user.get("_id"),
                                username: user.get("username"),
                                first: user.get("first"),
                                last: user.get("last"),
                                profilePhotos: user.get("profilePhotos")
                            }
                            note.user = _user;
                            return fn(null, note);
                        }
                    });
                }
            });
            }
        });
    },


    _sendEmailOnPOCreation: function(po, accountId, adminUrl) {
        var self = this;
        var component = {};
        
        var text = [];

        var poUrl = adminUrl + "#/purchase-orders/" + po.id();
        
        if(po.get("title")){
            text.push("<b>Title</b>: "+ po.get("title"));
        }
        if(po.get("text")){
            text.push("<b>Text</b>: "+ po.get("text"));
        }
        
        
        component.title = "You have a new purchase order!";
        component.text = text;
        
        component.attachment = po.get("attachment");
        component.poUrl = poUrl;

        var fromEmail = notificationConfig.FROM_EMAIL;
        var fromName =  notificationConfig.WELCOME_FROM_NAME;
        var emailSubject = notificationConfig.NEW_PURCHASE_ORDER_EMAIL_SUBJECT;
        var emailTo = notificationConfig.NEW_PURCHASE_ORDER_EMAIL_TO;

        app.render('purchaseorders/new_purchase_order', component, function(err, html){
            if(err) {
                self.log.error('error rendering html: ' + err);
                self.log.warn('email will not be sent to configured email.');
            } else {
                self.log.debug('sending email to: ', emailTo);
                console.log(html);
                emailMessageManager.sendNewPurchaseOrderEmail(fromEmail, fromName, emailTo, null, emailSubject, html, accountId, [], '', null, function(err, result){
                    self.log.debug('result: ', result);
                });
            }
        });
    }
    
};
