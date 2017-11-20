/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api.js');

var appConfig = require('../../configs/app.config');
var urlUtils = require('../../utils/urlutils');
var dao = require('../../externalproducts/dao/externalproduct.dao');
var manager = require('../../externalproducts/externalproduct.manager');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "externalproducts",

    version: "2.0",

    dao: dao,

    initialize: function () {

        app.get(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.listExternalProducts.bind(this));
        app.get(this.url('load'), this.isAuthAndSubscribedApi.bind(this), this.loadExternalProducts.bind(this));
        app.get(this.url('search'), this.isAuthAndSubscribedApi.bind(this), this.searchExternalProducts.bind(this));
        app.get(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.getExternalProduct.bind(this));

    },

    listExternalProducts: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> listExternalProducts');

        manager.listExternalProducts(function(err, value){
            self.log.debug(accountId, userId, '<< listExternalProducts');
            self.sendResultOrError(resp, err, value, 'Error listing external products');
        });

    },

    loadExternalProducts: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> loadExternalProducts');

        manager.loadExternalProducts(function(err, value){
            manager.runExternalProductsJob();
            self.log.debug(accountId, userId, '<< loadExternalProducts');
            self.sendResultOrError(resp, err, {numberLoaded:value}, 'Error loading external products');
        });
    },

    searchExternalProducts: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> searchExternalProducts');

        var skip = parseInt(req.query.skip) || 0;
        var limit = parseInt(req.query.limit) || 0;
        var sortBy = req.query.sortBy || null;
        var sortDir = parseInt(req.query.sortDir) || null;
        var fieldSearch = req.query;
        var term = req.query.term;
        delete fieldSearch.term;
        delete fieldSearch.skip;
        delete fieldSearch.limit;
        delete fieldSearch.sortBy;
        delete fieldSearch.sortDir;

        manager.externalProductSearch(accountId, userId, term, fieldSearch, skip, limit, sortBy, sortDir, function(err, list){
            self.log.debug(accountId, userId, '<< searchExternalProducts');
            self.sendResultOrError(resp, err, list, 'Error searching external products');
        });
    },

    getExternalProduct: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getExternalProduct');

        var id = req.params.id;
        manager.getExternalProduct(accountId, userId, id, function(err, value){
            self.log.debug(accountId, userId, '<< getExternalProduct');
            self.sendResultOrError(resp, err, value, 'Error fetching external product');
        });
    }

});

module.exports = new api({version:'2.0'});

