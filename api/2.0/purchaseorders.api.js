/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api.js');
var poDao = require('../../purchaseorders/dao/purchase_order.dao');
var poManager = require('../../purchaseorders/purchase_order_manager');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "purchaseorders",

    version: "2.0",

    dao: poDao,

    initialize: function () {

        app.get(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.listPurchaseOrders.bind(this));       

    },

    listPurchaseOrders: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '<< listPurchaseOrders');

        poManager.listPurchaseOrders(accountId, userId, function(err, list){
            self.log.debug(accountId, userId, '<< listPurchaseOrders');
            return self.sendResultOrError(resp, err, list, "Error listing orders");
        });
    }

});

module.exports = new api({version:'2.0'});

