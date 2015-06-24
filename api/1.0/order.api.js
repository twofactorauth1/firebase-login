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
        app.get(this.url('customer/:customerid'), this.isAuthAndSubscribedApi.bind(this), this.listOrdersByCustomer.bind(this));
        app.post(this.url(''), this.setup.bind(this), this.createOrder.bind(this));
        app.post(this.url(':id/update'), this.isAuthAndSubscribedApi.bind(this), this.updateOrder.bind(this));
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
        self.log.debug('>> Order Details '+ order);
        var accessToken = self.getAccessToken(req);
        var userId = self.userId(req);
        var accountId = self.currentAccountId(req);
        order.set('account_id', accountId);

        //No security

        orderManager.createOrder(order, accessToken, userId, function(err, order){
            self.log.debug('<< createOrder');
            self.sendResultOrError(res, err, order, 'Error creating order');
            if(userId && order) {
                self.createUserActivity(req, 'CREATE_ORDER', null, {id: order.id()}, function(){});
            }
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

    updateOrder: function(req, res) {
        var self = this;
        self.log.debug('>> updateOrder');
       
        console.dir(req.body);
        var order = new $$.m.Order(req.body.order);
        var orderId = req.params.id;
        order.set('_id', orderId);
        self.log.debug('>> Order', order);
        
        self.checkPermission(req, self.sc.privs.VIEW_ORDER, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                orderManager.updateOrderById(order, function(err, order){
                    self.log.debug('<< updateOrder');
                    self.sendResultOrError(res, err, order, 'Error updating order');
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

    listOrdersByCustomer: function(req, res) {
        var self = this;
        self.log.debug('>> listOrdersByCustomer');
        var accountId = parseInt(self.accountId(req));
        var customerId = parseInt(req.params.customerid);

        self.checkPermission(req, self.sc.privs.VIEW_ORDER, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                orderManager.listOrdersByCustomer(customerId, accountId, function(err, orders){
                    self.log.debug('<< listOrdersByCustomer');
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
                    self.createUserActivity(req, 'COMPLETE_ORDER', null, {id: order.id()}, function(){});
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
                    self.createUserActivity(req, 'CANCEL_ORDER', null, {id: orderId}, function(){});
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
                    self.createUserActivity(req, 'REFUND_ORDER', null, {id: orderId}, function(){});
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
                    self.createUserActivity(req, 'HOLD_ORDER', null, {id: orderId}, function(){});
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
                    self.createUserActivity(req, 'ADD_ORDER_NOTE', null, {id: orderId}, function(){});
                });
            }
        });


    }
});

module.exports = new api();
