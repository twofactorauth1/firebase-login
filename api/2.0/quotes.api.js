/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api.js');

var quoteManager = require('../../quotes/quote_manager');
var formidable = require('formidable');
var userManager = require('../../dao/user.manager');
var orgManager = require('../../organizations/organization_manager');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "quotes",

    version: "2.0",

    initialize: function () {
        app.get(this.url('cart/items'), this.isAuthAndSubscribedApi.bind(this), this.listQuoteItems.bind(this));       
        app.post(this.url('cart/items'), this.isAuthAndSubscribedApi.bind(this), this.saveUpdateCartQuoteItems.bind(this));
        //app.get(this.url('po/:id'), this.isAuthAndSubscribedApi.bind(this), this.getPurchaseOrder.bind(this));        
    },

    listQuoteItems: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> listQuoteItems');
        self._checkAccess(accountId, userId, 'quotes', function(err, isAllowed){
            if(!isAllowed) {
                self.log.debug(accountId, userId, '<< listQuoteItems [' + isAllowed + ']');
                return self.sendResultOrError(resp, err, [], "Error listing items");
            } else {
                quoteManager.listQuoteItems(accountId, userId, function(err, list){
                    self.log.debug(accountId, userId, '<< listQuoteItems');
                    return self.sendResultOrError(resp, err, list, "Error listing items");
                });
            }
        });

    },

    saveUpdateCartQuoteItems: function(req, resp) {
        var self = this;
        self.log.debug('>> saveUpdateCartQuoteItems');
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);

        self._checkAccess(accountId, userId, 'quotes', function(err, isAllowed){
            if(!isAllowed) {
                self.log.debug(accountId, userId, '<< saveUpdateCartQuoteItems [' + isAllowed + ']');
                return self.sendResultOrError(resp, err, [], "Error saving quote items");
            } else {
                
            }
        });
        var quoteItems = req.body;
        var quoteCartItem = new $$.m.QuoteCartItem(quoteItems);
        var modified = {
            date: new Date(),
            by: userId
        };
        var created = {
            date: new Date(),
            by: userId
        };

        quoteCartItem.set('modified', modified);
        quoteCartItem.set('created', created);
        quoteCartItem.set("accountId", accountId);
        quoteCartItem.set("userId", userId);

        
        quoteManager.saveUpdateCartQuoteItems(accountId, userId, quoteCartItem, function(err, value){
            self.log.debug(accountId, userId, '<< saveUpdateCartQuoteItems');
            self.sendResultOrError(resp, err, value, "Error saving quote items");
        });
    },

    deletePurchaseOrder: function (req, res) {

        var self = this;
        var purchaseOrderId = req.params.id;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> deletePurchaseOrder');

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_ORDER, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                if (!purchaseOrderId) {
                    self.wrapError(res, 400, null, "Invalid paramater for ID");
                }
                
                quoteManager.deletePurchaseOrder(accountId, userId, purchaseOrderId, function(err, value){
                    self.log.debug('<< deletePurchaseOrder');
                    self.sendResultOrError(res, err, {deleted:true}, "Error deleting PO");
                    self.createUserActivity(req, 'DELETE_PO', null, null, function(){});
                }); 
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
    }
    


});

module.exports = new api({version:'2.0'});

