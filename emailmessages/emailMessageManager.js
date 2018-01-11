/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var log = $$.g.getLogger("emailMessageManager");
var moment = require('moment');
var notificationConfig = require('../configs/notification.config');
var fs = require('fs');
var contactDao = require('../dao/contact.dao');
var accountDao = require('../dao/account.dao');
var campaignDao = require('../campaign/dao/campaign.dao');

var userDao = require('../dao/user.dao');
var async = require('async');
var juice = require('juice');
var appConfig = require('../configs/app.config');
var sendgridConfig = require('../configs/sendgrid.config');
var dao = require('./dao/emailmessage.dao');
var scheduledJobsManager = require('../scheduledjobs/scheduledjobs_manager');
var orgManager = require('../organizations/organization_manager');
var serialize = require('node-serialize');
var sanitizeHtml = require('sanitize-html');
var sg = require('sendgrid')(sendgridConfig.API_KEY);
var subjectPrefix = '';
if(appConfig.nonProduction === true) {
    subjectPrefix = '[TEST] ';
}

var s3dao = require('../dao/integrations/s3.dao');
var s3Config = require('../configs/aws.config');

require('./model/unsubscription');


var emailMessageManager = {

    log:log,

    sendAccountWelcomeEmail: function(fromAddress, fromName, toAddress, toName, subject, htmlContent, accountId, userId,
                                      vars, emailId, contactId, fn) {
        var self = this;
        self.log.debug('>> sendAccountWelcomeEmail');
        self._getFromAdressNameAndReplyTo(accountId, fromAddress, fromName, function(err, senderAddress, senderName, replyTo){
            self.log.debug('senderAddress:', senderAddress);
            self.log.debug('senderName:', senderName);
            self.log.debug('replyTo:', replyTo);
            self._checkForUnsubscribe(accountId, toAddress, function(err, isUnsubscribed) {
                if (isUnsubscribed == true) {
                    fn('skipping email for user on unsubscribed list');
                } else {
                    vars.push({
                        "name": "SENDDATE",
                        "content": moment().format('MMM Do, YYYY')
                    });
                    self._findReplaceMergeTags(accountId, contactId, htmlContent, vars, function(mergedHtml) {

                        juice.juiceResources(mergedHtml, {}, function(err, html){

                            var request = sg.emptyRequest();
                            request.body = {
                                "categories": [
                                    "welcome"
                                ],
                                "content": [
                                    {
                                        "type": "text/html",
                                        "value": html
                                    }
                                ],

                                "from": {
                                    "email": senderAddress
                                },
                                "headers": {},
                                "personalizations": [
                                    {
                                        "headers": {
                                            "X-Accept-Language": "en"
                                        },
                                        "subject": subjectPrefix + subject,

                                        "to": [
                                            {
                                                "email": toAddress
                                            }
                                        ]
                                    }
                                ],
                                "tracking_settings": {
                                    "click_tracking": {
                                        "enable": true,
                                        "enable_text": true
                                    },
                                    "subscription_tracking":{
                                        enable:false
                                    }
                                }
                            };
                            request.method = 'POST';
                            request.path = '/v3/mail/send';

                            if(senderName && senderName.length > 0) {
                                request.body.from.name = senderName;
                            }
                            if(toName && toName.length > 0) {
                                request.body.personalizations[0].to[0].name = toName;
                            }
                            request.body.reply_to = {
                                email: replyTo
                            };
                            if(fromName) {
                                request.body.reply_to.name = fromName;
                            }


                            self._safeStoreEmail(request.body, accountId, userId, emailId, function(err, emailmessage){
                                //we should not have an err here
                                if(err) {
                                    self.log.error('Error storing email (this should not happen):', err);
                                    return fn(err);
                                } else {
                                    request.body.custom_args = {
                                        emailmessageId: emailmessage.id(),
                                        accountId:''+accountId,
                                        date: moment().toISOString()
                                    };

                                    sg.API(request, function (error, response) {
                                        self.log.debug(response.statusCode);
                                        self.log.debug(response.body);
                                        self.log.debug(response.headers);
                                        if (err) {
                                            self.log.error('Error sending email:', err);
                                            return fn(err);
                                        } else {
                                            self.log.debug('<< sendAccountWelcomeEmail');
                                            return fn(null, response);
                                        }
                                    });


                                }
                            });
                        });
                    });
                }
            });
        });


    },

    cancelSendgridBatch: function(accountId, userId, batchId, campaignId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> cancelSendgridBatch');
        scheduledJobsManager.cancelCampaignJob(campaignId, function(err, value){
            if(err) {
                self.log.error('Error cancelling job:', err);
                return fn(err);
            } else {
                var request = sg.emptyRequest();
                request.method = 'POST';
                request.path = '/v3/user/scheduled_sends';
                request.body = {
                    batch_id: batchId,
                    status: 'pause'
                };
                sg.API(request, function (err, response) {
                    if(err) {
                        self.log.warn('Error cancelling batchId:', err);
                        self.log.error('Sendgrid says:', response.body);
                        fn(null, null);
                    } else {
                        self.log.debug('Sendgrid says:', response);
                        self.log.debug('Response.body:', response.body);
                        self.log.debug(accountId, userId, '<< cancelSendgridBatch');
                        return fn(null, response);
                    }
                });
            }
        });


    },

    sendBatchedCampaignEmail: function(fromAddress, fromName, contactAry, subject, htmlContent, account, campaignId,
                                       vars, emailSettings, emailId, userId, fn) {
        var self = this;
        var accountId = account.id();
        self.log.debug(accountId, null, '>> sendBatchedCampaignEmail');
        var sendgridBatchID = null;
        var senderAddress, senderName, replyTo;
        async.waterfall([
            function(cb) {
                self._getFromAdressNameAndReplyTo(accountId, fromAddress, fromName, function(err, _senderAddress, _senderName, _replyTo){
                    senderAddress = _senderAddress;
                    senderName = _senderName;
                    replyTo = _replyTo;
                    cb(null);
                });
            },
            function(cb) {
                var request = sg.emptyRequest();
                request.method = 'POST';
                request.path = '/v3/mail/batch';
                sg.API(request, function (err, response) {
                    if(err) {
                        self.log.warn('Error getting batchId:', err);
                        self.log.error('Sendgrid says:', response.body);
                        cb(null, null);
                    } else {
                        self.log.debug('BatchID: ', response.body.batch_id);
                        sendgridBatchID = response.body.batch_id;
                        cb(null, response.body.batch_id);
                    }
                });
            },
            function(batchId, cb) {
                //filter unsubscribes
                var filteredContacts = [];
                _.each(contactAry, function(contact){
                    if(contact.get('unsubscribed') === true) {
                        self.log.info('contact [' + contact.id() + ' with email [' + contact.getPrimaryEmail() + '] has unsubscribed.  Skipping email.');
                    } else {
                        filteredContacts.push(contact);
                    }
                });
                cb(null, batchId, filteredContacts);
            },
            function(batchId, contacts, cb) {
                if(accountId === 6) {
                    var userAry = [];
                    var userAccountAry = [];
                    async.each(contacts, function(_contact, callback){
                        var primaryEmail = _contact.getPrimaryEmail();
                        userDao.getUserByUsername(primaryEmail, function (err, user) {
                            if(err) {
                                self.log.error('Error retrieving contact:', err);
                                userAry.push({});
                                userAccountAry.push({});
                                callback();
                            } else {
                                if(user){
                                    userAry.push(user);
                                    var firstAccountId = user.get('accounts')[0].accountId;
                                    accountDao.getAccountByID(firstAccountId, function (err, userAccount) {
                                        if(err) {
                                            self.log.error('error retrieving firstAccountId:', err);
                                            userAccountAry.push({});
                                            callback();
                                        } else {
                                            userAccountAry.push(userAccount);
                                            callback();
                                        }
                                    });
                                }
                                else{
                                    callback();
                                }
                            }
                        });
                    }, function(err){
                        cb(null, batchId, contacts, userAry, userAccountAry);
                    });
                } else {
                    cb(null, batchId, contacts, [], []);
                }

            },
            function(batchId, contacts, userAry, userAccountAry, cb) {
                var sendgridSubsAndHtml = {};
                juice.juiceResources(htmlContent, {}, function(err, html){
                    if(err) {
                        self.log.error('Error juicing the htmlContent:', err);
                        cb(err);
                    } else {
                        //build personalizations
                        var personalizations = [];
                        var i = 0;
                        var filteredContacts = [];
                        _.each(contacts, function(contact){
                            var email = contact.getPrimaryEmail();

                            if(email.indexOf('@') >0) {
                                filteredContacts.push(contact);
                                var name = contact.get('first') + ' ' + contact.get('last');
                                var p = {
                                    to: [
                                        {email:email, name:name}
                                    ]
                                };
                                var user = null;
                                var userAccount = null;
                                if(userAry && userAry[i]) {
                                    user = userAry[i];
                                }
                                if(userAccountAry && userAccountAry[i]) {
                                    userAccount = userAccountAry[i];
                                }
                                sendgridSubsAndHtml = self._convertMergeTagsToSendgridPersonalizations(account, contact, user, userAccount, html, vars);
                                p.substitutions = sendgridSubsAndHtml.substitutions;
                                if(emailSettings.cc) {
                                    p.cc =[{email:emailSettings.cc}];
                                }
                                if(emailSettings.bcc) {
                                    p.bcc = [{email:emailSettings.bcc}];
                                }
                                p.custom_args = {
                                    contactId: contact.id(),
                                    contactFirstName: contact.get('first'),
                                    contactLastName: contact.get('last')
                                };
                                personalizations.push(p);
                                i++;
                            } else {
                                //contactDao.setInvalidEmailTag(accountId, userId, contact.id(), function(err, value){});
                            }

                        });


                        cb(null, batchId, personalizations, filteredContacts, sendgridSubsAndHtml.html);
                    }
                });
            },
            function(batchId, personalizations, contacts, html, cb) {

                var request = sg.emptyRequest();
                request.body = {
                    "batch_id": batchId,
                    "categories": [
                        "campaign"
                    ],

                    "from": {
                        "email": senderAddress
                    },
                    content: [
                        {
                            type:'text/html',
                            value:html
                        }
                    ],
                    "subject": subjectPrefix + subject,
                    "headers": {},

                    "tracking_settings": {
                        "click_tracking": {
                            "enable": true,
                            "enable_text": true
                        }
                    }
                };
                request.method = 'POST';
                request.path = '/v3/mail/send';

                if(senderName && senderName.length > 0) {
                    request.body.from.name = senderName;
                }
                request.body.reply_to = {
                    email: replyTo
                };
                if(fromName) {
                    request.body.reply_to.name = fromName;
                }
                request.body.batchId = campaignId;
                request.body.personalizations = personalizations;
                self._safeStoreBatchEmail(request.body, accountId, userId, emailId, campaignId, personalizations, function(err, messageIds){
                    cb(err, batchId, personalizations, request, messageIds, contacts);
                });

            },
            function(batchId, personalizations, request, messageIds, contacts, cb) {
                //Sendgrid doesn't like it when we mess with their chi
                delete request.body.batchId;

                var i = 0;
                _.each(contacts, function(contact){
                    var custom_args= {
                        emailmessageId: messageIds[i],
                        accountId:''+accountId,
                        date: moment().toISOString(),
                        emailId: emailId,
                        campaignId: campaignId,
                        contactId: ''+contact.id()
                    };
                    request.body.personalizations[i].custom_args = custom_args;//TODO: defense
                    i++;
                });
                //Figure out when to send it
                var send_at = null;
                var now_at = null;
                if(emailSettings.offset) {
                    //the offset is the number of mintues from now to send it at.
                    send_at = moment().utc().add('minutes', emailSettings.offset).unix();
                    self.log.debug('send_at (offset) ' + send_at);
                } else if(emailSettings.scheduled) {
                    send_at = self._getSecheduledUTCUnix(emailSettings.scheduled.day,
                        emailSettings.scheduled.hour, emailSettings.scheduled.minute, emailSettings.offset||0);
                    self.log.debug('send_at (scheduled): ' + send_at);
                } else if(emailSettings.sendAt) {
                    self.log.debug('send details >>> ', emailSettings.sendAt);
                    // send_at = self._getUtcDateTimeIsoString(stepSettings.sendAt.year, stepSettings.sendAt.month-1, stepSettings.sendAt.day, stepSettings.sendAt.hour, stepSettings.sendAt.minute, stepSettings.offset||0);
                    // now_at = self._getUtcDateTimeIsoString(moment().year(), moment().month(), moment().date(), moment().hour(), moment().minute(), 0);
                    emailSettings.sendAt.month = emailSettings.sendAt.month - 1;
                    self.log.debug('moment thinks sendAt is ' + moment(emailSettings.sendAt).toDate());
                    send_at = moment.utc(emailSettings.sendAt).unix();
                    now_at = moment.utc();
                    self.log.debug('send_at formatted >>> ', send_at);
                    self.log.debug('now_at formatted >>> ', now_at.unix());
                    if(moment.utc(emailSettings.sendAt).isBefore(now_at)) {
                        self.log.debug('Sending email now because ' + send_at + ' is in the past.');
                        send_at = moment().utc().unix();
                    }
                } else {
                    //send it now?
                    self.log.debug('No scheduled or sendAt specified.');
                    send_at = moment().utc().unix();
                }

                var maxSendTime = moment().add(72, 'hours');
                request.body.send_at = send_at;
                if(maxSendTime.isBefore(moment.unix(send_at))) {
                    //schedule the email
                    self.log.debug('Scheduling email');
                    var maxPersonalizations = 1000;
                    if(personalizations.length > maxPersonalizations) {
                        var code = 'var emailJson, uniqueArgs, send_at;';
                        var i,j,temparray,chunk = maxPersonalizations;
                        for (i=0,j=personalizations.length; i<j; i+=chunk) {
                            temparray = personalizations.slice(i,i+chunk);
                            // do whatever
                            request.body.personalizations = temparray;
                            code += 'emailJSON = ' + serialize.serialize(request.body) + ';';
                            code += 'uniqueArgs = {};';
                            code += 'send_at = ' + send_at + ';';
                            code += '$$.u.emailMessageManager._sendEmailJSON(emailJSON, uniqueArgs, send_at, function(){});';
                        }
                        var scheduledJob = new $$.m.ScheduledJob({
                            accountId: accountId,
                            campaignId: campaignId,
                            scheduledAt: moment.unix(send_at).toDate(),
                            runAt: null,
                            job:code
                        });


                        scheduledJobsManager.scheduleJob(scheduledJob, function(err, value){
                            self.log.debug(accountId, null, '<< sendCampaignEmail (scheduled)');
                            cb(err, value);
                        });
                    } else {
                        var code = '';
                        code+= 'var emailJSON = ' + serialize.serialize(request.body) + ';';
                        //code+= 'var uniqueArgs = ' + serialize.serialize(uniqueArgs) + ';';
                        code+= 'var uniqueArgs = {};';
                        code+= 'var send_at = ' + send_at + ';';
                        code+= '$$.u.emailMessageManager._sendEmailJSON(emailJSON, uniqueArgs, send_at, function(){});';

                        var scheduledJob = new $$.m.ScheduledJob({
                            accountId: accountId,
                            campaignId: campaignId,
                            scheduledAt: moment.unix(send_at).toDate(),
                            runAt: null,
                            job:code
                        });


                        scheduledJobsManager.scheduleJob(scheduledJob, function(err, value){
                            self.log.debug(accountId, null, '<< sendCampaignEmail (scheduled)');
                            cb(err, value);
                        });
                    }


                } else {
                    //send the email
                    self.log.trace('Sending:', JSON.stringify(request.body));
                    var maxPersonalizations = 1000;
                    if(personalizations.length > maxPersonalizations) {
                        var requestAry = [];
                        var i,j,temparray,chunk = maxPersonalizations;
                        for (i=0,j=personalizations.length; i<j; i+=chunk) {
                            temparray = personalizations.slice(i,i+chunk);
                            // do whatever
                            request.body.personalizations = temparray;
                            requestAry.push(sg.emptyRequest(request));
                        }
                        async.eachSeries(requestAry, function(_request, callback){
                            self.log.trace('Sending:', JSON.stringify(_request));
                            sg.API(_request, function(err, response){
                                if(err) {
                                    self.log.error('Error sending email:', err);
                                    if(err.response && err.response.body) {
                                        self.log.error(err.response.body.errors);
                                    }
                                    var campaignManager = require('../campaign/campaign_manager');
                                    campaignManager.updateCampaignFailures(campaignId, _request.body.personalizations, function(err, value){
                                        callback(null, response);
                                    });

                                } else {
                                    callback(null, response);
                                }

                            });
                        }, function(err, response){
                            self.log.debug(accountId, null, '<< sendCampaignEmail');
                            cb(null, response);
                        });
                    } else {
                        sg.API(request, function (err, response) {
                            self.log.debug(response.statusCode);
                            self.log.debug(response.body);
                            self.log.debug(response.headers);
                            if (err) {
                                self.log.error('Error sending email:', err);
                                cb(err);
                            } else {
                                self.log.debug(accountId, null, '<< sendCampaignEmail');
                                cb(null, response);
                            }
                        });
                    }

                }
            },
            function(response, cb) {
                if(sendgridBatchID) {
                    campaignDao.patch({_id:campaignId}, {sendgridBatchId:sendgridBatchID}, $$.m.CampaignV2, function(err, value){
                       if(err) {
                           self.log.error(accountId, userId, 'Error storing batchId:', err);
                       }
                       cb(null, response);
                    });
                } else {
                    cb(null, response);
                }
            }
        ], function(err, response){
            if(err) {
                self.log.error('Error sending campaign emails:', err);
                return fn(err);
            } else {
                self.log.debug(accountId, null, '<< sendCampaignEmail');
                return fn(null, response);
            }
        });



    },

    sendCampaignEmail: function(fromAddress, fromName, toAddress, toName, subject, htmlContent, accountId, campaignId,
                                contactId, vars, stepSettings, emailId, fn) {
        var self = this;
        self.log.debug(accountId, null, '>> sendCampaignEmail');
        self._checkForUnsubscribe(accountId, toAddress, function(err, isUnsubscribed) {
            if (isUnsubscribed == true) {
                self.log.debug(accountId, null, 'Skipping email for [' + toAddress + '] on campaign [' + campaignId + '] because contact has unsubscribed.' );
                fn(null, 'skipping email for user on unsubscribed list');
            } else {
                self._getFromAdressNameAndReplyTo(accountId, fromAddress, fromName, function(err, senderAddress, senderName, replyTo){
                    self._findReplaceMergeTags(accountId, contactId, htmlContent, vars, function(mergedHtml) {
                        //inline styles
                        juice.juiceResources(mergedHtml, {}, function(err, html){


                            var request = sg.emptyRequest();
                            request.body = {
                                "categories": [
                                    "campaign"
                                ],
                                "content": [
                                    {
                                        "type": "text/html",
                                        "value": html
                                    }
                                ],

                                "from": {
                                    "email": senderAddress
                                },
                                "subject": subjectPrefix + subject,
                                "headers": {},
                                "personalizations": [
                                    {"to": [{"email": toAddress}]}
                                ],
                                "tracking_settings": {
                                    "click_tracking": {
                                        "enable": true,
                                        "enable_text": true
                                    }
                                }
                            };
                            request.method = 'POST';
                            request.path = '/v3/mail/send';

                            if(senderName && senderName.length > 0) {
                                request.body.from.name = senderName;
                            }
                            if(toName && toName.length > 0) {
                                request.body.personalizations[0].to[0].name = toName;
                            }
                            if(stepSettings.bcc) {
                                request.body.personalizations[0].bcc = {
                                    email: stepSettings.bcc
                                }
                            }
                            request.body.batchId = campaignId;
                            request.body.reply_to = {
                                email: replyTo
                            };
                            if(fromName) {
                                request.body.reply_to.name = fromName;
                            }

                            self._safeStoreEmail(request.body, accountId, null, emailId, function(err, emailmessage){
                                //we should not have an err here
                                if(err) {
                                    self.log.error('Error storing email (this should not happen):', err);
                                    return fn(err);
                                } else {
                                    //Sendgrid doesn't like it when we mess with their chi
                                    delete request.body.batchId;

                                    request.body.custom_args = {
                                        emailmessageId: emailmessage.id(),
                                        accountId:''+accountId,
                                        date: moment().toISOString(),
                                        emailId: emailId,
                                        campaignId: campaignId,
                                        contactId:''+contactId
                                    };
                                    //Figure out when to send it
                                    var send_at = null;
                                    var now_at = null;
                                    if(stepSettings.offset) {
                                        //the offset is the number of mintues from now to send it at.
                                        send_at = moment().utc().add('minutes', stepSettings.offset).unix();
                                        self.log.debug('send_at (offset) ' + send_at);
                                    } else if(stepSettings.scheduled) {
                                        send_at = self._getSecheduledUTCUnix(stepSettings.scheduled.day,
                                            stepSettings.scheduled.hour, stepSettings.scheduled.minute, stepSettings.offset||0);
                                        self.log.debug('send_at (scheduled): ' + send_at);
                                    } else if(stepSettings.sendAt) {
                                        self.log.debug('send details >>> ', stepSettings.sendAt);
                                        // send_at = self._getUtcDateTimeIsoString(stepSettings.sendAt.year, stepSettings.sendAt.month-1, stepSettings.sendAt.day, stepSettings.sendAt.hour, stepSettings.sendAt.minute, stepSettings.offset||0);
                                        // now_at = self._getUtcDateTimeIsoString(moment().year(), moment().month(), moment().date(), moment().hour(), moment().minute(), 0);
                                        stepSettings.sendAt.month = stepSettings.sendAt.month - 1;
                                        self.log.debug('moment thinks sendAt is ' + moment(stepSettings.sendAt).toDate());
                                        send_at = moment.utc(stepSettings.sendAt).unix();
                                        now_at = moment.utc();
                                        self.log.debug('send_at formatted >>> ', send_at);
                                        self.log.debug('now_at formatted >>> ', now_at.unix());
                                        if(moment.utc(stepSettings.sendAt).isBefore(now_at)) {
                                            self.log.debug('Sending email now because ' + send_at + ' is in the past.');
                                            send_at = moment().utc().unix();
                                        }
                                    } else {
                                        //send it now?
                                        self.log.debug('No scheduled or sendAt specified.');
                                        send_at = moment().utc().unix();
                                    }

                                    var maxSendTime = moment().add(72, 'hours');
                                    request.body.send_at = send_at;
                                    if(maxSendTime.isBefore(moment.unix(send_at))) {
                                        //schedule the email
                                        self.log.debug('Scheduling email');
                                        var code = '';
                                        code+= 'var emailJSON = ' + serialize.serialize(request.body) + ';';
                                        code+= 'var uniqueArgs = ' + serialize.serialize(uniqueArgs) + ';';
                                        code+= 'var send_at = ' + send_at + ';';
                                        code+= '$$.u.emailMessageManager._sendEmailJSON(emailJSON, uniqueArgs, send_at, function(){});';

                                        var scheduledJob = new $$.m.ScheduledJob({
                                            accountId: accountId,
                                            campaignId: campaignId,
                                            scheduledAt: moment.unix(send_at).toDate(),
                                            runAt: null,
                                            job:code
                                        });


                                        scheduledJobsManager.scheduleJob(scheduledJob, function(err, value){
                                            self.log.debug('<< sendCampaignEmail');
                                            return fn(err, value);
                                        });

                                    } else {
                                        //send the email
                                        self.log.trace('Sending:', JSON.stringify(request.body));
                                        sg.API(request, function (error, response) {
                                            self.log.debug(response.statusCode);
                                            self.log.debug(response.body);
                                            self.log.debug(response.headers);
                                            if (err) {
                                                self.log.error('Error sending email:', err);
                                                return fn(err);
                                            } else {
                                                self.log.debug(accountId, null, '<< sendCampaignEmail');
                                                return fn(null, response);
                                            }
                                        });
                                    }
                                }
                            });
                        });
                    });
                });

            }
        });

    },

    sendOrderEmail: function(fromAddress, fromName, toAddress, toName, subject, htmlContent, accountId, orderId, vars,
                             emailId, ccAry, fn) {
        var self = this;
        self.log.debug('>> sendOrderEmail');
        self._checkForUnsubscribe(accountId, toAddress, function(err, isUnsubscribed) {
            if (isUnsubscribed == true) {
                fn('skipping email for user on unsubscribed list');
            } else {
                self._getFromAdressNameAndReplyTo(accountId, fromAddress, fromName, function(err, senderAddress, senderName, replyTo){
                    vars.push({
                            "name": "SENDDATE",
                            "content": moment().format('MMM Do, YYYY')
                        },
                        {
                            "name": 'ORDERID',
                            "content": orderId
                        }
                    );
                    htmlContent = self._replaceMandrillStyleVars(vars, htmlContent);
                    juice.juiceResources(htmlContent, {}, function(err, html) {
                        var request = sg.emptyRequest();
                        request.body = {
                            "categories": [
                                "order"
                            ],
                            "content": [
                                {
                                    "type": "text/html",
                                    "value": html
                                }
                            ],
                            "from": {
                                "email": senderAddress
                            },
                            "headers": {},
                            "personalizations": [
                                {
                                    "headers": {
                                        "X-Accept-Language": "en"
                                    },
                                    "subject": subjectPrefix + subject,

                                    "to": [
                                        {
                                            "email": toAddress
                                        }
                                    ]
                                }
                            ],
                            "tracking_settings": {
                                "click_tracking": {
                                    "enable": true,
                                    "enable_text": true
                                },
                                "subscription_tracking":{
                                    enable:false
                                }
                            }
                        };
                        request.method = 'POST';
                        request.path = '/v3/mail/send';

                        if(senderName && senderName.length > 0) {
                            request.body.from.name = senderName;
                        }
                        if(toName && toName.length > 0) {
                            request.body.personalizations[0].to[0].name = toName;
                        }
                        if(ccAry && ccAry.length > 0) {
                            request.body.personalizations[0].cc = [];
                            _.each(ccAry, function(ccAddress){
                                request.body.personalizations[0].cc.push({email:ccAddress});
                            });
                        }
                        request.body.reply_to = {
                            email: replyTo
                        };
                        if(fromName) {
                            request.body.reply_to.name = fromName;
                        }

                        self._safeStoreEmail(request.body, accountId, null, emailId, function(err, emailmessage){
                            //we should not have an err here
                            if(err) {
                                self.log.error('Error storing email (this should not happen):', err);
                                return fn(err);
                            } else {

                                request.body.custom_args = {
                                    emailmessageId: emailmessage.id(),
                                    accountId:''+accountId,
                                    orderId:orderId,
                                    date: moment().toISOString(),
                                    emailId: emailId
                                };
                                sg.API(request, function (error, response) {
                                    self.log.debug(response.statusCode);
                                    self.log.debug(response.body);
                                    self.log.debug(response.headers);
                                    if (err) {
                                        self.log.error('Error sending email:', err);
                                        return fn(err);
                                    } else {
                                        self.log.debug(accountId, null, '<< sendOrderEmail');
                                        return fn(null, response);
                                    }
                                });
                            }
                        });
                    });
                });

            }
        });

    },

    sendFulfillmentEmail: function(fromAddress, fromName, toAddress, toName, subject, htmlContent, accountId, orderId,
                                   vars, emailId, bcc,  fn) {
        var self = this;
        self.log.debug('>> sendFulfillmentEmail');
        self._checkForUnsubscribe(accountId, toAddress, function(err, isUnsubscribed) {
            if (isUnsubscribed == true) {
                fn('skipping email for user on unsubscribed list');
            } else {
                self._getFromAdressNameAndReplyTo(accountId, fromAddress, fromName, function(err, senderAddress, senderName, replyTo){
                    vars.push({
                            "name": "SENDDATE",
                            "content": moment().format('MMM Do, YYYY')
                        },
                        {
                            "name": 'ORDERID',
                            "content": orderId
                        }
                    );
                    htmlContent = self._replaceMandrillStyleVars(vars, htmlContent);
                    juice.juiceResources(htmlContent, {}, function(err, html) {
                        if (err) {
                            self.log.error('A juice error occurred. Failed to set styles inline.');
                            self.log.error(err);
                            return fn(err, null);
                        }

                        var request = sg.emptyRequest();
                        request.body = {
                            "categories": [
                                "fulfillment"
                            ],
                            "content": [
                                {
                                    "type": "text/html",
                                    "value": html
                                }
                            ],
                            "from": {
                                "email": senderAddress
                            },
                            "headers": {},
                            "personalizations": [
                                {
                                    "headers": {
                                        "X-Accept-Language": "en"
                                    },
                                    "subject": subjectPrefix + subject,

                                    "to": [
                                        {
                                            "email": toAddress
                                        }
                                    ]
                                }
                            ],
                            "tracking_settings": {
                                "click_tracking": {
                                    "enable": true,
                                    "enable_text": true
                                }
                            }
                        };
                        request.method = 'POST';
                        request.path = '/v3/mail/send';

                        if(senderName && senderName.length > 0) {
                            request.body.from.name = senderName;
                        }
                        if(toName && toName.length > 0) {
                            request.body.personalizations[0].to[0].name = toName;
                        }
                        if(bcc && bcc.length > 0) {
                            request.body.personalizations[0].bcc = [];
                            request.body.personalizations[0].bcc.push({
                                email: bcc
                            });
                        }

                        request.body.reply_to = {
                            email: replyTo
                        };
                        if(fromName) {
                            request.body.reply_to.name = fromName;
                        }

                        self._safeStoreEmail(request.body, accountId, null, emailId, function(err, emailmessage){
                            //we should not have an err here
                            if(err) {
                                self.log.error('Error storing email (this should not happen):', err);
                                return fn(err);
                            } else {

                                request.body.custom_args = {
                                    emailmessageId: emailmessage.id(),
                                    accountId:''+accountId,
                                    orderId:orderId,
                                    date: moment().toISOString(),
                                    emailId: emailId
                                };
                                sg.API(request, function (error, response) {
                                    self.log.debug(response.statusCode);
                                    self.log.debug(response.body);
                                    self.log.debug(response.headers);
                                    if (err) {
                                        self.log.error('Error sending email:', err);
                                        return fn(err);
                                    } else {
                                        self.log.debug(accountId, null, '<< sendFulfillmentEmail');
                                        return fn(null, response);
                                    }
                                });

                            }
                        });

                    });
                });

            }
        });

    },

    sendNewCustomerEmail: function(toAddress, toName, fromName, fromAddress, accountId, vars, ccArray, fn) {
        var self = this;
        self.log.debug('>> sendNewCustomerEmail', fromName);
        self._checkForUnsubscribe(accountId, toAddress, function(err, isUnsubscribed) {
            if (isUnsubscribed == true) {
                fn('skipping email for user on unsubscribed list');
            } else {
                if(!fromAddress) {
                    fromAddress = notificationConfig.WELCOME_FROM_EMAIL;
                }
                if(!fromName) {
                    fromName = notificationConfig.WELCOME_FROM_NAME;
                }
                self._getFromAdressNameAndReplyTo(accountId, fromAddress, fromName, function(err, senderAddress, senderName, replyTo){
                    vars.push({
                        "name": "SENDDATE",
                        "content": moment().format('MMM Do, YYYY')
                    });

                    fs.readFile('templates/emails/new_customer.html', 'utf-8', function(err, htmlContent){
                        if (err) {
                            self.log.error('Error getting new customer email file.  Welcome email not sent for accountId ' + accountId, err);
                        } else {
                            htmlContent = self._replaceMandrillStyleVars(vars, htmlContent);
                            var subject = 'You have a new customer!';


                            var request = sg.emptyRequest();
                            request.body = {
                                "categories": [
                                    "new_customer"
                                ],
                                "content": [
                                    {
                                        "type": "text/html",
                                        "value": htmlContent
                                    }
                                ],
                                "from": {
                                    "email": senderAddress
                                },
                                "headers": {},
                                "personalizations": [
                                    {
                                        "headers": {
                                            "X-Accept-Language": "en"
                                        },
                                        "subject": subjectPrefix + subject,

                                        "to": [
                                            {
                                                "email": toAddress
                                            }
                                        ]
                                    }
                                ],
                                "tracking_settings": {
                                    "click_tracking": {
                                        "enable": true,
                                        "enable_text": true
                                    },
                                    "subscription_tracking":{
                                        enable:false
                                    }
                                }
                            };
                            request.method = 'POST';
                            request.path = '/v3/mail/send';

                            if(senderName && senderName.length > 0) {
                                request.body.from.name = fromName;
                            }
                            if(toName && toName.length > 0) {
                                request.body.personalizations[0].to[0].name = toName;
                            }
                            request.body.reply_to = {
                                email: replyTo
                            };
                            if(fromName) {
                                request.body.reply_to.name = fromName;
                            }

                            self._safeStoreEmail(request.body, accountId, null, null, function(err, emailmessage){
                                //we should not have an err here
                                if(err) {
                                    self.log.error('Error storing email (this should not happen):', err);
                                    return fn(err);
                                } else {

                                    request.body.custom_args = {
                                        emailmessageId: emailmessage.id(),
                                        accountId:''+accountId,
                                        date: moment().toISOString()
                                    };
                                    sg.API(request, function (error, response) {
                                        self.log.debug(response.statusCode);
                                        self.log.debug(response.body);
                                        self.log.debug(response.headers);
                                        if (err) {
                                            self.log.error('Error sending email:', err);
                                            return fn(err);
                                        } else {
                                            self.log.debug(accountId, null, '<< sendNewCustomerEmail');
                                            return fn(null, response);
                                        }
                                    });

                                }
                            });
                        }
                    });
                });

            }
        });

    },

    sendBasicEmail: function(fromAddress, fromName, toAddress, toName, subject, htmlContent, accountId, vars, emailId,
                             ccAry, bcc, suppressUnsubscribe, fn) {
        var self = this;
        self.log.debug('>> sendBasicEmail');
        self.log.trace('subject:' + subject);
        self.log.trace('suppressUnsubscribe:' + suppressUnsubscribe);
        self._checkForUnsubscribe(accountId, toAddress, function(err, isUnsubscribed) {
            if (isUnsubscribed == true) {
                fn('skipping email for user on unsubscribed list');
            } else {
                self._getFromAdressNameAndReplyTo(accountId, fromAddress, fromName, function(err, senderAddress, senderName, replyTo){
                    htmlContent = self._replaceMandrillStyleVars(vars, htmlContent);
                    juice.juiceResources(htmlContent, {}, function(err, html) {
                        if (err) {
                            self.log.error('A juice error occurred. Failed to set styles inline.');
                            self.log.error(err);
                            return fn(err, null);
                        }

                        var request = sg.emptyRequest();
                        request.body = {
                            "categories": [
                                "basic"
                            ],
                            "content": [
                                {
                                    "type": "text/html",
                                    "value": htmlContent
                                }
                            ],
                            "from": {
                                "email": senderAddress
                            },
                            "headers": {},
                            "personalizations": [
                                {
                                    "headers": {
                                        "X-Accept-Language": "en"
                                    },
                                    "subject": subjectPrefix + subject,

                                    "to": [
                                        {
                                            "email": toAddress
                                        }
                                    ]
                                }
                            ],
                            "tracking_settings": {
                                "click_tracking": {
                                    "enable": true,
                                    "enable_text": true
                                },
                                "subscription_tracking":{enable:true}
                            }
                        };
                        if(suppressUnsubscribe && suppressUnsubscribe === true) {
                            request.body.tracking_settings.subscription_tracking.enable = false;
                        }
                        self.log.trace('request.body:', request.body);
                        request.method = 'POST';
                        request.path = '/v3/mail/send';

                        if(senderName && senderName.length > 0) {
                            request.body.from.name = senderName;
                        }
                        if(toName && toName.length > 0) {
                            request.body.personalizations[0].to[0].name = toName;
                        }
                        if(ccAry && ccAry.length > 0) {
                            request.body.personalizations[0].cc = [];
                            _.each(ccAry, function(ccAddress){
                                request.body.personalizations[0].cc.push({email:ccAddress});
                            });
                        }
                        if(bcc && bcc.length > 0) {
                            request.body.personalizations[0].bcc = [];
                            request.body.personalizations[0].bcc.push({
                                email: bcc
                            });
                        }
                        request.body.reply_to = {
                            email: replyTo
                        };
                        if(fromName) {
                            request.body.reply_to.name = fromName;
                        }

                        self._safeStoreEmail(request.body, accountId, null, emailId, function(err, emailmessage){
                            //we should not have an err here
                            if(err) {
                                self.log.error('Error storing email (this should not happen):', err);
                                return fn(err);
                            } else {
                                request.body.custom_args = {
                                    emailmessageId: emailmessage.id(),
                                    accountId:''+accountId,
                                    date: moment().toISOString(),
                                    emailId: emailId
                                };
                                sg.API(request, function (error, response) {
                                    self.log.debug(response.statusCode);
                                    self.log.debug(response.body);
                                    self.log.debug(response.headers);
                                    if (err) {
                                        self.log.error('Error sending email:', err);
                                        return fn(err);
                                    } else {
                                        self.log.debug(accountId, null, '<< sendBasicEmail');
                                        return fn(null, response);
                                    }
                                });
                            }
                        });
                    });
                });

            }
        });

    },


    sendBasicDetailsEmail: function(fromAddress, fromName, toAddress, toName, subject, htmlContent, accountId, vars, emailId, ccAry, bcc, fn) {
        var self = this;
        self.log.debug('>> sendBasicDetailsEmail');
        self._getFromAdressNameAndReplyTo(accountId, fromAddress, fromName, function(err, senderAddress, senderName, replyTo){
            htmlContent = self._replaceMandrillStyleVars(vars, htmlContent);
            juice.juiceResources(htmlContent, {}, function(err, html) {
                if (err) {
                    self.log.error('A juice error occurred. Failed to set styles inline.');
                    self.log.error(err);
                    return fn(err, null);
                }

                var request = sg.emptyRequest();
                request.body = {
                    "categories": [
                        "basic"
                    ],
                    "content": [
                        {
                            "type": "text/html",
                            "value": htmlContent
                        }
                    ],
                    "from": {
                        "email": senderAddress
                    },
                    "headers": {},
                    "personalizations": [
                        {
                            "headers": {
                                "X-Accept-Language": "en"
                            },
                            "subject": subjectPrefix + subject,

                            "to": [
                                {
                                    "email": toAddress
                                }
                            ]
                        }
                    ],
                    "tracking_settings": {
                        "click_tracking": {
                            "enable": true,
                            "enable_text": true
                        },
                        "subscription_tracking":{
                            enable:false
                        }
                    }

                };
                request.method = 'POST';
                request.path = '/v3/mail/send';

                if(senderName && senderName.length > 0) {
                    request.body.from.name = senderName;
                }
                if(toName && toName.length > 0) {
                    request.body.personalizations[0].to[0].name = toName;
                }
                if(ccAry && ccAry.length > 0) {
                    request.body.personalizations[0].cc = [];
                    _.each(ccAry, function(ccAddress){
                        request.body.personalizations[0].cc.push({email:ccAddress});
                    });
                }

                if(bcc) {
                    request.body.personalizations[0].bcc = [{email:bcc}];
                }
                request.body.reply_to = {
                    email: replyTo
                };
                if(fromName) {
                    request.body.reply_to.name = fromName;
                }

                self._safeStoreEmail(request.body, accountId, null, emailId, function(err, emailmessage){
                    //we should not have an err here
                    if(err) {
                        self.log.error('Error storing email (this should not happen):', err);
                        return fn(err);
                    } else {
                        request.body.custom_args = {
                            emailmessageId: emailmessage.id(),
                            accountId:''+accountId,
                            date: moment().toISOString(),
                            emailId: emailId
                        };
                        sg.API(request, function (error, response) {
                            self.log.debug(response.statusCode);
                            self.log.debug(response.body);
                            self.log.debug(response.headers);
                            if (err) {
                                self.log.error('Error sending email:', err);
                                return fn(err);
                            } else {
                                self.log.debug(accountId, null, '<< sendBasicDetailsEmail');
                                return fn(null, response);
                            }
                        });
                    }
                });
            });
        });


    },

    sendTestEmail: function(fromAddress, fromName, toAddress, toName, subject, htmlContent, accountId, vars, emailId, cc, bcc, fn) {
        var self = this;
        var contactId = null;
        self.log.debug('>> sendTestEmail');
        self._checkForUnsubscribe(accountId, toAddress, function(err, isUnsubscribed) {
            if (isUnsubscribed == true) {
                fn('skipping email for user on unsubscribed list');
            } else {
                self._getFromAdressNameAndReplyTo(accountId, fromAddress, fromName, function(err, senderAddress, senderName, replyTo){
                    self._findReplaceMergeTags(accountId, contactId, htmlContent, vars, function(mergedHtml) {
                        juice.juiceResources(mergedHtml, {}, function(err, html) {
                            if (err) {
                                self.log.error('A juice error occurred. Failed to set styles inline.');
                                self.log.error(err);
                                return fn(err, null);
                            }
                            var request = sg.emptyRequest();
                            request.body = {
                                "categories": [
                                    "test"
                                ],
                                "content": [
                                    {
                                        "type": "text/html",
                                        "value": html
                                    }
                                ],
                                "from": {
                                    "email": senderAddress
                                },
                                "subject": subjectPrefix + subject,
                                "headers": {},
                                "personalizations": [
                                    {
                                        "to": [
                                            {
                                                "email": toAddress
                                            }
                                        ]
                                    }
                                ],
                                "tracking_settings": {
                                    "click_tracking": {
                                        "enable": true,
                                        "enable_text": true
                                    }
                                }
                            };
                            request.method = 'POST';
                            request.path = '/v3/mail/send';

                            if(senderName && senderName.length > 0) {
                                request.body.from.name = senderName;
                            }
                            if(toName && toName.length > 0) {
                                request.body.personalizations[0].to[0].name = toName;
                            }

                            if(cc) {
                                request.body.personalizations[0].cc = [{email:cc}];
                            }

                            if(bcc) {
                                request.body.personalizations[0].bcc = [{email:bcc}];
                            }
                            request.body.reply_to = {
                                email: replyTo
                            };
                            if(fromName) {
                                request.body.reply_to.name = fromName;
                            }

                            self._safeStoreEmail(request.body, accountId, null, emailId, function(err, emailmessage){
                                //we should not have an err here
                                if(err) {
                                    self.log.error('Error storing email (this should not happen):', err);
                                    return fn(err);
                                } else {

                                    request.body.personalizations[0].custom_args = {
                                        emailmessageId: emailmessage.id(),
                                        accountId:''+accountId,
                                        date: moment().toISOString(),
                                        emailId: emailId
                                    };
                                    self.log.trace('Sending:', JSON.stringify(request));
                                    sg.API(request, function (error, response) {
                                        self.log.debug(response.statusCode);
                                        self.log.debug(response.body);
                                        self.log.debug(response.headers);
                                        if (err) {
                                            self.log.error('Error sending email:', err);
                                            return fn(err);
                                        } else {
                                            self.log.debug(accountId, null, '<< sendTestEmail');
                                            return fn(null, response);
                                        }
                                    });
                                }
                            });
                        });
                    });
                });

            }
        });

    },

    sendMailReplacement : function(from, to, cc, subject, htmlText, text, fn) {
        var self = this;
        self.log.debug('>> sendMailReplacement');

        var request = sg.emptyRequest();
        request.body = {
            "categories": [
                "server"
            ],
            "content": [
                {
                    "type": "text/html",
                    "value": htmlText
                }
            ],
            "from": {
                "email": from
            },
            "headers": {},
            "personalizations": [
                {
                    "headers": {
                        "X-Accept-Language": "en"
                    },
                    "subject": subjectPrefix + subject,

                    "to": [
                        {
                            "email": to
                        }
                    ]
                }
            ],
            "tracking_settings": {
                "click_tracking": {
                    "enable": true,
                    "enable_text": true
                },
                "subscription_tracking":{
                    enable:false
                }
            }
        };
        request.method = 'POST';
        request.path = '/v3/mail/send';

        if(text) {
            request.body.content = [
                {
                    "type": "text/plain",
                    "value": text
                }
            ];
        }
        if(cc && cc.length > 0) {
            request.body.personalizations[0].cc = [];
            _.each(cc, function(ccAddress){
                request.body.personalizations[0].cc.push({email:ccAddress});
            });
        }

        self._safeStoreEmail(request.body, 0, null, null, function(err, emailmessage){
            //we should not have an err here
            if(err) {
                self.log.error('Error storing email (this should not happen):', err);
                return fn(err);
            } else {

                request.body.custom_args = {
                    emailmessageId: emailmessage.id(),
                    date: moment().toISOString()
                };
                sg.API(request, function (error, response) {
                    self.log.debug(response.statusCode);
                    self.log.debug(response.body);
                    self.log.debug(response.headers);
                    if (err) {
                        self.log.error('Error sending email:', err);
                        return fn(err);
                    } else {
                        self.log.debug(null, null, '<< sendMailReplacement');
                        return fn(null, response);
                    }
                });

            }
        });

    },

    notifyAdmin: function(from, to, cc, subject, text, data, fn) {
        var self = this;

        self.log.debug('>> notifyAdmin');

        if(!to) {
            to = 'admin@indigenous.io';
        }
        if(!from) {
            from = 'admin@indigenous.io';
        }


        var msg = text || '';
        if(data) {
            try {
                msg += '\n' +  JSON.stringify(data);
                self.log.debug('msg is:', msg);
            } catch(Exception){
                self.log.error('Exception stringifying data:', Exception);
            }
        }

        var request = sg.emptyRequest();
        request.body = {
            "categories": [
                "server"
            ],
            "content": [
                {
                    "type": "text/plain",
                    "value": msg
                }
            ],
            "from": {
                "email": from
            },
            "headers": {},
            "personalizations": [
                {
                    "headers": {
                        "X-Accept-Language": "en"
                    },
                    "subject": subjectPrefix + subject,

                    "to": [
                        {
                            "email": to
                        }
                    ]
                }
            ],
            "tracking_settings": {
                "click_tracking": {
                    "enable": true,
                    "enable_text": true
                },
                "subscription_tracking":{enable:false}
            }
        };
        request.method = 'POST';
        request.path = '/v3/mail/send';

        if(cc && cc.length > 0) {
            request.body.personalizations[0].cc = [];
            _.each(cc, function(ccAddress){
                request.body.personalizations[0].cc.push({email:ccAddress});
            });
        }

        sg.API(request, function (error, response) {
            self.log.debug(response.statusCode);
            self.log.debug(response.body);
            self.log.debug(response.headers);
            if (error) {
                self.log.error('Error sending email:', error);
                return fn(error);
            } else {
                self.log.debug(null, null, '<< notifyAdmin');
                return fn(null, response);
            }
        });


    },

    sendInsightEmail: function(fromAddress, fromName, toAddress, toName, subject, htmlContent, accountId, userId,
                               contactId, vars, emailId, ccAry, repyToAddress, replyToName, mainAccountId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> sendInsightEmail');
        async.waterfall([
            function(cb) {
                self._checkForUnsubscribe(accountId, toAddress, function(err, isUnsubscribed) {
                    if (isUnsubscribed === true) {
                        self.log.warn(accountId, userId, 'Skipping insight email for [' + toAddress + '] because contact has unsubscribed.' );
                        cb('Destination address has unsubscribed');
                    } else {
                        cb();
                    }
                });
            },
            function(cb) {
                self._findReplaceMergeTags(accountId, contactId, htmlContent, vars, function(mergedHtml) {
                    cb(null, mergedHtml)
                });
            },
            function(mergedHtml, cb) {
                juice.juiceResources(mergedHtml, {}, function(err, html){
                    cb(err, html);
                });
            },
            function(html, cb) {
                var request = sg.emptyRequest();
                request.body = {
                    "categories": [
                        "insights"
                    ],
                    "content": [
                        {
                            "type": "text/html",
                            "value": html
                        }
                    ],
                    "from": {"email": fromAddress},
                    "headers": {},
                    "personalizations": [
                        {
                            "headers": {
                                "X-Accept-Language": "en"
                            },
                            "subject": subjectPrefix + subject,
                            "to": [ {"email": toAddress}]
                        }
                    ],
                    "tracking_settings": {
                        "click_tracking": {
                            "enable": true,
                            "enable_text": true
                        },
                        "subscription_tracking":{
                            enable:false,
                            html:'<table border="0" cellpadding="0" cellspacing="0" style="width:100%"><tbody><tr><td style="text-align:center">If you&#39;d like to unsubscribe and stop receiving these emails, <% click here %>.</td></tr></tbody></table>'
                        }
                    }
                };
                request.method = 'POST';
                request.path = '/v3/mail/send';

                if(fromName && fromName.length > 0) {
                    request.body.from.name = fromName;
                }
                if(toName && toName.length > 0) {
                    request.body.personalizations[0].to[0].name = toName;
                }
                if(repyToAddress) {
                    request.body.reply_to = {
                        email: repyToAddress
                    };
                    if(replyToName) {
                        request.body.reply_to.name = replyToName;
                    }
                }
                if(ccAry && ccAry.length > 0) {
                    request.body.personalizations[0].cc = [];
                    _.each(ccAry, function(ccAddress){
                        request.body.personalizations[0].cc.push({email:ccAddress});
                    });
                }
                self._safeStoreEmail(request.body, mainAccountId, userId, emailId, function(err, emailmessage){
                    if(err) {
                        self.log.error('Error storing email (this should not happen):', err);
                        cb(err);
                    } else {
                        cb(null, request, emailmessage);
                    }
                });
            }
        ], function(err, request, emailmessage){
            request.body.custom_args = {
                emailmessageId: emailmessage.id(),
                accountId:''+accountId,
                date: moment().toISOString()
            };

            sg.API(request, function (error, response) {
                self.log.debug(response.statusCode);
                self.log.debug(response.body);
                self.log.debug(response.headers);
                response.emailmessageId = emailmessage.id();
                if (err) {
                    self.log.error('Error sending email:', err);
                    return fn(err);
                } else {
                    self.log.debug('<< sendInsightEmail');
                    return fn(null, response);
                }
            });
        });
    },


    sendPromotionReport: function(accountId, fromAddress, fromName, toAddressAry, subject, attachment, pdf, content, fn) {
        var self = this;
        self.log.debug(accountId, null, '>> sendPromotionReport');
        var sendgridBatchID = null;
        var senderAddress, senderName, replyTo;
        async.waterfall([
            function(cb) {
                self._getFromAdressNameAndReplyTo(accountId, fromAddress, fromName, function(err, _senderAddress, _senderName, _replyTo){
                    senderAddress = _senderAddress;
                    senderName = _senderName;
                    replyTo = _replyTo;
                    cb(null);
                });
            },
            function(cb) {
                var request = sg.emptyRequest();
                request.method = 'POST';
                request.path = '/v3/mail/batch';
                sg.API(request, function (err, response) {
                    if(err) {
                        self.log.warn('Error getting batchId:', err);
                        self.log.error('Sendgrid says:', response.body);
                        cb(null, null);
                    } else {
                        self.log.debug('BatchID: ', response.body.batch_id);
                        sendgridBatchID = response.body.batch_id;
                        cb(null, response.body.batch_id);
                    }
                });
            },
            function(batchId, cb) {
                var sendgridSubsAndHtml = {};
                juice.juiceResources(content, {}, function(err, html){
                    if(err) {
                        self.log.error('Error juicing the htmlContent:', err);
                        cb(err);
                    } else {
                        //build personalizations
                        var personalizations = [];
                        var i = 0;
                        var filteredContacts = [];
                        _.each(toAddressAry, function(email){
                            if(email.indexOf('@') >0) {
                                filteredContacts.push(email);
                                var p = {
                                    to: [
                                        {email:email}
                                    ]
                                };
                                personalizations.push(p);
                                i++;
                            }
                        });

                        cb(null, batchId, personalizations, filteredContacts, html);
                    }
                });
            },
            function(batchId, personalizations, contacts, html, cb) {
                var b = new Buffer(attachment);
                var s = b.toString('base64');
                var chunks = [];
                pdf.on('data', function(chunk){chunks.push(chunk)});
                pdf.on('end', function(){
                    var pdfBase64String = Buffer.concat(chunks).toString('base64');
                    var request = sg.emptyRequest();
                    request.body = {
                        "batch_id": batchId,
                        "categories": [
                            "promotionreport"
                        ],

                        "from": {
                            "email": senderAddress
                        },
                        content: [
                            {
                                type:'text/html',
                                value:html
                            }
                        ],
                        "subject": subjectPrefix + subject,
                        "headers": {},

                        "tracking_settings": {
                            "click_tracking": {
                                "enable": true,
                                "enable_text": true
                            }
                        },
                        "attachments": [
                            {
                                "content": s,
                                "content_id": "ii_139db99fdb5c3704",
                                "disposition": "inline",
                                "filename": "report.csv",
                                "name": "report",
                                "type": "csv"
                            },
                            {
                                content:pdfBase64String,
                                content_id:'ii_2',
                                disposition:'inline',
                                filename:'report.pdf',
                                name:'report',
                                type:'pdf'
                            }
                        ]
                    };
                    request.method = 'POST';
                    request.path = '/v3/mail/send';

                    if(senderName && senderName.length > 0) {
                        request.body.from.name = senderName;
                    }
                    if(replyTo) {
                        request.body.reply_to = {
                            email: replyTo
                        };
                        if(fromName) {
                            request.body.reply_to.name = fromName;
                        }
                    }

                    request.body.personalizations = personalizations;

                    request.body.personalizations[0].bcc = [];
                    request.body.personalizations[0].bcc.push({
                        email: 'smaticsdemo-portal@indigenous.io'
                    });

                    self._safeStoreBatchEmail(request.body, accountId, null, null, null, personalizations, function(err, messageIds){
                        cb(err, batchId, personalizations, request, messageIds, contacts);
                    });
                });





            },
            function(batchId, personalizations, request, messageIds, contacts, cb) {
                //Sendgrid doesn't like it when we mess with their chi
                delete request.body.batchId;

                var i = 0;
                _.each(contacts, function(contact){
                    var custom_args= {
                        emailmessageId: messageIds[i],
                        accountId:''+accountId,
                        date: moment().toISOString(),
                        emailId: null,
                        campaignId: null,
                        contactId: null
                    };
                    request.body.personalizations[i].custom_args = custom_args;//TODO: defense
                    i++;
                });
                //send it now
                var send_at = moment().utc().unix();
                self.log.trace('Sending:', JSON.stringify(request.body));
                var maxPersonalizations = 1000;
                if(personalizations.length > maxPersonalizations) {
                    var requestAry = [];
                    var i,j,temparray,chunk = maxPersonalizations;
                    for (i=0,j=personalizations.length; i<j; i+=chunk) {
                        temparray = personalizations.slice(i,i+chunk);
                        // do whatever
                        request.body.personalizations = temparray;
                        requestAry.push(sg.emptyRequest(request));
                    }
                    async.eachSeries(requestAry, function(_request, callback){
                        self.log.trace('Sending:', JSON.stringify(_request));
                        sg.API(_request, function(err, response){
                            if(err) {
                                self.log.error('Error sending email:', err);
                                if(err.response && err.response.body) {
                                    self.log.error(err.response.body.errors);
                                }
                            } else {
                                callback(null, response);
                            }

                        });
                    }, function(err, response){
                        self.log.debug(accountId, null, '<< sendPromotionReport');
                        cb(null, response);
                    });
                } else {
                    sg.API(request, function (err, response) {
                        self.log.debug(response.statusCode);
                        self.log.debug(response.body);
                        self.log.debug(response.headers);
                        if (err) {
                            self.log.error('Error sending email:', err);
                            cb(err);
                        } else {
                            self.log.debug(accountId, null, '<< sendPromotionReport');
                            cb(null, response);
                        }
                    });
                }
            }
        ], function(err, response){
            if(err) {
                self.log.error('Error sending campaign emails:', err);
                return fn(err);
            } else {
                self.log.debug(accountId, null, '<< sendPromotionReport');
                return fn(null, response);
            }
        });
    },


    sendQuoteDetails: function(accountId, fromAddress, fromName, toEmail, subject, attachment, pdf, content, fn) {
        var self = this;
        self.log.debug(accountId, null, '>> sendQuoteDetails');
        var sendgridBatchID = null;
        var senderAddress, senderName, replyTo;
        async.waterfall([
            function(cb) {
                self._getFromAdressNameAndReplyTo(accountId, fromAddress, fromName, function(err, _senderAddress, _senderName, _replyTo){
                    senderAddress = _senderAddress;
                    senderName = _senderName;
                    replyTo = _replyTo;
                    cb(null);
                });
            },
            function(cb) {
                var request = sg.emptyRequest();
                request.method = 'POST';
                request.path = '/v3/mail/batch';
                sg.API(request, function (err, response) {
                    if(err) {
                        self.log.warn('Error getting batchId:', err);
                        self.log.error('Sendgrid says:', response.body);
                        cb(null, null);
                    } else {
                        self.log.debug('BatchID: ', response.body.batch_id);
                        sendgridBatchID = response.body.batch_id;
                        cb(null, response.body.batch_id);
                    }
                });
            },
            function(batchId, cb) {
                var sendgridSubsAndHtml = {};
                juice.juiceResources(content, {}, function(err, html){
                    if(err) {
                        self.log.error('Error juicing the htmlContent:', err);
                        cb(err);
                    } else {
                        //build personalizations
                        var personalizations = [];

                        var p = {
                            to: [
                                {email:toEmail}
                            ]
                        };
                        personalizations.push(p);

                        cb(null, batchId, personalizations, html);
                    }
                });
            },
            function(batchId, personalizations, html, cb) {
                var b = new Buffer(attachment);
                var s = b.toString('base64');
                // var chunks = [];
                // pdf.on('data', function(chunk){chunks.push(chunk)});
                // pdf.on('end', function(){
                //     var pdfBase64String = Buffer.concat(chunks).toString('base64');
                    var request = sg.emptyRequest();
                    request.body = {
                        "batch_id": batchId,
                        "categories": [
                            "promotionreport"
                        ],

                        "from": {
                            "email": senderAddress
                        },
                        content: [
                            {
                                type:'text/html',
                                value:html
                            }
                        ],
                        "subject": subjectPrefix + subject,
                        "headers": {},

                        "tracking_settings": {
                            "click_tracking": {
                                "enable": true,
                                "enable_text": true
                            }
                        },
                        "attachments": [
                            {
                                "content": s,
                                "content_id": "ii_139db99fdb5c3704",
                                "disposition": "inline",
                                "filename": "report.csv",
                                "name": "report",
                                "type": "csv"
                            }
                        ]
                    };
                    request.method = 'POST';
                    request.path = '/v3/mail/send';

                    if(senderName && senderName.length > 0) {
                        request.body.from.name = senderName;
                    }
                    if(replyTo) {
                        request.body.reply_to = {
                            email: replyTo
                        };
                        if(fromName) {
                            request.body.reply_to.name = fromName;
                        }
                    }

                    request.body.personalizations = personalizations;

                    self._safeStoreEmail(request.body, accountId, null, null, function(err, emailmessage){
                        //we should not have an err here
                        if(err) {
                            self.log.error('Error storing email (this should not happen):', err);
                            return fn(err);
                        } else {

                            request.body.custom_args = {
                                emailmessageId: emailmessage.id(),
                                accountId:''+accountId,
                                date: moment().toISOString()
                            };
                            sg.API(request, function (error, response) {
                                self.log.debug(response.statusCode);
                                self.log.debug(response.body);
                                self.log.debug(response.headers);
                                if (err) {
                                    self.log.error('Error sending email:', err);
                                    return fn(err);
                                } else {
                                    self.log.debug(accountId, null, '<< sendQuoteDetails');
                                    return fn(null, response);
                                }
                            });

                        }
                    });
                //});
            },
            function(batchId, personalizations, request, messageIds, contacts, cb) {
                //Sendgrid doesn't like it when we mess with their chi
                delete request.body.batchId;

                var i = 0;
                _.each(contacts, function(contact){
                    var custom_args= {
                        emailmessageId: messageIds[i],
                        accountId:''+accountId,
                        date: moment().toISOString(),
                        emailId: null,
                        campaignId: null,
                        contactId: null
                    };
                    request.body.personalizations[i].custom_args = custom_args;//TODO: defense
                    i++;
                });
                //send it now
                var send_at = moment().utc().unix();
                self.log.trace('Sending:', JSON.stringify(request.body));
                var maxPersonalizations = 1000;
                if(personalizations.length > maxPersonalizations) {
                    var requestAry = [];
                    var i,j,temparray,chunk = maxPersonalizations;
                    for (i=0,j=personalizations.length; i<j; i+=chunk) {
                        temparray = personalizations.slice(i,i+chunk);
                        // do whatever
                        request.body.personalizations = temparray;
                        requestAry.push(sg.emptyRequest(request));
                    }
                    async.eachSeries(requestAry, function(_request, callback){
                        self.log.trace('Sending:', JSON.stringify(_request));
                        sg.API(_request, function(err, response){
                            if(err) {
                                self.log.error('Error sending email:', err);
                                if(err.response && err.response.body) {
                                    self.log.error(err.response.body.errors);
                                }
                            } else {
                                callback(null, response);
                            }

                        });
                    }, function(err, response){
                        self.log.debug(accountId, null, '<< sendPromotionReport');
                        cb(null, response);
                    });
                } else {
                    sg.API(request, function (err, response) {
                        self.log.debug(response.statusCode);
                        self.log.debug(response.body);
                        self.log.debug(response.headers);
                        if (err) {
                            self.log.error('Error sending email:', err);
                            cb(err);
                        } else {
                            self.log.debug(accountId, null, '<< sendPromotionReport');
                            cb(null, response);
                        }
                    });
                }
            }
        ], function(err, response){
            if(err) {
                self.log.error('Error sending campaign emails:', err);
                return fn(err);
            } else {
                self.log.debug(accountId, null, '<< sendPromotionReport');
                return fn(null, response);
            }
        });
    },

    sendUnsubscribeSubstitutions: function(fn) {
        var self = this;

        self.log.debug('>> sendUnsubscribeSubstitutions');
        var subject = 'Testing unsubscribe';


        var request = sg.emptyRequest();
        request.body = {
            "categories": [
                "server"
            ],
            "content": [
                {
                    "type": "text/html",
                    "value": 'This is a sample message.  To unsubscribe, go to <a href="[unsubscribe_url]">[unsubscribe_url]</a>'
                }
            ],
            "from": {
                "email": 'kyle@indigenous.io'
            },
            "headers": {},
            "personalizations": [
                {
                    "headers": {
                        "X-Accept-Language": "en"
                    },
                    "subject": subjectPrefix + subject,

                    "to": [
                        {
                            "email": 'millkyl@gmail.com'
                        }
                    ],
                    substitutions:{
                        unsubscribe_url:'http://www.url1.com'
                    }
                },
                {
                    "headers": {
                        "X-Accept-Language": "en"
                    },
                    "subject": subjectPrefix + subject,

                    "to": [
                        {
                            "email": 'kyle@kyle-miller.com'
                        }
                    ],
                    substitutions:{
                        unsubscribe_url:'http://www.url2.com'
                    }
                }
            ],
            "tracking_settings": {
                "click_tracking": {
                    "enable": true,
                    "enable_text": true
                },
                "subscription_tracking":{enable:true,substitution_tag:'unsubscribe_url'}
            }
        };
        request.method = 'POST';
        request.path = '/v3/mail/send';



        sg.API(request, function (error, response) {
            self.log.debug(response.statusCode);
            self.log.debug(response.body);
            self.log.debug(response.headers);
            if (error) {
                self.log.error('Error sending email:', error);
                return fn(error);
            } else {
                self.log.debug(null, null, '<< sendUnsubscribeSubstitutions');
                return fn(null, response);
            }
        });
    },
    /* ********************************************************************
     *
     *
     * Non-Sending methods to follow
     *
     *
     * ********************************************************************
     */







    getMessageInfo: function(messageId, fn) {
        //TODO: this
        fn();
    },

    markMessageDelivered: function(messageId, event, fn) {
        var self = this;
        self.log.debug('>> markMessageDelivered');
        dao.findOne({_id:messageId}, $$.m.Emailmessage, function(err, emailMessage){
            if(err) {
                self.log.error('Error finding email message:', err);
                fn(err);
            } else if(!emailMessage) {
                self.log.debug('Cannot find emailMessage with ID:' + messageId);
                fn();
            } else {
                var eventDate = moment.unix(event.timestamp).toDate();
                var modified = {date: new Date(), by:'webhook'};
                emailMessage.set('deliveredDate', eventDate);
                emailMessage.set('modified', modified);
                var eventAry = emailMessage.get('events') || [];
                eventAry.push(event);
                emailMessage.set('events', eventAry);
                dao.saveOrUpdate(emailMessage, function(err, value){
                    if(err) {
                        self.log.error('Error updating emailmessage:', err);
                        return fn(err);
                    } else {
                        self.log.debug('<< markMessageDelivered');
                        return fn(null, value);
                    }
                });
            }
        });
    },

    markMessageOpened: function(messageId, event, fn) {
        var self = this;
        self.log.debug('>> markMessageOpened');
        dao.findOne({_id:messageId}, $$.m.Emailmessage, function(err, emailMessage){
            if(err) {
                self.log.error('Error finding email message:', err);
                fn(err);
            } else if(!emailMessage) {
                self.log.debug('Cannot find emailMessage with ID:' + messageId);
                fn();
            } else {
                var eventDate = moment.unix(event.timestamp).toDate();
                var modified = {date: new Date(), by:'webhook'};
                emailMessage.set('openedDate', eventDate);
                emailMessage.set('modified', modified);
                var eventAry = emailMessage.get('events') || [];
                eventAry.push(event);
                emailMessage.set('events', eventAry);
                dao.saveOrUpdate(emailMessage, function(err, value){
                    if(err) {
                        self.log.error('Error updating emailmessage:', err);
                        return fn(err);
                    } else {
                        self.log.debug('<< markMessageOpened');
                        return fn(null, value);
                    }
                });
            }
        });
    },

    markMessageClicked: function(messageId, event, fn) {
        var self = this;
        self.log.debug('>> markMessageClicked');
        dao.findOne({_id:messageId}, $$.m.Emailmessage, function(err, emailMessage){
            if(err) {
                self.log.error('Error finding email message:', err);
                fn(err);
            } else if(!emailMessage) {
                self.log.debug('Cannot find emailMessage with ID:' + messageId);
                fn();
            } else {
                var eventDate = moment.unix(event.timestamp).toDate();
                var modified = {date: new Date(), by:'webhook'};
                emailMessage.set('clickedDate', eventDate);
                emailMessage.set('modified', modified);
                var eventAry = emailMessage.get('events') || [];
                eventAry.push(event);
                emailMessage.set('events', eventAry);

                var addOpenEvent = null;
                if(!emailMessage.get('openedDate')) {
                    emailMessage.set('openedDate', eventDate);
                    addOpenEvent = true;
                }

                dao.saveOrUpdate(emailMessage, function(err, value){
                    if(err) {
                        self.log.error('Error updating emailmessage:', err);
                        return fn(err);
                    } else {
                        self.log.debug('<< markMessageClicked');
                        return fn(null, value, addOpenEvent);
                    }
                });
            }
        });
    },

    markMessageBounced: function(messageId, event, fn) {
        var self = this;
        self.log.debug('>> markMessageBounced');
        dao.findOne({_id:messageId}, $$.m.Emailmessage, function(err, emailMessage){
            if(err) {
                self.log.error('Error finding email message:', err);
                fn(err);
            } else if(!emailMessage) {
                self.log.debug('Cannot find emailMessage with ID:' + messageId);
                fn();
            } else {
                var eventDate = moment.unix(event.timestamp).toDate();
                var modified = {date: new Date(), by:'webhook'};
                emailMessage.set('bouncedDate', eventDate);
                emailMessage.set('modified', modified);
                var eventAry = emailMessage.get('events') || [];
                eventAry.push(event);
                emailMessage.set('events', eventAry);
                dao.saveOrUpdate(emailMessage, function(err, value){
                    if(err) {
                        self.log.error('Error updating emailmessage:', err);
                        return fn(err);
                    } else {
                        self.log.debug('<< markMessageBounced');
                        return fn(null, value);
                    }
                });
            }
        });
    },

    markMessageDropped: function(messageId, event, fn) {
        var self = this;
        self.log.debug('>> markMessageDropped');
        dao.findOne({_id:messageId}, $$.m.Emailmessage, function(err, emailMessage){
            if(err) {
                self.log.error('Error finding email message:', err);
                fn(err);
            } else if(!emailMessage) {
                self.log.debug('Cannot find emailMessage with ID:' + messageId);
                fn();
            } else {
                var eventDate = moment.unix(event.timestamp).toDate();
                var modified = {date: new Date(), by:'webhook'};
                emailMessage.set('droppedDate', eventDate);
                emailMessage.set('modified', modified);
                var eventAry = emailMessage.get('events') || [];
                eventAry.push(event);
                emailMessage.set('events', eventAry);
                dao.saveOrUpdate(emailMessage, function(err, value){
                    if(err) {
                        self.log.error('Error updating emailmessage:', err);
                        return fn(err);
                    } else {
                        self.log.debug('<< markMessageDropped');
                        return fn(null, value);
                    }
                });
            }
        });
    },

    isMessageDelivered: function(messageId, fn) {
        var self = this;
        self.log.debug('>> isMessageDelivered');
        dao.findOne({_id:messageId}, $$.m.Emailmessage, function(err, emailMessage) {
            if (err) {
                self.log.error('Error finding email message:', err);
                fn(err);
            } else if (!emailMessage) {
                self.log.debug('Cannot find emailMessage with ID:' + messageId);
                fn();
            } else {
                if(emailMessage.get('deliveredDate') !== null) {
                    self.log.debug('<< isMessageDelivered(true)');
                    return fn(null, true);
                } else {
                    self.log.debug('<< isMessageDelivered(false)');
                    return fn(null, false);
                }
            }
        });
    },

    isMessageOpened: function(messageId, fn) {
        var self = this;
        self.log.debug('>> isMessageOpened');
        dao.findOne({_id:messageId}, $$.m.Emailmessage, function(err, emailMessage) {
            if (err) {
                self.log.error('Error finding email message:', err);
                fn(err);
            } else if (!emailMessage) {
                self.log.debug('Cannot find emailMessage with ID:' + messageId);
                fn();
            } else {
                if(emailMessage.get('openedDate') !== null) {
                    self.log.debug('<< isMessageOpened(true)');
                    return fn(null, true);
                } else {
                    self.log.debug('<< isMessageOpened(false)');
                    return fn(null, false);
                }
            }
        });
    },

    isMessageClicked: function(messageId, fn) {
        var self = this;
        self.log.debug('>> isMessageClicked');
        dao.findOne({_id:messageId}, $$.m.Emailmessage, function(err, emailMessage) {
            if (err) {
                self.log.error('Error finding email message:', err);
                fn(err);
            } else if (!emailMessage) {
                self.log.debug('Cannot find emailMessage with ID:' + messageId);
                fn();
            } else {
                if(emailMessage.get('clickedDate') !== null) {
                    self.log.debug('<< isMessageClicked(true)');
                    return fn(null, true);
                } else {
                    self.log.debug('<< isMessageClicked(false)');
                    return fn(null, false);
                }
            }
        });
    },


    isMessageUnsubscribed: function(messageId, fn) {
        var self = this;
        self.log.debug('>> isMessageUnsubscribed');
        dao.findOne({_id:messageId}, $$.m.Emailmessage, function(err, emailMessage) {
            if (err) {
                self.log.error('Error finding email message:', err);
                fn(err);
            } else if (!emailMessage) {
                self.log.debug('Cannot find emailMessage with ID:' + messageId);
                fn();
            } else {
                if(emailMessage.get('unsubscribedDate') !== null) {
                    self.log.debug('<< isMessageUnsubscribed(true)');
                    return fn(null, true);
                } else {
                    self.log.debug('<< isMessageUnsubscribed(false)');
                    return fn(null, false);
                }
            }
        });
    },

    markMessageUnsubscribed: function(messageId, event, fn) {
        var self = this;
        self.log.debug('>> markMessageUnsubscribed');
        dao.findOne({_id:messageId}, $$.m.Emailmessage, function(err, emailMessage){
            if(err) {
                self.log.error('Error finding email message:', err);
                fn(err);
            } else if(!emailMessage) {
                self.log.debug('Cannot find emailMessage with ID:' + messageId);
                fn();
            } else {
                var eventDate = moment.unix(event.timestamp).toDate();
                var modified = {date: new Date(), by:'webhook'};
                emailMessage.set('unsubscribedDate', eventDate);
                emailMessage.set('modified', modified);
                var eventAry = emailMessage.get('events') || [];
                eventAry.push(event);
                emailMessage.set('events', eventAry);
                dao.saveOrUpdate(emailMessage, function(err, value){
                    if(err) {
                        self.log.error('Error updating emailmessage:', err);
                        return fn(err);
                    } else {
                        self.log.debug('<< markMessageUnsubscribed');
                        return fn(null, value);
                    }
                });
            }
        });
    },

    handleUnsubscribe: function(event, fn) {
        var self = this;
        self.log.debug('>> handleUnsubscribe');
        var unsubscription = new $$.m.Unsubscription({
            emailAddress: event.email,
            event:event
        });
        dao.saveOrUpdate(unsubscription, function(err, value){
            if(err) {
                self.log.error('Error handling unsubscribe:', err);
                return fn(err);
            } else {
                self.log.debug('<< handleUnsubscribe');
                return fn(null, value);
            }
        });
    },

    getUnsubscribedCount: function(accountId, userId, startDate, endDate, previousStart, previousEnd, fn) {
        var self = this;
        self.log.debug('>> getUnsubscribedCount');

        var unsubscribAry = ['unsubscribe'];
        var query = {
            'event.accountId':accountId.toString(),
            'created.date':{
                $gte:startDate,
                $lte:endDate
            },
            'event.event':{$in:unsubscribAry}
        };
        var previousQuery = {
            'event.accountId':accountId.toString(),
            'created.date':{
                $gte:previousStart,
                $lte:previousEnd
            },
            'event.event':{$in:unsubscribAry}
        };

        dao.findCount(query, $$.m.Unsubscription, function(err, count){
            if(err) {
                self.log.error(accountId, userId, 'Error getting unsubscribed count: ', err);
                fn(err);
            } else {
                var results = {
                    currentCount: count || 0
                };
                dao.findCount(previousQuery, $$.m.Unsubscription, function(err, count){
                    if(err) {
                        self.log.error(accountId, userId, 'Error getting unsubscribed count: ', err);
                        fn(err);
                    } else {
                        var previousCount = 0;
                        if(count) {
                            previousCount = count;
                        }
                        results.previousCount = previousCount;
                        self.log.debug(accountId, userId, '<< getUnsubscribedCount');
                        fn(null, results);
                    }
                });
            }

        });
    },

    isAddressUnsubscribed: function(emailAddress, fn) {

    },

    addEvent: function(messageId, event, fn) {
        var self = this;
        self.log.debug('>> addEvent');
        dao.findOne({_id:messageId}, $$.m.Emailmessage, function(err, emailMessage){
            if(err) {
                self.log.error('Error finding email message:', err);
                fn(err);
            } else if(!emailMessage) {
                self.log.debug('Cannot find emailMessage with ID:' + messageId);
                fn();
            } else {
                var eventDate = moment.unix(event.timestamp).toDate();
                var modified = {date: new Date(), by:'webhook'};
                emailMessage.set('modified', modified);
                var eventAry = emailMessage.get('events') || [];
                eventAry.push(event);
                emailMessage.set('events', eventAry);
                dao.saveOrUpdate(emailMessage, function(err, value){
                    if(err) {
                        self.log.error('Error updating emailmessage:', err);
                        return fn(err);
                    } else {
                        self.log.debug('<< addEvent');
                        return fn(null, value);
                    }
                });
            }
        });
    },

    findMessagesByCampaign: function(accountId, campaignId, userId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> findMessagesByCampaign');
        var query = {
            accountId:accountId,
            batchId:campaignId
        };
        var stageAry = [];
        stageAry.push({$match:query});
        var project = {$project:{deliveredDate:1, openedDate:1, clickedDate:1, bouncedDate:1, droppedDate:1}};
        stageAry.push(project);
        dao.aggregateWithCustomStages(stageAry, $$.m.Emailmessage, function(err, messages){
            if(err) {
                self.log.error(accountId, userId, 'Error finding campaign emails:', err);
                return fn(err);
            } else {
                self.log.debug(accountId, userId, '<< findMessagesByCampaign');
                return fn(err, messages);
            }
        });

    },

    getAsyncCampaignPerformanceReport: function(accountId, userId, campaignId, fn) {

    },

    getCampaignPerformanceReport: function(accountId, campaignId, userId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getCampaignPerformanceReport');
        var startTime = null;
        var tmpCollection = 'cpr_' + accountId + '_' + campaignId;
        async.waterfall([
            function(cb) {
                var stageAry = [];
                var match = {$match:{accountId:accountId, batchId:campaignId}};
                stageAry.push(match);
                var project = {$project:{receiver:1, deliveredDate:1, openedDate:1, clickedDate:1, emailId:1, _id:1}};
                stageAry.push(project);
                var lookup = {$lookup:{from:'contacts', as:'contactInfo', localField:'receiver', foreignField:'details.emails.email'}};
                stageAry.push(lookup);
                var project2 = {$project:{"receiver":1,"deliveredDate":1,"openedDate":1,"clickedDate":1,"emailId":1,"_id":1, 'first':{$arrayElemAt:['$contactInfo.first',0]}, 'last':{$arrayElemAt:['$contactInfo.last',0]}, 'phone':{$arrayElemAt:['$details.phones.number',0]}}};
                stageAry.push(project2);
                var outStage= {"$out": tmpCollection};
                stageAry.push(outStage);
                //{$lookup:{from:'contacts', as:'contactInfo', localField:'receiver', foreignField:'details.emails.email'}},
                // {$project:{"receiver":1,"deliveredDate":1,"openedDate":1,"clickedDate":1,"emailId":1,"_id":1, 'first':{$arrayElemAt:['$contactInfo.first',0]}, 'last':{$arrayElemAt:['$contactInfo.last',0]}, 'phone':{$arrayElemAt:['$details.phones.number',0]}}}
                startTime = new Date().getTime();
                dao.aggregateWithCustomStages(stageAry, $$.m.Emailmessage, function(err, results){
                    if(err) {
                        self.log.error(accountId, userId, 'Error in aggregation:', err);
                        cb(err);
                    } else {
                        self.log.debug('aggregate done');
                        dao.findRawWithFieldsLimitAndOrder({}, 0, null, null, null, tmpCollection, null, function(err, results){
                            self.log.debug('query done');
                            if(results) {
                                results = results.results;
                            }
                            cb(err, results);
                        });

                    }
                });
            },
            function(results, cb) {
                var emailMessageQueryDuration = new Date().getTime() - startTime;
                self.log.info(accountId, userId, 'Email Query Duration:', emailMessageQueryDuration);
                var headers = ['Email', 'Phone', 'Delivered', 'Opened', 'Clicked', 'Unsubscribed'];
                var csv = headers.join(',') + '\n';

                var unsubGrouping = {};
                var count = 0;
                var arrayCount = 0;
                unsubGrouping[arrayCount] = [];
                _.each(results, function(result){
                    if(count > 1000) {
                        count = 0;
                        arrayCount += 1;
                        unsubGrouping[arrayCount] = [];
                    }
                    unsubGrouping[arrayCount].push(result.receiver);
                    count++;
                });
                var unsubscriptions = {};
                async.each(_.keys(unsubGrouping),
                    function(groupNum, callback){
                        var query = {emailAddress:{$in:unsubGrouping[groupNum]}};
                        dao.findMany(query, $$.m.Unsubscription, function(err, value){
                            if(value && value.length > 0) {
                                _.each(value, function(unsub){
                                    unsubscriptions[unsub.get('emailAddress')] = true;
                                });
                            }
                            callback();
                        });
                }, function(err){
                    async.each(results, function(message, callback){
                        var isUnsubscribed = false;
                        var contactName = '';
                        var phone = '';
                        if(unsubscriptions[message.receiver]) {
                            isUnsubscribed = true;
                        }
                        if(message.first && message.last) {
                            contactName = (message.first + ' ' + message.last).trim() + ' ';
                        } else if(message.first) {
                            contactName = (message.first).trim() + ' ';
                        } else if (message.last) {
                            contactName = (message.last).trim() + ' ';
                        }

                        if(message.phone) {
                            phone = message.phone;
                        }
                        csv += contactName + '<' + message.receiver + '>,';
                        csv += phone + ',';
                        csv += (message.deliveredDate || false) + ',';
                        csv += (message.openedDate || false) + ',';
                        csv += (message.clickedDate || false) + ',';
                        csv += isUnsubscribed;
                        csv += '\n';

                        callback();
                        /*
                        contactDao.getContactByEmailAndAccount(message.receiver, accountId, function(err, contact){
                            if(err || !contact) {
                                self.log.debug('Error getting contact for email:' + message.receiver, err);
                            } else {
                                //self.log.debug('Found contact');
                                contactName = (contact.get('first') + ' ' + contact.get('last')).trim() + ' ';
                                var phones = contact.getPhones();
                                if (phones.length > 0) {
                                    phone = phones[0];
                                }
                            }
                         });
                        */

                    }, function(err) {
                        cb(err, csv);
                    });
                });

            }
        ], function(err, csv){
            self.log.debug(accountId, userId, '<< getCampaignPerformanceReport');
            fn(err, csv);
            dao.dropCollection(tmpCollection, function(err, result){self.log.debug('dropped collection ' + tmpCollection)});
        });
    },

    asyncCampaignPerformanceReport: function(accountId, campaignId, userId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> asyncCampaignPerformanceReport');

        async.waterfall([
            function(cb) {
                //get and return URL
                var key = campaignId + new Date().getTime() + '.csv';
                var url =  "http://s3.amazonaws.com/" + s3Config.BUCKETS.REPORTS + "/" + key;
                fn(null, url);
                cb(null, key);
            },
            function(key, cb) {
                var query = {
                    accountId:accountId,
                    batchId:campaignId//,
                    //openedDate:{$ne:null}
                };

                var startTime = new Date().getTime();
                dao.findManyWithFields(query, {receiver:1, deliveredDate:1, openedDate:1, clickedDate:1}, $$.m.Emailmessage, function(err, messages){
                    if(err) {
                        self.log.error(accountId, userId, 'Error finding campaign emails:', err);
                        cb(err);
                    } else {
                        var emailMessageQueryDuration = new Date().getTime() - startTime;
                        self.log.info(accountId, userId, 'Email Query Duration:', emailMessageQueryDuration);
                    }
                });
            }
        ], function(err){});

    },

    findOpenedMessagesByCampaign: function(accountId, campaignId, userId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> findMessagesByCampaign');
        var query = {
            accountId:accountId,
            batchId:campaignId//,
            //openedDate:{$ne:null}
        };

        var startTime = new Date().getTime();
        dao.findManyWithFields(query, {receiver:1, deliveredDate:1, openedDate:1, clickedDate:1}, $$.m.Emailmessage, function(err, messages){
            if(err) {
                self.log.error(accountId, userId, 'Error finding campaign emails:', err);
                return fn(err);
            } else {
                var emailMessageQueryDuration = new Date().getTime() - startTime;
                self.log.info(accountId, userId, 'Email Query Duration:', emailMessageQueryDuration);
                var headers = ['Email', 'Delivered', 'Opened', 'Clicked', 'Unsubscribed'];
                var csv = headers.join(',') + '\n';
                async.eachSeries(messages, function(message, callback){
                    contactDao.getContactByEmailAndAccount(message.get('receiver'), accountId, function(err, contact){
                        if(err || !contact) {
                            self.log.debug('Error getting contact for email:' + message.get('receiver'), err);
                            callback();
                        } else {
                            var isUnsubscribed = null;
                            var unsubscribeCheckQuery = {
                                'event.accountId': accountId.toString(),
                                'event.contactId':contact.id().toString(),
                                'event.event':'unsubscribe',
                                'event.campaignId': campaignId,
                                'event.emailId': message.get("emailId"),
                                'event.emailmessageId': message.id()
                            };
                            dao.exists(unsubscribeCheckQuery, $$.m.Unsubscription, function(err, value){
                                if(err) {
                                    log.error('Exception thrown checking for unsubscribe: ' + err);
                                    fn(err, null);
                                } else{

                                    if(value === true){
                                        isUnsubscribed = true;
                                    } else{
                                        isUnsubscribed = false;
                                    }
                                    csv += message.get('receiver') + ',';
                                    csv += (message.get('deliveredDate') || false) + ',';
                                    csv += (message.get('openedDate') || false) + ',';
                                    csv += (message.get('clickedDate') || false) + ',';
                                    csv += isUnsubscribed;
                                    csv += '\n';
                                    callback();
                                }
                            });


                        }
                    });
                }, function(err){
                    self.log.debug(accountId, userId, '<< findMessagesByCampaign');
                    return fn(err, csv);
                });
            }
        });
    },

    getEmailStatsByAccount: function(accountId, userId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getEmailStatsByAccount');
        /*
         {
         $match:{
         accountId:12
         }
         },
         {
         $project:{
         emailId:1,
         openedDate:1,
         clickedDate:1
         }
         },
         {
         $group:{
         _id:'$emailId',
         count:{$sum:1},
         sends:{$sum:{$cond:[{$ne:['$openedDate', null]}, 1, 0]}},
         clicks:{$sum:{$cond:[{$ne:['$clickedDate', null]}, 1, 0]}}
         }
         }
         */
        var stageAry = [];
        var match = {
            $match:{
                accountId:accountId
            }
        };
        stageAry.push(match);
        var project = {
            $project:{
                emailId: 1,
                openedDate: 1,
                clickedDate: 1
            }
        };
        stageAry.push(project);
        var group1 = {
            $group: {
                _id:'$emailId',
                sends: {$sum:1},
                opens:{$sum:{$cond:[{$ne:['$openedDate', null]}, 1, 0]}},
                clicks:{$sum:{$cond:[{$ne:['$clickedDate', null]}, 1, 0]}}
            }
        };

        stageAry.push(group1);

        dao.aggregateWithCustomStages(stageAry, $$.m.Emailmessage, function(err, value) {
            if(err) {
                self.log.error(accountId, userId, 'Error finding email messages:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< getEmailStatsByAccount');
                fn(null, value);
            }
        });
    },

    getEmailStats: function(accountId, userId, emailId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getEmailStats');
        var query = {
            accountId: accountId,
            emailId: emailId
        };
        dao.findMany(query, $$.m.Emailmessage, function(err, emails){
            if(err) {
                self.log.error(accountId, userId, 'Error finding email messages:', err);
                fn(err);
            } else {
                var opens = 0;
                var clicks = 0;
                var sends = 0;
                _.each(emails, function(email){
                    sends++;
                    if(email.get('openedDate')) {
                        opens++;
                    }
                    if(email.get('clickedDate')) {
                        clicks++;
                    }
                });
                var resp = {
                    opens: opens,
                    clicks: clicks,
                    sends: sends
                };
                self.log.debug(accountId, userId, '<< getEmailStats');
                fn(null, resp);
            }
        });
    },

    _getScheduleUtcDateTimeIsoString: function (daysShift, hoursValue, minutesValue, timezoneOffset) {
        var shiftedUtcDate = moment().utc().hours(hoursValue).minutes(minutesValue).add('minutes', timezoneOffset).add('days', daysShift);
        return shiftedUtcDate.toISOString();
    },

    _getSecheduledUTCUnix: function(daysShift, hoursValue, minutesValue, timezoneOffset) {
        var shiftedUtcDate = moment().utc().hours(hoursValue).minutes(minutesValue).add('minutes', timezoneOffset).add('days', daysShift);
        return shiftedUtcDate.unix();
    },

    _getUtcDateTimeIsoString: function(year, month, day, hour, minutes, timezoneOffset) {
        var utcDate = moment().utc().year(year).month(month).date(day).hours(hour).minutes(minutes).add('minutes', timezoneOffset);
        return utcDate.toISOString();
    },

    _checkForUnsubscribe: function(accountId, toAddress, fn) {
        var self = this;
        self.log = log;
        contactDao.getContactByEmailAndAccount(toAddress, accountId, function(err, contact){
            if(err || contact=== null) {
                self.log.debug('Could not find contact');
                return fn(null, false);
            } else {
                if(contact.get('unsubscribed') === true) {
                    self.log.info('contact [' + contact.id() + ' with email [' + toAddress + '] has unsubscribed.  Skipping email.');
                    return fn(null, true);
                } else {
                    return fn(null, false);
                }
            }
        });
    },

    _convertMergeTagsToSendgridPersonalizations: function(account, contact, user, userAccount, htmlContent, vars) {
        var self = this;

        var _account = account;
        var accountId = account.id();
        var _contact = contact;
        var contactId = contact.id();
        var _userAccount = userAccount;
        var _user = user;
        var environment = appConfig.environment;
        var port = appConfig.port;

        //list of possible merge vars and the matching data
        var _address = _account.get('business').addresses && _address ? _address : null;
        var hostname = '.indigenous.io';

        if(environment === appConfig.environments.DEVELOPMENT && appConfig.nonProduction){
            hostname = '.indigenous.local' + ":" + port;
        }
        else if(environment !== appConfig.environments.DEVELOPMENT && appConfig.nonProduction){
            hostname = '.test.indigenous.io';
        }
        var mergeTagMap = [{
            mergeTag: '[URL]',
            data: _account ? _account.get('subdomain') + hostname : ''
        }, {
            mergeTag: '[SUBDOMAIN]',
            data: _account ? _account.get('subdomain') : ''
        }, {
            mergeTag: '[CUSTOMDOMAIN]',
            data: _account ? _account.get('customDomain'): ''
        }, {
            mergeTag: '[BUSINESSNAME]',
            data: _account ? _account.get('business').name: ''
        }, {
            mergeTag: '[BUSINESSLOGO]',
            data: _account ? _account.get('business').logo: ''
        }, {
            mergeTag: '[BUSINESSDESCRIPTION]',
            data: _account ? _account.get('business').description: ''
        }, {
            mergeTag: '[BUSINESSPHONE]',
            data: _account.get('business').phones && _account.get('business').phones[0] ? _account.get('business').phones[0].number : ''
        }, {
            mergeTag: '[BUSINESSEMAIL]',
            data: _account.get('business').emails && _account.get('business').emails[0] ? _account.get('business').emails[0].email : ''
        }, {
            mergeTag: '[BUSINESSFULLADDRESS]',
            data: _address ? _address.address + ' ' + _address.address2 + ' ' + _address.city + ' ' + _address.state + ' ' + _address.zip : ''
        }, {
            mergeTag: '[BUSINESSADDRESS]',
            data: _address ? _address.address : ''
        }, {
            mergeTag: '[BUSINESSCITY]',
            data: _address ? _address.city : ''
        }, {
            mergeTag: '[BUSINESSSTATE]',
            data: _address ? _address.state : ''
        }, {
            mergeTag: '[BUSINESSZIP]',
            data: _address ? _address.zip : ''
        }, {
            mergeTag: '[TRIALDAYS]',
            data: _account ? _account.get('trialDaysRemaining'): ''
        }, {
            mergeTag: '[FULLNAME]',
            data: _contact ? _contact.get('first') + ' ' + _contact.get('last'): ''
        }, {
            mergeTag: '[FIRST]',
            data: _contact ? _contact.get('first') : ''
        }, {
            mergeTag: '[LAST]',
            data: _contact ? _contact.get('last') : ''
        }, {
            mergeTag: '[EMAIL]',
            data: _contact && _contact.getEmails() && _contact.getEmails()[0] ? _contact.getEmails()[0].email : ''
        }];

        if ((_user && _userAccount && accountId === 6) || (accountId === 6 && contactId === null)) {
            var _data = !contactId && !_userAccount ? _account.get('subdomain') : _userAccount.get('subdomain');
            var adminMergeTagMap = [{
                mergeTag: '[USERACCOUNTURL]',
                data: _data + hostname
            }];
            mergeTagMap = _.union(mergeTagMap, adminMergeTagMap);
        }

        var regex;
        //TODO: fix this block
        var substitutions = {};
        _.each(mergeTagMap, function (map) {
            if (htmlContent.indexOf(map.mergeTag) > -1) {
                //replace merge vars with relevant data
                regex = new RegExp(map.mergeTag.replace('[', '\\[').replace(']', '\\]'), 'g');
                var userData = map.data || '';
                self.log.trace('using the following regex:', regex);
                htmlContent = htmlContent.replace(regex, '%' + map.mergeTag + '%');
                self.log.trace('after the replace:', htmlContent);
                substitutions['%' + map.mergeTag + '%'] =userData;
            }
        });
        var siteUrl = null;
        var userName = null;
        if(_account) {
            siteUrl = _account.get('subdomain') + '.' + appConfig.subdomain_suffix;
        }
        if(_user) {
            userName = _user.get('username');
        }
        //TODO: fix this block
        _.each(vars, function(_var){
            if(htmlContent.indexOf(_var.name) > -1) {
                var regexp = new RegExp('\\*\\|' + _var.name + '\\|\\*', 'g');
                htmlContent = htmlContent.replace(regexp, '%' + _var.name + '%');
                substitutions['%' + _var.name + '%'] = _var.content;
            }
        });
        return {substitutions:substitutions, html:htmlContent};
    },

    /**
     * This method is SYNCHRONOUS
     * @param account
     * @param contact
     * @param user
     * @param userAccount
     * @param htmlContent
     * @param vars
     * @private
     */
    _findReplaceMergeTagsWithObjects: function(account, contact, user, userAccount, htmlContent, vars) {
        var self = this;

        var _account = account;
        var accountId = account.id();
        var _contact = contact;
        var contactId = contact.id();
        var _userAccount = userAccount;
        var _user = user;
        var environment = appConfig.environment;
        var port = appConfig.port;

        //list of possible merge vars and the matching data
        var _address = _account.get('business').addresses && _address ? _address : null;
        var hostname = '.indigenous.io';

        if(environment === appConfig.environments.DEVELOPMENT && appConfig.nonProduction){
            hostname = '.indigenous.local' + ":" + port;
        }
        else if(environment !== appConfig.environments.DEVELOPMENT && appConfig.nonProduction){
            hostname = '.test.indigenous.io';
        }
        var mergeTagMap = [{
            mergeTag: '[URL]',
            data: _account ? _account.get('subdomain') + hostname : ''
        }, {
            mergeTag: '[SUBDOMAIN]',
            data: _account ? _account.get('subdomain') : ''
        }, {
            mergeTag: '[CUSTOMDOMAIN]',
            data: _account ? _account.get('customDomain'): ''
        }, {
            mergeTag: '[BUSINESSNAME]',
            data: _account ? _account.get('business').name: ''
        }, {
            mergeTag: '[BUSINESSLOGO]',
            data: _account ? _account.get('business').logo: ''
        }, {
            mergeTag: '[BUSINESSDESCRIPTION]',
            data: _account ? _account.get('business').description: ''
        }, {
            mergeTag: '[BUSINESSPHONE]',
            data: _account.get('business').phones && _account.get('business').phones[0] ? _account.get('business').phones[0].number : ''
        }, {
            mergeTag: '[BUSINESSEMAIL]',
            data: _account.get('business').emails && _account.get('business').emails[0] ? _account.get('business').emails[0].email : ''
        }, {
            mergeTag: '[BUSINESSFULLADDRESS]',
            data: _address ? _address.address + ' ' + _address.address2 + ' ' + _address.city + ' ' + _address.state + ' ' + _address.zip : ''
        }, {
            mergeTag: '[BUSINESSADDRESS]',
            data: _address ? _address.address : ''
        }, {
            mergeTag: '[BUSINESSCITY]',
            data: _address ? _address.city : ''
        }, {
            mergeTag: '[BUSINESSSTATE]',
            data: _address ? _address.state : ''
        }, {
            mergeTag: '[BUSINESSZIP]',
            data: _address ? _address.zip : ''
        }, {
            mergeTag: '[TRIALDAYS]',
            data: _account ? _account.get('trialDaysRemaining'): ''
        }, {
            mergeTag: '[FULLNAME]',
            data: _contact ? _contact.get('first') + ' ' + _contact.get('last'): ''
        }, {
            mergeTag: '[FIRST]',
            data: _contact ? _contact.get('first') : ''
        }, {
            mergeTag: '[LAST]',
            data: _contact ? _contact.get('last') : ''
        }, {
            mergeTag: '[EMAIL]',
            data: _contact && _contact.getEmails() && _contact.getEmails()[0] ? _contact.getEmails()[0].email : ''
        }];

        if ((_user && _userAccount && accountId === 6) || (accountId === 6 && contactId === null)) {
            var _data = !contactId && !_userAccount ? _account.get('subdomain') : _userAccount.get('subdomain');
            var adminMergeTagMap = [{
                mergeTag: '[USERACCOUNTURL]',
                data: _data + hostname
            }];
            mergeTagMap = _.union(mergeTagMap, adminMergeTagMap);
        }

        var regex;
        _.each(mergeTagMap, function (map) {
            if (htmlContent.indexOf(map.mergeTag) > -1) {
                //replace merge vars with relevant data
                regex = new RegExp(map.mergeTag.replace('[', '\\[').replace(']', '\\]'), 'g');
                var userData = map.data || '';
                htmlContent = htmlContent.replace(regex, userData);
            }
        });
        var siteUrl = null;
        var userName = null;
        if(_account) {
            siteUrl = _account.get('subdomain') + '.' + appConfig.subdomain_suffix;
        }
        if(_user) {
            userName = _user.get('username');
        }
        //do the vars
        htmlContent = self._replaceMandrillStyleVars(vars, htmlContent);

        return htmlContent;
    },

    _findReplaceMergeTags : function(accountId, contactId, htmlContent, vars, fn) {
        var self = this;

        var _account = null;
        var _contact = null;
        var _userAccount = null;
        var _user = null;

        //validation
        async.waterfall([
            function getSendingAccount(callback) {
                if(accountId) {
                    accountDao.getAccountByID(accountId, function (err, account) {
                        if(err) {
                            self.log.error('Error retrieving account: ' + err);
                            return fn(err, null);
                        } else if(account === null) {
                            _account = null;
                            callback(null);
                        } else {
                            _account = account;
                            return callback(null);
                        }
                    });
                } else {
                    callback(null);
                }
            },
            function getContact(callback) {
                if(contactId) {
                    contactDao.getById(contactId, $$.m.Contact, function (err, contact) {
                        if(err) {
                            self.log.error('Error retrieving contact: ' + err);
                            return fn(err, null);
                        } else if(contact === null) {
                            _contact = null;
                            callback(null);
                        } else {
                            _contact = contact;
                            return callback(null);
                        }
                    });
                } else {
                    callback(null);
                }
            },
            function getUser(callback) {
                if(accountId === 6 && _contact) {
                    var primaryEmail = _contact.getPrimaryEmail();
                    userDao.getUserByUsername(primaryEmail, function (err, user) {
                        if(err) {
                            self.log.error('Error retrieving contact: ' + err);
                            return fn(err, null);
                        } else if(user === null) {
                            _user = null;
                            callback(null);
                        } else {
                            _user = user;
                            return callback(null);
                        }
                    });
                } else {
                    callback(null);
                }
            },
            function getUserAccount(callback) {
                if(_user) {
                    var existingUserId = _user.get('accounts')[0].accountId;
                    accountDao.getAccountByID(existingUserId, function (err, userAccount) {
                        if(err) {
                            self.log.error('Error user account: ' + err);
                            return fn(err, null);
                        } else if(userAccount === null) {
                            _userAccount = null;
                            callback(null);
                        } else {
                            _userAccount = userAccount;
                            return callback(null);
                        }
                    });
                } else {
                    callback(null);
                }
            },
            function mergeTags(callback) {

                var environment = appConfig.environment;
                var port = appConfig.port;

                //list of possible merge vars and the matching data
                var _address = _account.get('business').addresses && _address ? _address : null;
                var hostname = '.indigenous.io';

                if(environment === appConfig.environments.DEVELOPMENT && appConfig.nonProduction){
                    hostname = '.indigenous.local' + ":" + port;
                }
                else if(environment !== appConfig.environments.DEVELOPMENT && appConfig.nonProduction){
                    hostname = '.test.indigenous.io';
                }
                var mergeTagMap = [{
                    mergeTag: '[URL]',
                    data: _account ? _account.get('subdomain') + hostname : ''
                }, {
                    mergeTag: '[SUBDOMAIN]',
                    data: _account ? _account.get('subdomain') : ''
                }, {
                    mergeTag: '[CUSTOMDOMAIN]',
                    data: _account ? _account.get('customDomain'): ''
                }, {
                    mergeTag: '[BUSINESSNAME]',
                    data: _account ? _account.get('business').name: ''
                }, {
                    mergeTag: '[BUSINESSLOGO]',
                    data: _account ? _account.get('business').logo: ''
                }, {
                    mergeTag: '[BUSINESSDESCRIPTION]',
                    data: _account ? _account.get('business').description: ''
                }, {
                    mergeTag: '[BUSINESSPHONE]',
                    data: _account.get('business').phones && _account.get('business').phones[0] ? _account.get('business').phones[0].number : ''
                }, {
                    mergeTag: '[BUSINESSEMAIL]',
                    data: _account.get('business').emails && _account.get('business').emails[0] ? _account.get('business').emails[0].email : ''
                }, {
                    mergeTag: '[BUSINESSFULLADDRESS]',
                    data: _address ? _address.address + ' ' + _address.address2 + ' ' + _address.city + ' ' + _address.state + ' ' + _address.zip : ''
                }, {
                    mergeTag: '[BUSINESSADDRESS]',
                    data: _address ? _address.address : ''
                }, {
                    mergeTag: '[BUSINESSCITY]',
                    data: _address ? _address.city : ''
                }, {
                    mergeTag: '[BUSINESSSTATE]',
                    data: _address ? _address.state : ''
                }, {
                    mergeTag: '[BUSINESSZIP]',
                    data: _address ? _address.zip : ''
                }, {
                    mergeTag: '[TRIALDAYS]',
                    data: _account ? _account.get('trialDaysRemaining'): ''
                }, {
                    mergeTag: '[FULLNAME]',
                    data: _contact ? _contact.get('first') + ' ' + _contact.get('last'): ''
                }, {
                    mergeTag: '[FIRST]',
                    data: _contact ? _contact.get('first') : ''
                }, {
                    mergeTag: '[LAST]',
                    data: _contact ? _contact.get('last') : ''
                }, {
                    mergeTag: '[EMAIL]',
                    data: _contact && _contact.getEmails() && _contact.getEmails()[0] ? _contact.getEmails()[0].email : ''
                }];

                if ((_user && _userAccount && accountId === 6) || (accountId === 6 && contactId === null)) {
                    var _data = !contactId && !_userAccount ? _account.get('subdomain') : _userAccount.get('subdomain');
                    var adminMergeTagMap = [{
                        mergeTag: '[USERACCOUNTURL]',
                        data: _data + hostname
                    }];
                    mergeTagMap = _.union(mergeTagMap, adminMergeTagMap);
                }

                var regex;
                _.each(mergeTagMap, function (map) {
                    if (htmlContent.indexOf(map.mergeTag) > -1) {
                        //replace merge vars with relevant data
                        regex = new RegExp(map.mergeTag.replace('[', '\\[').replace(']', '\\]'), 'g');
                        var userData = map.data || '';
                        htmlContent = htmlContent.replace(regex, userData);

                    }
                });
                var siteUrl = null;
                var userName = null;
                if(_account) {
                    siteUrl = _account.get('subdomain') + '.' + appConfig.subdomain_suffix;
                }
                if(_user) {
                    userName = _user.get('username');
                }
                //do the vars
                htmlContent = self._replaceMandrillStyleVars(vars, htmlContent);

                if (fn) {
                    fn(htmlContent);
                }
            }
        ], function(err){
            if(err) {
                return fn(err);
            } else {
                self.log.warn('Unexpected method call');
                return;
            }
        });
    },

    _replaceMandrillStyleVars: function(vars, htmlContent) {
        _.each(vars, function(_var){
            if(htmlContent.indexOf(_var.name) > -1) {
                var regexp = new RegExp('\\*\\|' + _var.name + '\\|\\*', 'g');
                htmlContent = htmlContent.replace(regexp, _var.content);
            }
        });
        return htmlContent;
    },

    _safeStoreEmail: function(sendgridParam, accountId, userId, emailId, fn) {
        var emailmessage = new $$.m.Emailmessage({
            accountId: accountId,
            userId:userId,
            sender:sendgridParam.from.email,
            receiver:sendgridParam.personalizations[0].to[0].email,
            cc: sendgridParam.personalizations[0].cc,
            subject:sendgridParam.personalizations[0].subject,
            emailId: emailId,
            sendDate:new Date(),
            deliveredDate:null,
            openedDate:null,
            clickedDate:null
        });
        if(sendgridParam.content) {
            emailmessage.set('content', sendgridParam.content[0].value);
        }
        if(sendgridParam.personalizations[0].content) {
            emailmessage.set('content', sendgridParam.personalizations[0].content[0].value);
        }
        if(sendgridParam.batchId) {
            emailmessage.set('batchId',sendgridParam.batchId);
        }
        if(sendgridParam.batch_id) {
            emailmessage.set('sendgridBatchId', sendgridParam.batch_id);
        }
        if(sendgridParam.reply_to) {
            emailmessage.set('replyTo', sendgridParam.reply_to.email);
        }
        dao.saveOrUpdate(emailmessage, function(err, value){
            if(err) {
                log.error(accountId, userId, 'Error storing emailmessage:', err);
                //set a couple fields on emailmessage and return it
                emailmessage.set('_id', $$.u.idutils.generateUUID());
                emailmessage.set('created', {date:new Date()});
                fn(null, emailmessage);
            } else {
                fn(null, value);
            }
        });
    },

    _safeStoreBatchEmail: function(sendgridRequestBody, accountId, userId, emailId, campaignId, personalizations, fn) {
        var subject = sendgridRequestBody.subject;
        var sender = sendgridRequestBody.from.email;
        var messageIds = [];
        async.eachSeries(personalizations, function(p, cb){
            var emailmessage = new $$.m.Emailmessage({
                accountId: accountId,
                userId:userId,
                batchId:campaignId,
                sender:sender,
                receiver:p.to[0].email,
                cc: p.cc,
                subject:subject,
                emailId: emailId,
                sendDate:new Date(),
                deliveredDate:null,
                openedDate:null,
                clickedDate:null
            });
            if(sendgridRequestBody.content) {
                emailmessage.set('content', sendgridRequestBody.content[0].value);
            }
            if(sendgridRequestBody.personalizations[0].content) {
                emailmessage.set('content', sendgridRequestBody.personalizations[0].content[0].value);
            }
            if(sendgridRequestBody.batch_id) {
                emailmessage.set('sendgridBatchId', sendgridRequestBody.batch_id);
            }
            if(p.custom_args && p.custom_args.contactId) {
                emailmessage.set('contactId', p.custom_args.contactId);
            }
            if(p.custom_args && p.custom_args.contactFirstName) {
                emailmessage.set('contactFirstName', p.custom_args.contactFirstName);
                emailmessage.set('_contactFirstName', p.custom_args.contactFirstName.toLowerCase());
            }
            if(p.custom_args && p.custom_args.contactLastName) {
                emailmessage.set('contactLastName', p.custom_args.contactLastName);
                emailmessage.set('_contactLastName', p.custom_args.contactLastName.toLowerCase());
            }
            if(sendgridRequestBody.reply_to) {
                emailmessage.set('replyTo', sendgridRequestBody.reply_to.email);
            }
            dao.saveOrUpdate(emailmessage, function(err, value){
                if(err) {
                    log.error(accountId, userId, 'Error storing emailmessage:', err);
                    messageIds.push($$.u.idutils.generateUUID());
                   cb();
                } else {
                    messageIds.push(value.id());
                    cb();
                }
            });
        }, function(err){
            fn(null, messageIds);
        });
    },

    _sendEmailJSON: function(json, uniqueArgs, send_at, fn) {
        var self = this;
        self.log.debug('>> _sendEmailJSON');
        self.log.debug('json:', json);
        self.log.debug('uniqueArgs:', uniqueArgs);
        self.log.debug('send_at:', send_at);
        var params = serialize.unserialize(json);
        var request = null;
        if(params.content) {
            // we have a sendgrid v3 message
            request = sg.emptyRequest();
            request.body.from = params.from;
            request.body.subject = subjectPrefix + params.subject;
            //need to fix content array
            request.body.content = self._fixSerializedArray(params.content);
            //need to fix categories array
            request.body.categories = self._fixSerializedArray(params.categories);
            //need to set personalizations array recursive
            request.body.personalizations = self._fixSerializedArray(params.personalizations);
            _.each(request.body.personalizations, function(p){
                if(p.to) {
                    p.to = self._fixSerializedArray(p.to);
                }
                if(p.content) {
                    p.content = self._fixSerializedArray(p.content);
                }
                if(p.custom_args) {
                    var pCustomArgs = {};
                    _.each(_.keys(p.custom_args), function(key){
                        pCustomArgs[key] = ''+ p.custom_args[key];
                    });
                    p.custom_args = pCustomArgs;
                }
            });
            self.log.debug('request.body:', JSON.stringify(request.body));
        } else {
            //we have a sendgrid v2 message
            request = sg.emptyRequest();
            /*
             * params.from
             * params.fromname
             * params.subject
             * params.html
             * params.category
             * params.toname
             */
            request.body = {from:{}};

            request.body.from.email = params.from;
            request.body.from.name = params.fromname;
            request.body.subject = params.subject;
            request.body.content = [];
            request.body.content[0] = {value: params.html, type:'text/html'};
            request.body.categories = [];
            request.body.categories.push(params.category);

            var arr =[];
            for( var i in params.to ) {
                if (params.to.hasOwnProperty(i)){
                    if(typeof i != 'number') {
                        arr.push(params.to[i]);
                    } else {
                        arr[i] = params.to[i];
                    }
                }
            }

            self.log.debug('arr:', arr);
            self.log.debug('params.to:', params.to);
            request.body.personalizations = [];
            _.each(arr, function(toAddress){
                var p = {};
                p.to = [];
                p.to[0] = {email:toAddress};
                request.body.personalizations.push(p);
            });
            //Make all properties strings... because sendgrid.
            var custom_args = serialize.unserialize(uniqueArgs);
            var stringifiedValues = {};
            _.each(_.keys(custom_args), function(key){
                stringifiedValues[key] = ''+custom_args[key];
            });

            request.body.personalizations[0].custom_args = stringifiedValues;
        }

        request.method = 'POST';
        request.path = '/v3/mail/send';

        //need to fix the to addresses... should be an array


        request.body.send_at = send_at;
        self.log.debug('Sending:', JSON.stringify(request.body));
        sg.API(request, function (err, response) {
            self.log.debug(response.statusCode);
            self.log.debug(response.body);
            self.log.debug(response.headers);
            if (err) {
                self.log.error('Error sending email:', err);
                return fn(err);
            } else {
                self.log.debug(null, null, '<< _sendEmailJSON');
                return fn(null, response);
            }
        });


    },

    _fixSerializedArray: function(serializedAry) {
        var arr = [];
        _.each(_.keys(serializedAry), function(key){
            var obj = serializedAry[key];
            arr.push(obj);
        });
        return arr;
    },

    contentTransformations: function(email) {
        var self = this;
        var components = [];
        var keys = ['logo','title','text','text1','text2','text3'];
        var regex = new RegExp('src="//s3.amazonaws', "g");
        var emailContent = email.content || email;
        if(emailContent.components) {
            emailContent.components.forEach(function(component) {
                if(component.visibility){
                    for (var i = 0; i < keys.length; i++) {
                        if (component[keys[i]]) {
                            component[keys[i]] = component[keys[i]].replace(regex, 'src="http://s3.amazonaws');
                            // self.log.debug('sanitizeHtmlForSending before:', component[keys[i]]);
                            component[keys[i]] = self.sanitizeHtmlForSending(component[keys[i]]);
                            // self.log.debug('sanitizeHtmlForSending after:', component[keys[i]]);
                        }
                    }
                    if (!component.bg.color) {
                        component.bg.color = '#ffffff';
                    }
                    if (!component.emailBg) {
                        component.emailBg = '#ffffff';
                    }
                    if (component.bg.img && component.bg.img.show && component.bg.img.url) {
                        component.emailBgImage = component.bg.img.url.replace('//s3.amazonaws', 'http://s3.amazonaws');
                    }
                    if (!component.txtcolor) {
                        component.txtcolor = '#000000';
                    }
                    component.spacing = component.spacing || {};
                    components.push(component);
                }
            });
        }


        //self.log.debug('components >>> ', components);

        emailContent.components = components;

        return {
            email: emailContent
        }

    },

    sanitizeHtmlForSending: function(htmlString) {

        return sanitizeHtml(htmlString, {
            allowedTags: false,
            allowedAttributes: {
                'a': [ 'href', 'name', 'target', 'style', 'class' ],
                'img': [ 'src', 'alt', 'style', 'class', 'width', 'height' ],
                '*': [ 'style', 'class', 'width', 'height' ]
            }
        })

    },

    getMessagesSentOpenedClicked: function(accountId, userId, startDate, endDate, previousStart, previousEnd, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getMessagesSentOpenedClicked');
        var sentQuery = {
            accountId:accountId,
            deliveredDate:{
                $gte:startDate,
                $lte:endDate
            }
        };
        var openQuery = {
            accountId:accountId,
            openedDate:{
                $gte:startDate,
                $lte:endDate
            }
        };
        var clickQuery = {
            accountId:accountId,
            clickedDate:{
                $gte:startDate,
                $lte:endDate
            }
        };
        var results = {sentCount:{}, openCount:{}, clickCount:{}};
        async.waterfall([
            function(cb) {
                dao.findCount(sentQuery, $$.m.Emailmessage, function(err, value){
                    if(err) {
                        self.log.error('Error finding sentCount:', err);
                        cb(err);
                    } else {
                        results.sentCount.current = value;
                        cb();
                    }
                });
            },
            function(cb) {
                dao.findCount(openQuery, $$.m.Emailmessage, function(err, value){
                    if(err) {
                        self.log.error('Error finding openCount:', err);
                        cb(err);
                    } else {
                        results.openCount.current = value;
                        cb();
                    }
                });
            },
            function(cb) {
                dao.findCount(clickQuery, $$.m.Emailmessage, function(err, value){
                    if(err) {
                        self.log.error('Error finding clickCount:', err);
                        cb(err);
                    } else {
                        results.clickCount.current = value;
                        cb();
                    }
                });
            },
            function(cb) {
                sentQuery.deliveredDate.$gte = previousStart;
                sentQuery.deliveredDate.$lte = previousEnd;
                dao.findCount(sentQuery, $$.m.Emailmessage, function(err, value){
                    if(err) {
                        self.log.error('Error finding sentCount:', err);
                        cb(err);
                    } else {
                        results.sentCount.previous = value;
                        cb();
                    }
                });
            },
            function(cb) {
                openQuery.openedDate.$gte = previousStart;
                openQuery.openedDate.$lte = previousEnd;
                dao.findCount(openQuery, $$.m.Emailmessage, function(err, value){
                    if(err) {
                        self.log.error('Error finding openCount:', err);
                        cb(err);
                    } else {
                        results.openCount.previous = value;
                        cb();
                    }
                });
            },
            function(cb) {
                clickQuery.clickedDate.$gte = previousStart;
                clickQuery.clickedDate.$lte = previousEnd;
                dao.findCount(clickQuery, $$.m.Emailmessage, function(err, value){
                    if(err) {
                        self.log.error('Error finding clickCount:', err);
                        cb(err);
                    } else {
                        results.clickCount.previous = value;
                        cb();
                    }
                });
            }
        ], function(err){
            if(err) {
                self.log.error('Error in getMessagesSentOpenedClicked:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< getMessagesSentOpenedClicked');
                fn(null, results);
            }
        });
    },

    _getFromAdressNameAndReplyTo: function(accountId, fromAddress, fromName, fn) {
        var self = this;
        var senderAddress = notificationConfig.DEFAULT_SENDER_ADDRESS;
        //var senderName = fromName + ' via Indigenous';
        var senderName = fromName;
        if(fromName === 'Indigenous') {
            senderName = 'Indigenous';
        }
        var replyTo = fromAddress;
        accountDao.getAccountByID(accountId, function(err, account){
            if(err || !account) {
                self.log.error(accountId, null, 'Error getting account:', err);
                fn(null, senderAddress, senderName, replyTo);
            } else {
                if(account.get('email_preferences') && account.get('email_preferences').senderAddress) {
                    senderAddress = account.get('email_preferences').senderAddress;
                    senderName = fromName;
                    fn(null, senderAddress, senderName, replyTo);
                } else {
                    orgManager.getOrgById(accountId, null, account.get('orgId') || 0, function(err, org){
                        if(err || !org) {
                            self.log.error(accountId, null, 'Error getting organization:', err);
                            fn(null, senderAddress, senderName, replyTo);
                        } else {
                            if(org.get('defaultSender')) {
                                senderAddress = org.get('defaultSender');
                            }
                            if(org.get('defaultSenderNameSuffix')) {
                                senderName = fromName + ' ' + org.get('defaultSenderNameSuffix');
                            }
                            fn(null, senderAddress, senderName, replyTo);
                        }
                    });
                }
            }
        });
    },


    getCampaignRecipientStatistics: function(accountId, campaignId, skip, limit, sortBy, sortDir, term, fieldSearch, fn) {
        var self = this;
        self.log.debug(accountId, null, '>> getCampaignRecipientStatistics');
        var query = {
            accountId: accountId,
            batchId: campaignId
        };
        if(term){
            term = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            var regex = new RegExp('\.*'+term+'\.*', 'i');
            var orQuery = [
                {contactId:parseInt(term)},
                {receiver:regex},
                {contactFirstName:regex},
                {contactLastName:regex}
            ];
            query["$or"] = orQuery;
        }
        if(fieldSearch){
            var fieldSearchArr = [];
            for(var i=0; i <= Object.keys(fieldSearch).length - 1; i++){
                var key = Object.keys(fieldSearch)[i];
                var value = fieldSearch[key];
                self.log.debug('value:', value);
                var obj = {};
                value = value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                console.log(value);
                if(value){
                    if(key == 'deliveredDate' || key == 'openedDate' || key == 'clickedDate' || key == 'unsubscribedDate'){
                        if(value == "true"){
                            obj[key] = {$ne:null};
                            fieldSearchArr.push(obj);
                        } else{
                            obj[key] = null;
                            fieldSearchArr.push(obj);
                        }
                    }
                    else if (key == 'contactId') {
                        obj[key] = parseInt(value);
                        fieldSearchArr.push(obj);
                    }
                    else{
                        obj[key] = new RegExp(value, 'i');
                        fieldSearchArr.push(obj);
                    }
                }
            }
            if(fieldSearchArr.length){
                query["$and"] = fieldSearchArr;
            }
        }

        //console.log(query);
        self.log.debug('>> getCampaignRecipientStatistics');

        dao.findWithFieldsLimitOrderAndTotal(query, skip, limit, sortBy, null, $$.m.Emailmessage, sortDir, fn);

    }

};

$$.u = $$.u || {};
$$.u.emailMessageManager = emailMessageManager;

$$.g.mailer = $$.g.mailer || {};
$$.g.mailer.sendMail = emailMessageManager.sendMailReplacement;
module.exports = emailMessageManager;
