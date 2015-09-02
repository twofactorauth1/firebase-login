/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var dao = require('./dao/useractivity.dao');
var log = $$.g.getLogger("useractivity_manager");

module.exports = {

    createUserActivity: function(userActivity, fn) {
        var self = this;
        log.debug('>> createUserActivity');
        dao.saveOrUpdate(userActivity, function(err, value){
            if(err) {
                log.error('Error creating userActivity');
                return fn(err, null);
            } else {
                log.debug('<< createUserActivity');
                return fn(null, value);
            }
        });
    },

    createUserLoginActivity: function(accountId, userId, requestorProps, fn) {
        var self = this;
        log.debug('>> createUserLoginActivity');
        var data = requestorProps || {};
        data.accountId = accountId;
        data.userId = userId;
        data.activityType = $$.m.UserActivity.types.LOGIN;
        var activity = new $$.m.UserActivity(data);

        dao.saveOrUpdate(activity, function(err, value){
            if(err) {
                log.error('Error creating userActivity');
                return fn(err, null);
            } else {
                log.debug('<< createUserLoginActivity');
                return fn(null, value);
            }
        });
    },

    createUserLogoutActivity: function(accountId, userId, fn) {
        var self = this;
        log.debug('>> createUserLogoutActivity');
        var activity = new $$.m.UserActivity({
            accountId: accountId,
            userId: userId,
            activityType: $$.m.UserActivity.types.LOGOUT
        });

        dao.saveOrUpdate(activity, function(err, value){
            if(err) {
                log.error('Error creating userActivity');
                return fn(err, null);
            } else {
                log.debug('<< createUserLogoutActivity');
                return fn(null, value);
            }
        });
    },

    createUserReauthActivity: function(accountId, userId, fn) {
        var self = this;
        log.debug('>> createUserReauthActivity');
        var activity = new $$.m.UserActivity({
            accountId: accountId,
            userId: userId,
            activityType: $$.m.UserActivity.types.REAUTH
        });

        dao.saveOrUpdate(activity, function(err, value){
            if(err) {
                log.error('Error creating userActivity');
                return fn(err, null);
            } else {
                log.debug('<< createUserReauthActivity');
                return fn(null, value);
            }
        });
    },

    getActivityById: function(activityId, fn) {
        var self = this;
        log.debug('>> getActivityById');

        dao.getById(activityId, $$.m.UserActivity, function(err, value) {
            if (err) {
                log.error('Error getting activity: ' + err);
                fn(err, null);
            } else {
                log.debug('<< getActivityById');
                fn(null, value);
            }
        });
    },

    listActivities: function(accountId, skip, limit, fn) {
        var self = this;
        log.debug('>> listActivities(' + accountId  +', ' + skip + ', ' + limit + ')');


        dao.findAllWithFieldsAndLimit({
                'accountId': accountId
            }, skip, limit, 'start', null, $$.m.UserActivity,
            function(err, list) {
                if (err) {
                    log.error('Error listing activities: ' + err);
                    fn(err, null);
                } else {
                    log.debug('<< listActivities');
                    fn(null, list);
                }
            });
    }

};