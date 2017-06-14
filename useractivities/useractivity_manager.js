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
var geoiputil = require('../utils/geoiputil');

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

    createUserLoginActivity: function(accountId, userId, requestorProps, orgId, fn) {
        var self = this;
        log.debug('>> createUserLoginActivity');
        var data = requestorProps || {};
        data.accountId = accountId;
        data.userId = userId;
        data.orgId = orgId;
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
                        mostRecentLoginQuery.start = value;
                        dao.findOne(mostRecentLoginQuery, $$.m.UserActivity, function(err, userActivity){
                            if(userActivity) {
                                results.mostRecentActivity = userActivity.toJSON('public');
                                geoiputil.getMaxMindGeoForIP(results.mostRecentActivity.ip, function(err, ip_geo_info){
                                    if(ip_geo_info) {
                                        var replacementObject = {
                                            province: ip_geo_info.region,
                                            city: ip_geo_info.city,
                                            postal_code: ip_geo_info.postal,
                                            continent: ip_geo_info.continent,
                                            country: ip_geo_info.countryName
                                        };
                                        results.mostRecentActivity.geo = replacementObject;
                                        self.log.debug('results.mostRecentActivity:', results.mostRecentActivity);
                                        cb(null);
                                    } else {
                                        cb(null);
                                    }
                                });
                            } else {
                                self.log.debug('most recent activity:', userActivity);
                                cb(null);
                            }

                        });
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

    },

    getMostRecentLogin: function(accountId, userId, userIdAry, fn) {
        var self = this;
        self.log = log;
        self.log.debug(accountId, userId, '>> getMostRecentLogin');

        /*
         [{$match:{accountId:1321, activityType:{$in:['LOGIN', 'REAUTH']}}}, {$sort:{userId:1, date:-1}}, {
         $group:{_id:'$userId', date:{$last:'$start'}, ip:{$last:'$ip'}}
         }]
         */
        var stageAry = [];
        var match = {$match:{
            accountId:accountId,
            userId:{$in:userIdAry},
            activityType:{$in:[$$.m.UserActivity.types.REAUTH, $$.m.UserActivity.types.LOGIN]}
        }};
        stageAry.push(match);

        var sort = {$sort:{userId:1, date:-1}};
        stageAry.push(sort);

        var group = {$group:{
            _id:'$userId',
            date:{$last:'$start'},
            ip:{$last:'$ip'}}
        };
        stageAry.push(group);

        dao.aggregateWithCustomStages(stageAry, $$.m.UserActivity, function(err, results){
            if(err) {
                self.log.error(accountId, userId, 'Error in DB:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< getMostRecentLogin');
                fn(null, results);
            }
        });
    }
};