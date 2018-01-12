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
var cheerio = require('cheerio');
var insightsConfig = require('../configs/insights.config');
var sm = require('../security/sm')(false);
var scheduledJobsManager = require('../scheduledjobs/scheduledjobs_manager');

/*
 * need to add some dependencies for static loading by scheduler
 */
require('./model/insight');
require('./model/insightjob');
require('../models/account');

var insightsManager = {

    log:log,

    config:insightsConfig,

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
        accountDao.getAccountByID(accountId, function(err, account){
            if(err) {
                self.log.error(accountId, userId, 'Error listing messages:', err);
                return fn(err);
            } else {
                query.orgId = account.get('orgId') || 0;
                broadcastMessageDao.findMany(query, $$.m.BroadcastMessage, function(err, list){
                    if(err) {
                        self.log.error(accountId, userId, 'Error listing messages:', err);
                        return fn(err);
                    } else {
                        self.log.debug(accountId, userId, '<< listBroadcastMessages');
                        return fn(null, list);
                    }
                });
            }
        });

    },

    getActiveBroadcastMessages:function(accountId, userId, fn){
        var self = this;
        self.log.debug(accountId, userId, '>> getActiveBroadcastMessages');
        var now = moment().toDate();
        var query = {
            startDate : {$lte:now},
            endDate : {$gte:now},
            accountId: {$gte:0}
        };

        accountDao.getAccountByID(accountId, function(err, account){
            if(err) {
                self.log.error(accountId, userId, 'Error finding active messages:', err);
                return fn(err);
            } else {
                query.orgId = account.get('orgId') || 0;
                broadcastMessageDao.findMany(query, $$.m.BroadcastMessage, function(err, list){
                    if(err) {
                        self.log.error(accountId, userId, 'Error finding active messages:', err);
                        return fn(err);
                    } else {
                        self.log.debug(accountId, userId, '<< getActiveBroadcastMessages');
                        return fn(null, list);
                    }
                });
            }
        });

    },



    getActiveBroadcastMessagesWithUser:function(accountId, userId, fn){
        var self = this;
        self.log.debug(accountId, userId, '>> getActiveBroadcastMessagesWithUser');
        var now = moment().toDate();
        var query = {
            startDate : {$lte:now},
            endDate : {$gte:now},
            accountId: {$gte:0}
        };

        accountDao.getAccountByID(accountId, function(err, account){
            if(err) {
                self.log.error(accountId, userId, 'Error finding active messages:', err);
                return fn(err);
            } else {
                query.orgId = account.get('orgId') || 0;
                broadcastMessageDao.findMany(query, $$.m.BroadcastMessage, function(err, list){
                    if(err) {
                        self.log.error(accountId, userId, 'Error finding active messages:', err);
                        return fn(err);
                    } else {
                        self.log.debug(accountId, userId, '<< getActiveBroadcastMessagesWithUser');

                        async.each(list, function (message, cb) {
                            if(message.get("modified") && message.get("modified").by){
                                userDao.getById(message.get("modified").by, function (err, user) {
                                    if (err) {
                                        log.error(accountId, userId, 'Error getting user: ' + err);
                                        cb(err);
                                    } else {
                                        var _user = {
                                            _id: user.get("_id"),
                                            username: user.get("username"),
                                            first: user.get("first"),
                                            last: user.get("last"),
                                            profilePhotos: user.get("profilePhotos")
                                        };
                                        message.set("user", _user);
                                        cb();
                                    }
                                });
                            }
                            else{
                                cb();
                            }

                        }, function (err) {
                            if (err) {
                                log.error(accountId, userId, 'Error finding active message users: ' + err);
                                return fn(err, null);
                            } else {
                                log.debug('<< getActiveBroadcastMessagesWithUser');
                                return fn(null, list);
                            }
                        });
                    }
                });
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

    createBroadcastMessage:function(accountId, userId, message, subject, startDate, endDate, fn){
        var self = this;
        self.log.debug(accountId, userId, '>> createBroadcastMessage');

        // if(!moment().isDate(startDate)) {
        //     return fn('startDate parameter must be a date!');
        // }

        // if(!moment().isDate(endDate)) {
        //     return fn('endDate parameter must be a date!');
        // }
        accountDao.getAccountByID(accountId, function(err, account){
            if(err) {
                self.log.error(accountId, userId, 'Error creating message:', err);
                return fn(err);
            } else {
                var orgId = account.get('orgId') || 0;
                var msg = new $$.m.BroadcastMessage({
                    accountId:accountId,
                    message:message,
                    subject: subject,
                    startDate:startDate,
                    endDate:endDate,
                    orgId:orgId,
                    created:{
                        date:new Date(),
                        by:userId
                    },
                    modified:{
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
        var emailId;
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
                        //self.log.debug(accountId, userId, 'built section data', sectionDataMap);
                        cb(null, account, sectionDataMap);
                    }
                });
            },
            function(account, sectionDataMap, cb) {
                //get the email HTML
                emailId = self.config.emailId;
                if(account.get("orgId") == 1){
                    emailId = self.config.rvlvrEmailId;
                }
                self.log.debug('Looking for email with ID:', emailId);
                emailDao.getEmailById(emailId, function(err, email){
                    if(err || !email) {
                        if(!err) {
                            err = 'Email not found';
                        }
                        self.log.error('Error getting email to render: ' + err);
                        cb(err);
                    } else {
                       
                        (email.attributes['handle']==="insights-template") ?  email.attributes['tableBgColor']='#ffffff' : email.attributes['tableBgColor']='transparent' ; 
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
                if(account.get("orgId") == 1){
                    siteUrl = account.get('subdomain') + '.gorvlvr.com';
                } else if(account.get("orgId") == 5){
                    siteUrl = account.get('subdomain') + '.leadsource.cc';
                }

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
                    if(row.previousWeek != 0 && row.previousWeek !== '$0.00' && row.lastWeek !== row.previousWeek) {
                        trend = (row.lastWeek - row.previousWeek) / row.previousWeek;
                        row.trend = numeral(trend).format('0,0%');
                        trend *=100;//fix magnitude on trend for sorting later
                    } else if((row.previousWeek === 0 || row.previousWeek === '$0.00') && (row.lastWeek === 0 || row.lastWeek === '$0.00')) {
                        //Set trend to 0 for sorting and 'NA' for display purposes
                        trend = 0;
                        row.trend = 'Unchanged';
                    } else if(row.lastWeek === row.previousWeek){
                        trend = 0;
                        row.trend = 'Unchanged';
                    } else {
                        trend = 0;
                        row.trend = 'Rising';
                    }
                    row.rawTrend = trend;
                    if(trend > 0) {
                        row.class = 'fa fa-caret-up text-green';
                        row.imgsrc = '&#x25B2;';
                    } else if (trend < 0) {
                        row.class = 'fa fa-caret-down text-red';
                        row.imgsrc = '&#x25BC;';
                    } else {
                        row.class = '';
                    }
                    //self.log.debug('row.trend = ' + row.trend + ' and row.class = ' + row.class);
                    row.absTrend = Math.abs(trend);
                    row.lastWeekRaw = row.lastWeek;
                     row.previousWeekRaw = row.previousWeek;
                     if(name=='Revenue')
                        {
                         row.lastWeek = prefix + numeral(row.lastWeek).format('0,0.00') + suffix;
                        row.previousWeek = prefix + numeral(row.previousWeek).format('0,0.00') + suffix;
                        }else{
                        row.lastWeek = prefix + numeral(row.lastWeek).format('0,0[.]00') + suffix;
                        row.previousWeek = prefix + numeral(row.previousWeek).format('0,0[.]00') + suffix;
                     }
                    return row;
                };

                self.log.debug('data:', JSON.stringify(data));

                rows.push(buildRow('visitsCount', 'Visits', 'currentCount', 'previousCount', data, '', ''));
                rows.push(buildRow('visitorCount', 'Visitors', 'currentCount', 'previousCount', data, '', ''));
                rows.push(buildRow('bounceRate', 'Bounce Rate', 'currentBounceRate', 'previousBounceRate', data, '', '%'));
                rows.push(buildRow('searchReferrals', 'Inbounds from Search', 'currentCount', 'previousCount', data, '', ''));
                rows.push(buildRow('ordersCount', 'Orders', 'currentCount', 'previousCount', data, '', ''));
                rows.push(buildRow('unsubscribedReports', 'Unsubscribed', 'currentCount', 'previousCount', data, '', ''));

                rows.push(buildRow('revenueReport', 'Revenue', 'currentRevenue', 'previousRevenue', data, '$', ''));
                
                rows.push(buildRow('sentCount', 'Emails Delivered', 'current', 'previous', data.emailReports, '', ''));
                rows.push(buildRow('openCount', 'Emails Opened', 'current', 'previous', data.emailReports, '', ''));
                rows.push(buildRow('clickCount', 'Emails Clicked', 'current', 'previous', data.emailReports, '', ''));
                self.log.debug('rows:', rows);
                var sortedRows = _.sortBy(rows, function(row){return -row.absTrend});
                /*
                 * remove any rows that are "uninteresting" should be 4
                 */
                while(sortedRows.length > 4 && self._removeLeastInterestingRow(sortedRows) != 0) {
                    //this space intentionally left blank;
                }
                sortedRows.unshift(buildRow('pageViewsCount', 'Page Views', 'currentCount', 'previousCount', data, '', ''));
                var jadeVars = {
                    reports:sortedRows,
                    loginTime:data.loginReports.mostRecentLogin
                };
                if(data.loginReports.mostRecentActivity) {
                    jadeVars.loginIP = data.loginReports.mostRecentActivity.ip;
                    if(data.loginReports.mostRecentActivity.geo) {
                        jadeVars.loginCity = data.loginReports.mostRecentActivity.geo.city;
                        jadeVars.loginState = data.loginReports.mostRecentActivity.geo.province;
                    } else {
                        jadeVars.loginCity = '';
                        jadeVars.loginState = '';
                    }

                }
                app.render('insights/weeklyreport', jadeVars, function(err, jadeHtml){
                    if(jadeHtml) {
                        vars.push({
                            name:'WEEKLYREPORTSECTION',
                            content:jadeHtml
                        });
                    }
                    //console.log();
                    //self.log.debug('jade html:', jadeHtml);
                    //self.log.debug('base html:', html);
                    cb(err, account, sectionDataMap, html, contact, vars);
                });

            },
            function(account, sectionDataMap, html, contact, vars, cb) {
                var data = sectionDataMap.broadcastmessage[0];
                var bMessage = '';

                _.each(sectionDataMap.broadcastmessage, function(msg){
                    var $$$ = cheerio.load(msg.get('message'));
                    $$$('span').each(function() {
                        $$$(this).removeAttr('style');
                    });
                    bMessage+= $$$.html();
                });
                //self.log.debug('data:', bMessage);
                if(data) {
                    app.render('insights/broadcastmessage', {message:bMessage}, function(err, jadeHtml){
                        if(jadeHtml) {
                            vars.push({
                                name:'BROADCASTMESSAGESECTION',
                                content:jadeHtml
                            });
                        }
                        //self.log.debug('jade html:', jadeHtml);
                        cb(err, account, sectionDataMap, html, contact, vars);
                    });
                } else {
                    vars.push({
                        name:'BROADCASTMESSAGESECTION',
                        content:''
                    });
                    cb(null, account, sectionDataMap, html, contact, vars);
                }

            },
            function(account, sectionDataMap, html, contact, vars, cb) {
                var siteUrl = account.get('subdomain') + '.' + appConfig.subdomain_suffix;
                //TODO: put these is org settings
                // rvlvr
                if(account.get("orgId") == 1){
                    var suffix = '.gorvlvr.com'; // Todo: Get domain from orgId
                    if(appConfig.nonProduction === true) {
                        suffix = '.test' + suffix;
                    }
                    siteUrl = account.get('subdomain') + suffix;
                    vars.push({name:'ORGLOGO', content:'https://s3.amazonaws.com/indigenous-digital-assets/account_1301/rvlvr_logo_350.png'});
                }
                // leadsource
                else if(account.get("orgId") == 5) {
                    var suffix = '.leadsource.cc'; // Todo: Get domain from orgId
                    if (appConfig.nonProduction === true) {
                        suffix = '.test' + suffix;
                    }
                    siteUrl = account.get('subdomain') + suffix;
                    vars.push({name:'ORGLOGO', content:'https://s3-us-west-2.amazonaws.com/indigenous-admin/TESSCO_LOGO_DRAFT.jpg'});
                }
                // amrvlvr
                else if(account.get("orgId") == 6) {
                    var suffix = '.amrvlvr.com'; // Todo: Get domain from orgId
                    if (appConfig.nonProduction === true) {
                        suffix = '.test' + suffix;
                    }
                    siteUrl = account.get('subdomain') + suffix;
                    vars.push({name:'ORGLOGO', content:'https://s3.amazonaws.com/indigenous-digital-assets/account_1395/am_logo.png'});
                } else {
                    vars.push({name:'ORGLOGO', content:'https://s3.amazonaws.com/indigenous-digital-assets/account_6/Indigenous-Logo_EmailSafe_1495057493172.png'});
                }
                console.log(siteUrl);
                app.render('insights/footer', {siteUrl:siteUrl}, function(err, jadeHtml){
                    if(jadeHtml) {
                        vars.push({
                            name:'FOOTER',
                            content:jadeHtml
                        });
                    }
                    //self.log.debug('jade html:', jadeHtml);
                    cb(err, account, sectionDataMap, html, contact, vars);
                });
            },
            function(account, sectionDataMap, html, contact, reportVars, cb) {
                //send the email
                var fromAddress = self.config.fromAddress;
                var fromName = self.config.fromName;
                var toAddress = destinationAddress;
                var toName = null;
                var subject = self.config.subject;
                //TODO: put these in org settings
                if(account.get('orgId') == 1) {
                    fromAddress = 'insights@gorvlvr.com';
                    fromName = 'RVLVR Insights';
                    subject = 'RVLVR Insights Report';
                } else if(account.get('orgId') == 5) {
                    fromAddress = 'insights@gorvlvr.com';
                    fromName = 'Tessco LeadSource Insights';
                    subject = 'Tessco LeadSource Insights Report';
                }
                var htmlContent = html;
                var _accountId = customerAccountId;
                var contactId = null;
                if(contact) {
                    contactId = contact.id();
                }
                var vars = reportVars;                
                var ccAry = self.config.ccAry;
                var replyToAddress = self.config.replyToAddress;
                var replyToName = self.config.replyToName;
                //Add Jim to insights email for Main in Prod.
                if(_accountId === appConfig.mainAccountID && appConfig.nonProduction !== true) {
                    ccAry = ccAry || [];
                    ccAry.push('jim@indigenous.io');
                }
                if(account.get('orgId') == 5) {                    
                    replyToAddress = "admin@gorvlvr.com";
                }
                emailMessageManager.sendInsightEmail(fromAddress, fromName, toAddress, toName, subject, htmlContent,
                    _accountId, userId, contactId, vars, emailId, ccAry, replyToAddress, replyToName, accountId, function(err, value){
                        cb(err, sectionDataMap, value);
                    });

                //cb(null, sectionDataMap, {emailmessageId:''});
            }
        ], function(err, sectionHTMLMap, emailResponse){
            if(err) {
                self.log.error(accountId, userId, 'Error generating report:', err);
                return fn(err);
            } else {
                var result = {
                    data: sectionHTMLMap,
                    email: emailResponse,
                    emailMessageId: emailResponse.emailmessageId
                };
                self.log.debug(accountId, userId, '<< generateInsightReport');
                return fn(null, result);
            }
        });
    },

    /**
     *
     * @param accountId
     * @param userId
     * @param startDate - if null, becomes today-7
     * @param endDate - if null, becomes today
     * @param scheduledSendDate - if null, becomes today
     * @param sendToAccountOwners - T/F
     * @param fn
     */
    generateInsightsForAllAccounts: function(accountId, userId, startDate, endDate, scheduledSendDate, sendToAccountOwners, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> generateInsightsForAllAccounts');
        var now = moment().toDate();

        if(!startDate) {
            startDate = moment().subtract(7, 'days').toDate();
        }
        if(!endDate) {
            endDate = now;
        }
        if(!scheduledSendDate) {
            scheduledSendDate = now;
        }
        var insightJob = new $$.m.Insight({
            accountId:accountId,
            configuration:{
                startDate:startDate,
                endDate:endDate,
                scheduledDate:scheduledSendDate,
                sendToAccountOwners:sendToAccountOwners
            },

            exclusions:self.config.accountExclusions,
            created:{
                date:new Date(),
                by:userId
            }
        });

        async.waterfall([
            function(cb){
                accountDao.findMany({_id:{$nin:self.config.accountExclusions}}, $$.m.Account, cb);
            },
            function(accounts, cb) {
                var accountList = [];
                var includedAccounts = [];//IDs only
                var expiredTrials = [];//IDs only
                var invalidSubscriptions = []; //IDs only
                var configExcluded = []; //IDs only
                async.eachSeries(accounts, function(account, callback){
                    var billing = account.get('billing');
                    var emailPreferences = account.get('email_preferences');
                    var receiveInsights = true;
                    if(emailPreferences && emailPreferences.receiveInsights === false) {
                        receiveInsights = false;
                    }

                    /*
                     * Figure out if we should include them:
                     *  - billing.plan === NO_PLAN_ARGUMENT
                     *      -- verify trial days remaining
                     *  - billing.plan === EVERGREEN
                     *      -- include automatically
                     *  - otherwise
                     *  -- verify stripeCustomerId and stripeSubscriptionId
                     */
                    if(!receiveInsights) {
                        configExcluded.push(account.id());
                        callback();
                    } else if(account.id() === appConfig.mainAccountID) {
                        accountList.push(account);
                        includedAccounts.push(account.id());
                        callback();
                    } else if(billing.plan === 'NO_PLAN_ARGUMENT') {
                        if(sm.isWithinTrial(billing)) {
                            accountList.push(account);
                            includedAccounts.push(account.id());
                            callback();
                        } else {
                            expiredTrials.push(account.id());
                            callback();
                        }
                    } else if(billing.plan === 'EVERGREEN') {
                        accountList.push(account);
                        includedAccounts.push(account.id());
                        callback();
                    } else if(billing.stripeCustomerId && billing.subscriptionId && !billing.cancellationDate) {
                        self.log.debug('Validating subscription for:', billing);
                        sm.isValidSub(account.id(), billing, function(err, isValid){
                            if(isValid && isValid === true) {
                                accountList.push(account);
                                includedAccounts.push(account.id());
                                callback();
                            } else {
                                invalidSubscriptions.push(account.id());
                                callback();
                            }
                        });
                    } else {
                        self.log.debug('Skipping account [' + account.id() + ' because of invalid billing');
                        invalidSubscriptions.push(account.id());
                        callback();
                    }
                }, function(err){
                    if(err) {
                        self.log.error(accountId, userId, 'Error verifying accounts:', err);
                        cb(err);
                    } else {
                        insightJob.set('includedAccounts', includedAccounts);
                        insightJob.set('expiredTrials', expiredTrials);
                        insightJob.set('invalidSubscriptions', invalidSubscriptions);
                        insightJob.set('configExcluded', configExcluded);
                        cb(null, accountList);
                    }
                });
            },
            function(accounts, cb) {
                //save insight-in-progress
                dao.saveOrUpdate(insightJob, function(err, value){
                    if(err) {
                        self.log.error('Error saving insight:', err);
                        cb(err);
                    } else {
                        cb(null, accounts, value);
                    }
                });
            },
            function(accounts, insight, cb) {
                async.eachSeries(insight.get('includedAccounts'), function(customerAccountId, callback){
                    self.log.debug(accountId, userId, 'Starting insight generation for ' + customerAccountId);
                    var sections = constants.availableSections;
                    var destinationAddress = 'account_managers@indigenous.io';
                    if(appConfig.nonProduction === true) {
                        destinationAddress = 'test_account_managers@indigenous.io';
                    }
                    if(sendToAccountOwners === true) {
                        /*
                         * look at account.business.emails[0].email
                         * then check account.ownerUser.username
                         * be sure to CC account_managers@indigenous.io
                         */
                        var customerAccount = _.find(accounts, function(account){return account.id() === customerAccountId});
                        if(customerAccount) {
                            var business = customerAccount.get('business');
                            if(business && business.emails && business.emails[0] && business.emails[0].email) {
                                destinationAddress = business.emails[0].email;
                                self.log.debug(accountId, userId, 'destination address:', destinationAddress);
                                self.generateInsightReport(accountId, userId, customerAccountId, sections, destinationAddress, startDate, endDate, function(err, value){
                                    if(err || !value) {
                                        self.log.error('Error generating report for [' + customerAccountId + ']:', err);
                                        callback(err);
                                    } else {
                                        insight.get('emailMessageIds').push(value.emailMessageId);
                                        insight.get('processedAccounts').push(customerAccountId);
                                        callback();
                                    }
                                });
                            } else {
                                var ownerUserId = customerAccount.get('ownerUser');
                                userDao.getById(parseInt(ownerUserId), $$.m.User, function(err, user){
                                    if(err || !user) {
                                        self.log.error('Error finding ownerUser:', err);
                                        callback();
                                    } else {
                                        destinationAddress = user.get('email');
                                        self.log.debug('ownerUser destination address:', destinationAddress);
                                        self.generateInsightReport(accountId, userId, customerAccountId, sections, destinationAddress, startDate, endDate, function(err, value){
                                            if(err || !value) {
                                                self.log.error('Error generating report for [' + customerAccountId + ']:', err);
                                                callback(err);
                                            } else {
                                                insight.get('emailMessageIds').push(value.emailMessageId);
                                                insight.get('processedAccounts').push(customerAccountId);
                                                callback();
                                            }
                                        });
                                    }
                                });
                            }
                        } else {
                            self.log.warn(accountId, userId, 'Could not find account in accounts List for [' + customerAccountId + ']');
                            self.generateInsightReport(accountId, userId, customerAccountId, sections, destinationAddress, startDate, endDate, function(err, value){
                                if(err || !value) {
                                    self.log.error('Error generating report for [' + customerAccountId + ']:', err);
                                    callback(err);
                                } else {
                                    insight.get('emailMessageIds').push(value.emailMessageId);
                                    insight.get('processedAccounts').push(customerAccountId);
                                    callback();
                                }
                            });
                        }
                    } else {
                        self.log.debug('sending to account manager');
                        self.generateInsightReport(accountId, userId, customerAccountId, sections, destinationAddress, startDate, endDate, function(err, value){
                            if(err || !value) {
                                self.log.error('Error generating report for [' + customerAccountId + ']:', err);
                                callback(err);
                            } else {
                                insight.get('emailMessageIds').push(value.emailMessageId);
                                insight.get('processedAccounts').push(customerAccountId);
                                callback();
                            }
                        });
                    }

                }, function(err){
                    //save the insight and continue
                    if(!err) {
                        insight.set('completedDate', moment().toDate());
                    }
                    dao.saveOrUpdate(insight, function(saveErr, value){
                        if(saveErr) {
                            self.log.error('Error saving updated insight:', saveErr);
                            cb(err);
                        } else {
                            self.log.debug('Finished generating insights.');
                            cb(err, value);
                        }
                    });
                });
            }
        ], function(err, insight){
            if(err) {
                self.log.error(accountId, userId, 'Error generating insight report:', err);
                self.log.debug(accountId, userId, 'Final insight:', insight);
                return fn(err);
            } else {
                self.log.info(accountId, userId, 'Report generation took ' + moment().diff(moment(now))+ 'seconds');
                self.log.debug(accountId, userId, '<< generateInsightsForAllAccounts');
                return fn(null, insight);
            }
        });
    },

    createOrUpdateInsightJob:function(accountId, userId, scheduledDay, scheduledTime, sendToAccountOwners, fn){
        var self = this;
        self.log.debug(accountId, userId, '>> createOrUpdateInsightJob');
        var query = {accountId:accountId};

        async.waterfall([
            function(cb) {
                dao.findOne(query, $$.m.InsightJob, function(err, job){
                    cb(err, job);
                });
            },
            function(job, cb) {
                if(job) {
                    self.log.debug('Found:', job);
                    //need to unschedule this job before continuing
                    var scheduledJobID = job.get('jobId');
                    scheduledJobsManager.cancelJob(scheduledJobID, function(err, value){
                        if(err) {
                            self.log.error(accountId, userId, 'Error cancelling existing insight job:', err);
                            cb(err);
                        } else {
                            //set modified date
                            job.set('modified', {date:new Date(), by:userId});
                            cb(null, job);
                        }
                    });
                } else {
                    job = new $$.m.InsightJob({accountId:accountId, created:{date:new Date(), by:userId}});
                    cb(null, job);
                }
            },
            function(job, cb) {
                job.set('scheduledTime', {dayOfWeek:scheduledDay, timeOfDay:scheduledTime});
                if(sendToAccountOwners===true) {
                    job.set('sendToAccountOwners', true);
                } else {
                    job.set('sendToAccountOwners', false);
                }
                job.set('_id', accountId);
                var code = '$$.u.insightsManager.runInsightJob(' + accountId + ');';
                var send_at = moment().day(scheduledDay).hour(scheduledTime).minute(0);
                var scheduledJob = new $$.m.ScheduledJob({
                    accountId: accountId,
                    scheduledAt: moment(send_at).toDate(),
                    runAt: null,
                    job:code,
                    created:{
                        date:new Date(),
                        by:userId
                    }
                });
                scheduledJobsManager.scheduleJob(scheduledJob, function(err, value){
                    if(err || !value) {
                        self.log.error(accountId, userId, 'Error scheduling job with manager:', err);
                        cb(err);
                    } else {
                        job.set('jobId', value.id());
                        cb(null, job);
                    }
                });
            },
            function(job, cb) {
                self.log.debug('about to save job:', job);
                dao.saveOrUpdate(job, function(err, savedJob){
                    self.log.debug('back from the dao:', err);
                    cb(err, savedJob);
                });
            }
        ], function(err, job){
            if(err) {
                self.log.error(accountId, userId, 'Error creating Insights Job:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< createOrUpdateInsightJob');
                fn(null, job);
            }
        });


    },

    getInsightJob:function(accountId, userId, fn){
        var self = this;
        self.log.debug(accountId, userId, '>> createOrUpdateInsightJob');
        var query = {accountId:accountId};
        dao.findOne(query, $$.m.InsightJob, function(err, job){
            if(err) {
                self.log.error(accountId, userId, 'Error getting Insight Job:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< createOrUpdateInsightJob');
                fn(null, job);
            }
        });
    },

    deleteInsightJob:function(accountId, userId, fn){
        var self = this;
        self.log.debug(accountId, userId, '>> deleteInsightJob');
        var query = {accountId:accountId};
        dao.removeByQuery(query, $$.m.InsightJob, function(err, value){
            if(err) {
                self.log.error(accountId, userId, 'Error removing Insight Job:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< deleteInsightJob');
                fn(null, value);
            }
        });
    },

    runInsightJob:function(insightJobId, fn) {
        var self = this;
        self.log.debug('fetching job');
        dao.findOne({_id:insightJobId}, $$.m.InsightJob, function(err, job){
            if(err || !job) {
                self.log.error('Could not find job to execute:', err);
                if(fn) {
                    fn(err);
                }
            } else {
                var accountId = 0;
                var userId = 0;
                var startDate = null;
                var endDate = null;
                var scheduledSendDate = null;
                var sendToAccountOwners = job.get('sendToAccountOwners');
                self.generateInsightsForAllAccounts(accountId, userId, startDate, endDate, scheduledSendDate, sendToAccountOwners, function(err, value){
                    self.log.debug('Finished generating insights:', value);
                    if(err) {
                        self.log.error('Error during generation:', err);
                    }
                    if(fn) {
                        fn(err);
                    }
                });
                //schedule next run
                var scheduledDay = job.get('scheduledTime').dayOfWeek;
                var scheduledTime = job.get('scheduledTime').timeOfDay;
                var code = '$$.u.insightsManager.runInsightJob(' + job.get('accountId') + ');';
                var send_at = moment().day(scheduledDay).hour(scheduledTime).minute(0);
                //if(moment(send_at).isBefore(moment())) {
                    send_at = moment(send_at).add(7, 'days');
                    self.log.debug('Scheduling ahead a week');
                //}
                var scheduledJob = new $$.m.ScheduledJob({
                    accountId: accountId,
                    scheduledAt: moment(send_at).toDate(),
                    runAt: null,
                    job:code
                });
                scheduledJobsManager.scheduleJob(scheduledJob, function(err, value){
                    if(err || !value) {
                        self.log.error(accountId, userId, 'Error scheduling job with manager:', err);
                        cb(err);
                    } else {
                        job.set('jobId', value.id());
                        dao.saveOrUpdate(job, function(err, value){
                            if(err) {
                                self.log.error('Error re-saving insight job:', err);
                            } else {
                                self.log.debug('Job resaved.');
                            }
                        });
                    }
                });
            }
        });
    },

    getInsightStatistics: function(accountId, userId, insightId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getInsightStatistics');
        async.waterfall([
            function(cb) {
                dao.getById(insightId, $$.m.Insight, function(err, insight){
                    if(err) {
                        self.log.error('Error fetching insight:', err);
                        cb(err);
                    } else {
                        cb(null, insight);
                    }
                });
            },
            function(insight, cb) {
                if(!insight) {
                    cb('Could not find insight');
                } else {
                    var emailMessageIds = insight.get('emailMessageIds');
                    var query = {_id: {$in:emailMessageIds}};
                    emailDao.findMany(query, $$.m.Emailmessage, function(err, messages){
                        if(err) {
                            self.log.error('Error finding emails:', err);
                            cb(err);
                        } else {
                            cb(null, insight, messages);
                        }
                    });
                }
            }
        ], function(err, insight, messages){
            if(err) {
                self.log.error('Error finding stats:', err);
                fn(err);
            } else {
                var sentCount = 0;
                var deliverCount = 0;
                var openCount = 0;
                var clickCount = 0;
                var bounceCount = 0;
                var bounceAddresses = [];
                var bounceAccounts = [];
                var bounceEmailIDs = [];
                _.each(messages, function(message){
                    if(message.get('sendDate')) {
                        sentCount++;
                    }
                    if(message.get('deliveredDate')) {
                        deliverCount++;
                    }
                    if(message.get('openedDate')) {
                        openCount++;
                    }
                    if(message.get('clickedDate')) {
                        clickCount++;
                    }
                    if(message.get('bouncedDate')) {
                        bounceCount++;
                        bounceAddresses.push(message.get('receiver'));
                        bounceAccounts.push(message.get('accountId'));
                        bounceEmailIDs.push(message.id());
                    }
                });
                var stats = {
                    sentCount:sentCount,
                    deliverCount:deliverCount,
                    openCount:openCount,
                    clickCount:clickCount,
                    bounceCount:bounceCount,
                    bounceAddresses:bounceAddresses,
                    bounceAccounts:bounceAccounts,
                    bounceEmailIDs:bounceEmailIDs
                };
                self.log.debug(accountId, userId, '<< getInsightStatistics');
                fn(null, stats);
            }
        });
    },

    _handleSection: function(sectionName, account, startDate, endDate, fn) {
        var self = this;
        if(sectionName === 'weeklyreport') {
            return self._handleWeeklyReport(account, startDate, endDate, fn);
        } else if(sectionName === 'broadcastmessage') {
            return self._handleBroadcastMessage(account, startDate, endDate, fn);
        } else {
            self.log.warn('No handler for section: ' + sectionName);
            fn(null, '');
        }
    },

    _handleBroadcastMessage: function(account, startDate, endDate, fn) {
        var self = this;

        var query = {
            //startDate : {$lte:now},
            //endDate : {$gte:now},
            accountId: {$gte:0},
            orgId: account.get("orgId") || 0
        };
        broadcastMessageDao.findMany(query, $$.m.BroadcastMessage, function(err, list){
            if(err) {
                return fn(err);
            } else {
                return fn(null, list);
            }
        });
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
                emailMessageManager.getMessagesSentOpenedClicked(accountId, userId, startDate, endDate, previousStart, previousEnd, callback);
            },
            loginReports: function(callback) {
                userActivityManager.countNonAdminLogins(accountId, userId, startDate, endDate, callback);
            },
            unsubscribedReports: function(callback) {
                emailMessageManager.getUnsubscribedCount(accountId, userId, startDate, endDate, previousStart, previousEnd, callback);
            }
        }, function(err, results){
            fn(err, results);
        });
    },

    _removeLeastInterestingRow: function(sortedRows) {
        //if any trends are 0, remove them
        for(var i=sortedRows.length-1; i>=0; i--) {
            if(sortedRows[i].trend === 'Unchanged') {
                sortedRows.splice(i, 1);
                return 1;
            }
        }
        //if any trends are infinity, remove the one with the least magnitude of values
        var leastMagnitudeIndex = -1;
        var leastMagnitudeValue = Infinity;
        for(i = sortedRows.length-1; i>=0; i--) {
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

$$.u = $$.u || {};
$$.u.insightsManager = insightsManager;

module.exports = insightsManager;
