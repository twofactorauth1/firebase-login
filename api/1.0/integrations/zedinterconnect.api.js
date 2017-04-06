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
        manager.inventory(accountId, userId, function(err, value){
            self.log.debug('<< inventory');
            return self.sendResultOrError(resp, err, value, "Error calling inventory");
        });
    },

    loadinventory: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> loadinventory');
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
        manager.aging(accountId, userId, cardCodeFrom, cardCodeTo, dateString, function(err, value){
            self.log.debug('<< aging');
            return self.sendResultOrError(resp, err, value, "Error calling aging");
        });

    }
});

return new api();