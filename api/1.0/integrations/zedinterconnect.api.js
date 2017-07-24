/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../../base.api.js');
var appConfig = require('../../../configs/app.config');
var ziDao = require('../../../zedinterconnect/dao/zi.dao');
var manager = require('../../../zedinterconnect/zi_manager');
var userManager = require('../../../dao/user.manager');
var orgManager = require('../../../organizations/organization_manager');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "integrations/zi",

    dao: ziDao,

    initialize: function () {
        app.get(this.url('demo'), this.isAuthAndSubscribedApi.bind(this), this.demo.bind(this));
        app.get(this.url('inventory'), this.isAuthAndSubscribedApi.bind(this), this.inventory.bind(this));
        app.get(this.url('inventory/filter'), this.isAuthAndSubscribedApi.bind(this), this.inventoryFilter.bind(this));
        app.get(this.url('inventory/search'), this.isAuthAndSubscribedApi.bind(this), this.inventorySearch.bind(this));

        app.get(this.url('inventory/:id'), this.isAuthAndSubscribedApi.bind(this), this.inventoryItem.bind(this));
        app.get(this.url('inventory/name/:id'), this.isAuthAndSubscribedApi.bind(this), this.inventoryItemByName.bind(this));

        app.get(this.url('loadinventory'), this.isAuthAndSubscribedApi.bind(this), this.loadinventory.bind(this));
        app.get(this.url('ledger'), this.isAuthAndSubscribedApi.bind(this), this.ledger.bind(this));
        app.get(this.url('ledger/top'), this.isAuthAndSubscribedApi.bind(this), this.getTopInvoices.bind(this));
        app.get(this.url('ledger/:id'), this.isAuthAndSubscribedApi.bind(this), this.ledgerItem.bind(this));
        app.get(this.url('customers'), this.isAuthAndSubscribedApi.bind(this), this.getCustomers.bind(this));
        app.get(this.url('customer/:id'), this.isAuthAndSubscribedApi.bind(this), this.customerItem.bind(this));
        app.get(this.url('dashboard/inventory'), this.isAuthAndSubscribedApi.bind(this), this.getDashboardInventory.bind(this));
        app.get(this.url('loadcustomer'), this.isAuthAndSubscribedApi.bind(this), this.loadcustomer.bind(this));
        app.get(this.url('loadledger'), this.isAuthAndSubscribedApi.bind(this), this.loadledger.bind(this));
        app.get(this.url('invoices/:id'), this.isAuthAndSubscribedApi.bind(this), this.getCustomerInvoices.bind(this));
        app.get(this.url('customers/filter'), this.isAuthAndSubscribedApi.bind(this), this.customersFilter.bind(this));
        app.get(this.url('inventory/products/search'), this.isAuthAndSubscribedApi.bind(this), this.productSearch.bind(this));
        app.get(this.url('vendors'), this.isAuthAndSubscribedApi.bind(this), this.listVendors.bind(this));
        app.get(this.url('promotions/participants/search'), this.isAuthAndSubscribedApi.bind(this), this.participantSearch.bind(this));
        app.post(this.url('inventory/useractivity'), this.isAuthAndSubscribedApi.bind(this), this.createActivity.bind(this));
        app.get(this.url('vars/exists'), this.isAuthAndSubscribedApi.bind(this), this.customerExists.bind(this));
        app.get(this.url('customer/:id/export/csv'), this.isAuthAndSubscribedApi.bind(this), this.exportCustomerStatement.bind(this));
    },

    demo: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> demo');
        manager.demo(accountId, userId, function(err, value){
            self.log.debug('<< demo');
            return self.sendResultOrError(resp, err, value, "Error calling demo");
        });
    },

    inventory: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> inventory');
        var skip = parseInt(req.query.skip) || 0;
        var limit = parseInt(req.query.limit) || 0;
        var sortBy = req.query.sortBy || null;
        var sortDir = parseInt(req.query.sortDir) || null;

        self._checkAccess(accountId, userId, 'inventory', function(err, isAllowed){
            if(isAllowed) {
                manager.cachedInventory(accountId, userId, skip, limit, sortBy, sortDir, function(err, value){
                    self.log.debug(accountId, userId, '<< inventory');
                    return self.sendResultOrError(resp, err, value, "Error calling inventory");
                });
            } else {
                var value = {
                    "skip": null,
                    "limit": null,
                    "total": 0,
                    "results": []
                };
                self.log.debug(accountId, userId, '<< inventory [' + isAllowed + ']');
                return self.sendResultOrError(resp, err, value, "Error calling inventory");
            }
        });


    },

    getDashboardInventory: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getDashboardInventory');
        var skip = null;
        var limit = null;
        var sortBy = null;
        var sortDir = null;


        self._checkAccess(accountId, userId, 'inventory', function(err, isAllowed){
            if(isAllowed) {
                manager.getDashboardInventory(accountId, userId, function(err, value){
                    self.log.debug(accountId, userId, '<< getDashboardInventory');
                    return self.sendResultOrError(resp, err, value, "Error calling getDashboardInventory");
                });
            } else {
                self.log.debug(accountId, userId, '<< getDashboardInventory [' + isAllowed + ']');
                var value = {
                    "skip": null,
                    "limit": null,
                    "total": 0,
                    "results": []
                };
                return self.sendResultOrError(resp, err, value, "Error calling getDashboardInventory");
            }
        });


    },

    inventoryItem: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> inventoryItem');
        var itemId = req.params.id;
        //TODO: security
        manager.getInventoryItem(accountId, userId, itemId, function(err, value){
            self.log.debug(accountId, userId, '<< inventory');
            var note = "Product Name: " + value.OITM_ItemName;
            self.createUserActivity(req, 'INV_DETAIL', note, null, function(){});
            return self.sendResultOrError(resp, err, value, "Error calling inventory");
        });
    },

    inventoryItemByName: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> inventoryItemByName');
        var name = req.params.id;
        //TODO: security
        manager.getInventoryItemByName(accountId, userId, name, function(err, value){
            self.log.debug(accountId, userId, '<< inventory');
            var note = "Product Name: " + value.OITM_ItemName;
            self.createUserActivity(req, 'INV_DETAIL', note, null, function(){});
            return self.sendResultOrError(resp, err, value, "Error calling inventory");
        });
    },

    inventoryFilter: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> inventoryFilter');
        var skip = parseInt(req.query.skip) || 0;
        var limit = parseInt(req.query.limit) || 0;
        var sortBy = req.query.sortBy || null;
        var sortDir = parseInt(req.query.sortDir) || null;
        var query = req.query;

        /*
         * Search across all (or a subset) of fields for the same value if "term" is a query param.  Otherwise, use filter
         */
        if(req.query.term) {
            var term = req.query.term;
            var fieldNames = null;
            if(req.query.fieldNames) {
                fieldNames = req.query.fieldNames.split(',');
            }
            //TODO: security
            manager.inventorySearch(accountId, userId, term, null, skip, limit, sortBy, sortDir, function(err, value){
                self.log.debug(accountId, userId, '<< inventorySearch');
                var note = "Search: " + req.query.term;
                self.createUserActivity(req, 'INV_SEARCH', note, null, function(){});
                return self.sendResultOrError(resp, err, value, "Error searching inventory");
            });
        } else {
            delete req.query.skip;
            delete req.query.limit;
            delete req.query.sortBy;
            delete req.query.sortDir;
            //TODO: security
            manager.inventoryFilter(accountId, userId, query, skip, limit, sortBy, sortDir, function(err, value){
                self.log.debug(accountId, userId, '<< inventoryFilter');

                return self.sendResultOrError(resp, err, value, "Error searching inventory");

            });
        }

    },


    inventorySearch: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> inventorySearch');
        var skip = parseInt(req.query.skip) || 0;
        var limit = parseInt(req.query.limit) || 0;
        var sortBy = req.query.sortBy || null;
        var sortDir = parseInt(req.query.sortDir) || null;
        var fieldSearch = req.query;

        var fieldSearch = req.query;
        delete fieldSearch.term;
        delete fieldSearch.skip;
        delete fieldSearch.limit;
        delete fieldSearch.sortBy;
        delete fieldSearch.sortDir;
        var term = req.query.term;
        /*
         * Search across the fields
         */


        //TODO: security
        manager.inventorySearch(accountId, userId, term, fieldSearch, skip, limit, sortBy, sortDir, function(err, value){
            self.log.debug(accountId, userId, '<< inventorySearch');
            var note = "Search: ";
            if(term){
                note += JSON.stringify(fieldSearch) + ", ";
            }
            note += JSON.stringify(fieldSearch);
            self.createUserActivity(req, 'INV_SEARCH', note, null, function(){});
            return self.sendResultOrError(resp, err, value, "Error searching inventory");

        });
    },

    loadinventory: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> loadinventory');
        //TODO: security
        manager.loadInventoryCollection(function(err, value){
            self.log.debug('<< loadinventory');
        });
        return self.send200(resp);
    },

    ledger: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> ledger');

        var dateString = req.query.date || moment().format("M/DD/YY");

        self._checkAccess(accountId, userId, 'ledger', function(err, isAllowed){
            if(!isAllowed) {
                self.log.debug(accountId, userId, '<< ledger [' + isAllowed + ']');
                return self.sendResultOrError(resp, err, [], "Error calling aging");
            } else {
                self._isUserAdmin(req, function(err, isAdmin){
                    if(isAdmin && isAdmin === true) {
                        //ALL the CardCodes or whatever is passed in
                        var cardCodeAry = [];
                        if(req.query.cardCodeFrom && req.query.cardCodeTo) {
                            //we have to do the range
                            var cardCodeFrom = req.query.cardCodeFrom || 'C1002221';
                            var cardCodeTo = req.query.cardCodeTo || 'C1002221';
                            manager.getLedger(accountId, userId, cardCodeFrom, cardCodeTo, dateString, function(err, value){
                                self.log.debug(accountId, userId, '<< ledger');
                                return self.sendResultOrError(resp, err, value, "Error calling aging");
                            });
                        }
                        else{
                            if(req.query.cardCodeFrom) {
                                cardCodeAry.push(req.query.cardCodeFrom);
                            } else if(req.query.cardCodeTo) {
                                cardCodeAry.push(req.query.cardCodeTo);
                            }
                            manager.getLedgerWithLimit(accountId, userId, cardCodeAry, dateString, 0, function(err, value){
                                self.log.debug(accountId, userId, '<< ledger');
                                return self.sendResultOrError(resp, err, value, "Error calling aging");
                            });
                        }

                    } else {
                        //Only the codes in the user prop or whatever is passed in IF it is in the user prop
                        self._getOrgConfig(accountId, userId, function(err, orgConfig){
                            if(!orgConfig) {
                                orgConfig = {};
                            }
                            var cardCodes = orgConfig.cardCodes || [];
                            if(cardCodes && cardCodes.length > 0) {
                                cardCodes = _.map(cardCodes, function(code){return code.toLowerCase()});
                                if(req.query.cardCodeFrom && req.query.cardCodeTo) {
                                    //we have to do the range
                                    var cardCodeFrom = req.query.cardCodeFrom;
                                    var cardCodeTo = req.query.cardCodeTo;

                                    if(_.contains(cardCodes, cardCodeFrom.toLowerCase()) && _.contains(cardCodes, cardCodeTo.toLowerCase())){
                                        manager.getLedger(accountId, userId, cardCodeFrom, cardCodeTo, dateString, function(err, value){
                                            self.log.debug(accountId, userId, '<< ledger');
                                            return self.sendResultOrError(resp, err, value, "Error calling aging");
                                        });
                                    }
                                    else{
                                        return self.wrapError(resp, 400, 'Bad Request', 'User does not have any matching cardCodes');
                                    }

                                } else {
                                    var cardCodeAry = [];
                                    var addAll = true;
                                    if(req.query.cardCodeFrom) {
                                        addAll = false;
                                        if(_.contains(cardCodes, req.query.cardCodeFrom.toLowerCase())) {
                                            cardCodeAry.push(req.query.cardCodeFrom);
                                        }
                                    }
                                    if(req.query.cardCodeTo) {
                                        addAll = false;
                                        if(_.contains(cardCodes, req.query.cardCodeTo.toLowerCase())) {
                                            cardCodeAry.push(req.query.cardCodeTo);
                                        }
                                    }
                                    if(addAll === true){
                                        cardCodeAry = cardCodes;
                                    }
                                    manager.getLedgerWithLimit(accountId, userId, cardCodeAry, dateString, 0, function(err, value){
                                        self.log.debug(accountId, userId, '<< ledger');
                                        return self.sendResultOrError(resp, err, value, "Error calling aging");
                                    });
                                }

                            } else {
                                return self.wrapError(resp, 400, 'Bad Request', 'User does not have any cardCodes');
                            }
                        });
                    }
                });
            }
        });


    },

    getTopInvoices: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getTopInvoices');
        var dateString = moment().format("M/DD/YY");
        var limit = 5;
        if(req.query.limit) {
            limit = parseInt(req.query.limit);
        }

        var cardCodeAry = [];
        self._isUserAdminOrSecurematics(req, function(err, isAdmin){
            if(isAdmin && isAdmin === true) {
                manager.getLedgerWithLimit(accountId, userId, cardCodeAry, dateString, limit, function(err, value){
                    self.log.debug(accountId, userId, '<< getTopInvoices');
                    return self.sendResultOrError(resp, err, value, "Error calling aging");
                });
            } else {
                self._getOrgConfig(accountId, userId, function(err, orgConfig){
                    if(!orgConfig) {
                        orgConfig = {};
                    }
                    var cardCodes = orgConfig.cardCodes || [];
                    if(cardCodes.length){
                        cardCodes = _.map(cardCodes, function(code){return code.toLowerCase()});
                        manager.getLedgerWithLimit(accountId, userId, cardCodes, dateString, limit, function(err, value){
                            self.log.debug(accountId, userId, '<< getTopInvoices');
                            return self.sendResultOrError(resp, err, value, "Error calling aging");
                        });
                    }
                    else{
                        return self.sendResultOrError(resp, null, [], "Error calling aging");
                    }
                   
                });
            }
        });
    },

    getCustomers: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getCustomers');
        var skip = parseInt(req.query.skip) || 0;
        var limit = parseInt(req.query.limit) || 0;
        var sortBy = req.query.sortBy || null;
        var sortDir = parseInt(req.query.sortDir) || null;
        var term = req.query.term || null;

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
                manager.getCustomers(accountId, userId, ['admin'], skip, limit, sortBy, sortDir, term, null, function(err, value){
                    self.log.debug(accountId, userId, '<< getCustomers');
                    return self.sendResultOrError(resp, err, value, "Error listing customers");
                });
            } else {
                if(_isVAR){
                    self._getOrgConfig(accountId, userId, function(err, orgConfig){
                        if(!orgConfig){
                            orgConfig = {};
                        }
                        var cardCodes = orgConfig.cardCodes || [];
                        if(cardCodes.length){
                            manager.getCustomers(accountId, userId, cardCodes, skip, limit, sortBy, sortDir, term, null, function(err, value){
                                self.log.debug(accountId, userId, '<< getCustomers');
                                return self.sendResultOrError(resp, err, value, "Error listing customers");
                            });
                        }
                        else
                        {
                            return self.wrapError(resp, 400, 'Bad Request', 'User does not have any cardCodes');
                        }    
                    });
                }
                else{
                    return self.wrapError(resp, 400, 'Bad Request', 'User does not have permissions');
                }
                
            }
        });
    },

    customersFilter: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> customersFilter');
        var skip = parseInt(req.query.skip) || 0;
        var limit = parseInt(req.query.limit) || 0;
        var sortBy = req.query.sortBy || null;
        var sortDir = parseInt(req.query.sortDir) || null;
        var fieldSearch = req.query;

        var fieldSearch = req.query;
        delete fieldSearch.term;
        delete fieldSearch.skip;
        delete fieldSearch.limit;
        delete fieldSearch.sortBy;
        delete fieldSearch.sortDir;
        var term = req.query.term;

        self._isUserAdminOrSecurematics(req, function(err, isAdmin){
            if(isAdmin && isAdmin === true) {
                manager.getCustomers(accountId, userId, ['admin'], skip, limit, sortBy, sortDir, term, fieldSearch, function(err, value){
                    self.log.debug(accountId, userId, '<< customersFilter');
                    return self.sendResultOrError(resp, err, value, "Error listing customers");
                });
            } else {
                self._getOrgConfig(accountId, userId, function(err, orgConfig){
                    if(!orgConfig){
                        orgConfig = {};
                    }
                    var cardCodes = orgConfig.cardCodes || [];

                    manager.getCustomers(accountId, userId, cardCodes, skip, limit, sortBy, sortDir, term, fieldSearch, function(err, value){
                        self.log.debug(accountId, userId, '<< customersFilter');
                        return self.sendResultOrError(resp, err, value, "Error listing customers");
                    });
                });

            }
        });
    },

    loadcustomer: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> loadcustomer');
        //TODO: security
        manager.loadCustomerCollection(function(err, value){
            self.log.debug('<< loadcustomer');
        });
        return self.send200(resp);
    },

    loadledger: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> loadledger');
         var dateString = moment().format("M/DD/YY");
        //TODO: security
        manager.loadLedgerCollection(dateString, function(err, value){
            self.log.debug('<< loadledger');
        });
        return self.send200(resp);
    },

    ledgerItem: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> ledgerItem');
        var itemId = req.params.id;
        self._checkAccess(accountId, userId, 'ledger', function(err, isAllowed){
            if(!isAllowed) {
                self.log.debug(accountId, userId, '<< ledger [' + isAllowed + ']');
                return self.sendResultOrError(resp, err, [], "Error calling ledgerItem");
            } else {
                self._isUserAdminOrSecurematics(req, function(err, isAdmin){
                    if(isAdmin && isAdmin === true) {
                        manager.getLedgerItem(accountId, userId, itemId, function(err, value){
                            self.log.debug(accountId, userId, '<< ledgerItem');
                            return self.sendResultOrError(resp, err, value, "Error calling ledgerItem");
                        });
                    } else {
                        self._getOrgConfig(accountId, userId, function(err, orgConfig){
                            if(!orgConfig){
                                orgConfig = {};
                            }
                            var cardCodes = orgConfig.cardCodes || [];
                            cardCodes = _.map(cardCodes, function(code){return code.toLowerCase()});
                            if(_.contains(cardCodes, itemId.toLowerCase())){
                                manager.getLedgerItem(accountId, userId, itemId, function(err, value){
                                    self.log.debug(accountId, userId, '<< ledgerItem');
                                    return self.sendResultOrError(resp, err, value, "Error calling ledger");
                                });
                            }
                            else{
                                return self.wrapError(resp, 400, 'Bad Request', 'User does not have any matching cardCodes');
                            }
                        });
                    }
                });
            }
        })
    },


    exportCustomerStatement: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> exportCustomerStatement');
        var itemId = req.params.id;
        self._checkAccess(accountId, userId, 'ledger', function(err, isAllowed){
            if(!isAllowed) {
                self.log.debug(accountId, userId, '<< ledger [' + isAllowed + ']');
                return self.sendResultOrError(resp, err, [], "Error calling exportCustomerStatement");
            } else {
                self._isUserAdminOrSecurematics(req, function(err, isAdmin){
                    if(isAdmin && isAdmin === true) {
                        manager.exportCustomerStatement(accountId, userId, itemId, function(err, list){
                            self.log.debug(accountId, userId, '<< exportCustomerStatement');
                            self._exportToCSV(req, resp, list);
                        });
                    } else {
                        self._getOrgConfig(accountId, userId, function(err, orgConfig){
                            if(!orgConfig){
                                orgConfig = {};
                            }
                            var cardCodes = orgConfig.cardCodes || [];
                            cardCodes = _.map(cardCodes, function(code){return code.toLowerCase()});
                            if(_.contains(cardCodes, itemId.toLowerCase())){
                                manager.exportCustomerStatement(accountId, userId, itemId, function(err, list){
                                    self.log.debug(accountId, userId, '<< exportCustomerStatement');
                                    self._exportToCSV(req, resp, list);
                                });
                            }
                            else{
                                return self.wrapError(resp, 400, 'Bad Request', 'User does not have any matching cardCodes');
                            }
                        });
                    }
                });
            }
        })
    },

    customerItem: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> customerItem');
        var itemId = req.params.id;
        self._checkAccess(accountId, userId, 'ledger', function(err, isAllowed){
            if(!isAllowed) {
                self.log.debug(accountId, userId, '<< ledger [' + isAllowed + ']');
                return self.sendResultOrError(resp, err, [], "Error calling customerItem");
            } else {
                self._isUserAdminOrSecurematics(req, function(err, isAdmin){
                    if(isAdmin && isAdmin === true) {
                        manager.getCustomerItem(accountId, userId, itemId, function(err, value){
                            self.log.debug(accountId, userId, '<< customerItem');
                            return self.sendResultOrError(resp, err, value, "Error calling customerItem");
                        });
                    } else {
                        self._getOrgConfig(accountId, userId, function(err, orgConfig){
                            if(!orgConfig){
                                orgConfig = {};
                            }
                            var cardCodes = orgConfig.cardCodes || [];
                            cardCodes = _.map(cardCodes, function(code){return code.toLowerCase()});
                            if(_.contains(cardCodes, itemId.toLowerCase())){
                                manager.getCustomerItem(accountId, userId, itemId, function(err, value){
                                    self.log.debug(accountId, userId, '<< customerItem');
                                    return self.sendResultOrError(resp, err, value, "Error calling customerItem");
                                });
                            }
                            else{
                                return self.wrapError(resp, 400, 'Bad Request', 'User does not have any matching cardCodes');
                            }
                        });

                    }
                });
            }
        })
    },

    getCustomerInvoices: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getCustomerInvoices');
        var customerId = req.params.id;
        var transactionId = parseInt(req.query.transactionId);
        self._checkAccess(accountId, userId, 'ledger', function(err, isAllowed){
            if(!isAllowed) {
                self.log.debug(accountId, userId, '<< ledger [' + isAllowed + ']');
                return self.sendResultOrError(resp, err, [], "Error calling invoices");
            } else {
                self._isUserAdminOrSecurematics(req, function(err, isAdmin){
                    if(isAdmin && isAdmin === true) {
                        manager.getCustomerInvoices(accountId, userId, customerId, transactionId, function(err, value){
                            self.log.debug(accountId, userId, '<< getCustomerInvoices');
                            return self.sendResultOrError(resp, err, value, "Error calling invoices");
                        });
                    } else {
                        self._getOrgConfig(accountId, userId, function(err, orgConfig){
                            if(!orgConfig){
                                orgConfig = {};
                            }
                            var cardCodes = orgConfig.cardCodes || [];
                            cardCodes = _.map(cardCodes, function(code){return code.toLowerCase()});
                            if(_.contains(cardCodes, customerId.toLowerCase())){
                                manager.getCustomerInvoices(accountId, userId, customerId, transactionId, function(err, value){
                                    self.log.debug(accountId, userId, '<< getCustomerInvoices');
                                    return self.sendResultOrError(resp, err, value, "Error calling invoices");
                                });
                            }
                            else{
                                return self.wrapError(resp, 400, 'Bad Request', 'User does not have any matching cardCodes');
                            }
                        });
                    }
                });
            }
        })
    },

    productSearch: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> productSearch');
        var skip = parseInt(req.query.skip) || 0;
        var limit = parseInt(req.query.limit) || 0;
        var sortBy = req.query.sortBy || null;
        var sortDir = parseInt(req.query.sortDir) || null;
        var term = req.query.term;
        var filter = req.query.vendor;
        
        /*
         * Search across all (or a subset) of fields for the same value if "term" is a query param.  Otherwise, use filter
         */
        manager.productSearch(accountId, userId, term, skip, limit, sortBy, sortDir, filter, function(err, value){
            self.log.debug(accountId, userId, '<< productSearch');
            return self.sendResultOrError(resp, err, value, "Error searching products");
        });

    },

    listVendors: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> listVendors');
        manager.listVendors(accountId, userId, function(err, value){
            self.log.debug(accountId, userId, '<< listVendors');
            return self.sendResultOrError(resp, err, value, "Error listing vendors");
        });
    },

    participantSearch: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> participantSearch');
        var skip = parseInt(req.query.skip) || 0;
        var limit = parseInt(req.query.limit) || 0;
        var sortBy = req.query.sortBy || null;
        var sortDir = parseInt(req.query.sortDir) || null;
        var term = req.query.term;
        
        /*
         * Search across all (or a subset) of fields for the same value if "term" is a query param.  Otherwise, use filter
         */
        manager.participantSearch(accountId, userId, term, skip, limit, sortBy, sortDir, function(err, value){
            self.log.debug(accountId, userId, '<< participantSearch');
            return self.sendResultOrError(resp, err, value, "Error searching participants");
        });

    },

    customerExists: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> customerExists');
        
        var cardCodes = req.query.codes.split(",");
        console.log(cardCodes);
        cardCodes = _.map(cardCodes, function(code){return code.toLowerCase()});
        manager.customerExists(accountId, userId, cardCodes, function(err, list){
            self.log.debug(accountId, userId, '<< customerExists');
            return self.sendResultOrError(resp, err, list, "Error checking customers if exists");
        });
    },

    createActivity: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> createActivity');
        
        var activity = req.body;
        self.createUserActivity(req, activity.activityType, activity.note, null, function(){});
        self.send200(resp);
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

    _isUserAdminOrSecurematics: function(req, fn) {
        var self = this;
        var userId = self.userId(req);
        var accountId = parseInt(self.accountId(req));
        userManager.getUserById(userId, function(err, user){
            if(user && _.contains(user.getPermissionsForAccount(accountId), 'admin') || _.contains(user.getPermissionsForAccount(accountId), 'securematics')) {
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
    },

    _checkUserRole: function(req, fn) {
        var self = this;
        var userId = self.userId(req);
        var accountId = parseInt(self.accountId(req));
        userManager.getUserById(userId, function(err, user){
            fn(null, user);
        });
    },

    _exportToCSV: function(req, resp, csv){
        var self = this;
        resp.set('Content-Type', 'text/csv');
        resp.set("Content-Disposition", "attachment;filename=csv.csv");
        self.sendResult(resp, csv);
    }
});

return new api();
