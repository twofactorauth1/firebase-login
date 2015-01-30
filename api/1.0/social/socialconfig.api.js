/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../../base.api');
var socialConfigManager = require('../../../socialconfig/socialconfig_manager');
var socialConfig = require('../../../socialconfig/model/socialconfig');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "social/socialconfig",

    log: $$.g.getLogger("socialconfig.api"),

    initialize: function () {

        app.get(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.getSocialConfig.bind(this));
        app.get(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.getSocialConfig.bind(this));
        app.post(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.createSocialConfig.bind(this));
        app.post(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.updateSocialConfig.bind(this));

    },

    /**
     * This method retrieves a social config by account or id.
     * @param req
     * @param resp
     */
    getSocialConfig: function(req, resp) {
        var self = this;
        self.log.debug('>> getSocialConfig');
        var id = null;
        if(req.params.id) {
            id = req.params.id;
        }
        var accountId = parseInt(self.accountId(req));
        self.checkPermission(req, self.sc.privs.VIEW_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.getSocialConfig(accountId, id, function(err, config){
                    self.log.debug('<< getSocialConfig');
                    self.sendResultOrError(resp, err, config, "Error retrieving social config");
                });
            }
        });

    },

    createSocialConfig: function(req, resp) {

    },

    updateSocialConfig: function(req, resp) {

    }


});

module.exports = new api();
