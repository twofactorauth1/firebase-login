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

    listActivitiesByContactId: function(accountId, contactId, skip, limit, fn) {
        var self = this;
        log.debug('>> listActivitiesByContactId');
        var queryObj = {'accountId': accountId, 'contactId': contactId};

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
                             afterTimestamp, skip, limit, fn) {

        var self = this;
        log.debug('>> findActivities');
        var queryObj = {};

        if(accountId) {
            queryObj.accountId = accountId;
        }
        if(contactId) {
            queryObj.contactId = contactId;
        }
        if(activityTypeAry && isArray(activityTypeAry)) {
            queryObj.activityType = {'$in' : activityTypeAry};
        } else if(activityTypeAry) {
            queryObj.activityType = activityTypeAry;
        }
        if(noteText) {
            queryObj.note = '/' + noteText + '/';
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

        log.debug('Submitting query: ' + JSON.stringify(queryObj));

        dao.findAllWithFieldsAndLimit(queryObj, skip, limit, null, null, $$.m.ContactActivity, function(err, list){
            if(err) {
                log.error('Error finding activities: ' + err);
                fn(err, null);
            } else {
                log.debug('<< findActivities');
                fn(null, list);
            }
        });

    }


};