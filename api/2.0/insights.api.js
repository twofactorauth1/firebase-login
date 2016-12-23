/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api.js');
var dao = require('../../insights/dao/insights.dao');
var manager = require('../../insights/insights_manager');

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
        var sections = ['weeklyreport'];
        var destinationAddress = 'kyle@indigenous.io';
        var startDate = moment().subtract(7, 'days').toDate();
        var endDate = moment().toDate();
        manager.generateInsightReport(accountId, userId, customerAccountId, sections, destinationAddress, startDate,
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
        var sections = ['weeklyreport'];
        var destinationAddress = 'account_managers@indigenous.io';
        var startDate = moment().subtract(7, 'days').toDate();
        var endDate = moment().toDate();
        manager.generateInsightReport(accountId, userId, customerAccountId, sections, destinationAddress, startDate,
            endDate, function(err, results){
                self.log.debug(accountId, userId, '<< sendInsightReport');
                self.sendResultOrError(resp, err, results, 'Could not send insight report');
            });
    }

});

module.exports = new api({version:'2.0'});

