/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api.js');
var workstreamDao = require('../../workstream/dao/workstream.dao');
var workstreamManager = require('../../workstream/workstream_manager');

var moment = require('moment');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "dashboard",

    version: "2.0",

    dao: workstreamDao,

    initialize: function () {

        app.get(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.getDashboardForAccount.bind(this));
        app.get(this.url('workstreams'), this.isAuthAndSubscribedApi.bind(this), this.getWorkstreamsForAccount.bind(this));
        app.get(this.url('workstreams/:id'), this.isAuthAndSubscribedApi.bind(this), this.getWorkstream.bind(this));
        app.post(this.url('workstreams/:id/unlock'), this.isAuthAndSubscribedApi.bind(this), this.unlockWorkstream.bind(this));
        app.post(this.url('workstreams/:id/blocks/:blockId/complete'), this.isAuthAndSubscribedApi.bind(this), this.markBlockComplete.bind(this));

        //these might need to move into their own api
        app.get(this.url('reports/contactsByDay'), this.isAuthAndSubscribedApi.bind(this), this.getContactsByDayReport.bind(this));
        app.get(this.url('reports/pageViewsByDay'), this.isAuthAndSubscribedApi.bind(this), this.getPageViewsByDayReport.bind(this));
        app.get(this.url('reports/newVisitorsByDay'), this.isAuthAndSubscribedApi.bind(this), this.getNewVisitorsByDayReport.bind(this));
        app.get(this.url('reports/revenueByMonth'), this.isAuthAndSubscribedApi.bind(this), this.getRevenueByMonthReport.bind(this));
        app.get(this.url('reports/campaignStatsByMonth'), this.isAuthAndSubscribedApi.bind(this), this.getCampaignStatsByMonthReport.bind(this));

        app.get(this.url('analytics'), this.isAuthAndSubscribedApi.bind(this), this.getDashboardAnalytics.bind(this));
    },

    noop: function(req, resp) {
        var self = this;
        self.log.debug('>> noop');
        var accountId = parseInt(self.accountId(req));
        self.log.debug('<< noop');
        self.sendResult(resp, {msg:'method not implemented'});
    },

    /*
     * This will return workstreams and analytic widgets
     */
    getDashboardForAccount: function(req, resp) {
        var self = this;
        self.sendResult(resp, {msg:'getDashboardForAccount'});
    },

    getWorkstreamsForAccount: function(req, resp) {
        var self = this;
        self.log.debug('>> getWorkstreamsForAccount');
        var accountId = parseInt(self.accountId(req));

        //No Authorization
        workstreamManager.listWorkstreams(accountId, function(err, workstreams){
            self.log.debug('<< getWorkstreamsForAccount');
            return self.sendResultOrError(resp, err, workstreams, "Error getting workstreams");
        });
    },

    getWorkstream: function(req, resp) {
        var self = this;
        self.log.debug('>> getWorkstream');
        var accountId = parseInt(self.accountId(req));
        var workstreamId = req.params.id;

        workstreamManager.getWorkstream(accountId, workstreamId, function(err, workstream){
            self.log.debug('<< getWorkstream');
            return self.sendResultOrError(resp, err, workstream, "Error getting workstream");
        });
    },

    unlockWorkstream: function(req, resp) {
        var self = this;
        self.log.debug('>> unlockWorkstream');
        var accountId = parseInt(self.accountId(req));
        var workstreamId = req.params.id;
        var userId = self.userId(req);

        workstreamManager.unlockWorkstream(accountId, workstreamId, userId, function(err, workstream){
            self.log.debug('<< unlockWorkstream');
            return self.sendResultOrError(resp, err, workstream, "Error unlocking workstream");
        });
    },

    markBlockComplete: function(req, resp) {
        var self = this;
        self.log.debug('>> markBlockComplete');
        var accountId = parseInt(self.accountId(req));
        var workstreamId = req.params.id;
        var blockId = parseInt(req.params.blockId);
        var modified = {
            by: self.userId(req),
            date: new Date()
        };

        workstreamManager.markBlockComplete(accountId, workstreamId, blockId, modified, function(err, workstream){
            self.log.debug('<< markBlockComplete');
            return self.sendResultOrError(resp, err, workstream, "Error marking block complete");
        });
    },

    getContactsByDayReport: function(req, resp) {
        var self = this;
        self.log.debug('>> getContactsByDayReport');
        var accountId = parseInt(self.accountId(req));
        var startDate, endDate;
        if(req.query.startDate) {
            startDate = moment(req.query.startDate).toDate();
        } else {
            startDate = moment().startOf('month').toDate();
        }
        if(req.query.endDate) {
            endDate = moment(req.query.endDate);
        } else {
            endDate = moment().endOf('month').toDate();
        }

        workstreamManager.getContactsByDayReport(accountId, startDate, endDate, function(err, results){
            self.log.debug('<< getContactsByDayReport');
            return self.sendResultOrError(resp, err, results, "Error getting report");
        });
    },

    getPageViewsByDayReport: function(req, resp) {
        var self = this;
        self.log.debug('>> getPageViewsByDayReport');
        var accountId = parseInt(self.accountId(req));
        var startDate, endDate;
        if(req.query.startDate) {
            startDate = moment(req.query.startDate).toDate();
        } else {
            startDate = moment().startOf('month').toDate();
        }
        if(req.query.endDate) {
            endDate = moment(req.query.endDate);
        } else {
            endDate = moment().endOf('month').toDate();
        }

        self.log.debug('Using dates:' + startDate + ' and ' + endDate);
        workstreamManager.getPageViewsByDayReport(accountId, startDate, endDate, function(err, results){
            self.log.debug('<< getPageViewsByDayReport');
            return self.sendResultOrError(resp, err, results, "Error getting report");
        });

    },

    getNewVisitorsByDayReport: function(req, resp) {
        var self = this;
        self.log.debug('>> getUniqueVisitorsByDayReport');
        var accountId = parseInt(self.accountId(req));
        var startDate, endDate;
        if(req.query.startDate) {
            startDate = moment(req.query.startDate).toDate();
        } else {
            startDate = moment().startOf('month').toDate();
        }
        if(req.query.endDate) {
            endDate = moment(req.query.endDate);
        } else {
            endDate = moment().endOf('month').toDate();
        }

        self.log.debug('Using dates:' + startDate + ' and ' + endDate);
        workstreamManager.getNewVisitorsByDayReport(accountId, startDate, endDate, function(err, results){
            self.log.debug('<< getUniqueVisitorsByDayReport');
            return self.sendResultOrError(resp, err, results, "Error getting report");
        });
    },

    getRevenueByMonthReport: function(req, resp) {
        var self = this;
        self.log.debug('>> getRevenueByMonthReport');
        var accountId = parseInt(self.accountId(req));

        workstreamManager.getRevenueByMonthReport(accountId, function(err, results){
            self.log.debug('<< getRevenueByMonthReport');
            return self.sendResultOrError(resp, err, results, "Error getting report");
        });
    },

    getCampaignStatsByMonthReport: function(req, resp) {
        var self = this;
        self.log.debug('>> getCampaignStatsByMonthReport');
        var accountId = parseInt(self.accountId(req));
        var startDate, endDate;
        if(req.query.startDate) {
            startDate = moment(req.query.startDate).toDate();
        } else {
            startDate = moment().startOf('month').toDate();
        }
        if(req.query.endDate) {
            endDate = moment(req.query.endDate);
        } else {
            endDate = moment().endOf('month').toDate();
        }

        workstreamManager.getCampaignStatsByMonthReport(accountId, startDate, endDate, function(err, results){
            self.log.debug('<< getCampaignStatsByMonthReport');
            return self.sendResultOrError(resp, err, results, "Error getting report");
        });
    },

    getDashboardAnalytics: function(req, resp) {
        var self = this;
        self.log.debug('>> getDashboardAnalytics');
        var accountId = parseInt(self.accountId(req));
        var startDate, endDate;
        if(req.query.startDate) {
            startDate = moment(req.query.startDate).toDate();
        } else {
            startDate = moment().startOf('month').toDate();
        }
        if(req.query.endDate) {
            endDate = moment(req.query.endDate);
        } else {
            endDate = moment().endOf('month').toDate();
        }

        workstreamManager.getDashboardAnalytics(accountId, startDate, endDate, function(err, results){
            self.log.debug('<< getDashboardAnalytics');
            return self.sendResultOrError(resp, err, results, "Error getting report");
        });
    }

});

module.exports = new api({version:'2.0'});

