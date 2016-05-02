/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var async = require('async');
var orderManager = require('../../orders/order_manager');
var appConfig = require('../../configs/app.config');
var dao = require('../../orders/dao/order.dao');
var emailDao = require('../../cms/dao/email.dao');
var emailMessageManager = require('../../emailmessages/emailMessageManager');
var productManager = require('../../products/product_manager');


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
        app.post(this.url('payment/paypal'), this.setup.bind(this), this.createPaypalOrder.bind(this));
        app.post(this.url(':id/update'), this.isAuthAndSubscribedApi.bind(this), this.updateOrder.bind(this));
        app.post(this.url(':id/complete'), this.isAuthAndSubscribedApi.bind(this), this.completeOrder.bind(this));
        app.post(this.url(':id/cancel'), this.isAuthAndSubscribedApi.bind(this), this.cancelOrder.bind(this));
        app.post(this.url(':id/refund'), this.isAuthAndSubscribedApi.bind(this), this.refundOrder.bind(this));
        app.post(this.url(':id/hold'), this.isAuthAndSubscribedApi.bind(this), this.holdOrder.bind(this));

        app.post(this.url(':id/note'), this.isAuthAndSubscribedApi.bind(this), this.addOrderNote.bind(this));
        app.post(this.url(':id/paid'), this.setup.bind(this), this.orderPaymentComplete.bind(this));

        app.delete(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.deleteOrder.bind(this));
    },

    createOrder: function(req, res) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.currentAccountId(req);
        self.log.debug(accountId, userId, '>> createOrder');

        var order = new $$.m.Order(req.body);
        self.log.debug(accountId, userId, '>> Order Details '+ order);
        self.getStripeTokenFromUnAuthenticatedAccount(req, function(err, accessToken){

            order.set('account_id', accountId);

            //No security

            orderManager.createOrder(order, accessToken, userId, function(err, order){
                self.log.debug(accountId, userId, '<< createOrder', err);
                self.sendResultOrError(res, err, order, 'Error creating order', 500);
                if(userId && order) {
                    self.createUserActivity(req, 'CREATE_ORDER', null, {id: order.id()}, function(){});
                }
            });
        });

    },

    /**
     * *Note* If req.body.cancelUrl and req.body.returnUrl are not present on the req.body object, they will
     * be inferred from the referrer header
     * @param req.body is of type $$.m.Order (with optional params req.body.cancelUrl and req.body.returnUrl)
     * @param resp
     */
    createPaypalOrder: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.currentAccountId(req);

        self.log.debug(accountId, userId, '>> createPaypalOrder');
        var fullUrl = req.get('Referrer');
        var order = new $$.m.Order(req.body);
        var hasSubscriptionProduct = false;
        order.attributes.line_items.forEach(function(item, index) {
            if (item.type == 'SUBSCRIPTION') {
                hasSubscriptionProduct = true;
            }
        });
        if (hasSubscriptionProduct) {
            //changing to 400 Bad Request instead of 500 Server Error
            self.log.error(accountId, userId, 'Paypal order has subscription product.  Returning 400.');
            return resp.status(400).send('Unsupported Payment method');
        }
        order.set('status', 'pending_payment');

        order.set('account_id', accountId);
        var cancelUrl = null;
        var returnUrl = null;
        if(order.get('cancelUrl')) {
            cancelUrl = order.get('cancelUrl');
        } else {
            cancelUrl = fullUrl + '?state=6&comp=products';
        }
        if(order.get('returnUrl')) {
            returnUrl = order.get('returnUrl');
        } else {
            returnUrl = fullUrl + '?state=5&comp=products';
        }

        orderManager.createPaypalOrder(order, userId, cancelUrl, returnUrl, function(err, order){
            self.log.debug(accountId, userId, '<< createOrder', err);
            self.sendResultOrError(resp, err, order, 'Error creating order', 500);
            if(userId && order) {
                self.createUserActivity(req, 'CREATE_PAYPAL_ORDER', null, {id: order.id()}, function(){});
            }
        });

    },

    getOrder: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getOrder');

        var orderId = req.params.id;
        self.checkPermission(req, self.sc.privs.VIEW_ORDER, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                orderManager.getOrderById(orderId, function(err, order){
                    self.log.debug(accountId, userId, '<< getOrder');
                    self.sendResultOrError(res, err, order, 'Error creating order');
                });
            }
        });


    },

    updateOrder: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> updateOrder');

        //self.log.debug(accountId, userId, 'Body:', req.body);
        var order = new $$.m.Order(req.body.order);
        var orderId = req.params.id;
        order.set('_id', orderId);
        order.attributes.modified.date = new Date();
        //self.log.debug('>> Order', order);
        var created_at = order.get('created_at');

        if (created_at && _.isString(created_at)) {
            created_at = moment(created_at).toDate();
            order.set('created_at', created_at);
        }
        self.checkPermission(req, self.sc.privs.VIEW_ORDER, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                orderManager.updateOrderById(order, function(err, order){
                    self.log.debug(accountId, userId, '<< updateOrder');
                    self.sendResultOrError(res, err, order, 'Error updating order');
                });
            }
        });


    },

    listOrders: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> listOrders');


        self.checkPermission(req, self.sc.privs.VIEW_ORDER, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                orderManager.listOrdersByAccount(accountId, function(err, orders){
                    self.log.debug(accountId, userId, '<< listOrders');
                    self.sendResultOrError(res, err, orders, 'Error listing orders');
                });
            }
        });

    },

    listOrdersByCustomer: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> listOrdersByCustomer');

        var customerId = parseInt(req.params.customerid);

        self.checkPermission(req, self.sc.privs.VIEW_ORDER, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                orderManager.listOrdersByCustomer(customerId, accountId, function(err, orders){
                    self.log.debug(accountId, userId, '<< listOrdersByCustomer');
                    self.sendResultOrError(res, err, orders, 'Error listing orders');
                });
            }
        });

    },

    completeOrder: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> completeOrder');

        var orderId = req.params.id;
        var note = req.body.note;

        self.checkPermission(req, self.sc.privs.MODIFY_ORDER, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                orderManager.completeOrder(accountId, orderId, note, userId, function(err, order){
                    self.log.debug(accountId, userId, '<< completeOrder');
                    self.sendResultOrError(res, err, order, 'Error completing order');
                    self.createUserActivity(req, 'COMPLETE_ORDER', null, {id: order.id()}, function(){});
                });
            }
        });


    },

    cancelOrder: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> cancelOrder');

        var orderId = req.params.id;
        var note = req.body.note;

        self.checkPermission(req, self.sc.privs.MODIFY_ORDER, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                orderManager.cancelOrder(accountId, orderId, note, userId, function(err, order){
                    self.log.debug(accountId, userId, '<< cancelOrder');
                    self.sendResultOrError(res, err, order, 'Error cancelling order');
                    self.createUserActivity(req, 'CANCEL_ORDER', null, {id: orderId}, function(){});
                });
            }
        });
    },

    refundOrder: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> refundOrder');

        var orderId = req.params.id;

        self.checkPermission(req, self.sc.privs.MODIFY_ORDER, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var note = req.body.note;
                var amount = req.body.amount;
                var reason = req.body.reason;
                //var accessToken = self.getAccessToken(req);
                self.getStripeTokenFromAccount(req, function(err, accessToken){
                    orderManager.refundOrder(accountId, orderId, note, userId, amount, reason, accessToken, function(err, order){
                        self.log.debug(accountId, userId, '<< refundOrder');
                        self.sendResultOrError(res, err, order, 'Error refunding order');
                        self.createUserActivity(req, 'REFUND_ORDER', null, {id: orderId}, function(){});
                    });
                });

            }
        });

    },

    holdOrder: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> holdOrder');

        var orderId = req.params.id;
        var note = req.body.note;

        self.checkPermission(req, self.sc.privs.MODIFY_ORDER, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                orderManager.holdOrder(accountId, orderId, note, userId, function(err, order){
                    self.log.debug(accountId, userId, '<< holdOrder');
                    self.sendResultOrError(res, err, order, 'Error holding order');
                    self.createUserActivity(req, 'HOLD_ORDER', null, {id: orderId}, function(){});
                });
            }
        });
    },

    addOrderNote: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> addOrderNote');

        var orderId = req.params.id;
        var note = req.body.note;

        self.checkPermission(req, self.sc.privs.MODIFY_ORDER, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                orderManager.addOrderNote(accountId, orderId, note, userId, function(err, order){
                    self.log.debug(accountId, userId, '<< addOrderNote');
                    self.sendResultOrError(res, err, order, 'Error adding order note');
                    self.createUserActivity(req, 'ADD_ORDER_NOTE', null, {id: orderId}, function(){});
                });
            }
        });
    },

    orderPaymentComplete: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> orderPaymentComplete');

        //console.dir(req.body);
        var order = new $$.m.Order(req.body);
        var orderId = req.params.id;
        order.set('_id', orderId);

        async.waterfall([
          function (callback) {
            if (order.get('line_items').length && order.get('line_items')[0].type == 'DONATION') {
              order.set('status', 'completed');
            } else {
              order.set('status', 'processing');
            }
            order.attributes.modified.date = new Date();
            self.log.debug(accountId, userId, '>> Order', order);
            var created_at = order.get('created_at');

            if (created_at && _.isString(created_at)) {
                created_at = moment(created_at).toDate();
                order.set('created_at', created_at);
            }
            orderManager.updateOrderById(order, function(err, order){
                callback(err, order);
            });
          },
          function (order, callback) {
            var productAry = [];
            async.each(order.get('line_items'), function iterator(item, cb){
                productManager.getProduct(item.product_id, function(err, product){
                    if(err) {
                        cb(err);
                    } else {
                        if(product.get('fulfillment_email')){
                            productAry.push(product);
                        }
                        self.log.debug(accountId, userId, 'Product is', product);
                        cb();
                    }
                });
            }, function done(err){
                self.log.debug(accountId, userId, 'productAry', productAry);
                callback(err, order, productAry);
            });
          },
          function(order, fulfillmentProductArr, callback) {
              if(fulfillmentProductArr && fulfillmentProductArr.length){
                  if(!order || !order.get('billing_address') || !order.get('billing_address').email) {
                      self.log.warn('No order email address.  No Fulfillment email sent.');
                      order.get("notes").push({
                          note: 'No email address provided with order. No fulfillment email sent.',
                          user_id: userId,
                          date: new Date()
                      });
                      dao.saveOrUpdate(order, function(err, order){
                          if(err) {
                              self.log.error(accountId, userId, 'Error updating order: ' + err);
                              callback(err);
                          } else {
                              callback(null,order);
                          }
                      });
                  }
                  else{
                      var _ba = order.get('billing_address');
                      var toName = (_ba.first_name || '') + ' ' + (_ba.last_name || '');
                      var accountId = order.get('account_id');
                      var toAddress = _ba.email;

                      async.each(fulfillmentProductArr, function iterator(product, cb){
                          var settings = product.get("emailSettings");
                          var fromAddress = settings.fromEmail;
                          var subject = settings.subject;
                          var orderId = order.get("_id");
                          var accountId = order.get('accountId');
                          var vars = settings.vars || [];
                          var fromName = settings.fromName;
                          var emailId = settings.emailId;
                          var bcc = settings.bcc;

                          emailDao.getEmailById(emailId, function(err, email){
                              if(err || !email) {
                                  self.log.error(accountId, userId, 'Error getting email to render: ' + err);
                                  return fn(err, null);
                              }
                              var components = [];
                              var keys = ['logo','title','text','text1','text2','text3'];
                              var regex = new RegExp('src="//s3.amazonaws', "g");

                              email.get('components').forEach(function(component){
                                  if(component.visibility){
                                      for (var i = 0; i < keys.length; i++) {
                                          if (component[keys[i]]) {
                                          component[keys[i]] = component[keys[i]].replace(regex, 'src="http://s3.amazonaws');
                                          }
                                      }
                                      if (!component.bg.color) {
                                          component.bg.color = '#ffffff';
                                      }
                                      if (!component.emailBg) {
                                          component.emailBg = '#ffffff';
                                      }
                                      if (component.bg.img && component.bg.img.show && component.bg.img.url) {
                                          component.emailBgImage = component.bg.img.url.replace('//s3.amazonaws', 'http://s3.amazonaws');
                                      }
                                      if (!component.txtcolor) {
                                          component.txtcolor = '#000000';
                                      }
                                      components.push(component);
                                  }
                              });

                              app.render('emails/base_email_v2', { components: components }, function(err, html) {
                                  if (err) {
                                      self.log.error(accountId, userId, 'Error updating order: ' + err);
                                      self.log.warn('email will not be sent.');
                                      cb();
                                  } else {
                                      emailMessageManager.sendFulfillmentEmail(fromAddress, fromName, toAddress, toName, subject, html, accountId, orderId, vars, email._id, bcc, function(){
                                          if(err) {
                                              self.log.warn('Error sending email');
                                              order.get("notes").push({
                                                  note: 'Error sending fulfillment email.',
                                                  user_id: userId,
                                                  date: new Date()
                                              });
                                              dao.saveOrUpdate(order, function(err, order){
                                                  if(err) {
                                                      self.log.error(accountId, userId, 'Error updating order: ' + err);
                                                      callback(err);
                                                  } else {
                                                      cb();
                                                  }
                                              });
                                          } else {
                                              cb();
                                          }

                                      });
                                  }
                              });
                          });
                      }, function done(err){
                          callback(null, order);
                      });
                  }
              }
              else{
                  callback(null, order);
              }
          }
        ], function(err, order) {
          self.log.debug(accountId, userId, '<< orderPaymentComplete');
          self.sendResultOrError(res, err, order, 'Error updating order');
        });
    },

    deleteOrder: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> deleteOrder');
        var orderId = req.params.id;

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_ORDER, accountId, function (err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                orderManager.deleteOrder(orderId, function(err, value){
                    self.log.debug(accountId, userId, '<< deleteOrder');
                    if (!err && value != null) {
                        self.sendResult(res, {deleted:true});
                        self.createUserActivity(req, 'DELETE_ORDER', null, {id: orderId}, function(){});
                    } else {
                        self.wrapError(res, 401, null, err, value);
                    }
                });
            }
        });
    }
});

module.exports = new api();
