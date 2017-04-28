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
var userManager = require('../dao/user.manager');
require('./model/purchase_order');


var accountDao = require('../dao/account.dao');


module.exports = {
	
    listPurchaseOrders: function (accountId, userId, fn) {
        log.debug(accountId, userId, '>> listPurchaseOrders');

        async.waterfall([
            function(cb) {
                userManager.getUserById(userId, function(err, user){
                    cb(err, user);
                });
            },
            function(user, cb) {
                accountDao.getAccountByID(accountId, function(err, account){
                    cb(err, user, account);
                });
            },
            function(user, account, cb) {
                if(!user) {
                    cb('user not found');
                } else {
                    var query = {
                        accountId:accountId,
                        archived: {$ne: true}
                    };
                    if(_.contains(user.getPermissionsForAccount(accountId), 'vendor')){
                        var orgConfig = user.getOrgConfig(account.get('orgId'));
                        if(!orgConfig) {
                            orgConfig = {};
                        }
                        var cardCodes = orgConfig.cardCodes || [];
                        query.cardCode = {$in:cardCodes};
                    }
                    cb(null, query);
                }
            },
            function(query, cb) {
                purchaseOrderdao.findMany(query, $$.m.PurchaseOrder, function (err, orders) {
                    if(err) {
                        log.error(accountId, userId, 'Error finding POs:', err);
                        cb(err);
                    } else {
                        /*
                         * Cache users
                         */
                        var userIDMap = {};
                        async.each(orders, function(order, callback){
                            if(userIDMap[order.get('userId')]) {
                                var _user = userIDMap[order.get('userId')];
                                order.set("submitter", _user);
                                callback();
                            } else {
                                userManager.getUserById(order.get('userId'), function(err, user){
                                    if(err) {
                                        log.error(accountId, userId, 'Error getting user:', err);
                                        //return anyway
                                        callback();
                                    } else {
                                        var _user = {
                                            _id: user.get("_id"),
                                            username: user.get("username"),
                                            first: user.get("first"),
                                            last: user.get("last")
                                        };
                                        userIDMap[order.get('userId')] = _user;
                                        order.set("submitter", _user);
                                        callback();
                                    }
                                });
                            }
                        }, function(err){
                            cb(err, orders);
                        });
                    }
                });
            }
        ], function(err, orders){
            if (err) {
                log.error(accountId, userId, 'Error fetching users for orders: ' + err);
                return fn(err, orders);
            } else {
                log.debug(accountId, userId, '<< listPurchaseOrders');
                return fn(null, orders);
            }
        });


    },


    listArchivedPurchaseOrders: function (accountId, userId, fn) {
        log.debug(accountId, userId, '>> listArchivedPurchaseOrders');

        async.waterfall([
            function(cb) {
                userManager.getUserById(userId, function(err, user){
                    cb(err, user);
                });
            },
            function(user, cb){
                accountDao.getAccountByID(accountId, function(err,account){
                    cb(err, user, account);
                });
            },
            function(user, account, cb) {
                if(!user) {
                    cb('user not found');
                } else {
                    var query = {
                        accountId:accountId,
                        archived: true
                    };
                    if(_.contains(user.getPermissionsForAccount(accountId), 'vendor')){
                        var orgConfig = user.getOrgConfig(account.get('orgId'));
                        if(!orgConfig) {
                            orgConfig = {};
                        }
                        var cardCodes = orgConfig.cardCodes || [];
                        query.cardCode = {$in:cardCodes};
                    }
                    cb(null, query);
                }
            },
            function(query, cb) {
                purchaseOrderdao.findMany(query, $$.m.PurchaseOrder, function (err, orders) {
                    if(err) {
                        log.error(accountId, userId, 'Error finding POs:', err);
                        cb(err);
                    } else {
                        /*
                         * Cache users
                         */
                        var userIDMap = {};
                        async.each(orders, function(order, callback){
                            if(userIDMap[order.get('userId')]) {
                                var _user = userIDMap[order.get('userId')];
                                order.set("submitter", _user);
                                callback();
                            } else {
                                userManager.getUserById(order.get('userId'), function(err, user){
                                    if(err) {
                                        log.error(accountId, userId, 'Error getting user:', err);
                                        //return anyway
                                        callback();
                                    } else {
                                        var _user = {
                                            _id: user.get("_id"),
                                            username: user.get("username"),
                                            first: user.get("first"),
                                            last: user.get("last")
                                        };
                                        userIDMap[order.get('userId')] = _user;
                                        order.set("submitter", _user);
                                        callback();
                                    }
                                });
                            }
                        }, function(err){
                            cb(err, orders);
                        });
                    }
                });
            }
        ], function(err, orders){
            if (err) {
                log.error(accountId, userId, 'Error fetching users for orders: ' + err);
                return fn(err, orders);
            } else {
                log.debug(accountId, userId, '<< listArchivedPurchaseOrders');
                return fn(null, orders);
            }
        });
    },


    getDashboardPurchaseOrders: function (accountId, userId, fn) {
        log.debug(accountId, userId, '>> getDashboardPurchaseOrders');

        async.waterfall([
            function(cb) {
                userManager.getUserById(userId, function(err, user){
                    cb(err, user);
                });
            },
            function(user, cb) {
                accountDao.getAccountByID(accountId, function(err, account){
                    cb(err, user, account);
                });
            },
            function(user, account, cb) {
                if(!user) {
                    cb('user not found');
                } else {
                    var query = {
                        accountId:accountId,
                        archived: {$ne: true}
                    };
                    if(_.contains(user.getPermissionsForAccount(accountId), 'vendor')){
                        var orgConfig = user.getOrgConfig(account.get('orgId'));
                        if(!orgConfig) {
                            orgConfig = {};
                        }
                        var cardCodes = orgConfig.cardCodes || [];
                        query.cardCode = {$in:cardCodes};
                    }
                    cb(null, query);
                }
            },
            function(query, cb) {
                purchaseOrderdao.findWithFieldsLimitOrderAndTotal(query, 0, 5, "created.date", null, $$.m.PurchaseOrder, -1, function (err, orders) {
                    if(err) {
                        log.error(accountId, userId, 'Error finding POs:', err);
                        cb(err);
                    } else {
                        /*
                         * Cache users
                         */
                        
                        if(orders){
                            var userIDMap = {};
                            async.each(orders.results, function(order, callback){
                                if(userIDMap[order.get('userId')]) {
                                    var _user = userIDMap[order.get('userId')];
                                    order.set("submitter", _user);
                                    callback();
                                } else {
                                    userManager.getUserById(order.get('userId'), function(err, user){
                                        if(err) {
                                            log.error(accountId, userId, 'Error getting user:', err);
                                            //return anyway
                                            callback();
                                        } else {
                                            var _user = {
                                                _id: user.get("_id"),
                                                username: user.get("username"),
                                                first: user.get("first"),
                                                last: user.get("last")
                                            };
                                            userIDMap[order.get('userId')] = _user;
                                            order.set("submitter", _user);
                                            callback();
                                        }
                                    });
                                }
                            }, function(err){
                                cb(err, orders);
                            });
                        }
                        else{
                            cb(err, orders);
                        }
                        
                    }
                });
            }
        ], function(err, orders){
            if (err) {
                log.error(accountId, userId, 'Error fetching users for orders: ' + err);
                return fn(err, orders);
            } else {
                log.debug(accountId, userId, '<< getDashboardPurchaseOrders');
                return fn(null, orders);
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
        };
        

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
            
                    if(value && value.url) {
                        value.url = value.url.replace("s3.amazonaws.com", "s3-us-west-1.amazonaws.com");
                    }


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
                            };
                            order.set("submitter", _user);
                            self._sendEmailOnPOCreation(order, accountId, adminUrl);
                            fn(null, order, file);
                        }
                    });
                }
            });
        });

    },


    getPurchaseOrderById: function (accountId, userId, orderId, fn) {
        var self = this;
        log.debug(accountId, userId, '>> getPurchaseOrderById');
        purchaseOrderdao.getById(orderId, $$.m.PurchaseOrder, function (err, order) {
            if (err) {
                log.error('Error getting purchase order: ' + err);
                return fn(err, null);
            } else {
                accountDao.getAccountByID(accountId, function(err, account){
                    if(err) {
                        log.error('Error getting account:', err);
                        return fn(err);
                    } else {
                        userManager.getUserById(userId, function(err, user){
                            if(err || !user) {
                                log.error('Error getting user:', err);
                                return fn(err);
                            } else {
                                if(_.contains(user.getPermissionsForAccount(accountId), 'vendor')){
                                    var orgConfig = user.getOrgConfig(account.get('orgId'));
                                    if(!orgConfig) {
                                        orgConfig = {};
                                    }
                                    var cardCodes = orgConfig.cardCodes || [];
                                    if(!_.contains(user.get('orgConfig').cardCodes, order.get('cardCode'))) {
                                        return fn();
                                    }
                                }
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
                                            };
                                            note.user = _user;
                                            cb();
                                        }
                                    });
                                }, function (err) {
                                    if (err) {
                                        log.error(accountId, userId, 'Error getting purchase order: ' + err);
                                        return fn(err, null);
                                    } else {
                                        log.debug('<< getPurchaseOrderById');
                                        return fn(null, order);
                                    }
                                });
                            }
                        });
                    }
                });


            }
        });
    },

    addNotesToPurchaseOrder: function(accountId, userId, purchaseOrderId, note, fn){
        var self = this;
        log.debug(accountId, userId, '>> addNotesToPurchaseOrder');
        purchaseOrderdao.getById(purchaseOrderId, $$.m.PurchaseOrder, function (err, po) {
            if (err) {
                log.error(accountId, userId, 'Error getting purchase order: ' + err);
                return fn(err, null);
            } else {
                po.get("notes").push(note);
                purchaseOrderdao.saveOrUpdate(po, function(err, order){
                    if(err) {
                        self.log.error(accountId,userId,'Exception during po creation: ' + err);
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
                                };
                                note.user = _user;
                                log.debug(accountId, userId, '<< addNotesToPurchaseOrder');
                                return fn(null, note);
                            }
                        });
                    }
                });
            }
        });
    },

    deletePurchaseOrder: function(accountId, userId, purchaseOrderId, fn){
        var self = this;
        log.debug(accountId, userId, '>> deletePurchaseOrder');
        userManager.getUserById(userId, function(err, user){
            if(err || !user) {
                self.log.error('Error deleting po: ' + err);
                return fn(err, null);
            } else {
                accountDao.getAccountByID(accountId, function(err, account){
                    if(err || !account) {
                        self.log.error('Error getting account:', err);
                        return fn(err);
                    } else {
                        var query = {_id:purchaseOrderId};
                        if(_.contains(user.getPermissionsForAccount(accountId), 'vendor')){
                            var orgConfig = user.getOrgConfig(account.get('orgId'));
                            if(!orgConfig) {
                                orgConfig = {};
                            }
                            var cardCodes = orgConfig.cardCodes || [];
                            query.cardCode = {$in:cardCodes};
                        }
                        purchaseOrderdao.removeByQuery(query, $$.m.PurchaseOrder, function(err, value){
                            if(err) {
                                self.log.error('Error deleting po: ' + err);
                                return fn(err, null);
                            } else {
                                log.debug(accountId, userId, '<< deletePurchaseOrder');
                                fn(null, value);
                            }
                        });
                    }
                });

            }
        });
    },

    archivePurchaseOrder: function(accountId, userId, purchaseOrderId, fn){
        var self = this;
        log.debug(accountId, userId, '>> archivePurchaseOrder');
        userManager.getUserById(userId, function(err, user){
            if(err || !user) {
                self.log.error('Error archiving po: ' + err);
                return fn(err, null);
            } else {
                accountDao.getAccountByID(accountId, function(err, account){
                    if(err || !account) {
                        self.log.error('Error archiving po', err);
                        return fn(err, null);
                    } else {
                        var query = {_id:purchaseOrderId};
                        if(_.contains(user.getPermissionsForAccount(accountId), 'vendor')){
                            var orgConfig = user.getOrgConfig(account.get('orgId'));
                            if(!orgConfig) {
                                orgConfig = {};
                            }
                            var cardCodes = orgConfig.cardCodes || [];
                            query.cardCode = {$in:cardCodes};
                        }
                        purchaseOrderdao.findOne(query, $$.m.PurchaseOrder, function(err, po){
                            if(err) {
                                self.log.error('Error getting po: ' + err);
                                return fn(err, null);
                            } else {
                                po.set('archived', true);
                                po.set('modified', {date: new Date(), by: userId});
                                purchaseOrderdao.saveOrUpdate(po, function(err, savedPo){
                                    if(err) {
                                        self.log.error(accountId, userId,'Error saving PO:', err);
                                        return fn(err);
                                    }
                                    else{
                                        log.debug(accountId, userId, '<< archivePurchaseOrder');
                                        fn(null, savedPo);
                                    }
                                })
                            }
                        });
                    }

                });

            }
        });
    },

    archiveBulkPurchaseOrders: function(accountId, userId, orderIds, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> archiveBulkPurchaseOrders');
        var query = {
            _id: {'$in': orderIds}
        };
        userManager.getUserById(userId, function(err, user){
            if(err || !user) {
                self.log.error(accountId, userId, 'Error finding orders with orderIds:', err);
                return fn(err);
            } else {
                accountDao.getAccountByID(accountId, function(err, account){
                    if(err || !account) {
                        self.log.error(accountId, userId, 'Error finding orders with orderIds:', err);
                        return fn(err);
                    } else {
                        if(_.contains(user.getPermissionsForAccount(accountId), 'vendor')){
                            var orgConfig = user.getOrgConfig(account.get('orgId'));
                            if(!orgConfig) {
                                orgConfig = {};
                            }
                            var cardCodes = orgConfig.cardCodes || [];
                            query.cardCode = {$in:cardCodes};
                        }
                        purchaseOrderdao.findMany(query, $$.m.PurchaseOrder, function(err, orders){
                            if(err) {
                                self.log.error(accountId, userId, 'Error finding orders with orderIds:', err);
                                fn(err);
                            } else {
                                async.eachSeries(orders, function(po, callback){
                                    po.set('archived', true);
                                    po.set('modified', {date: new Date(), by: userId});
                                    callback();
                                }, function(err){
                                    if(err) {
                                        fn(err);
                                    } else {
                                        purchaseOrderdao.batchUpdate(orders, $$.m.PurchaseOrder, function(err, updatedOrders){
                                            if(err) {
                                                self.log.error(accountId, userId,'Error saving Purchase Orders:', err);
                                                return fn(err);
                                            }
                                            else{
                                                log.debug(accountId, userId, '<< archiveBulkPurchaseOrders');
                                                fn(null, orderIds);
                                            }
                                        });
                                    }
                                });
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
    },

    _getOrgConfig: function(accountId, userId, fn) {
        accountDao.getById(accountId, function(err, account){
            if(err || !account) {
                fn(err);
            } else {
                userDao.getById(userId, $$.m.User, function(err, user){
                    if(err || !user) {
                        fn(err);
                    } else {
                        fn(null, user.getOrgConfig(account.get('orgId')));
                    }
                });
            }
        });
    }
    
};
