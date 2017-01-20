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
        app.get(this.url('all'), this.isAuthAndSubscribedApi.bind(this), this.generateAllInsightReports.bind(this));

        //broadcast messages
        app.get(this.url('messages'), this.isAuthAndSubscribedApi.bind(this), this.listBroadcastMessages.bind(this));
        app.get(this.url('messages/active'), this.isAuthAndSubscribedApi.bind(this), this.getActiveBroadcastMessages.bind(this));
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
        var destinationAddress = 'account_managers@indigenous.io';
        if(appConfig.nonProduction === true) {
            destinationAddress = 'test_account_managers@indigenous.io';
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
        var sendToAccountOwners = false;
        manager.generateInsightsForAllAccounts(accountId, userId, startDate, endDate, scheduledSendDate, sendToAccountOwners, function(err, results){
            self.log.debug(accountId, userId, '<< generateAllInsightReports');
        });
        self.send200(resp);
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

    createBroadcastMessage: function(req, resp){
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> createBroadcastMessage');

        var message = req.body.message;
        var startDate = null;
        var endDate = null;
        if(req.body.startDate){
            startDate = moment(req.body.startDate).toDate();
        }
        if(req.body.startDate){
            endDate = moment(req.body.endDate).toDate();
        }

        manager.createBroadcastMessage(accountId, userId, message, startDate, endDate, function(err, value){
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

