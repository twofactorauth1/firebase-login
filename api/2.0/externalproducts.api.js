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

    }

});

module.exports = new api({version:'2.0'});

