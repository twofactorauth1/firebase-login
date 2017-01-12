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
var orderManager = require('../orders/order_manager');
var appConfig = require('../configs/app.config');
var numeral = require('numeral');
var broadcastMessageDao = require('./dao/broadcast_messages.dao');

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

    listBroadcastMessages:function(accountId, userId, fn){
        var self = this;
        self.log.debug(accountId, userId, '>> listBroadcastMessages');
        var query = {accountId:accountId};
        broadcastMessageDao.findMany(query, $$.m.BroadcastMessage, function(err, list){
            if(err) {
                self.log.error(accountId, userId, 'Error listing messages:', err);
                return fn(err);
            } else {
                self.log.debug(accountId, userId, '<< listBroadcastMessages');
                return fn(null, list);
            }
        });
    },

    getActiveBroadcastMessages:function(accountId, userId, fn){
        var self = this;
        self.log.debug(accountId, userId, '>> getActiveBroadcastMessages');
        var now = moment().toDate();
        var query = {
            startDate : {$lte:now},
            endDate : {$gte:now}
        };
        broadcastMessageDao.findMany(query, $$.m.BroadcastMessage, function(err, list){
            if(err) {
                self.log.error(accountId, userId, 'Error finding active messages:', err);
                return fn(err);
            } else {
                self.log.debug(accountId, userId, '<< getActiveBroadcastMessages');
                return fn(null, list);
            }
        });
    },

    updateBroadcastMessage:function(accountId, userId, broadcastMessage, fn){
        var self = this;
        self.log.debug(accountId, userId, '>> updateBroadcastMessage');
        broadcastMessage.set('modified', {date:new Date(), by:userId});

        broadcastMessageDao.saveOrUpdate(broadcastMessage, function(err, value){
            if(err) {
                self.log.error(accountId, userId, 'Error updating message:', err);
                return fn(err);
            } else {
                self.log.debug(accountId, userId, '<< updateBroadcastMessage');
                return fn(null, value);
            }
        });
    },

    createBroadcastMessage:function(accountId, userId, message, startDate, endDate, fn){
        var self = this;
        self.log.debug(accountId, userId, '>> createBroadcastMessage');

        if(!moment().isDate(startDate)) {
            return fn('startDate parameter must be a date!');
        }

        if(!moment().isDate(endDate)) {
            return fn('endDate parameter must be a date!');
        }

        var msg = new $$.m.BroadcastMessage({
            accountId:accountId,
            message:message,
            startDate:startDate,
            endDate:endDate,
            created:{
                date:new Date(),
                by:userId
            }
        });
        broadcastMessageDao.saveOrUpdate(msg, function(err, value){
            if(err) {
                self.log.error(accountId, userId, 'Error creating message:', err);
                return fn(err);
            } else {
                self.log.debug(accountId, userId, '<< createBroadcastMessage');
                return fn(null, value);
            }
        });

    },

    deleteBroadcastMessage:function(accountId, userId, messageId, fn){
        var self = this;
        self.log.debug(accountId, userId, '>> deleteBroadcastMessage');

        var query = {
            _id:messageId,
            accountId: accountId
        };
        broadcastMessageDao.removeByQuery(query, $$.m.BroadcastMessage, function(err, value){
            if(err) {
                self.log.error(accountId, userId, 'Error deleting message:', err);
                return fn(err);
            } else {
                self.log.debug(accountId, userId, '<< deleteBroadcastMessage');
                return fn(null, value);
            }
        });
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
                var siteUrl = account.get('subdomain') + '.' + appConfig.subdomain_suffix;
                vars.push({
                    name:'SITEURL',
                    content:siteUrl
                });
                var data = sectionDataMap.weeklyreport;
                /*
                 * Need to build rows like:
                 * {
                 *      name: 'Visitors',
                 *      lastWeek: '873',
                 *      previousWeek: ' 95',
                 *      trend: '100%'
                 * }
                 */
                var rows = [];
                var buildRow = function(field, name, lastWeek, previousWeek, obj, prefix, suffix) {
                    var row = {
                        name: name
                    };
                    row.lastWeek = obj[field][lastWeek];
                    row.previousWeek = obj[field][previousWeek];
                    var trend = 0.0000001;//hack for sorting
                    if(row.previousWeek != 0 && row.previousWeek !== '$0.00') {
                        trend = (row.lastWeek - row.previousWeek) / row.previousWeek;
                        row.trend = numeral(trend).format('0,0%');
                        trend *=100;//fix magnitude on trend for sorting later
                    } else if((row.previousWeek === 0 || row.previousWeek === '$0.00') && (row.lastWeek === 0 || row.lastWeek === '$0.00')) {
                        //Set trend to 0 for sorting and 'NA' for display purposes
                        trend = 0;
                        row.trend = 'NA';
                    } else {
                        row.trend = 'Rising';
                    }

                    row.absTrend = Math.abs(trend);
                    row.lastWeekRaw = row.lastWeek;
                    //row.lastWeek = prefix + row.lastWeek.toLocaleString() + suffix;
                    row.lastWeek = prefix + numeral(row.lastWeek).format('0,0[.]00') + suffix;
                    row.previousWeekRaw = row.previousWeek;
                    row.previousWeek = prefix + numeral(row.previousWeek).format('0,0[.]00') + suffix;
                    //row.previousWeek = prefix + row.previousWeek.toLocaleString() + suffix;
                    return row;
                };

                rows.push(buildRow('visitsCount', 'Visits', 'currentCount', 'previousCount', data, '', ''));
                rows.push(buildRow('visitorCount', 'Visitors', 'currentCount', 'previousCount', data, '', ''));
                rows.push(buildRow('bounceRate', 'Bounce Rate', 'currentBounceRate', 'previousBounceRate', data, '', '%'));
                rows.push(buildRow('searchReferrals', 'Inbounds from Search', 'currentCount', 'previousCount', data, '', ''));
                rows.push(buildRow('ordersCount', 'Orders', 'currentCount', 'previousCount', data, '', ''));
                rows.push(buildRow('revenueReport', 'Revenue', 'currentRevenue', 'previousRevenue', data, '$', ''));
                //rows.push(buildRow('', 'Emails'));
                //self.log.debug('rows:', rows);
                var sortedRows = _.sortBy(rows, function(row){return -row.absTrend});
                /*
                 * remove any rows that are "uninteresting"
                 */
                while(sortedRows.length > 4 && self._removeLeastInterestingRow(sortedRows) != 0) {
                    //this space intentionally left blank;
                }
                sortedRows.unshift(buildRow('pageViewsCount', 'Page Views', 'currentCount', 'previousCount', data, '', ''));

                app.render('insights/weeklyreport', {reports:sortedRows, loginTime:data.loginReports.mostRecentLogin}, function(err, jadeHtml){
                    if(jadeHtml) {
                        vars.push({
                            name:'WEEKLYREPORTSECTION',
                            content:jadeHtml
                        });
                    }
                    cb(err, account, sectionDataMap, html, contact, vars);
                });

            },
            /*
            function(account, sectionDataMap, html, contact, jadeHtml, cb) {
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
                var visitors = '<b>' + data.visitorCount.currentCount + '</b>';
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
                    content:jadeHtml
                });
                cb(null, account, sectionDataMap, html, contact, vars);
            },
            */
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
        var dateDiff = moment(startDate).diff(endDate, 'days');

        var previousStart = moment(startDate).add(dateDiff, 'days').toDate();
        var previousEnd = startDate;

        async.parallel({
            visitorCount: function(callback){
                analyticsManager.getVisitorCount(accountId, userId, startDate, endDate, previousStart, previousEnd, false, callback);
            },
            visitsCount: function(callback){
                analyticsManager.getVisitCount(accountId, userId, startDate, endDate, previousStart, previousEnd, false, callback);
            },
            pageViewsCount:function(callback) {
                analyticsManager.getPageViewCount(accountId, userId, startDate, endDate, previousStart, previousEnd, false, callback);
            },
            bounceRate:function(callback) {
                analyticsManager.getBounceRate(accountId, userId, startDate, endDate, previousStart, previousEnd, false, callback);
            },
            searchReferrals:function(callback) {
                analyticsManager.getSearchReferrals(accountId, userId, startDate, endDate, previousStart, previousEnd, false, callback);
            },
            ordersCount:function(callback) {
                orderManager.getOrderCount(accountId, userId, startDate, endDate, previousStart, previousEnd, false, callback);
            },
            revenueReport:function(callback) {
                orderManager.getRevenueAmount(accountId, userId, startDate, endDate, previousStart, previousEnd, false, callback);
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
    },

    _removeLeastInterestingRow: function(sortedRows) {
        //if any trends are 0, remove them
        for(var i=sortedRows.length-1; i>=0; i--) {
            if(sortedRows[i].trend === 'NA') {
                sortedRows.splice(i, 1);
                return 1;
            }
        }
        //if any trends are infinity, remove the one with the least magnitude of values
        var leastMagnitudeIndex = -1;
        var leastMagnitudeValue = Infinity;
        for(var i = sortedRows.length-1; i>=0; i--) {
            if(sortedRows[i].trend === 'Rising' && sortedRows[i].lastWeekRaw < leastMagnitudeValue) {
                leastMagnitudeIndex = i;
                leastMagnitudeValue = sortedRows[i].lastWeekRaw;
            }
        }
        if(leastMagnitudeIndex > 0) {
            sortedRows.splice(leastMagnitudeIndex, 1);
            return 1;
        }
        return 0;
    }


};
