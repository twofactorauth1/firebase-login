/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var orderManager = require('../../orders/order_manager');
var appConfig = require('../../configs/app.config');
//TODO: refactor getAccessToken into base.api
var paymentsAPI = require('./integrations/payments.api');


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

    },

    createOrder: function(req, res) {
        var self = this;
        self.log.debug('>> createOrder');

        var order = new $$.m.Order(req.body);
        var accessToken = paymentsAPI._getAccessToken(req);
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
        //TODO: security

        orderManager.getOrderById(orderId, function(err, order){
            self.log.debug('<< getOrder');
            self.sendResultOrError(res, err, order, 'Error creating order');
        });
    },

    listOrders: function(req, res) {
        var self = this;
        self.log.debug('>> listOrders');
        var accountId = parseInt(self.accountId(req));

        orderManager.listOrdersByAccount(accountId, function(err, orders){
            self.log.debug('<< listOrders');
            self.sendResultOrError(res, err, orders, 'Error listing orders');
        });
    }
});

module.exports = new api();
