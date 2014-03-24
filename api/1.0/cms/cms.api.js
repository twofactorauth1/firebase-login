var baseApi = require('../base.api');
var cmsDao = require('../../dao/cms/cms.dao');

var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "cms",

    dao: cmsDao,

    initialize: function() {
        //GET
        app.get(this.url(':accountid/cms/website', "account"), this.isAuthApi, this.getWebsiteForAccountId.bind(this));
    },


    getWebsiteForAccountId: function(req, resp) {
        var self = this;
        var accountId = parseInt(req.params.accountId);

        cmsDao.getOrCreateWebsiteByAccountId(accountId, req.user.id(), function(err, value) {
            if (err) {
                self.wrapError(resp, 500, "Error retrieving website for account id", err, value);
                self = accountId = null;
            }
        });
    }
});

module.exports = new api();

