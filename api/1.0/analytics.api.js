/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var cookies = require('../../utils/cookieutil');
var analyticsDao = require('../../analytics/dao/analyticsDao.js');
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

        //event CRUDL
        app.get(this.url('events'), this.isAuthApi, this.listEvents.bind(this));
        app.post(this.url('events'), this.isAuthApi, this.createEvent.bind(this));
        app.get(this.url('events/:id'), this.isAuthApi, this.getEvent.bind(this));
        app.post(this.url('events/:id'), this.isAuthApi, this.updateEvent.bind(this));
        app.delete(this.url('events/:id'), this.isAuthApi, this.deleteEvent.bind(this));

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

    listEvents: function(req, res) {


        var self = this;
        var accountId = parseInt(self.accountId(req));
        //TODO - add granular security - VIEW_ANALYTICS

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
        var accountId = parseInt(self.accountId(req));
        //TODO - add granular security - MODIFY_ANALYTICS

        self.log.debug('>> createEvent');
        var event = req.body;
        event.accountId = accountId;


        analyticsManager.createEvent(event, function(err, value){
            self.log.debug('<< createEvent');
            self.sendResultOrError(res, err, value, "Error creating Analytic Event");
        });
    },

    getEvent: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        //TODO - add granular security - VIEW_ANALYTICS

        self.log.debug('>> getEvent');
        var eventId = req.params.id;
        analyticsManager.getEvent(eventId, function(err, value){
            self.log.debug('<< getEvent');
            self.sendResultOrError(res, err, value, "Error retrieving Analytic Event");
        });
    },

    updateEvent: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        //TODO - add granular security - MODIFY_ANALYTICS

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
        var accountId = parseInt(self.accountId(req));
        //TODO - add granular security - MODIFY_ANALYTICS

        self.log.debug('>> deleteEvent');
        var eventId = req.params.id;

        analyticsManager.removeEvent(eventId, function(err, value){
            self.log.debug('<< deleteEvent');
            self.sendResultOrError(res, err, value, "Error deleting Analytic Event");
        });
    }
});

module.exports = new api();

