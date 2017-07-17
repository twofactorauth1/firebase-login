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
        app.delete(this.url('cart/items/:id'), this.isAuthAndSubscribedApi.bind(this), this.deleteCartQuoteItem.bind(this));
        app.post(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.createQuote.bind(this));
        app.post(this.url('attachment/:id'), this.isAuthApi.bind(this), this.updateQuoteAttachment.bind(this));
    },

    listQuoteItems: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> listQuoteItems');
        self._checkAccess(accountId, userId, 'quotes', function(err, isAllowed){
            if(!isAllowed) {
                self.log.debug(accountId, userId, '<< listQuoteItems [' + isAllowed + ']');
                return self.sendResultOrError(resp, err, [], "Error listing quote items");
            } else {
                quoteManager.listQuoteItems(accountId, userId, function(err, list){
                    self.log.debug(accountId, userId, '<< listQuoteItems');
                    return self.sendResultOrError(resp, err, list, "Error listing quote items");
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
            }
        });
        
    },

    deleteCartQuoteItem: function(req, resp) {
        var self = this;
        self.log.debug('>> deleteCartQuoteItem');
        var promotionId = req.params.id;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self._checkAccess(accountId, userId, 'quotes', function(err, isAllowed){
            if(!isAllowed) {
                self.log.debug(accountId, userId, '<< deleteCartQuoteItem [' + isAllowed + ']');
                return self.sendResultOrError(resp, err, [], "Error deleting quote");
            } else {
                quoteManager.deleteCartQuoteItem(accountId, userId, promotionId, function(err, value){
                    if(err) {
                        self.wrapError(resp, 500, err, "Error deleting quote cart item");
                    } else {
                        self.log.debug('<< deleteCartQuoteItem');
                        self.send200(resp);
                        //self.createUserActivity(req, 'DELETE_PROMOTION', null, null, function(){});
                    }
                });
             }
        });
    },
    createQuote: function(req, resp) {
        var self = this;
        self.log.debug('>> createQuote');
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);

        self._checkAccess(accountId, userId, 'quotes', function(err, isAllowed){
            if(!isAllowed) {
                self.log.debug(accountId, userId, '<< createQuote [' + isAllowed + ']');
                return self.sendResultOrError(resp, err, [], "Error saving quote");
            } else {
                var quoteObj = req.body;
                var quote = new $$.m.Quote(quoteObj);
                var modified = {
                    date: new Date(),
                    by: userId
                };
                var created = {
                    date: new Date(),
                    by: userId
                };

                quote.set('modified', modified);
                quote.set('created', created);
                quote.set("accountId", accountId);
                quote.set("userId", userId);


                quoteManager.createQuote(accountId, userId, quote, function(err, value){
                    self.log.debug(accountId, userId, '<< createQuote');
                    self.sendResultOrError(resp, err, value, "Error saving quote");
                });
            }
        });
        
    },

    updateQuoteAttachment: function(req, res) {
        var self = this;
        self.log.debug('>> updateQuoteAttachment');
        var form = new formidable.IncomingForm();
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        var quoteId = req.params.id;
        form.parse(req, function(err, fields, files) {
            if(err) {
                self.wrapError(res, 500, 'fail', 'The upload failed', err);
                self = null;
                return;
            } else {

                var file = files['file'];
                console.log(file);

                var fileToUpload = {};
                fileToUpload.mimeType = file.type;
                fileToUpload.size = file.size;
                fileToUpload.name = file.name;
                fileToUpload.path = file.path;
                fileToUpload.type = file.type;
                quoteManager.updateQuoteAttachment(fileToUpload, quoteId, accountId, userId, function(err, value, file){                                                       
                    self.log.debug('>> updateQuoteAttachment');
                    self.sendResultOrError(res, err, value, 'Could not update quote attachment');                    
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

