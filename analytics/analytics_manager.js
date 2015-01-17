/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
require('./dao/analytics.dao.js');
var _log = $$.g.getLogger("analytics_manager");
var SEGMENTIO = 'segment.io';
var dao = require('./dao/analytics.dao.js');
var segmentConfig = require('../configs/segmentio.config');
var Analytics = require('analytics-node');
var analytics = new Analytics(segmentConfig.SEGMENT_WRITE_KEY);
var contactDao = require('../dao/contact.dao');
var contactActivityManager = require('../contactactivities/contactactivity_manager');
var async = require('async');

module.exports = {


    createEventFromSegment: function(segmentObj, fn) {
        var self = this;
        _log.debug('>> createEventFromSegment');
        /*
         * if there is a groupId, use that
         * if there are traits, use traits[accountId]
         * if there are properties, use properties[accountId]
         * else 0
         */
        var accountId = 0;
        if(segmentObj.hasOwnProperty('groupId')){
            accountId = segmentObj.groupId;
        } else if(segmentObj.hasOwnProperty('traits')){
            accountId = segmentObj.traits['accountId'];
        } else if(segmentObj.hasOwnProperty('properties')){
            accountId = segmentObj.properties['accountId'];
        }
        var analyticEvent = new $$.m.AnalyticsEvent({
            type: segmentObj.type,
            source: SEGMENTIO,
            accountId:accountId,
            timestamp: new Date(),
            body:segmentObj
        });
        dao.saveOrUpdate(analyticEvent, function(err, value){
            if(err) {
                _log.error('Exception saving event: ' + err);
                fn(err, null);
            } else {
                _log.debug('<< createEventFromSegment');
                fn(null, value);
            }
        });
        //associate the event to a contact.

    },

    createEvent: function(analyticsEvent, fn) {
        var self = this;
        _log.debug('>> createEvent');
        dao.saveOrUpdate(analyticsEvent, function(err, value){
            if(err) {
                _log.error('Exception saving event: ' + err);
                fn(err, null);
            } else {
                _log.debug('<< createEvent');
                fn(null, value);
            }
        });
    },

    updateEvent: function(analyticsEvent, fn) {
        var self = this;
        _log.debug('>> updateEvent');
        dao.saveOrUpdate(analyticsEvent, function(err, value){
            if(err) {
                _log.error('Exception updating event: ' + err);
                fn(err, null);
            } else {
                _log.debug('<< updateEvent');
                fn(null, value);
            }
        });
    },

    getEvent: function(eventID, fn) {
        var self = this;
        _log.debug('>> getEvent');
        dao.getById(eventID, $$.m.AnalyticsEvent, function(err, value){
            if(err) {
                _log.error('Exception getting event: ' + err);
                fn(err, null);
            } else {
                _log.debug('<< getEvent');
                fn(null, value);
            }
        });
    },

    removeEvent: function(eventID, fn) {
        var self = this;
        _log.debug('>> removeEvent');
        dao.removeById(eventID, $$.m.AnalyticsEvent, function(err, value){
            if(err) {
                _log.error('Exception removing event: ' + err);
                fn(err, null);
            } else {
                _log.debug('<< removeEvent');
                fn(null, value);
            }
        });
    },

    listEvents: function(accountId, limit, skip, fn) {
        var self = this;
        _log.debug('>> listEvents');
        var query = {};
        if(accountId) {
            query.accountId = accountId;
        }
        dao.findAllWithFieldsAndLimit(query, skip, limit, null, null, $$.m.AnalyticsEvent, function(err, list){
            if(err) {
                _log.error('Exception listing events: ' + err);
                fn(err, null);
            } else {
                _log.debug('<< listEvents');
                fn(null, list);
            }
        });
    },

    linkUsers: function(oldId, newId, fn) {
        var self = this;
        _log.debug('>> linkUsers');
        analytics.alias({
            previousId: oldId,
            userId: newId
        }, function(err, value){
            if(err) {
                _log.error('Error calling segment to link users: ' + err);
            } else {
                _log.debug('Linked users: ' + value);
            }
            _log.debug('<< linkUsers');
            fn(null, value);
        });
    },

    storeSessionEvent: function(sessionEvent, fn) {
        var self = this;
        _log.debug('>> storeSessionEvent');
        //check if we have one already....
        dao.findOne({session_id: sessionEvent.get('session_id')}, $$.m.SessionEvent, function(err, value){
            if(err) {
                _log.error('Error looking for duplicate sessionEvents: ' + err);
                fn(err, null);
            } else if(value=== null) {


                var fingerprint = sessionEvent.get('fingerprint');

                $$.dao.ContactDao.findMany({fingerprint:fingerprint}, $$.m.Contact, function(err, list){
                    if(err) {
                        _log.error('error creating contact activity for session event: ' + err);
                    } else {
                        async.each(list, function(contact, cb){
                            var contactActivity = new $$.m.ContactActivity({
                                accountId: contact.get('accountId'),
                                contactId: contact.id(),
                                activityType: $$.m.ContactActivity.types.PAGE_VIEW,
                                start: new Date()
                            });
                            contactActivityManager.createActivity(contactActivity, function(err, val){
                                if(err) {
                                    _log.error('error creating contact activity for session event: ' + err);
                                    cb(err);
                                } else {
                                    cb();
                                }
                            });
                        }, function(err){
                            _log.debug('Created contact activities for session event');
                            dao.saveOrUpdate(sessionEvent, fn);
                        });
                    }
                });
            } else {
                //already have one.  Store a ping instead.
                var pingEvent = new $$.m.PingEvent({
                    session_id: sessionEvent.get('session_id'),
                    server_time: sessionEvent.get('server_time')
                });
                dao.saveOrUpdate(pingEvent, fn);
            }
        });


    },

    findSessionEventsByFingerprint: function(fingerprint, accountId, fn) {
        _log.debug('>> findSessionEventsByFingerprint');
        var query = {
            fingerprint: fingerprint,
            accountId: accountId
        };
        dao.findMany(query, $$.m.SessionEvent, function(err, value){
            if(err) {
                _log.error('Error finding session events: ' + err);
                fn(err, null);
            } else {
                _log.debug('<< findSessionEventsByFingerprint');
                fn(null, value);
            }
        });
    },

    storePageEvent: function(pageEvent, fn) {
        _log.debug('>> storePageEvent');
        dao.saveOrUpdate(pageEvent, fn);
    },

    storePingEvent: function(pingEvent, fn) {
        _log.debug('>> storePingEvent');
        dao.saveOrUpdate(pingEvent, fn);
    }

}