/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var cookies = require('../../utils/cookieutil');
var analyticsDao = require('../../analytics/dao/analytics.dao.js');
var analyticsManager = require('../../analytics/analytics_manager.js');
var keenConfig = require('../../configs/keen.config');
var async = require('async');
var contactDao = require('../../dao/contact.dao');
var contactActivityManager = require('../../contactactivities/contactactivity_manager');
var urlUtils = require('../../utils/urlutils');

var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "analytics",

    dao: analyticsDao,

    initialize: function() {

        //segmentio webhook
        app.post(this.url('webhook/event'), this.verifyEvent, this.saveAnalyticEvent.bind(this));
        app.get(this.url('webhook/event'), this.verifyEvent, this.showOk.bind(this));

        //event CRUDL
        app.get(this.url('events'), this.isAuthAndSubscribedApi.bind(this), this.listEvents.bind(this));
        app.post(this.url('events'), this.isAuthAndSubscribedApi.bind(this), this.createEvent.bind(this));
        app.get(this.url('events/:id'), this.isAuthAndSubscribedApi.bind(this), this.getEvent.bind(this));
        app.post(this.url('events/:id'), this.isAuthAndSubscribedApi.bind(this), this.updateEvent.bind(this));
        app.delete(this.url('events/:id'), this.isAuthAndSubscribedApi.bind(this), this.deleteEvent.bind(this));

        app.post(this.url('mandrill/event'), this.filterMandrillEvents.bind(this), this.sendToKeen.bind(this));

        //visit
        app.post(this.url('session/:id/sessionStart'), this.setup.bind(this), this.storeSessionInfo.bind(this));
        app.post(this.url('session/:id/pageStart'), this.storePageInfo.bind(this));
        app.post(this.url('session/:id/ping'), this.storePingInfo.bind(this));


    },

    sendToKeen: function(req, res) {
        var self = this;
        self.log.debug('>> sendToKeen');
        //var request = require('request');
        var request = require('superagent');

        var msg = {};
        var messagesToSend = [];
        if(req.body.mandrill_events) {
            try {
                msg = JSON.parse(req.body.mandrill_events);
                if(_.isArray(msg)) {
                    //msg = {'mandrill_events': JSON.parse(req.body.mandrill_events)};
                    _.each(msg, function(value, key, list){
                        var obj = {};
                        var name = 'mandrill_' + value.event;
                        obj.collection = name;
                        obj.value = value;
                        messagesToSend.push(obj);
                    });
                } else {
                    messagesToSend.push(msg);
                }
            } catch(err) {
                self.log.debug('error parsing events: ' + err);
                msg = req.body;
            }

        } else {
            msg = req.body;
            messagesToSend.push(msg);
        }
        //self.log.info('Sending the following to keen:');
        //console.dir(messagesToSend);
        var url = "https://api.keen.io/3.0/projects/"+keenConfig.KEEN_PROJECT_ID+"/events/";
        var api_key = keenConfig.KEEN_WRITE_KEY;
        async.eachSeries(messagesToSend, function(message, callback){
            console.log('url ', url + message.collection + '?api_key=' + api_key);
            var newrequest = request.post(url + message.collection + '?api_key=' + api_key)
                .send(message.value)
                .end(function(error, result){
                    if(error) {
                        self.log.error("received error: " + error);
                    }
                });
            callback();
        }, function(err){
            if(err) {
                console.log('Error duing send to keen: ' + err);
            } else {
                self.log.debug('<< sendToKeen');
            }
        });

        //TODO: Verify message from mandirll
        //TODO: parameterize url
        self.sendResult(res, {'ok': 'ok'});
    },

    verifyEvent: function(req, res, next) {
        //TODO: verify event comes from segment
        next();
    },

    filterMandrillEvents: function(req, res, next) {
        //TODO: create customActivities
        var self = this;
        self.log.debug('>> filterMandrillEvents');
        var msg = null;
        var objArray = [];
        if(req.body.mandrill_events) {
            try {
                msg = JSON.parse(req.body.mandrill_events);
                if(_.isArray(msg)) {
                    _.each(msg, function (value, key, list) {
                        var type = value.event;
                        var obj = {};
                        obj.email = value.msg.email;
                        obj.sender = value.msg.sender;
                        obj.ts = moment.utc(value.ts*1000).toDate();
                        if (type === 'send') {
                            obj.activityType = $$.m.ContactActivity.types.EMAIL_DELIVERED;
                            objArray.push(obj);
                        } else if (type === 'open') {
                            obj.activityType = $$.m.ContactActivity.types.EMAIL_OPENED;
                            objArray.push(obj);
                        } else if (type === 'click') {
                            obj.activityType = $$.m.ContactActivity.types.EMAIL_CLICKED;
                            objArray.push(obj);
                        } else if (type === 'unsub') {
                            obj.activityType = $$.m.ContactActivity.types.EMAIL_UNSUB;
                            objArray.push(obj);
                        }
                    });
                }
            } catch(err) {
                self.log.debug('error parsing events: ' + err);
                msg = req.body;
            }

        }

        self.log.debug('<< filterMandrillEvents');
        next();
        //create contactActivities from events.
        _.each(objArray, function(value, key, list){
            var query = {};
            //TODO: get contactId from sender Email
            //query.accountId = value.id();
            query['details.emails.email'] = value.email;

            contactDao.findMany(query, $$.m.Contact, function(err, list){
                if(err) {
                    self.log.error('Error finding contacts by email: ' + err);
                } else if(!list || list.length < 1) {
                    self.log.warn('Contact could not be found for email address: ' + value.email);
                } else if(list.length > 1) {
                    self.log.warn('Too many contacts found for email address: ' + value.email);
                } else {
                    var contact = list[0];
                    var activity = new $$.m.ContactActivity({
                        accountId: contact.get('accountId'),
                        contactId: contact.id(),
                        activityType: value.activityType,
                        start: value.ts
                    });
                    contactActivityManager.createActivity(activity, function(err, value){});
                }
            });
        });
    },

    saveAnalyticEvent: function(req, res) {
        var self = this;
        self.log.debug('>> saveAnalyticEvent');
        analyticsManager.createEventFromSegment(req.body, function(err, event){
            self.send200(res);
            if(err) {
                self.log.error('Exception storing event: ' + err);
                self.log.error(JSON.stringify(req.body));
            } else {
                self.log.debug('<< saveAnalyticEvent');
            }
        });
    },

    showOk: function(req, res) {
        var self = this;
        self.sendResult(res, {'ok': 'ok'});
    },

    listEvents: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));

        self.checkPermission(req, self.sc.privs.VIEW_ANALYTICS, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(res);
            } else {
                var skip = req.query['skip'];
                var limit = req.query['limit'];
                self.log.debug('>> listEvents');
                analyticsManager.listEvents(accountId, limit, skip, function(err, eventList){
                    self.log.debug('<< listEvents');
                    self.sendResultOrError(res, err, eventList, "Error listing Analytic Events");
                });
            }
        });
    },

    createEvent: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));

        self.log.debug('>> createEvent');
        self.checkPermission(req, self.sc.privs.MODIFY_ANALYTICS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var event = req.body;
                event.accountId = accountId;

                analyticsManager.createEvent(event, function(err, value){
                    self.log.debug('<< createEvent');
                    self.sendResultOrError(res, err, value, "Error creating Analytic Event");
                });
            }
        });

    },

    getEvent: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        self.log.debug('>> getEvent');

        self.checkPermission(req, self.sc.privs.VIEW_ANALYTICS, function(err, isAllowed){
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var eventId = req.params.id;
                analyticsManager.getEvent(eventId, function(err, value){
                    self.log.debug('<< getEvent');
                    self.sendResultOrError(res, err, value, "Error retrieving Analytic Event");
                });
            }
        });

    },

    updateEvent: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));

        self.log.debug('>> updateEvent');
        self.checkPermission(req, self.sc.privs.MODIFY_ANALYTICS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var eventId = req.params.id;
                var event = req.body;
                event._id = eventId;

                analyticsManager.updateEvent(event, function(err, value){
                    self.log.debug('<< updateEvent');
                    self.sendResultOrError(res, err, value, "Error updating Analytic Event");
                });
            }
        });

    },

    deleteEvent: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));

        self.log.debug('>> deleteEvent');
        self.checkPermission(req, self.sc.privs.MODIFY_ANALYTICS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var eventId = req.params.id;

                analyticsManager.removeEvent(eventId, function(err, value){
                    self.log.debug('<< deleteEvent');
                    self.sendResultOrError(res, err, value, "Error deleting Analytic Event");
                });
            }
        });

    },

    storeSessionInfo: function(req, res) {
        var self = this;
        var sessionEvent = new $$.m.SessionEvent(req.body);
        sessionEvent.set('session_id', req.params.id);
        //console.log('Storing Session API >>> ', new Date().getTime());
        sessionEvent.set('server_time', new Date().getTime());
        sessionEvent.set('ip_address', self.ip(req));
        var geoInfo = self.geo(req);
        sessionEvent.set('ip_geo_info', geoInfo);

        sessionEvent.set('accountId', self.accountId(req));

        var subdomainObj = urlUtils.getSubdomainFromRequest(req);
        if(subdomainObj.isMainApp===true) {
            sessionEvent.set('subdomain', 'main');
        } else {
            sessionEvent.set('subdomain', subdomainObj.subdomain);
        }
        


        analyticsManager.storeSessionEvent(sessionEvent, function(err){
            if(err) {
                self.log.error('Error saving session event: ' + err);
            }
        });

        return self.send200(res);
    },

    storePageInfo: function(req, res) {
        var self = this;
        var pageEvent = new $$.m.PageEvent(req.body);
        pageEvent.set('session_id', req.params.id);
        pageEvent.set('server_time', new Date().getTime());
        analyticsManager.storePageEvent(pageEvent, function(err){
            if(err) {
                self.log.error('Error saving page event: ' + err);
            }
        });

        self.send200(res);
    },

    storePingInfo: function(req, res) {
        var self = this;
        var pingEvent = new $$.m.PingEvent(req.body);
        pingEvent.set('session_id', req.params.id);
        pingEvent.set('server_time', new Date().getTime());
        analyticsManager.storePingEvent(pingEvent, function(err){
            if(err) {
                self.log.error('Error saving ping event: ' + err);
            }
        });

        self.send200(res);
    }
});

module.exports = new api();

