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

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "integrations/zi",

    dao: ziDao,



    initialize: function () {
        app.get(this.url('demo'), this.isAuthAndSubscribedApi.bind(this), this.demo.bind(this));
        app.get(this.url('inventory'), this.isAuthAndSubscribedApi.bind(this), this.inventory.bind(this));
        app.get(this.url('inventory/search'), this.isAuthAndSubscribedApi.bind(this), this.inventorySearch.bind(this));
        app.get(this.url('inventory/filter'), this.isAuthAndSubscribedApi.bind(this), this.inventoryFilter.bind(this));
        app.get(this.url('inventory/search/:field/:value'), this.isAuthAndSubscribedApi.bind(this), this.inventoryFieldSearch.bind(this));
        app.get(this.url('inventory/:id'), this.isAuthAndSubscribedApi.bind(this), this.inventoryItem.bind(this));
        app.get(this.url('loadinventory'), this.isAuthAndSubscribedApi.bind(this), this.loadinventory.bind(this));
        app.get(this.url('aging'), this.isAuthAndSubscribedApi.bind(this), this.aging.bind(this));
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
        self.log.debug('query:', query);
        //TODO: security
        manager.inventoryFilter(accountId, userId, query, skip, limit, sortBy, sortDir, function(err, value){
            self.log.debug(accountId, userId, '<< inventoryFilter');
            return self.sendResultOrError(resp, err, value, "Error searching inventory");
        });
    },

    inventorySearch: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> inventorySearch');
        var term = req.query.term;
        var fieldNames = null;
        if(req.query.fieldNames) {
            fieldNames = req.query.fieldNames.split(',');
        }
        var skip = parseInt(req.query.skip) || 0;
        var limit = parseInt(req.query.limit) || 0;
        var sortBy = req.query.sortBy || null;
        var sortDir = parseInt(req.query.sortDir) || null;
        //TODO: security
        manager.inventorySearch(accountId, userId, term, fieldNames, skip, limit, sortBy, sortDir, function(err, value){
            self.log.debug(accountId, userId, '<< inventorySearch');
            return self.sendResultOrError(resp, err, value, "Error searching inventory");
        });
    },

    inventoryFieldSearch: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> inventoryFieldSearch');
        var field = req.params.field;
        var value = req.params.value;
        var skip = parseInt(req.query.skip) || 0;
        var limit = parseInt(req.query.limit) || 0;
        var sortBy = req.query.sortBy || null;
        var sortDir = parseInt(req.query.sortDir) || null;
        //TODO: security
        manager.inventoryFieldSearch(accountId, userId, field, value, skip, limit, sortBy, sortDir, function(err, list){
            self.log.debug(accountId, userId, '<< inventorySearch');
            return self.sendResultOrError(resp, err, list, "Error searching inventory");
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

    aging: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> aging');

        var dateString = req.query.date || '3/27/17';
        var cardCodeFrom = req.query.cardCodeFrom || 'C101291';
        var cardCodeTo = req.query.cardCodeTo || 'C101291';
        //TODO: security
        manager.aging(accountId, userId, cardCodeFrom, cardCodeTo, dateString, function(err, value){
            self.log.debug('<< aging');
            return self.sendResultOrError(resp, err, value, "Error calling aging");
        });

    }
});

return new api();