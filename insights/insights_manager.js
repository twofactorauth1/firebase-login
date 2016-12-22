/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */


var dao = require('./dao/insights.dao');
var log = $$.g.getLogger("insights_manager");
var constants = require('./insights_constants');
var emailMessageManager = require('../emailmessages/emailMessageManager');
var accountDao = require('../dao/account.dao');
var async = require('async');
var analyticsManager = require('../analytics/analytics_manager');
var ssbManager = require('../ssb/ssb_manager');

module.exports = {

    log:log,

    getAvailableSections: function(accountId, userId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getAvailableSections');
        var insightSections = constants.availableSections;
        self.log.debug(accountId, userId, '<< getAvailableSections');
        fn(null, insightSections);
    },

    generateInsightReport: function(accountId, userId, customerAccountId, sections, destinationAddress, startDate, endDate, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> generateInsightReport');
        async.waterfall([
            function(cb) {
                accountDao.getAccountByID(customerAccountId, function(err, customerAccount){
                    if(err) {
                        self.log.error(accountId, userId, 'Error loading customer account:', err);
                        cb(err);
                    } else if(!customerAccount) {
                        self.log.error(accountId, userId, 'Could not find account for [' + customerAccountId + ']');
                        cb('Could not find account for [' +customerAccountId+']');
                    } else {
                        self.log.debug(accountId, userId, 'Got customer account');
                        cb(null, customerAccount);
                    }
                });
            },
            function(account, cb) {
                //factor out any sections that have been overridden on account settings
                var filteredSections = [];
                if(account.get('insightSettings')) {

                } else {
                    filteredSections = filteredSections.concat(sections);
                }
                cb(null, account, filteredSections);
            },
            function(account, filteredSections, cb) {
                //handle each section and build the html
                var sectionHTMLMap = {};
                async.each(filteredSections, function(section, callback){
                    self._handleSection(section, account, startDate, endDate, function(err, html){
                        if(err) {
                            self.log.error(accountId, userId, 'Error handling section [' + section + ']:', err);
                            callback(err);
                        } else {
                            sectionHTMLMap[section] = html;
                            callback();
                        }
                    });
                }, function(err){
                    if(err) {
                        self.log.error(accountId, userId, 'Error handling sections:', err);
                        cb(err);
                    } else {
                        self.log.debug(accountId, userId, 'built section html');
                        cb(null, sectionHTMLMap);
                    }
                });
            }
        ], function(err, sectionHTMLMap){
            if(err) {
                self.log.error(accountId, userId, 'Error generating report:', err);
                return fn(err);
            } else {
                self.log.debug(accountId, userId, '<< generateInsightReport');
                return fn(null, sectionHTMLMap);
            }
        });


    },

    _handleSection: function(sectionName, account, startDate, endDate, fn) {
        var self = this;
        if(sectionName === 'weeklyreport') {
            return self._handleWeeklyReport(account, startDate, endDate, fn);
        } else {
            self.log.warn('No handler for section: ' + sectionName);
            fn(null, '');
        }
    },

    _handleWeeklyReport: function(account, startDate, endDate, fn) {
        var self = this;
        /*
         * Need the following stats for the time period:
         *  - pages created
         *  - pages modified
         *  - pages published
         *  - number visitors across site
         *  - emails sent/opened/clicked
         *  - number of logins
         */
        var accountId = account.id();
        var userId = 0;
        async.parallel({
            visitorCount: function(callback){
                analyticsManager.getVisitorCount(accountId, userId, startDate, endDate, false, callback);
            },
            pagesReports: function(callback) {
                ssbManager.getPagesCreatedModifiedPublished(accountId, userId, startDate, endDate, callback);
            },
            emailReports: function(callback) {
                emailMessageManager.getMessagesSentOpenedClicked(accountId, userId, startDate, endDate, callback);
            }
        }, function(err, results){
            fn(err, results);
        });
    }


};
