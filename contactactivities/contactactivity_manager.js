/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('./dao/contactactivity.dao.js');
var dao = require('./dao/contactactivity.dao.js');
var log = $$.g.getLogger("contactactivity_manager");

module.exports = {

    createActivity: function(contactActivity, fn) {
        var self = this;
        log.debug('>> createActivity');

        dao.saveOrUpdate(contactActivity, function(err, value){
            if(err) {
                log.error('Error creating activity: ' + err);
                fn(err, null);
            } else {
                log.debug('<< createActivity');
                fn(null, value);
            }
        });
    },

    createActivityFromEvent: function(analyticEvent, fn) {
        //TODO
    },

    getActivityById: function(activityId, fn) {
        var self = this;
        log.debug('>> getActivityById');

        dao.getById(activityId, $$.m.ContactActivity, function(err, value){
            if(err) {
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
        log.debug('>> listActivities');

        dao.findAllWithFieldsAndLimit({'accountId':accountId}, skip, limit, null, null, $$.m.ContactActivity,
            function(err, list){
                if(err) {
                    log.error('Error listing activities: ' + err);
                    fn(err, null);
                } else {
                    log.debug('<< listActivities');
                    fn(null, list);
                }
            });
    },

    listActivitiesByContactId: function(accountId, contactId, skip, limit, isRead, fn) {
        var self = this;
        log.debug('>> listActivitiesByContactId');
        var queryObj = {'accountId': accountId, 'contactId': contactId};
        if(isRead && isRead === 'true') {
            queryObj.read = true;
        }
        if(isRead && isRead === 'false') {
            queryObj.read = false;
        }

        dao.findAllWithFieldsAndLimit(queryObj, skip, limit, null, null, $$.m.ContactActivity, function(err, list){
            if(err) {
                log.error('Error listing activities by contactId: ' + err);
                fn(err, null);
            } else {
                log.debug('<< listActivitiesByContactId');
                fn(null, list);
            }
        });
    },

    findActivities: function(accountId, contactId, activityTypeAry, noteText, detailText, beforeTimestamp,
                             afterTimestamp, skip, limit, isRead, fn) {

        var self = this;
        log.debug('>> findActivities', activityTypeAry);
        var queryObj = {};

        if(accountId) {
            queryObj.accountId = accountId;
        }
        if(contactId) {
            queryObj.contactId = contactId;
        }
        if(activityTypeAry && activityTypeAry.indexOf(',') === -1 && $.isArray(activityTypeAry) && activityTypeAry.length > 0) {
            queryObj.activityType = {'$in' : activityTypeAry};
        } else if(activityTypeAry && activityTypeAry.indexOf(',') != -1) {
            queryObj.activityType = activityTypeAry;
        }
        if(noteText) {
            //queryObj.note = '/' + noteText + '/';
            queryObj.note = {'$regex': noteText, '$options':'i'};
        }
        if(detailText) {
            queryObj.detail = '/' + detailText + '/';
        }
        if(beforeTimestamp && afterTimestamp) {
            queryObj.start = {'$gte' : afterTimestamp, '$lte': beforeTimestamp};
        } else if(beforeTimestamp) {
            queryObj.start = {'$lte': beforeTimestamp};
        } else if(afterTimestamp) {
            queryObj.start = {'$gte' : afterTimestamp};
        }

        if(isRead && (isRead === 'true')) {
            queryObj.read = true;
        }

        if(isRead && isRead === 'false') {
            queryObj.read = false;
        }

        log.debug('Submitting query: ' + JSON.stringify(queryObj));

        //dao.findAllWithFieldsAndLimit(queryObj, skip, limit, null, null, $$.m.ContactActivity, function(err, list){
        dao.findWithFieldsLimitAndTotal(queryObj, skip, limit, null, null, $$.m.ContactActivity, function(err, list){
            if(err) {
                log.error('Error finding activities: ' + err);
                fn(err, null);
            } else {
                log.debug('<< findActivities');
                fn(null, list);
            }
        });

    },

    markActivityRead: function(activityId, fn) {
        var self = this;
        log.debug('>> markActivityRead');

        dao.getById(activityId, $$.m.ContactActivity, function(err, value){
            if(err|| value===null) {
                log.error('Error getting activity: ' + err);
                return fn(err, null);
            }
            value.set('read', true);
            dao.saveOrUpdate(value, function(err, value){
                if(err) {
                    log.error('Error updating activity: ' + err);
                    return fn(err, null);
                }
                log.debug('<< markActivityRead');
                return fn(null, value);
            });
        });
    }


};