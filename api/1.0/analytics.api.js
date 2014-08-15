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
        app.delete(this.urL('events/:id'), this.isAuthApi, this.deleteEvent.bind(this));

    },

    verifyEvent: function(req, res, next) {
        next();
    },

    saveAnalyticEvent: function(req, res) {

    },

    listEvents: function(req, res) {
        //TODO - add granular security

        var self = this;
        self.log.debug('>> listEvents');
        analyticsManager.listEvents(function(err, eventList){
            self.log.debug('<< listEvents');
            self.sendResultOrError(res, err, eventList, "Error listing Analytic Events");
        });
    },

    createEvent: function(req, res) {

    },

    getEvent: function(req, res) {

    },

    updateEvent: function(req, res) {

    },

    deleteEvent: function(req, res) {

    }
});

module.exports = new api();

