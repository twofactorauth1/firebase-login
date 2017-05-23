/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api.js');
var dao = require('../../insights/dao/insights.dao');
var manager = require('../../insights/insights_manager');
var appConfig = require('../../configs/app.config');
var insightsConfig = require('../../configs/insights.config');
var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "insights",

    version: "2.0",

    dao: dao,

    initialize: function () {
        app.get(this.url('sections/available'), this.isAuthAndSubscribedApi.bind(this), this.getAvailableSections.bind(this));
        app.get(this.url('test'), this.isAuthAndSubscribedApi.bind(this), this.testInsightReport.bind(this));
        app.post(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.sendInsightReport.bind(this));
        app.post(this.url('all'), this.isAuthAndSubscribedApi.bind(this), this.generateAllInsightReports.bind(this));
        //insights cron job - there can be only one
        app.get(this.url('job'), this.isAuthAndSubscribedApi.bind(this), this.getInsightsJob.bind(this));
        app.post(this.url('job'), this.isAuthAndSubscribedApi.bind(this), this.saveOrUpdateInsightsJob.bind(this));
        app.del(this.url('job'), this.isAuthAndSubscribedApi.bind(this), this.deleteInsightsJob.bind(this));
        //statistics
        app.get(this.url(':id/stats'), this.isAuthAndSubscribedApi.bind(this), this.getInsightStatistics.bind(this));

        //broadcast messages
        app.get(this.url('messages'), this.isAuthAndSubscribedApi.bind(this), this.listBroadcastMessages.bind(this));
        app.get(this.url('messages/active'), this.isAuthAndSubscribedApi.bind(this), this.getActiveBroadcastMessages.bind(this));
        app.get(this.url('messages/messageswithuser'), this.isAuthAndSubscribedApi.bind(this), this.getActiveBroadcastMessagesWithUser.bind(this));
        app.post(this.url('messages'), this.isAuthAndSubscribedApi.bind(this), this.createBroadcastMessage.bind(this));
        app.post(this.url('messages/:id'), this.isAuthAndSubscribedApi.bind(this), this.updateBroadcastMessage.bind(this));
        app.del(this.url('messages/:id'), this.isAuthAndSubscribedApi.bind(this), this.removeBroadcastMessage.bind(this));
    },

    getAvailableSections: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getAvailableSections');
        manager.getAvailableSections(accountId, userId, function(err, data){
            self.log.debug(accountId, userId, '<< getAvailableSections');
            self.sendResultOrError(resp, err, data, 'Could not load available sections');
        });
    },

    testInsightReport: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> testInsightReport');
        var customerAccountId = accountId;
        var sections = ['weeklyreport', 'broadcastmessage'];
        var destinationAddress = 'kyle@kyle-miller.com';
        var startDate = moment().subtract(7, 'days').toDate();
        var endDate = moment().toDate();
        manager.generateInsightReport(accountId, userId, 1702, sections, destinationAddress, startDate,
                endDate, function(err, results){
            self.log.debug(accountId, userId, '<< testInsightReport');
            self.sendResultOrError(resp, err, results, 'Could not test insight report');
        });
    },

    sendInsightReport: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> sendInsightReport');

        var customerAccountId = req.body.accountId;
        var sections = ['weeklyreport', 'broadcastmessage'];
        var destinationAddress = insightsConfig.ccAry[0] || 'account_managers+customerproxy@indigenous.io';
        if(appConfig.nonProduction === true) {
            destinationAddress = 'test_account_managers+customerproxy@indigenous.io';
        }
        var startDate = moment().subtract(7, 'days').toDate();
        var endDate = moment().toDate();
        manager.generateInsightReport(accountId, userId, customerAccountId, sections, destinationAddress, startDate,
                endDate, function(err, results){
            self.log.debug(accountId, userId, '<< sendInsightReport');
            self.sendResultOrError(resp, err, results, 'Could not send insight report');
        });
    },

    generateAllInsightReports: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> generateAllInsightReports');
        var startDate = moment().subtract(7, 'days').toDate();
        var endDate = moment().toDate();
        var scheduledSendDate = null;
        var sendToAccountOwners = true;
        manager.generateInsightsForAllAccounts(accountId, userId, startDate, endDate, scheduledSendDate, sendToAccountOwners, function(err, results){
            self.log.debug(accountId, userId, '<< generateAllInsightReports');
        });
        self.send200(resp);
    },

    getInsightsJob: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getInsightsJob');
        manager.getInsightJob(accountId, userId, function(err, job){
            self.log.debug(accountId, userId, '<< getInsightsJob');
            self.sendResultOrError(resp, err, job, 'Could not get insight job');
        });
    },

    saveOrUpdateInsightsJob: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> saveOrUpdateInsightsJob');

        //TODO: un-hardcode these sometime

        var scheduledDay = 6;
        var scheduledTime = 20;
        var sendToAccountOwners = false;

        manager.createOrUpdateInsightJob(accountId, userId, scheduledDay, scheduledTime, sendToAccountOwners, function(err, job){
            self.log.debug(accountId, userId, '<< saveOrUpdateInsightsJob');
            self.sendResultOrError(resp, err, job, 'Could not save insight job');
        });
    },

    deleteInsightsJob: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> deleteInsightsJob');

        manager.deleteInsightJob(accountId, userId, function(err, job){
            self.log.debug(accountId, userId, '<< deleteInsightsJob');
            self.sendResultOrError(resp, err, job, 'Could not delete insight job');
        });
    },

    getInsightStatistics: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getInsightStatistics');
        var id = req.params.id;
        manager.getInsightStatistics(accountId, userId, id, function(err, stats){
            self.log.debug(accountId, userId, '<< getInsightStatistics');
            self.sendResultOrError(resp, err, stats, 'Could not get insight statistics');
        });

    },

    listBroadcastMessages: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> listBroadcastMessages');

        manager.listBroadcastMessages(accountId, userId, function(err, value){
            self.log.debug(accountId, userId, '<< listBroadcastMessages');
            self.sendResultOrError(resp, err, value, 'Could not list messages');
        });
    },

    getActiveBroadcastMessages: function(req, resp){
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getActiveBroadcastMessages');

        manager.getActiveBroadcastMessages(accountId, userId, function(err, value){
            self.log.debug(accountId, userId, '<< getActiveBroadcastMessages');
            self.sendResultOrError(resp, err, value, 'Could not get active messages');
        });
    },

    getActiveBroadcastMessagesWithUser: function(req, resp){
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getActiveBroadcastMessagesWithUser');

        manager.getActiveBroadcastMessagesWithUser(accountId, userId, function(err, value){
            self.log.debug(accountId, userId, '<< getActiveBroadcastMessagesWithUser');
            self.sendResultOrError(resp, err, value, 'Could not get active messages');
        });
    },



    createBroadcastMessage: function(req, resp){
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> createBroadcastMessage');

        var message = req.body.message;
        var startDate = null;
        var endDate = null;
        var subject = null;
        if(req.body.startDate){
            startDate = moment(req.body.startDate).toDate();
        }
        if(req.body.endDate){
            endDate = moment(req.body.endDate).toDate();
        }

        if(req.body.subject){
            subject = req.body.subject;
        }

        manager.createBroadcastMessage(accountId, userId, message, subject, startDate, endDate, function(err, value){
            self.log.debug(accountId, userId, '<< createBroadcastMessage');
            self.sendResultOrError(resp, err, value, 'Could not create message');
        });
    },

    updateBroadcastMessage: function(req, resp){
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> updateBroadcastMessage');

        var msg = new $$.m.BroadcastMessage(req.body);
        msg.set('_id', req.params.id);
        var startDate = null;
        var endDate = null;

        if(req.body.startDate){
            startDate = moment(req.body.startDate).toDate();
        }
        if(req.body.startDate){
            endDate = moment(req.body.endDate).toDate();
        }

        msg.set("startDate", startDate);
        msg.set("endDate", endDate);

        manager.updateBroadcastMessage(accountId, userId, msg, function(err, value){
            self.log.debug(accountId, userId, '<< updateBroadcastMessage');
            self.sendResultOrError(resp, err, value, 'Could not update message');
        });
    },

    removeBroadcastMessage: function(req, resp){
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> removeBroadcastMessage');

        var msgId = req.params.id;
        manager.deleteBroadcastMessage(accountId, userId, msgId, function(err, value){
            self.log.debug(accountId, userId, '<< removeBroadcastMessage');
            if(err) {
                self.wrapError(resp, 500, err, "Could not delete message");
            } else {
                self.send200(resp);
            }
        });
    }

});

module.exports = new api({version:'2.0'});

