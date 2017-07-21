/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var userActivityManager = require('../../useractivities/useractivity_manager');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "useractivity",

    log: $$.g.getLogger("useractivity.api"),

    initialize: function () {
        app.get(this.url(''), this.isAuthApi.bind(this), this.findActivities.bind(this));
        app.get(this.url('user'), this.isAuthApi.bind(this), this.findUserActivities.bind(this));
    },

    findActivities: function(req, resp) {
        var self = this;

        self.log.debug('>> findActivities ');
        var accountId = parseInt(self.accountId(req));
        var skip = 0;
        if(req.query.skip) {
            skip = parseInt(req.query.skip);
        }
        var limit = 0;
        if(req.query.limit) {
            limit = parseInt(req.query.limit);
        }

        userActivityManager.listActivities(accountId, skip, limit, function(err, list){
            if(err) {
                self.log.error('Error listing activities: ' + err);
                return self.wrapError(resp, 500, "An error occurred listing activities", err);
            } else {
                self.log.debug('<< findActivities');
                return resp.send(list);
            }
        });
    },

    findUserActivities: function(req, resp) {
        var self = this;

        self.log.debug('>> findUserActivities ');
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        var skip = 0;
        if(req.query.skip) {
            skip = parseInt(req.query.skip);
        }
        var limit = 0;
        if(req.query.limit) {
            limit = parseInt(req.query.limit);
        }

        userActivityManager.listUserActivities(accountId, userId, skip, limit, function(err, list){
            if(err) {
                self.log.error('Error listing user activities: ' + err);
                return self.wrapError(resp, 500, "An error occurred listing user activities", err);
            } else {
                self.log.debug('<< findUserActivities');
                return resp.send(list);
            }
        });
    }
});

module.exports = new api();
