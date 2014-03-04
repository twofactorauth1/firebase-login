var BaseApi = require('../../base.api');
var FacebookDao = require('../../../dao/social/facebook.dao');


var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, BaseApi.prototype, {

    base: "social/facebook",

    dao: FacebookDao,

    initialize: function() {
        //GET
        app.get(this.url('profile'), this.isAuthApi, this.getFacebookProfile.bind(this));
    },


    getFacebookProfile: function(req, resp) {
        FacebookDao.getProfileForUser(req.user, function(err, value) {
            if (!err) {
                resp.send(value);
            } else {
                self.wrapError(resp, 500, "Error retrieving facebook profile", err, value);
            }
        });
    }
});

module.exports = new api();

