require('../app');
var _ = require('underscore');
//require('../configs/log4js.config').configure();
var mongoConfig = require('../configs/mongodb.config');

var mongoskin = require('mongoskin');
var async = require('async');
var analyticsManager = require('../analytics/analytics_manager.js');
var analyticsDao = require('../analytics/dao/analytics.dao');
require('moment');


var perfutil = {

    log:$$.g.getLogger("dbperfutil"),

    run:function(cb) {
        var self = this;
        var startTime = new Date().getTime();
        var accountId = 6;
        var userId = 4;
        var end = moment().toDate();
        var start = moment().add(-30, 'days').toDate();
        var dateDiff = moment(start).diff(end, 'days');

        var previousStart = moment(start).add(dateDiff, 'days').toDate();
        var previousEnd = start;
        //self.log.debug('startTime:' + startTime);

        //TEST
        //var accountsToTry = [6, 1720, 1721, 1722, 1723, 1724, 1725, 1726, 1727, 1728];

        //PROD
        var accountsToTry = [4, 6, 12, 15, 21,
            37, 38, 45, 71, 78,
            79, 80, 97, 109, 115,
            129, 183, 1300, 1286, 1282,
            1245, 1233, 1217, 1216, 1215];
        var runs = 0;
        var checkpoint = startTime;
        async.eachSeries(accountsToTry, function(accountId, callback){
            self._runCustomerAnalytics(accountId, userId, start, end, previousStart, previousEnd, function(err, value){

                var midPointError = err;
                self._runPlatformAnalytics(accountId, userId, start, end, previousStart, previousEnd, function(err2, value){
                    var midPoint = new Date().getTime();
                    self.log.debug('checkpoint: ' + (midPoint - checkpoint));
                    checkpoint = midPoint;
                    var endError = err;
                    callback(err || err2);
                });
            });
        }, function(err){
            var endTime = new Date().getTime();
            self.log.info('Results:');
            var duration = endTime - startTime;
            var avgRun = duration / accountsToTry.length;
            self.log.info('Total Duration: ' + duration + 'ms');
            self.log.info('Average Run: ' + avgRun + 'ms');
            if(err) {
                self.log.warn('End error:', err);
            }
            cb();
        });


    },

    _runCustomerAnalytics: function(accountId, userId, start, end, previousStart, previousEnd, cb) {
        async.parallel({
            visitorReports: function(callback){
                analyticsManager.getVisitorReports(accountId, userId, start, end, false, callback);
            },
            visitorLocationsReport: function(callback) {
                analyticsManager.getVisitorLocationsReport(accountId, userId, start, end, false, callback);
            },
            visitorLocationsByCountryReport: function(callback) {
                analyticsManager.getVisitorLocationsByCountryReport(accountId, userId, start, end, false, callback);
            },
            visitorDeviceReport: function(callback) {
                analyticsManager.getVisitorDeviceReport(accountId, userId, start, end, false, callback);
            },
            userReport: function(callback) {
                analyticsManager.getUserReport(accountId, userId, start, end, previousStart, previousEnd, false, callback);
            },
            pageViewsReport: function(callback) {
                analyticsManager.getPageViewsReport(accountId, userId, start, end, previousStart, previousEnd, false, callback);
            },
            sessionsReport: function(callback) {
                analyticsManager.getSessionsReport(accountId, userId, start, end, previousStart, previousEnd, false, callback);
            },
            sessionLengthReport: function(callback) {
                analyticsManager.sessionLengthReport(accountId, userId, start, end, previousStart, previousEnd, false, callback);
            },
            trafficSourcesReport: function(callback) {
                analyticsManager.trafficSourcesReport(accountId, userId, start, end, false, callback);
            },
            newVsReturningReport: function(callback) {
                analyticsManager.newVsReturningReport(accountId, userId, start, end, false, callback);
            },
            pageAnalyticsReport: function(callback) {
                analyticsManager.pageAnalyticsReport(accountId, userId, start, end, false, callback);
            },
            userAgents: function(callback) {
                analyticsManager.getUserAgentReport(accountId, userId, start, end, false, callback);
            },
            revenueReport: function(callback) {
                analyticsManager.getRevenueByMonth(accountId, userId, start, end, previousStart, previousEnd, false, callback);
            },
            emailsReport: function(callback) {
                analyticsManager.getCampaignEmailsReport(accountId, userId, start, end, previousStart, previousEnd, false, callback);
            }
        }, function(err, results){
            cb(err, results);
        });
    },

    _runPlatformAnalytics: function(accountId, userId, start, end, previousStart, previousEnd, cb) {
        async.parallel({
            visitorReports: function(callback){
                analyticsManager.getVisitorReports(accountId, userId, start, end, true, callback);
            },
            visitorLocationsReport: function(callback) {
                analyticsManager.getVisitorLocationsReport(accountId, userId, start, end, true, callback);
            },
            visitorLocationsByCountryReport: function(callback) {
                analyticsManager.getVisitorLocationsByCountryReport(accountId, userId, start, end, true, callback);
            },
            visitorDeviceReport: function(callback) {
                analyticsManager.getVisitorDeviceReport(accountId, userId, start, end, true, callback);
            },
            userReport: function(callback) {
                analyticsManager.getUserReport(accountId, userId, start, end, previousStart, previousEnd, true, callback);
            },
            pageViewsReport: function(callback) {
                analyticsManager.getPageViewsReport(accountId, userId, start, end, previousStart, previousEnd, true, callback);
            },
            sessionsReport: function(callback) {
                analyticsManager.getSessionsReport(accountId, userId, start, end, previousStart, previousEnd, true, callback);
            },
            sessionLengthReport: function(callback) {
                analyticsManager.sessionLengthReport(accountId, userId, start, end, previousStart, previousEnd, true, callback);
            },
            trafficSourcesReport: function(callback) {
                analyticsManager.trafficSourcesReport(accountId, userId, start, end, true, callback);
            },
            newVsReturningReport: function(callback) {
                analyticsManager.newVsReturningReport(accountId, userId, start, end, true, callback);
            },
            pageAnalyticsReport: function(callback) {
                analyticsManager.pageAnalyticsReport(accountId, userId, start, end, true, callback);
            },
            dau: function(callback) {
                analyticsManager.getDailyActiveUsers(accountId, userId, start, end, callback);
            },
            userAgents: function(callback) {
                analyticsManager.getUserAgentReport(accountId, userId, start, end, true, callback);
            },
            revenueReport: function(callback) {
                analyticsManager.getRevenueByMonth(accountId, userId, start, end, previousStart, previousEnd, true, callback);
            },
            osReport: function(callback) {
                analyticsManager.getOSReport(accountId, userId, start, end, true, callback);
            },
            emailsReport: function(callback) {
                analyticsManager.getCampaignEmailsReport(accountId, userId, start, end, previousStart, previousEnd, true, callback);
            }
        }, function(err, results){
            cb(err, results);
        });
    }

};

module.exports = perfutil;