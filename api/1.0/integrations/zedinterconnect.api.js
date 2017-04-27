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
        app.post(this.url('inventory/search'), this.isAuthAndSubscribedApi.bind(this), this.inventorySearch.bind(this));

        app.get(this.url('inventory/:id'), this.isAuthAndSubscribedApi.bind(this), this.inventoryItem.bind(this));
        app.get(this.url('inventory/name/:id'), this.isAuthAndSubscribedApi.bind(this), this.inventoryItemByName.bind(this));

        app.get(this.url('loadinventory'), this.isAuthAndSubscribedApi.bind(this), this.loadinventory.bind(this));
        app.get(this.url('ledger'), this.isAuthAndSubscribedApi.bind(this), this.ledger.bind(this));
        app.get(this.url('ledger/top'), this.isAuthAndSubscribedApi.bind(this), this.getTopInvoices.bind(this));

        app.get(this.url('customers'), this.isAuthAndSubscribedApi.bind(this), this.getCustomers.bind(this));
        app.get(this.url('dashboard/inventory'), this.isAuthAndSubscribedApi.bind(this), this.getDashboardInventory.bind(this));
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


        //TODO: security
        manager.cachedInventory(accountId, userId, skip, limit, sortBy, sortDir, function(err, value){
            self.log.debug(accountId, userId, '<< inventory');
            return self.sendResultOrError(resp, err, value, "Error calling inventory");
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


        //TODO: security
        manager.getDashboardInventory(accountId, userId, function(err, value){
            self.log.debug(accountId, userId, '<< getDashboardInventory');
            return self.sendResultOrError(resp, err, value, "Error calling getDashboardInventory");
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
        var fieldSearch = req.body;

        /*
         * Search across the fields
         */


        //TODO: security
        manager.inventorySearch(accountId, userId, null, fieldSearch, skip, limit, sortBy, sortDir, function(err, value){
            self.log.debug(accountId, userId, '<< inventorySearch');
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
                } else if(req.query.cardCodeFrom) {
                    cardCodeAry.push(req.query.cardCodeFrom);
                } else if(req.query.cardCodeTo) {
                    cardCodeAry.push(req.query.cardCodeTo);
                }
                manager.getLedgerWithLimit(accountId, userId, cardCodeAry, dateString, 0, function(err, value){
                    self.log.debug(accountId, userId, '<< ledger');
                    return self.sendResultOrError(resp, err, value, "Error calling aging");
                });
            } else {
                //Only the codes in the user prop or whatever is passed in IF it is in the user prop
                self.getUserProperty(userId, 'cardCodes', function(err, cardCodes){
                    if(cardCodes && cardCodes.length > 0) {
                        var cardCodeAry = [];
                        var addAll = true;
                        if(req.query.cardCodeFrom) {
                            addAll = false;
                            if(_.contains(cardCodes, req.query.cardCodeFrom)) {
                                cardCodeAry.push(req.query.cardCodeFrom);
                            }
                        }
                        if(req.query.cardCodeTo) {
                            addAll = false;
                            if(_.contains(cardCodes, req.query.cardCodeTo)) {
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
                    } else {
                        return self.wrapError(resp, 400, 'Bad Request', 'User does not have any cardCodes');
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
        self._isUserAdmin(req, function(err, isAdmin){
            if(isAdmin && isAdmin === true) {
                manager.getLedgerWithLimit(accountId, userId, cardCodeAry, dateString, limit, function(err, value){
                    self.log.debug(accountId, userId, '<< getTopInvoices');
                    return self.sendResultOrError(resp, err, value, "Error calling aging");
                });
            } else {
                self.getUserProperty(userId, 'cardCodes', function(err, cardCodes){
                    manager.getLedgerWithLimit(accountId, userId, cardCodes, dateString, limit, function(err, value){
                        self.log.debug(accountId, userId, '<< getTopInvoices');
                        return self.sendResultOrError(resp, err, value, "Error calling aging");
                    });
                });
            }
        });
    },

    getCustomers: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getCustomers');

        self._isUserAdmin(req, function(err, isAdmin){
            if(isAdmin && isAdmin === true) {
                manager.getCustomers(accountId, userId, ['admin'], function(err, value){
                    self.log.debug(accountId, userId, '<< getCustomers');
                    return self.sendResultOrError(resp, err, value, "Error listing customers");
                });
            } else {
                self.getUserProperty(userId, 'cardCodes', function(err, cardCodes){
                    manager.getCustomers(accountId, userId, cardCodes, function(err, value){
                        self.log.debug(accountId, userId, '<< getCustomers');
                        return self.sendResultOrError(resp, err, value, "Error listing customers");
                    });
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
    }
});

return new api();
