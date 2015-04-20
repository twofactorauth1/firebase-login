/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var orderManager = require('../../orders/order_manager');
var appConfig = require('../../configs/app.config');



var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "orders",

    log: $$.g.getLogger("orders.api"),

    initialize: function () {
        app.get(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.listOrders.bind(this));
        app.get(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.getOrder.bind(this));
        app.post(this.url(''), this.setup.bind(this), this.createOrder.bind(this));
        app.post(this.url(':id/complete'), this.isAuthAndSubscribedApi.bind(this), this.completeOrder.bind(this));
        app.post(this.url(':id/cancel'), this.isAuthAndSubscribedApi.bind(this), this.cancelOrder.bind(this));
        app.post(this.url(':id/refund'), this.isAuthAndSubscribedApi.bind(this), this.refundOrder.bind(this));
        app.post(this.url(':id/hold'), this.isAuthAndSubscribedApi.bind(this), this.holdOrder.bind(this));

        app.post(this.url(':id/note'), this.isAuthAndSubscribedApi.bind(this), this.addOrderNote.bind(this));
    },

    createOrder: function(req, res) {
        var self = this;
        self.log.debug('>> createOrder');

        var order = new $$.m.Order(req.body);
        var accessToken = self.getAccessToken(req);
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        order.set('account_id', accountId);

        //No security

        orderManager.createOrder(order, accessToken, userId, function(err, order){
            self.log.debug('<< createOrder');
            self.sendResultOrError(res, err, order, 'Error creating order');
        });

    },

    getOrder: function(req, res) {
        var self = this;
        self.log.debug('>> getOrder');

        var orderId = req.params.id;
        self.checkPermission(req, self.sc.privs.VIEW_ORDER, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                orderManager.getOrderById(orderId, function(err, order){
                    self.log.debug('<< getOrder');
                    self.sendResultOrError(res, err, order, 'Error creating order');
                });
            }
        });


    },

    listOrders: function(req, res) {
        var self = this;
        self.log.debug('>> listOrders');
        var accountId = parseInt(self.accountId(req));

        self.checkPermission(req, self.sc.privs.VIEW_ORDER, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                orderManager.listOrdersByAccount(accountId, function(err, orders){
                    self.log.debug('<< listOrders');
                    self.sendResultOrError(res, err, orders, 'Error listing orders');
                });
            }
        });

    },

    completeOrder: function(req, res) {
        var self = this;
        self.log.debug('>> completeOrder');
        var accountId = parseInt(self.accountId(req));
        var orderId = req.params.id;
        var note = req.body.note;
        var userId = self.userId(req);

        self.checkPermission(req, self.sc.privs.MODIFY_ORDER, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                orderManager.completeOrder(accountId, orderId, note, userId, function(err, order){
                    self.log.debug('<< completeOrder');
                    self.sendResultOrError(res, err, order, 'Error completing order');
                });
            }
        });


    },

    cancelOrder: function(req, res) {
        var self = this;
        self.log.debug('>> cancelOrder');
        var accountId = parseInt(self.accountId(req));
        var orderId = req.params.id;
        var note = req.body.note;
        var userId = self.userId(req);

        self.checkPermission(req, self.sc.privs.MODIFY_ORDER, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                orderManager.cancelOrder(accountId, orderId, note, userId, function(err, order){
                    self.log.debug('<< cancelOrder');
                    self.sendResultOrError(res, err, order, 'Error cancelling order');
                });
            }
        });
    },

    refundOrder: function(req, res) {
        var self = this;
        self.log.debug('>> refundOrder');
        var accountId = parseInt(self.accountId(req));
        var orderId = req.params.id;

        self.checkPermission(req, self.sc.privs.MODIFY_ORDER, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var note = req.body.note;
                var userId = self.userId(req);
                var amount = req.body.amount;
                var reason = req.body.reason;
                var accessToken = self.getAccessToken(req);
                orderManager.refundOrder(accountId, orderId, note, userId, amount, reason, accessToken, function(err, order){
                    self.log.debug('<< refundOrder');
                    self.sendResultOrError(res, err, order, 'Error refunding order');
                });
            }
        });

    },

    holdOrder: function(req, res) {
        var self = this;
        self.log.debug('>> holdOrder');
        var accountId = parseInt(self.accountId(req));
        var orderId = req.params.id;
        var note = req.body.note;
        var userId = self.userId(req);

        self.checkPermission(req, self.sc.privs.MODIFY_ORDER, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                orderManager.holdOrder(accountId, orderId, note, userId, function(err, order){
                    self.log.debug('<< holdOrder');
                    self.sendResultOrError(res, err, order, 'Error holding order');
                });
            }
        });
    },

    addOrderNote: function(req, res) {
        var self = this;
        self.log.debug('>> addOrderNote');
        var accountId = parseInt(self.accountId(req));
        var orderId = req.params.id;
        var note = req.body.note;
        var userId = self.userId(req);

        self.checkPermission(req, self.sc.privs.MODIFY_ORDER, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                orderManager.addOrderNote(accountId, orderId, note, userId, function(err, order){
                    self.log.debug('<< addOrderNote');
                    self.sendResultOrError(res, err, order, 'Error adding order note');
                });
            }
        });


    }
});

module.exports = new api();
