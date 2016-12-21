/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api.js');
var dao = require('../../insights/dao/insights.dao');
var manager = require('../../insights/insights_manager');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "insights",

    version: "2.0",

    dao: dao,

    initialize: function () {
        app.get(this.url('sections/available'), this.isAuthAndSubscribedApi.bind(this), this.getAvailableSections.bind(this));
    },

    getAvailableSections: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getAvailableSections');
        manager.getAvailableSections(accountId, userId, function(err, data){
            self.log.debug(accountId, userId, '<< getAvailableSections');
            self.sendResultOrError(resp, err, data, 'Could not load available sections');
        });
    }

});

module.exports = new api({version:'2.0'});
