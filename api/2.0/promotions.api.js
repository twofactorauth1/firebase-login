/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api.js');
var promotionDao = require('../../promotions/dao/promotion.dao');
var promotionManager = require('../../promotions/promotion_manager');
var formidable = require('formidable');
var userManager = require('../../dao/user.manager');
var orgManager = require('../../organizations/organization_manager');
require('../../promotions/model/promotion');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "promotions",

    version: "2.0",

    dao: promotionDao,

    initialize: function () {

        app.get(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.listPromotions.bind(this));       
        app.post(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.createPromotion.bind(this));
        app.get(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.getPromotionDetails.bind(this));
        app.delete(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.deletePromotion.bind(this));
        app.post(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.updatePromotion.bind(this));
        app.post(this.url('attachment/:id'), this.isAuthApi.bind(this), this.updatePromotionAttachment.bind(this));
        app.post(this.url('promotion/shipment'), this.isAuthApi.bind(this), this.createShipment.bind(this));
        app.post(this.url('promotion/shipment/:id'), this.isAuthApi.bind(this), this.updateShipment.bind(this));
        app.post(this.url('promotion/shipment/attachment/:id'), this.isAuthApi.bind(this), this.updateShipmentAttachment.bind(this));
        app.get(this.url(':promotionId/shipments'), this.isAuthAndSubscribedApi.bind(this), this.listShipments.bind(this));       
        app.delete(this.url('promotion/shipment/:id'), this.isAuthApi.bind(this), this.deleteShipment.bind(this));
        app.get(this.url(':promotionId/shipments/export/csv'), this.isAuthAndSubscribedApi.bind(this), this.exportShipments.bind(this));       

    },

    listPromotions: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        var vendorFilter = null;
        self._checkAccess(accountId, userId, 'promotions', function(err, isAllowed){
            if(!isAllowed) {
                self.log.debug(accountId, userId, '<< promotions [' + isAllowed + ']');
                return self.sendResultOrError(resp, err, [], "Error listing promotions");
            } else {
                self.log.debug(accountId, userId, '>> listPromotions');
                self._checkUserRole(req, function(err, userObj){
                    var _isAdmin = false;
                    var _isVendor = false;
                    var _isVAR = false;
                    var _isSecurematics = false;
                    if(userObj){
                        _isAdmin = _.contains(userObj.getPermissionsForAccount(accountId), 'admin');
                        _isVendor = _.contains(userObj.getPermissionsForAccount(accountId), 'vendor-restricted');
                        _isVAR = _.contains(userObj.getPermissionsForAccount(accountId), 'vendor');
                        _isSecurematics = _.contains(userObj.getPermissionsForAccount(accountId), 'securematics');
                    }   
                    if(_isAdmin || _isSecurematics) {
                        promotionManager.listPromotions(accountId, userId, [], vendorFilter, function(err, list){
                            self.log.debug(accountId, userId, '<< listPromotions');
                            return self.sendResultOrError(resp, err, list, "Error listing promotions");
                        });
                    }
                    else{
                        if(_isVendor){
                            self._getOrgConfig(accountId, userId, function(err, orgConfig){
                                if(!orgConfig) {
                                    orgConfig = {};
                                }
                                vendorFilter = orgConfig.vendorName;
                                if(vendorFilter){
                                    promotionManager.listPromotions(accountId, userId, [], vendorFilter, function(err, list){
                                        self.log.debug(accountId, userId, '<< listPromotions');
                                        return self.sendResultOrError(resp, err, list, "Error listing promotions");
                                    }); 
                                }
                                else{
                                    return self.sendResultOrError(resp, err, [], "Error listing promotions");
                                }
                            });
                        }
                        else{
                            self._getOrgConfig(accountId, userId, function(err, orgConfig){
                                if(!orgConfig) {
                                    orgConfig = {};
                                }
                                var cardCodes = orgConfig.cardCodes || [];
                                if(cardCodes.length){
                                    cardCodes = _.map(cardCodes, function(code){return code.toLowerCase()});
                                    promotionManager.listPromotions(accountId, userId, cardCodes, vendorFilter, function(err, list){
                                        self.log.debug(accountId, userId, '<< listPromotions');
                                        return self.sendResultOrError(resp, err, list, "Error listing promotions");
                                    });
                                }
                            });
                        }
                    }
                }) 
            }
        })        
    },
    
    getPromotionDetails: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        var promotionId = req.params.id;
        console.log(promotionId);
        self.log.debug(accountId, userId, '>> getPromotionDetails');
        var vendorFilter = null;
        self._checkAccess(accountId, userId, 'promotions', function(err, isAllowed){
            if(!isAllowed) {
                self.log.debug(accountId, userId, '<< promotions [' + isAllowed + ']');
                return self.sendResultOrError(resp, err, [], "Error listing promotions");
            }
            else{
                self._checkUserRole(req, function(err, userObj){
                    var _isAdmin = false;
                    var _isVendor = false;
                    var _isVAR = false;
                    var _isSecurematics = false;
                    if(userObj){
                        _isAdmin = _.contains(userObj.getPermissionsForAccount(accountId), 'admin');
                        _isVendor = _.contains(userObj.getPermissionsForAccount(accountId), 'vendor-restricted');
                        _isVAR = _.contains(userObj.getPermissionsForAccount(accountId), 'vendor');
                        _isSecurematics = _.contains(userObj.getPermissionsForAccount(accountId), 'securematics');
                    }

                    if(_isAdmin || _isSecurematics) {
                        promotionManager.getPromotionDetails(accountId, userId, promotionId, [], vendorFilter, function(err, list){
                            self.log.debug(accountId, userId, '<< getPromotionDetails');
                            return self.sendResultOrError(resp, err, list, "Error getting promotion");
                        });
                    }
                    else{
                        if(_isVendor){
                            self._getOrgConfig(accountId, userId, function(err, orgConfig){
                                if(!orgConfig) {
                                    orgConfig = {};
                                }
                                vendorFilter = orgConfig.vendorName;
                                if(vendorFilter){
                                    promotionManager.getPromotionDetails(accountId, userId, promotionId, [], vendorFilter, function(err, list){
                                        self.log.debug(accountId, userId, '<< getPromotionDetails');
                                        return self.sendResultOrError(resp, err, list, "Error getting promotion");
                                    }); 
                                }
                                else{
                                    return self.sendResultOrError(resp, err, null, "Error getting promotion");
                                }
                            });
                        }
                        else{
                            self._getOrgConfig(accountId, userId, function(err, orgConfig){
                                if(!orgConfig) {
                                    orgConfig = {};
                                }
                                var cardCodes = orgConfig.cardCodes || [];
                                if(cardCodes.length){
                                    cardCodes = _.map(cardCodes, function(code){return code.toLowerCase()});
                                    promotionManager.getPromotionDetails(accountId, userId, promotionId, cardCodes, vendorFilter, function(err, list){
                                        self.log.debug(accountId, userId, '<< getPromotionDetails');
                                        return self.sendResultOrError(resp, err, list, "Error getting promotion");
                                    });
                                }
                            });
                        }
                        
                    }
                })
            }
        })
    },

    deletePromotion: function(req, resp) {
        var self = this;
        self.log.debug('>> deletePromotion');
        var promotionId = req.params.id;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        // self.checkPermission(req, self.sc.privs.MODIFY_PROMOTION, function(err, isAllowed) {
        //     if (isAllowed !== true) {
        //         return self.send403(resp);
        //     } else {
                promotionManager.deletePromotion(accountId, userId, promotionId, function(err, value){
                    if(err) {
                        self.wrapError(resp, 500, err, "Error deleting promotion");
                    } else {
                        self.log.debug('<< deletePromotion');
                        self.send200(resp);
                        self.createUserActivity(req, 'DELETE_PROMOTION', null, null, function(){});
                    }
                });
        //     }
        // });
    },


    updatePromotion: function(req, resp) {
        var self = this;
        self.log.debug('>> updatePromotion');
        var promotionId = req.params.id;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        // self.checkPermission(req, self.sc.privs.MODIFY_PROMOTION, function(err, isAllowed) {
        //     if (isAllowed !== true) {
        //         return self.send403(resp);
        //     } else {
                var promoObj = req.body;
                var promotion = new $$.m.Promotion(promoObj);
                var modified = {
                    date: new Date(),
                    by: userId
                };
                promotion.set('modified', modified);

                if(promoObj.startDate){
                    promotion.set("startDate", moment(promoObj.startDate).toDate());
                }
                else{
                    promotion.set("startDate", null);
                }
                if(promoObj.expirationDate){
                    promotion.set("expirationDate", moment(promoObj.expirationDate).toDate());
                }
                else{
                    promotion.set("expirationDate", null);
                }

                if(promoObj.report && promoObj.report.startDate){
                    promotion.attributes.report.startDate = moment(promoObj.report.startDate).toDate();
                }
                else{
                    if(promotion.attributes.report){
                        promotion.attributes.report.startDate = null;
                    }
                }

                promotionManager.saveOrUpdatePromotion(accountId, userId, promotion, promotionId, function(err, value){
                    self.log.debug(accountId, userId, '<< updatePromotion');
                    self.sendResultOrError(resp, err, value, "Error updating promotion");
                    self.createUserActivity(req, 'UPDATE_PROMOTION', null, null, function(){});
                });
        //     }
        // });
    },

    createPromotion: function(req, resp) {
        var self = this;
        self.log.debug('>> createPromotion');
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        // self.checkPermission(req, self.sc.privs.MODIFY_PROMOTION, function(err, isAllowed) {
        //     if (isAllowed !== true) {
        //         return self.send403(resp);
        //     } else {
                var promoObj = req.body;
                var promotion = new $$.m.Promotion(promoObj);
                var modified = {
                    date: new Date(),
                    by: userId
                };
                var created = {
                    date: new Date(),
                    by: userId
                };

                promotion.set('modified', modified);
                promotion.set('created', created);
                promotion.set("accountId", accountId);
                promotion.set("userId", userId);

                if(promoObj.startDate){                    
                    promotion.set("startDate", moment(promoObj.startDate).toDate());
                }
                if(promoObj.expirationDate){
                    promotion.set("expirationDate", moment(promoObj.expirationDate).toDate());
                }
                if(promoObj.report && promoObj.report.startDate){
                    promotion.attributes.report.startDate = moment(promoObj.report.startDate).toDate();
                }

                promotionManager.saveOrUpdatePromotion(accountId, userId, promotion, null, function(err, value){
                    self.log.debug(accountId, userId, '<< createPromotion');
                    self.sendResultOrError(resp, err, value, "Error creating promotion");
                    self.createUserActivity(req, 'CREATE_PROMOTION', null, null, function(){});
                });
        //     }
        // });
    },


    updatePromotionAttachment: function(req, res) {
        var self = this;
        self.log.debug('>> updatePromotionAttachment');
        var form = new formidable.IncomingForm();
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        var promotionId = req.params.id;
        form.parse(req, function(err, fields, files) {
            if(err) {
                self.wrapError(res, 500, 'fail', 'The upload failed', err);
                self = null;
                return;
            } else {

                var file = files['file'];
                console.log(file);

                var fileToUpload = {};
                fileToUpload.mimeType = file.type;
                fileToUpload.size = file.size;
                fileToUpload.name = file.name;
                fileToUpload.path = file.path;
                fileToUpload.type = file.type;
                promotionManager.updatePromotionAttachment(fileToUpload, promotionId, accountId, userId, function(err, value, file){                                                       
                    self.log.debug('>> updatePromotionAttachment');
                    self.sendResultOrError(res, err, value, 'Could not update promotion attachment');                    
                });
            }
        });
    },

    createShipment: function(req, resp) {
        var self = this;
        self.log.debug('>> createShipment');
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        // self.checkPermission(req, self.sc.privs.MODIFY_PROMOTION, function(err, isAllowed) {
        //     if (isAllowed !== true) {
        //         return self.send403(resp);
        //     } else {
                var shipmentObj = req.body;
                var shipment = new $$.m.Shipment(shipmentObj);
                var modified = {
                    date: new Date(),
                    by: userId
                };
                var created = {
                    date: new Date(),
                    by: userId
                };

                shipment.set('modified', modified);
                shipment.set('created', created);
                shipment.set("accountId", accountId);
                shipment.set("userId", userId);

                if(shipmentObj.shipDate){                    
                    shipment.set("shipDate", moment(shipmentObj.shipDate).toDate());
                }
                if(shipmentObj.configDate){
                    shipment.set("configDate", moment(shipmentObj.configDate).toDate());
                }
                if(shipmentObj.deployDate){                    
                    shipment.set("deployDate", moment(shipmentObj.deployDate).toDate());
                }
                if(shipmentObj.endDate){
                    shipment.set("endDate", moment(shipmentObj.endDate).toDate());
                }

                promotionManager.saveOrUpdateShipment(accountId, userId, shipment, null, function(err, value){
                    self.log.debug(accountId, userId, '<< createShipment');
                    self.sendResultOrError(resp, err, value, "Error creating shipment");
                    self.createUserActivity(req, 'CREATE_SHIPMENT', null, null, function(){});
                });
        //     }
        // });
    },

    updateShipment: function(req, resp) {
        var self = this;
        self.log.debug('>> updateShipment');
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        var shipmentId = req.params.id;
        // self.checkPermission(req, self.sc.privs.MODIFY_PROMOTION, function(err, isAllowed) {
        //     if (isAllowed !== true) {
        //         return self.send403(resp);
        //     } else {
                var shipmentObj = req.body;
                var shipment = new $$.m.Shipment(shipmentObj);
                var modified = {
                    date: new Date(),
                    by: userId
                };
                
                shipment.set('modified', modified);

                if(shipmentObj.shipDate){                    
                    shipment.set("shipDate", moment(shipmentObj.shipDate).toDate());
                }
                else{
                    shipment.set("shipDate", null);
                }
                if(shipmentObj.configDate){
                    shipment.set("configDate", moment(shipmentObj.configDate).toDate());
                }
                else{
                    shipment.set("configDate", null);
                }
                if(shipmentObj.deployDate){                    
                    shipment.set("deployDate", moment(shipmentObj.deployDate).toDate());
                }
                else{
                    shipment.set("deployDate", null);
                }
                if(shipmentObj.endDate){
                    shipment.set("endDate", moment(shipmentObj.endDate).toDate());
                }
                else{
                    shipment.set("endDate", null);
                }

                promotionManager.saveOrUpdateShipment(accountId, userId, shipment, shipmentId, function(err, value){
                    self.log.debug(accountId, userId, '<< updateShipment');
                    self.sendResultOrError(resp, err, value, "Error updating shipment");
                    self.createUserActivity(req, 'UPDATE_SHIPMENT', null, null, function(){});
                });
        //     }
        // });
    },

    updateShipmentAttachment: function(req, res) {
        var self = this;
        self.log.debug('>> updateShipmentAttachment');
        var form = new formidable.IncomingForm();
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        var shipmentId = req.params.id;
        form.parse(req, function(err, fields, files) {
            if(err) {
                self.wrapError(res, 500, 'fail', 'The upload failed', err);
                self = null;
                return;
            } else {

                var file = files['file'];
                console.log(file);

                var fileToUpload = {};
                fileToUpload.mimeType = file.type;
                fileToUpload.size = file.size;
                fileToUpload.name = file.name;
                fileToUpload.path = file.path;
                fileToUpload.type = file.type;
                promotionManager.updateShipmentAttachment(fileToUpload, shipmentId, accountId, userId, function(err, value, file){                                                       
                    self.log.debug('>> updateShipmentAttachment');
                    self.sendResultOrError(res, err, value, 'Could not update shipment attachment');                    
                });
            }
        });
    },

    listShipments: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        var promotionId = req.params.promotionId;
        self.log.debug(accountId, userId, '>> listShipments');
        self._checkAccess(accountId, userId, 'promotions', function(err, isAllowed){
            if(!isAllowed) {
                self.log.debug(accountId, userId, '<< promotions [' + isAllowed + ']');
                return self.sendResultOrError(resp, err, [], "Error listing shipments");
            } else {
                self.log.debug(accountId, userId, '>> listShipments');
                     
                self._checkUserRole(req, function(err, userObj){
                    var _isAdmin = false;
                    var _isVendor = false;
                    var _isVAR = false;
                    var _isSecurematics = false;
                    if(userObj){
                        _isAdmin = _.contains(userObj.getPermissionsForAccount(accountId), 'admin');
                        _isVendor = _.contains(userObj.getPermissionsForAccount(accountId), 'vendor-restricted');
                        _isVAR = _.contains(userObj.getPermissionsForAccount(accountId), 'vendor');
                        _isSecurematics = _.contains(userObj.getPermissionsForAccount(accountId), 'securematics');
                    }
                    if(_isAdmin || _isSecurematics) {
                        promotionManager.listShipments(accountId, userId, promotionId, [], function(err, list){
                            self.log.debug(accountId, userId, '<< listShipments');
                            return self.sendResultOrError(resp, err, list, "Error listing shipments");
                        });
                    }
                    else{
                        if(_isVendor){
                            promotionManager.listShipments(accountId, userId, promotionId, [], function(err, list){
                                self.log.debug(accountId, userId, '<< listShipments');
                                return self.sendResultOrError(resp, err, list, "Error listing shipments");
                            });
                        }
                        else{
                            self._getOrgConfig(accountId, userId, function(err, orgConfig){
                                if(!orgConfig) {
                                    orgConfig = {};
                                }
                                var cardCodes = orgConfig.cardCodes || [];
                                if(cardCodes.length){
                                    cardCodes = _.map(cardCodes, function(code){return code.toLowerCase()});
                                    promotionManager.listShipments(accountId, userId, promotionId, cardCodes, function(err, list){
                                        self.log.debug(accountId, userId, '<< listShipments');
                                        return self.sendResultOrError(resp, err, list, "Error listing shipments");
                                    });
                                }
                            });
                        }
                    }
                }) 
            }
        })
        
    },

    exportShipments: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        var promotionId = req.params.promotionId;
        self.log.debug(accountId, userId, '>> exportShipments');
        self._checkAccess(accountId, userId, 'promotions', function(err, isAllowed){
            if(!isAllowed) {
                self.log.debug(accountId, userId, '<< promotions [' + isAllowed + ']');
                return self.sendResultOrError(resp, err, [], "Error listing shipments");
            } else {
                self.log.debug(accountId, userId, '>> exportShipments');
                     
                self._checkUserRole(req, function(err, userObj){
                    var _isAdmin = false;
                    var _isVendor = false;
                    var _isVAR = false;
                    var _isSecurematics = false;
                    if(userObj){
                        _isAdmin = _.contains(userObj.getPermissionsForAccount(accountId), 'admin');
                        _isVendor = _.contains(userObj.getPermissionsForAccount(accountId), 'vendor-restricted');
                        _isVAR = _.contains(userObj.getPermissionsForAccount(accountId), 'vendor');
                        _isSecurematics = _.contains(userObj.getPermissionsForAccount(accountId), 'securematics');
                    }
                    if(_isAdmin || _isSecurematics) {
                        promotionManager.exportShipments(accountId, userId, promotionId, [], function(err, list){
                            self.log.debug(accountId, userId, '<< exportShipments');
                            self._exportToCSV(req, resp, list);
                        });
                    }
                    else{
                        if(_isVendor){
                            promotionManager.exportShipments(accountId, userId, promotionId, [], function(err, list){
                                self.log.debug(accountId, userId, '<< exportShipments');
                                self._exportToCSV(req, resp, list);
                            });
                        }
                        else{
                            self._getOrgConfig(accountId, userId, function(err, orgConfig){
                                if(!orgConfig) {
                                    orgConfig = {};
                                }
                                var cardCodes = orgConfig.cardCodes || [];
                                if(cardCodes.length){
                                    cardCodes = _.map(cardCodes, function(code){return code.toLowerCase()});
                                    promotionManager.exportShipments(accountId, userId, promotionId, cardCodes, function(err, list){
                                        self.log.debug(accountId, userId, '<< exportShipments');
                                        self._exportToCSV(req, resp, list);
                                    });
                                }
                            });
                        }
                    }
                }) 
            }
        })
        
    },

    deleteShipment: function(req, resp) {
        var self = this;
        self.log.debug('>> deleteShipment');
        var shipmentId = req.params.id;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        // self.checkPermission(req, self.sc.privs.MODIFY_PROMOTION, function(err, isAllowed) {
        //     if (isAllowed !== true) {
        //         return self.send403(resp);
        //     } else {
                promotionManager.deleteShipment(accountId, userId, shipmentId, function(err, value){
                    if(err) {
                        self.wrapError(resp, 500, err, "Error deleting shipment");
                    } else {
                        self.log.debug('<< deleteShipment');
                        self.send200(resp);
                        self.createUserActivity(req, 'DELETE_SHIPMENT', null, null, function(){});
                    }
                });
        //     }
        // });
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

    _checkUserRole: function(req, fn) {
        var self = this;
        var userId = self.userId(req);
        var accountId = parseInt(self.accountId(req));
        userManager.getUserById(userId, function(err, user){
            fn(null, user);
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
    },

    _exportToCSV: function(req, resp, csv){
        var self = this;
        resp.set('Content-Type', 'text/csv');
        resp.set("Content-Disposition", "attachment;filename=csv.csv");
        self.sendResult(resp, csv);
    }

});

module.exports = new api({version:'2.0'});

