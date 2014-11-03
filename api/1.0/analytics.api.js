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
        app.get(this.url('events'), this.isAuthApi, this.listEvents.bind(this));
        app.post(this.url('events'), this.isAuthApi, this.createEvent.bind(this));
        app.get(this.url('events/:id'), this.isAuthApi, this.getEvent.bind(this));
        app.post(this.url('events/:id'), this.isAuthApi, this.updateEvent.bind(this));
        app.delete(this.url('events/:id'), this.isAuthApi, this.deleteEvent.bind(this));

        app.post(this.url('mandrill/event'), this.sendToKeen.bind(this));

    },

    sendToKeen: function(req, res) {
       var self = this;
       self.log.debug('>> sendToKeen', req);
       var request = require('request');
       var options = {};

        options.url = 'https://api.keen.io/3.0/projects/54528c1380a7bd6a92e17d29/events/mandrill_events?api_key=c36124b0ccbbfd0a5e50e6d8c7e80a870472af9bf6e74bd11685d30323096486a19961ebf98d57ee642d4b83e33bd3929c77540fa479f46e68a0cdd0ab57747a96bff23c4d558b3424ea58019066869fd98d04b2df4c8de473d0eb66cc6164f03530f8ab7459be65d3bf2e8e8a21c34a';
        options.headers = {
                'Accept': "application/json",
                'Content-type': "application/json"
        };
       request.post(options, req.body, function(error, response, body) {
            self.log.debug('<< success sendToKeen', body);
        });
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
        //TODO - add granular security

        var self = this;
        var accountId = parseInt(self.accountId(req));
        var skip = req.query['skip'];
        var limit = req.query['limit'];
        self.log.debug('>> listEvents');
        analyticsManager.listEvents(accountId, limit, skip, function(err, eventList){
            self.log.debug('<< listEvents');
            self.sendResultOrError(res, err, eventList, "Error listing Analytic Events");
        });
    },

    createEvent: function(req, res) {
        var self = this;
        //TODO - add granular security

        self.log.debug('>> createEvent');
        var event = req.body;
        event.accountId = parseInt(self.accountId(req));
        analyticsManager.createEvent(event, function(err, value){
            self.log.debug('<< createEvent');
            self.sendResultOrError(res, err, value, "Error creating Analytic Event");
        });
    },

    getEvent: function(req, res) {
        var self = this;
        //TODO - add granular security

        self.log.debug('>> getEvent');
        var eventId = req.params.id;
        analyticsManager.getEvent(eventId, function(err, value){
            self.log.debug('<< getEvent');
            self.sendResultOrError(res, err, value, "Error retrieving Analytic Event");
        });
    },

    updateEvent: function(req, res) {
        var self = this;
        //TODO - add granular security

        self.log.debug('>> updateEvent');
        var eventId = req.params.id;
        var event = req.body;
        event._id = eventId;

        analyticsManager.updateEvent(event, function(err, value){
            self.log.debug('<< updateEvent');
            self.sendResultOrError(res, err, value, "Error updating Analytic Event");
        });
    },

    deleteEvent: function(req, res) {
        var self = this;
        //TODO - add granular security

        self.log.debug('>> deleteEvent');
        var eventId = req.params.id;

        analyticsManager.removeEvent(eventId, function(err, value){
            self.log.debug('<< deleteEvent');
            self.sendResultOrError(res, err, value, "Error deleting Analytic Event");
        });
    }
});

module.exports = new api();

