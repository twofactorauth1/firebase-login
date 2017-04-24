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
        var cardCodeFrom = req.query.cardCodeFrom || 'C1002221';
        var cardCodeTo = req.query.cardCodeTo || 'C1002221';
        self.getUserProperty(userId, 'cardCodes', function(err, cardCodes){
            if(cardCodes) {
                cardCodeFrom = cardCodes[0];
                cardCodeTo = cardCodes[0];
            }
            //TODO: security
            manager.getLedger(accountId, userId, cardCodeFrom, cardCodeTo, dateString, function(err, value){
                self.log.debug(accountId, userId, '<< ledger');
                return self.sendResultOrError(resp, err, value, "Error calling aging");
            });
        });



    },

    getCustomers: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getCustomers');

        //TODO: security
        manager.getCustomers(accountId, userId, function(err, value){
            self.log.debug(accountId, userId, '<< getCustomers');
            return self.sendResultOrError(resp, err, value, "Error listing customers");
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
