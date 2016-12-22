/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var dao = require('./dao/useractivity.dao');
var log = $$.g.getLogger("useractivity_manager");
var async = require('async');
var userDao = require('../dao/user.dao');

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

    createUserReauthActivity: function(accountId, userId, requestorProps, fn) {
        var self = this;
        log.debug('>> createUserReauthActivity');
        var data = requestorProps || {};
        data.accountId = accountId;
        data.userId = userId;
        data.activityType = $$.m.UserActivity.types.REAUTH;
        var activity = new $$.m.UserActivity(data);

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
    },

    countNonAdminLogins: function(accountId, userId, startDate, endDate, fn) {
        var self = this;
        self.log = log;
        self.log.debug(accountId, userId, '>> countNonAdminLogins');
        var results = {};
        async.waterfall([
            function(cb) {
                //get all the admin ids
                var userQuery = {
                    $or: [{email:/.*@indigenous.io.*/}, {username:'millkyl@gmail.com'}]
                };
                userDao.findMany(userQuery, $$.m.User, function(err, users){
                    if(err) {
                        self.log.error('Error finding admin users:', err);
                        cb(err);
                    } else {
                        var adminIDs = [];
                        _.each(users, function(user){
                            adminIDs.push(user.id());
                        });
                        cb(null, adminIDs);
                    }
                });
            },
            function(adminIDs, cb) {
                var loginQuery = {
                    accountId:accountId,
                    userId:{$nin:adminIDs},
                    activityType:{$in:[$$.m.UserActivity.types.REAUTH, $$.m.UserActivity.types.LOGIN]}
                };
                dao.findCount(loginQuery, $$.m.UserActivity, function(err, value){
                    if(err) {
                        self.log.error('Error finding login count:', err);
                        cb(err);
                    } else {
                        results.loginCount = value;
                        cb(null, adminIDs);
                    }
                });
            },
            function(adminIDs, cb) {
                var mostRecentLoginQuery = {
                    accountId:accountId,
                    userId:{$nin:adminIDs},
                    activityType:{$in:[$$.m.UserActivity.types.REAUTH, $$.m.UserActivity.types.LOGIN]}
                };
                dao.getMaxValue(mostRecentLoginQuery, 'start', $$.m.UserActivity, function(err, value){
                    if(err) {
                        self.log.error('Error finding most recent login:', err);
                        cb(err);
                    } else {
                        results.mostRecentLogin = value;
                        cb(null);
                    }
                });
            }
        ], function(err){
            if(err) {
                self.log.error(accountId, userId, 'Error in countNonAdminLogins:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< countNonAdminLogins');
                fn(null, results);
            }
        });

    }
};