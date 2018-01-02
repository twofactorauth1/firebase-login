/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('./dao/contactactivity.dao.js');
var dao = require('./dao/contactactivity.dao.js');
var log = $$.g.getLogger('contactactivity_manager');
var pageDao = require('../ssb/dao/page.dao');
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
        var activities = [];
        async.each(list, function(activity, cb){
          activities.push(activity);
          if(activity.get("sessionId")){
            var sessionId = activity.get("sessionId");
            var query = {
              session_id: sessionId, 
              accountId: accountId
            }
            dao.findOne(query, $$.m.SessionEvent, function(err, value){
              if(err) {
                  log.error('Error finding session events: ' + err);
                  cb(err);
              } else {
                activity.set("session_event", value);
                dao.findMany(query, $$.m.PageEvent, function(err, pageEvents){
                  if(err) {
                    _log.error('Error finding session events: ' + err);
                    cb(err);
                  } else {  
                                                           
                    if(pageEvents.length){
                      var page_events = [];
                      var pageIDMap = {};                      
                      async.each(pageEvents, function(pageEvent, callback){
                        var handle = "";
                        if(pageEvent.get("url") && pageEvent.get("url").path){
                          handle = pageEvent.get("url").path;
                        }
                        if(pageEvent.get("requestedUrl") && pageEvent.get("requestedUrl").path){
                          handle = pageEvent.get("requestedUrl").path;
                        }
                        if(handle){
                          if (handle.indexOf('/') === 0) {
                            handle = handle.replace('/', '');
                          }
                          if(!handle){
                            handle = "index";
                          }
                          if(handle == 'blog'){
                            handle = 'blog-list';
                          }
                          console.log(handle);                     
                          var singleEvent = {                          
                            url: pageEvent.get("url"),
                            server_time: pageEvent.get("server_time"),
                            start: pageEvent.get("server_time_dt"),
                            requestedUrl: pageEvent.get("requestedUrl"),
                            entrance: pageEvent.get("entrance") || false
                          }
                          if(pageIDMap[handle] && pageIDMap[handle].handle) {
                            singleEvent.page = pageIDMap[handle];
                            page_events.push(singleEvent);
                            callback();
                          } else {
                            pageDao.getPublishedPageByHandle(handle, accountId, function(err, page) {
                              if(err) {
                                  callback(err)
                              } else {
                                if(page){                                  
                                  var _page =  {
                                    title: page.get("title"),
                                    handle: page.get("handle")
                                  }
                                  singleEvent.page = _page;
                                  pageIDMap[handle] = _page;
                                }
                                else
                                {
                                  singleEvent.page = {
                                    handle: handle
                                  };
                                }
                                page_events.push(singleEvent);
                                callback();
                              }
                            })
                          }  
                        }
                        else{
                          callback()
                        }
                        
                      }, function(err){
                        var accountUrl = '';
                        var entrancePath = '';

                        page_events = _.sortBy(page_events, function(result){return result.server_time});
                        // Unique page events
                        page_events = _.uniq(page_events, function(result){
                          return result.page.handle
                        });
                        if(page_events[0].url && page_events[0].url.protocol && page_events[0].url.domain){
                          accountUrl = page_events[0].url.protocol + "://" + page_events[0].url.domain;
                        }
                        var entranceSession = _.find(page_events, function(event){
                          return event.entrance
                        })
                        if(entranceSession && entranceSession.page){
                          entrancePath = entranceSession.page.title;
                        }
                        activities.push({
                          activityType: 'PAGE_VIEW',
                          start: page_events[0].start,
                          page_events: page_events,
                          accountUrl: accountUrl,
                          entrancePath: entrancePath
                        })
                        cb();
                      });
                    }
                    else{
                      cb();
                    }                    
                  }
                })
              }
            });
          }
          else{
            cb()
          }
        }, function(err){
          fn(null, activities);
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
