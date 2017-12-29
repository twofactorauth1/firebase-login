/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('./dao/contactactivity.dao.js');
var dao = require('./dao/contactactivity.dao.js');
var log = $$.g.getLogger('contactactivity_manager');
var async = require('async');
module.exports = {

  createActivity: function(contactActivity, fn) {
    var self = this;
    log.debug('>> createActivity');
    contactActivity.attributes.start = new Date(contactActivity.attributes.start);
    if(contactActivity.attributes.end)
      contactActivity.attributes.end = new Date(contactActivity.attributes.end);
    dao.saveOrUpdate(contactActivity, function(err, value) {
      if (err) {
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

    dao.getById(activityId, $$.m.ContactActivity, function(err, value) {
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
    log.debug('>> listActivities');

    dao.findAllWithFieldsAndLimit({
        'accountId': accountId
      }, skip, limit, null, null, $$.m.ContactActivity,
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

  listActivitiesByContactId: function(accountId, contactId, skip, limit, isRead, fn) {
    var self = this;
    log.debug('>> listActivitiesByContactId');
    var queryObj = {
      'accountId': accountId,
      'contactId': contactId
    };
    if (isRead && isRead === 'true') {
      queryObj.read = true;
    }
    if (isRead && isRead === 'false') {
      queryObj.read = false;
    }

    dao.findAllWithFieldsAndLimit(queryObj, skip, limit, null, null, $$.m.ContactActivity, function(err, list) {
      if (err) {
        log.error('Error listing activities by contactId: ' + err);
        fn(err, null);
      } else {
        log.debug('<< listActivitiesByContactId');
        fn(null, list);
      }
    });
  },

  getActivitySessionByContactId: function(accountId, contactId, skip, limit, fn) {
    var self = this;
    log.debug('>> getActivitySessionByContactId');
    var queryObj = {
      'accountId': accountId,
      'contactId': contactId,
      'activityType': {$ne: 'PAGE_VIEW'}
    };

    dao.findAllWithFieldsAndLimit(queryObj, skip, limit, null, null, $$.m.ContactActivity, function(err, list) {
      if (err) {
        log.error('Error listing activities by contactId: ' + err);
        fn(err, null);
      } else {
        log.debug('<< getActivitySessionByContactId');
        // Bind activity with session
        async.each(list, function(activity, cb){
            if(activity.get("sessionId")){
              var sessionId = activity.get("sessionId");
              dao.findOne({session_id: sessionId, accountId: accountId}, $$.m.SessionEvent, function(err, value){
                if(err) {
                    _log.error('Error finding session events: ' + err);
                    cb(err);
                } else {
                    activity.set("session_event", value);
                    cb()
                }
              });
            }
            else{
              cb()
            }
        }, function(err){
            fn(null, list);
        });
      }
    });
  },


  findActivities: function(accountId, contactId, activityTypeAry, noteText, detailText, beforeTimestamp,
    afterTimestamp, skip, limit, isRead, includeDeleted, fn) {

    var self = this;
    log.debug('>> findActivities', activityTypeAry);
    var queryObj = {};

    if (accountId) {
      queryObj.accountId = accountId;
    }
    if (contactId) {
      queryObj.contactId = contactId;
    }
    if (activityTypeAry && activityTypeAry.indexOf(',') === -1 && $.isArray(activityTypeAry) && activityTypeAry.length > 0) {
      queryObj.activityType = {
        '$in': activityTypeAry
      };
    } else if (activityTypeAry && activityTypeAry.indexOf(',') != -1) {
      queryObj.activityType = activityTypeAry;
    }
    if (noteText) {
      //queryObj.note = '/' + noteText + '/';
      queryObj.note = {
        '$regex': noteText,
        '$options': 'i'
      };
    }
    if (detailText) {
      queryObj.detail = '/' + detailText + '/';
    }
    if (beforeTimestamp && afterTimestamp) {
      queryObj.start = {
        '$gte': afterTimestamp,
        '$lte': beforeTimestamp
      };
    } else if (beforeTimestamp) {
      queryObj.start = {
        '$lte': beforeTimestamp
      };
    } else if (afterTimestamp) {
      queryObj.start = {
        '$gte': afterTimestamp
      };
    }

    if (isRead && (isRead === 'true')) {
      queryObj.read = true;
    }

    if (isRead && isRead === 'false') {
      queryObj.read = false;
    }

    if(includeDeleted === true || includeDeleted === 'true') {
        //do the query as is
        dao.findWithFieldsLimitAndTotal(queryObj, skip, limit, null, null, $$.m.ContactActivity, function(err, list) {
            if (err) {
                log.error('Error finding activities: ' + err);
                return fn(err, null);
            } else {
                log.debug('<< findActivities');
                return fn(null, list);
            }
        });
    } else {
        var contactQuery = {};
        if(accountId) {
            contactQuery.accountId = accountId;
        }
        dao.findMany(contactQuery, $$.m.Contact, function(err, contacts){
            if(err) {
                log.error('Error finding activities: ' + err);
                return fn(err, null);
            } else {
                var idAry = _.map(contacts, function(contact){return contact.id();});
                if(idAry && idAry.length > 0)
                    queryObj.contactId = {'$in':idAry};
                log.debug('Submitting query: ' + JSON.stringify(queryObj));
                dao.findWithFieldsLimitAndTotal(queryObj, skip, limit, null, null, $$.m.ContactActivity, function(err, list) {
                    if (err) {
                        log.error('Error finding activities: ' + err);
                        return fn(err, null);
                    } else {
                        log.debug('<< findActivities');
                        return fn(null, list);
                    }
                });
            }
        });
    }

  },

  markActivityRead: function(activityId, fn) {
    var self = this;
    log.debug('>> markActivityRead');

    dao.getById(activityId, $$.m.ContactActivity, function(err, value) {
      if (err || value === null) {
        log.error('Error getting activity: ' + err);
        return fn(err, null);
      }
      value.set('read', true);
      dao.saveOrUpdate(value, function(err, value) {
        if (err) {
          log.error('Error updating activity: ' + err);
          return fn(err, null);
        }
        log.debug('<< markActivityRead');
        return fn(null, value);
      });
    });
  }


};
