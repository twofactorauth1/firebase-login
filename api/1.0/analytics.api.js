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

    }
});

module.exports = new api();

