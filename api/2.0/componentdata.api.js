/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api.js');
var dao = require('../../componentdata/dao/componentdata.dao');
var manager = require('../../componentdata/componentdata_manager');

var moment = require('moment');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "componentdata",

    version: "2.0",

    dao: dao,

    initialize: function () {

        app.get(this.url(':type/:key'), this.setup.bind(this), this.getComponentDataByTypeAndKey.bind(this));
        app.put(this.url(':type/:key'), this.isAuthAndSubscribedApi.bind(this), this.saveComponentData.bind(this));
        app.delete(this.url(':type/:key'), this.isAuthAndSubscribedApi.bind(this), this.deleteComponentData.bind(this));


    },


    getComponentDataByTypeAndKey: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.currentAccountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getComponentDataByTypeAndKey');
        var type = req.params.type;
        var key = req.params.key;
        manager.getComponentData(accountId, userId, type, key, function(err, data){
            self.log.debug(accountId, userId, '<< getComponentDataByTypeAndKey');
            self.sendResultOrError(resp, err, data, 'Could not load component data');
        });
    },

    saveComponentData: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> saveComponentData');
        var type = req.params.type;
        var key = req.params.key;
        var data = req.body;
        manager.saveComponentData(accountId, userId, type, key, data, function(err,data){
            self.log.debug(accountId, userId, '<< saveComponentData');
            self.sendResultOrError(resp, err, data, 'Could not save component data');
        });
    },

    deleteComponentData: function(req, resp) {
        var self = this;
        self.log.debug('>> noop');
        var accountId = parseInt(self.accountId(req));
        self.log.debug('<< noop');
        self.sendResult(resp, {msg:'method not implemented'});
    }

});

module.exports = new api({version:'2.0'});

