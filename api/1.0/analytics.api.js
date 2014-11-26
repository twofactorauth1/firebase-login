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
var async = require('async');

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

        app.post(this.url('mandrill/event'), this.sendToKeen.bind(this));

        //visit
        app.post(this.url('session/:id/sessionStart'), this.storeSessionInfo.bind(this));
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
        var url = "https://api.keen.io/3.0/projects/54528c1380a7bd6a92e17d29/events/";
        var api_key = "c36124b0ccbbfd0a5e50e6d8c7e80a870472af9bf6e74bd11685d30323096486a19961ebf98d57ee642d4b83e33bd3929c77540fa479f46e68a0cdd0ab57747a96bff23c4d558b3424ea58019066869fd98d04b2df4c8de473d0eb66cc6164f03530f8ab7459be65d3bf2e8e8a21c34a";
        async.eachSeries(messagesToSend, function(message, callback){
            //var url = 'https://api.keen.io/3.0/projects/54528c1380a7bd6a92e17d29/events/mandrill_events?api_key=c36124b0ccbbfd0a5e50e6d8c7e80a870472af9bf6e74bd11685d30323096486a19961ebf98d57ee642d4b83e33bd3929c77540fa479f46e68a0cdd0ab57747a96bff23c4d558b3424ea58019066869fd98d04b2df4c8de473d0eb66cc6164f03530f8ab7459be65d3bf2e8e8a21c34a';

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
        sessionEvent.set('server_time', new Date().getTime());
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

