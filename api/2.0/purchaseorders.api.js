/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api.js');
var poDao = require('../../purchaseorders/dao/purchase_order.dao');
var poManager = require('../../purchaseorders/purchase_order_manager');
var formidable = require('formidable');
var userManager = require('../../dao/user.manager');
var orgManager = require('../../organizations/organization_manager');
require('../../purchaseorders/model/purchase_order');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "purchaseorders",

    version: "2.0",

    dao: poDao,

    initialize: function () {

        app.get(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.listPurchaseOrders.bind(this));       
        app.post(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.createPurchaseOrder.bind(this));
        app.get(this.url('po/:id'), this.isAuthAndSubscribedApi.bind(this), this.getPurchaseOrder.bind(this));
        app.post(this.url('po/:id/notes'), this.isAuthAndSubscribedApi.bind(this), this.addPurchaseOrderNotes.bind(this));
        app.post(this.url('po/archivepurchaseorders'), this.isAuthAndSubscribedApi.bind(this), this.archiveBulkPurchaseOrders.bind(this));
        app.delete(this.url('po/:id'), this.isAuthAndSubscribedApi.bind(this), this.deletePurchaseOrder.bind(this));
        app.put(this.url('po/archive/:id'), this.isAuthAndSubscribedApi.bind(this), this.archivePurchaseOrder.bind(this));
        app.get(this.url('dashboard/listpurchaseorders'), this.isAuthAndSubscribedApi.bind(this), this.getDashboardPurchaseOrders.bind(this));
        app.get(this.url('archived'), this.isAuthAndSubscribedApi.bind(this), this.listArchivedPurchaseOrders.bind(this));       
    },

    listPurchaseOrders: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> listPurchaseOrders');
        self._checkAccess(accountId, userId, 'purchaseorders', function(err, isAllowed){
            if(!isAllowed) {
                self.log.debug(accountId, userId, '<< listPurchaseOrders [' + isAllowed + ']');
                return self.sendResultOrError(resp, err, [], "Error listing orders");
            } else {
                poManager.listPurchaseOrders(accountId, userId, function(err, list){
                    self.log.debug(accountId, userId, '<< listPurchaseOrders');
                    return self.sendResultOrError(resp, err, list, "Error listing orders");
                });
            }
        });

    },

    listArchivedPurchaseOrders: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> listArchivedPurchaseOrders');

        poManager.listArchivedPurchaseOrders(accountId, userId, function(err, list){
            self.log.debug(accountId, userId, '<< listArchivedPurchaseOrders');
            return self.sendResultOrError(resp, err, list, "Error listing orders");
        });
    },


    getDashboardPurchaseOrders: function(req, resp){
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getDashboardPurchaseOrders');

        poManager.getDashboardPurchaseOrders(accountId, userId, function(err, list){
            self.log.debug(accountId, userId, '<< getDashboardPurchaseOrders');
            return self.sendResultOrError(resp, err, list, "Error listing orders");
        });
    },
    
    createPurchaseOrder: function(req, res) {
        var self = this;
        self.log.debug('>> createPurchaseOrder');
        var form = new formidable.IncomingForm();
        var accountId = parseInt(self.accountId(req));
        
        self.checkPermission(req, self.sc.privs.MODIFY_ORDER, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(res);
            } else {
                var userId = self.userId(req);

                form.parse(req, function(err, fields, files) {
                    if(err) {
                        self.wrapError(res, 500, 'fail', 'The upload failed', err);
                        self = null;
                        return;
                    } else {

                        var file = files['file'];
                        
                        var body = JSON.parse(fields['po']);

                        var po = new $$.m.PurchaseOrder(body);
                        var adminUrl = fields['adminUrl'];

                        
                        var fileToUpload = {};
                        fileToUpload.mimeType = file.type;
                        fileToUpload.size = file.size;
                        fileToUpload.name = file.name;
                        fileToUpload.path = file.path;
                        fileToUpload.type = file.type;


                        po.set("accountId", accountId);
                        po.set("userId", userId);

                        //console.log(file);

                        poManager.createPO(fileToUpload, adminUrl, po, accountId, userId, function(err, value, file){                                                       
                            self.sendResultOrError(res, err, value, 'Could not save PO');
                            self.createUserActivity(req, 'CREATE_PO', null, null, function(){});
                        });
                    }


                });
            }
        });

    },

    getPurchaseOrder: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '<< getPurchaseOrder');
        var purchaseOrderId = req.params.id;
        poManager.getPurchaseOrderById(accountId, userId, purchaseOrderId, function(err, order){
            self.log.debug(accountId, userId, '<< getPurchaseOrder');
            return self.sendResultOrError(resp, err, order, "Error getting Purchase Order");
        });
    },


    addPurchaseOrderNotes: function(req, res) {
        var self = this;
        self.log.debug('>> addPurchaseOrderNotes');
        
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.checkPermission(req, self.sc.privs.MODIFY_ORDER, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(res);
            } else {              
                var notes = req.body;
                notes.userId = userId;
                var purchaseOrderId = req.params.id;
                poManager.addNotesToPurchaseOrder(accountId, userId, purchaseOrderId, notes, function(err, value){                                                       
                    self.sendResultOrError(res, err, value, 'Could not add notes to PO');                    
                }); 
            }
        });

    },

    deletePurchaseOrder: function (req, res) {

        var self = this;
        var purchaseOrderId = req.params.id;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> deletePurchaseOrder');

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_ORDER, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                if (!purchaseOrderId) {
                    self.wrapError(res, 400, null, "Invalid paramater for ID");
                }
                
                poManager.deletePurchaseOrder(accountId, userId, purchaseOrderId, function(err, value){
                    self.log.debug('<< deletePurchaseOrder');
                    self.sendResultOrError(res, err, {deleted:true}, "Error deleting PO");
                    self.createUserActivity(req, 'DELETE_PO', null, null, function(){});
                }); 
            }
        });
    },


    archivePurchaseOrder: function (req, res) {

        var self = this;
        var purchaseOrderId = req.params.id;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> archivePurchaseOrder');

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_ORDER, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                if (!purchaseOrderId) {
                    self.wrapError(res, 400, null, "Invalid paramater for ID");
                }
                
                poManager.archivePurchaseOrder(accountId, userId, purchaseOrderId, function(err, value){
                    self.log.debug('<< archivePurchaseOrder');
                    self.sendResultOrError(res, err, {deleted:true}, "Error archiving PO");
                    self.createUserActivity(req, 'UPDATE_PO', null, null, function(){});
                }); 
            }
        });
    },

    archiveBulkPurchaseOrders: function (req, res) {

        var self = this;
        var purchaseOrders = req.body;
        console.log(purchaseOrders);
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> archiveBulkPurchaseOrders');
        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_ORDER, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                
                poManager.archiveBulkPurchaseOrders(accountId, userId, purchaseOrders, function(err, value){                                                       
                    self.log.debug('<< archiveBulkPurchaseOrders');
                    self.sendResultOrError(res, err, {deleted:true}, "Error archiving PO's");
                }); 
            }
        });
    },

    _isUserAdmin: function(req, fn) {
        var self = this;
        var userId = self.userId(req);
        var accountId = parseInt(self.accountId(req));
        userManager.getUserById(userId, function(err, user){
            if(user && _.contains(user.getPermissionsForAccount(accountId), 'admin')) {
                fn(null, true);
            } else {
                fn(null, false);
            }
        });
    },

    _isUserVendor: function(req, fn) {
        var self = this;
        var userId = self.userId(req);
        var accountId = parseInt(self.accountId(req));
        userManager.getUserById(userId, function(err, user){
            if(user && _.contains(user.getPermissionsForAccount(accountId), 'vendor')) {
                fn(null, true);
            } else {
                fn(null, false);
            }
        });
    },

    _checkAccess: function(accountId, userId, module, fn) {
        var self = this;
        userManager.getUserById(userId, function(err, user){
            orgManager.getOrgByAccountId(accountId, userId, function(err, organization){
                if(user && organization && user.getOrgConfig(organization.id()).modules) {
                    var modules = user.getOrgConfig(organization.id()).modules;
                    if(modules[module] !== undefined && modules[module] === false) {
                        fn(null, false);
                    } else {
                        fn(null, true);
                    }
                } else {
                    fn(null, true);
                }
            });

        });
    }
    


});

module.exports = new api({version:'2.0'});

