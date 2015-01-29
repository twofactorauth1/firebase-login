/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../../base.api');
var twitterDao = require('../../../dao/social/twitter.dao');


var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "social/twitter",

    dao: twitterDao,

    initialize: function() {
        //GET
        /*
        app.get(this.url('checkaccess'), this.isAuthApi, this.checkAccess.bind(this));
        app.get(this.url('profile'), this.isAuthApi, this.getFacebookProfile.bind(this));
        app.get(this.url('friends'), this.isAuthApi, this.getFacebookFriends.bind(this));

        app.get(this.url('friends/import'), this.isAuthApi, this.importFacebookFriends.bind(this));
        app.post(this.url('friends/import'), this.isAuthApi, this.importFacebookFriends.bind(this));

        //facebook api
        app.get(this.url('likesperday'), this.isAuthApi, this.getLikesPerDay.bind(this));
        app.get(this.url('insights/'), this.isAuthApi, this.getAppInsights.bind(this));
        app.get(this.url('insights/:metric'), this.isAuthApi, this.getAppInsights.bind(this));
        app.get(this.url('insights/:metric/:period'), this.isAuthApi, this.getAppInsights.bind(this));
        app.get(this.url('insights/:metric/:period/:breakdown'), this.isAuthApi, this.getAppInsights.bind(this));

        app.post(this.url('share/link'), this.isAuthApi, this.shareLink.bind(this));
        */

        app.post(this.url('status'), this.isAuthApi.bind(this), this.updateStatus.bind(this));

        app.get(this.url('tweets/:twitterId'), this.isAuthApi.bind(this), this.getTweetsForUser.bind(this));
    },

    updateStatus: function(req, resp) {
        var self = this;
        self.log.debug('>> updateStatus');

        var status = req.body.status;
        twitterDao.post(req.user, status, function(err, value){
            self.log.debug('<< shareLink');
            self.sendResultOrError(resp, err, value, 'Error posting status update', 500);
        });
    },

    getTweetsForUser: function(req, resp) {
        var self = this;
        self.log.debug('>> getTweetsForUser');

        var twitterId = req.params.twitterId;
        twitterDao.getTweetsForUser(req.user, twitterId, function(err, value){
            self.log.debug('<< tweets');
            self.sendResultOrError(resp, err, value, 'Error getting tweets for user', 500);
        });
    }
});

module.exports = new api();

