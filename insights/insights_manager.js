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
var userActivityManager = require('../useractivities/useractivity_manager');
var emailDao = require('../cms/dao/email.dao');
var contactDao = require('../dao/contact.dao');
var userDao = require('../dao/user.dao');

module.exports = {

    log:log,

    config:{
        //hardcoded for now
        fromAddress:'insights@indigenous.io',
        fromName: 'Indigenous Insights',
        emailId:'bfa86581-c8e4-444e-bf0f-15519eff2bc8',
        subject:'Insight Report',
        ccAry:[],
        replyToAddress: 'account_managers@indigenous.io',
        replyToName:'Account Managers'
    },

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
                //handle each section
                var sectionDataMap = {};
                async.each(filteredSections, function(section, callback){
                    self._handleSection(section, account, startDate, endDate, function(err, data){
                        if(err) {
                            self.log.error(accountId, userId, 'Error handling section [' + section + ']:', err);
                            callback(err);
                        } else {
                            sectionDataMap[section] = data;
                            callback();
                        }
                    });
                }, function(err){
                    if(err) {
                        self.log.error(accountId, userId, 'Error handling sections:', err);
                        cb(err);
                    } else {
                        self.log.debug(accountId, userId, 'built section data');
                        cb(null, account, sectionDataMap);
                    }
                });
            },
            function(account, sectionDataMap, cb) {
                //get the email HTML
                emailDao.getEmailById(self.config.emailId, function(err, email){
                    if(err || !email) {
                        if(!err) {
                            err = 'Email not found';
                        }
                        self.log.error('Error getting email to render: ' + err);
                        cb(err);
                    } else {
                        app.render('emails/base_email_v2', emailMessageManager.contentTransformations(email.toJSON()), function(err, html) {
                            cb(err, account, sectionDataMap, html);
                        });
                    }
                });
            },
            function(account, sectionDataMap, html, cb) {
                //load the contact
                userDao.getById(account.get('ownerUser'), $$.m.User, function(err, user){
                    if(err || !user) {
                        self.log.warn('could not load the user for the account:', err);
                        cb(null, account, sectionDataMap, html, null);
                    } else {
                        //get the contact for this user on the main account
                        contactDao.getContactByEmailAndAccount(user.get('email'), accountId, function(err, contact){
                            if(err || !contact) {
                                self.log.warn('could not load the contact for user:', err);
                                cb(null, account, sectionDataMap, html, null);
                            } else {
                                cb(null, account, sectionDataMap, html, contact);
                            }
                        });
                    }
                });
            },
            function(account, sectionDataMap, html, contact, cb) {
                //build the needed variables for substitution
                var vars = [];
                vars.push({
                    name:'INSIGHTSTARTDATE',
                    content:moment(startDate).format('MM/DD/YYYY')
                });
                vars.push({
                    name:'INSIGHTENDDATE',
                    content:moment(endDate).format('MM/DD/YYYY')
                });
                var data = sectionDataMap.weeklyreport;
                var visitors = '<b>' + data.visitorCount + '</b>';
                var sendCount = '<b>' + data.emailReports.sentCount + '</b>';
                var openCount = '<b>' + data.emailReports.openCount + '</b>';
                var clickCount = '<b>' + data.emailReports.clickCount + '</b>';
                var pageCreate = '<b>' + data.pagesReports.pagesCreated + '</b>';
                var pageModify = '<b>' + data.pagesReports.pagesModified + '</b>';
                var publishCount = '<b>' + data.pagesReports.pagesPublished + '</b>';
                var accountLogins = '<b>' + data.loginReports.loginCount + '</b>';
                var loginTime = '<b>' + data.loginReports.mostRecentLogin + '</b>';

                var s = '<p>This past week, you had ' + visitors + ' visitors.</p>';
                s += '<p>You sent ' + sendCount + ' emails, '+ openCount + ' emails were opened and ' + clickCount + ' emails were clicked.</p>';
                s += '<p>You created ' + pageCreate + ' page(s), modified ' + pageModify + ' page(s) and published ' + publishCount + ' page(s).</p>';
                s += '<p>There were ' + accountLogins + ' admin sessions with the most recent login at ' + loginTime + '.</p>';

                vars.push({
                    name:'WEEKLYREPORTSECTION',
                    content:s
                });
                cb(null, account, sectionDataMap, html, contact, vars);
            },
            function(account, sectionDataMap, html, contact, reportVars, cb) {
                //send the email
                var fromAddress = self.config.fromAddress;
                var fromName = self.config.fromName;
                var toAddress = destinationAddress;
                var toName = null;
                var subject = self.config.subject;
                var htmlContent = html;
                var _accountId = customerAccountId;
                var contactId = null;
                if(contact) {
                    contactId = contact.id();
                }
                var vars = reportVars;
                var emailId = self.config.emailId;
                var ccAry = self.config.ccAry;
                var replyToAddress = self.config.replyToAddress;
                var replyToName = self.config.replyToName;
                emailMessageManager.sendInsightEmail(fromAddress, fromName, toAddress, toName, subject, htmlContent,
                    _accountId, userId, contactId, vars, emailId, ccAry, replyToAddress, replyToName, function(err, value){
                        cb(err, sectionDataMap, value);
                    });
            }
        ], function(err, sectionHTMLMap, emailResponse){
            if(err) {
                self.log.error(accountId, userId, 'Error generating report:', err);
                return fn(err);
            } else {
                var result = {
                    data: sectionHTMLMap,
                    email: emailResponse
                };
                self.log.debug(accountId, userId, '<< generateInsightReport');
                return fn(null, result);
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
            },
            loginReports: function(callback) {
                userActivityManager.countNonAdminLogins(accountId, userId, startDate, endDate, callback);
            }
        }, function(err, results){
            fn(err, results);
        });
    }


};
