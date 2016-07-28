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
var userDao = require('../dao/user.dao');
var async = require('async');
var juice = require('juice');
var appConfig = require('../configs/app.config');
var sendgridConfig = require('../configs/sendgrid.config');
var sendgrid  = require('sendgrid')(sendgridConfig.API_KEY);
var dao = require('./dao/emailmessage.dao');
var scheduledJobsManager = require('../scheduledjobs/scheduledjobs_manager');
var serialize = require('node-serialize');
var sanitizeHtml = require('sanitize-html');


var emailMessageManager = {

    log:log,

    //TODO: add reply-to
    sendAccountWelcomeEmail: function(fromAddress, fromName, toAddress, toName, subject, htmlContent, accountId, userId,
                                      vars, emailId, contactId, fn) {
        var self = this;
        self.log.debug('>> sendAccountWelcomeEmail');
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
                        var params = {
                            smtpapi:  new sendgrid.smtpapi(),
                            to:       [toAddress],
                            //toname:   [],
                            from:     fromAddress,
                            fromname: '',
                            subject:  subject,
                            //text:     '',
                            html:     html,
                            //bcc:      [],
                            //cc:       [],
                            //replyto:  '',
                            date:     moment().toISOString(),
                            //headers:    {}
                            category: 'welcome'
                        };
                        if(fromName && fromName.length > 0) {
                            params.fromname = fromName;
                        }
                        if(toName && toName.length > 0) {
                            params.toname = toName;
                        }


                        self._safeStoreEmail(params, accountId, userId, emailId, function(err, emailmessage){
                            //we should not have an err here
                            if(err) {
                                self.log.error('Error storing email (this should not happen):', err);
                                return fn(err);
                            } else {
                                var email = new sendgrid.Email(params);
                                email.setUniqueArgs({
                                    emailmessageId: emailmessage.id(),
                                    accountId:accountId
                                });


                                sendgrid.send(email, function(err, json) {
                                    if (err) {
                                        self.log.error('Error sending email:', err);
                                        return fn(err);
                                    } else {
                                        self.log.debug('<< sendAccountWelcomeEmail');
                                        return fn(null, json);
                                    }
                                });
                            }
                        });
                    });
                });
            }
        });

    },

    sendCampaignEmail: function(fromAddress, fromName, toAddress, toName, subject, htmlContent, accountId, campaignId,
                                contactId, vars, stepSettings, emailId, fn) {
        var self = this;
        self.log.debug('>> sendCampaignEmail');
        self._checkForUnsubscribe(accountId, toAddress, function(err, isUnsubscribed) {
            if (isUnsubscribed == true) {
                fn(null, 'skipping email for user on unsubscribed list');
            } else {
                self._findReplaceMergeTags(accountId, contactId, htmlContent, vars, function(mergedHtml) {
                    //inline styles
                    juice.juiceResources(mergedHtml, {}, function(err, html){
                        //smtpapi:  new sendgrid.smtpapi(),
                        var params = {

                            to:       [toAddress],
                            from:     fromAddress,
                            fromname: '',
                            subject:  subject,
                            html:     html,
                            date:     moment().toISOString(),
                            category: 'campaign'
                        };
                        if(fromName && fromName.length > 0) {
                            params.fromname = fromName;
                        }
                        if(toName && toName.length > 0) {
                            params.toname = toName;
                        }
                        if(stepSettings.bcc) {
                            params.bcc = stepSettings.bcc;
                        }
                        params.batchId = campaignId;
                        self._safeStoreEmail(params, accountId, null, emailId, function(err, emailmessage){
                            //we should not have an err here
                            if(err) {
                                self.log.error('Error storing email (this should not happen):', err);
                                return fn(err);
                            } else {
                                var email = new sendgrid.Email(params);
                                var uniqueArgs = {
                                    emailmessageId: emailmessage.id(),
                                    accountId:accountId,
                                    emailId: emailId,
                                    campaignId: campaignId,
                                    contactId: contactId
                                };
                                email.setUniqueArgs({
                                    emailmessageId: emailmessage.id(),
                                    accountId:accountId,
                                    emailId: emailId,
                                    campaignId: campaignId,
                                    contactId: contactId
                                });
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
                                email.setSendAt(send_at);
                                if(maxSendTime.isBefore(moment.unix(send_at))) {
                                    //schedule the email
                                    self.log.debug('Scheduling email');
                                    var code = '';
                                    code+= 'var emailJSON = ' + serialize.serialize(params) + ';';
                                    code+= 'var uniqueArgs = ' + serialize.serialize(uniqueArgs) + ';';
                                    code+= 'var send_at = ' + send_at + ';';
                                    code+= '$$.u.emailMessageManager._sendEmailJSON(emailJSON, uniqueArgs, send_at, function(){});';

                                    var scheduledJob = new $$.m.ScheduledJob({
                                        accountId: accountId,
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
                                    sendgrid.send(email, function(err, json) {
                                        if (err) {
                                            self.log.error('Error sending email:', err);
                                            return fn(err);
                                        } else {
                                            self.log.debug('<< sendCampaignEmail');
                                            return fn(null, json);
                                        }
                                    });
                                }
                            }
                        });
                    });
                });
            }
        });

    },

    sendOrderEmail: function(fromAddress, fromName, toAddress, toName, subject, htmlContent, accountId, orderId, vars,
                             emailId, fn) {
        var self = this;
        self.log.debug('>> sendOrderEmail');
        self._checkForUnsubscribe(accountId, toAddress, function(err, isUnsubscribed) {
            if (isUnsubscribed == true) {
                fn('skipping email for user on unsubscribed list');
            } else {
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

                var params = {
                    smtpapi:  new sendgrid.smtpapi(),
                    to:       [toAddress],
                    from:     fromAddress,
                    fromname: '',
                    subject:  subject,
                    html:     htmlContent,
                    date:     moment().toISOString(),
                    category: 'order'
                };
                if(fromName && fromName.length > 0) {
                    params.fromname = fromName;
                }
                if(toName && toName.length > 0) {
                    params.toname = toName;
                }

                self._safeStoreEmail(params, accountId, null, emailId, function(err, emailmessage){
                    //we should not have an err here
                    if(err) {
                        self.log.error('Error storing email (this should not happen):', err);
                        return fn(err);
                    } else {
                        var email = new sendgrid.Email(params);
                        email.setUniqueArgs({
                            emailmessageId: emailmessage.id(),
                            accountId:accountId,
                            orderId:orderId
                        });

                        sendgrid.send(email, function(err, json) {
                            if (err) {
                                self.log.error('Error sending email:', err);
                                return fn(err);
                            } else {
                                self.log.debug('<< sendAccountWelcomeEmail');
                                return fn(null, json);
                            }
                        });
                    }
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
                    var params = {
                        smtpapi:  new sendgrid.smtpapi(),
                        to:       [toAddress],
                        from:     fromAddress,
                        fromname: '',
                        subject:  subject,
                        html:     html,
                        date:     moment().toISOString(),
                        category: 'fulfillment'
                    };
                    if(fromName && fromName.length > 0) {
                        params.fromname = fromName;
                    }
                    if(toName && toName.length > 0) {
                        params.toname = toName;
                    }
                    if(bcc && bcc.length > 0) {
                        params.bcc = bcc;
                    }

                    self._safeStoreEmail(params, accountId, null, emailId, function(err, emailmessage){
                        //we should not have an err here
                        if(err) {
                            self.log.error('Error storing email (this should not happen):', err);
                            return fn(err);
                        } else {
                            var email = new sendgrid.Email(params);
                            email.setUniqueArgs({
                                emailmessageId: emailmessage.id(),
                                accountId:accountId,
                                orderId:orderId
                            });

                            sendgrid.send(email, function(err, json) {
                                if (err) {
                                    self.log.error('Error sending email:', err);
                                    return fn(err);
                                } else {
                                    self.log.debug('<< sendAccountWelcomeEmail');
                                    return fn(null, json);
                                }
                            });
                        }
                    });

                });
            }
        });

    },

    sendNewCustomerEmail: function(toAddress, toName, accountId, vars, fn) {
        var self = this;
        self.log.debug('>> sendNewCustomerEmail');
        self._checkForUnsubscribe(accountId, toAddress, function(err, isUnsubscribed) {
            if (isUnsubscribed == true) {
                fn('skipping email for user on unsubscribed list');
            } else {
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
                        var fromAddress = notificationConfig.WELCOME_FROM_EMAIL;
                        var fromName = notificationConfig.WELCOME_FROM_NAME;

                        var params = {
                            smtpapi:  new sendgrid.smtpapi(),
                            to:       [toAddress],
                            from:     fromAddress,
                            fromname: '',
                            subject:  subject,
                            html:     htmlContent,
                            date:     moment().toISOString(),
                            category: 'new_customer'
                        };
                        if(fromName && fromName.length > 0) {
                            params.fromname = fromName;
                        }
                        if(toName && toName.length > 0) {
                            params.toname = toName;
                        }

                        self._safeStoreEmail(params, accountId, null, null, function(err, emailmessage){
                            //we should not have an err here
                            if(err) {
                                self.log.error('Error storing email (this should not happen):', err);
                                return fn(err);
                            } else {
                                var email = new sendgrid.Email(params);
                                email.setUniqueArgs({
                                    emailmessageId: emailmessage.id(),
                                    accountId:accountId
                                });

                                sendgrid.send(email, function(err, json) {
                                    if (err) {
                                        self.log.error('Error sending email:', err);
                                        return fn(err);
                                    } else {
                                        self.log.debug('<< sendAccountWelcomeEmail');
                                        return fn(null, json);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });

    },

    sendBasicEmail: function(fromAddress, fromName, toAddress, toName, subject, htmlContent, accountId, vars, emailId, fn) {
        var self = this;
        self.log.debug('>> sendBasicEmail');
        self._checkForUnsubscribe(accountId, toAddress, function(err, isUnsubscribed) {
            if (isUnsubscribed == true) {
                fn('skipping email for user on unsubscribed list');
            } else {
                htmlContent = self._replaceMandrillStyleVars(vars, htmlContent);
                juice.juiceResources(htmlContent, {}, function(err, html) {
                    if (err) {
                        self.log.error('A juice error occurred. Failed to set styles inline.');
                        self.log.error(err);
                        return fn(err, null);
                    }

                    var params = {
                        smtpapi:  new sendgrid.smtpapi(),
                        to:       [toAddress],
                        from:     fromAddress,
                        fromname: '',
                        subject:  subject,
                        html:     html,
                        date:     moment().toISOString(),
                        category: 'basic'
                    };
                    if(fromName && fromName.length > 0) {
                        params.fromname = fromName;
                    }
                    if(toName && toName.length > 0) {
                        params.toname = toName;
                    }

                    self._safeStoreEmail(params, accountId, null, emailId, function(err, emailmessage){
                        //we should not have an err here
                        if(err) {
                            self.log.error('Error storing email (this should not happen):', err);
                            return fn(err);
                        } else {
                            var email = new sendgrid.Email(params);
                            email.setUniqueArgs({
                                emailmessageId: emailmessage.id(),
                                accountId:accountId,
                                emailId:emailId
                            });

                            sendgrid.send(email, function(err, json) {
                                if (err) {
                                    self.log.error('Error sending email:', err);
                                    return fn(err);
                                } else {
                                    self.log.debug('<< sendAccountWelcomeEmail');
                                    return fn(null, json);
                                }
                            });
                        }
                    });
                });
            }
        });

    },

    sendTestEmail: function(fromAddress, fromName, toAddress, toName, subject, htmlContent, accountId, vars, emailId, fn) {
        var self = this;
        var contactId = null;
        self.log.debug('>> sendTestEmail');
        self._checkForUnsubscribe(accountId, toAddress, function(err, isUnsubscribed) {
            if (isUnsubscribed == true) {
                fn('skipping email for user on unsubscribed list');
            } else {
                self._findReplaceMergeTags(accountId, contactId, htmlContent, vars, function(mergedHtml) {
                    juice.juiceResources(mergedHtml, {}, function(err, html) {
                        if (err) {
                            self.log.error('A juice error occurred. Failed to set styles inline.');
                            self.log.error(err);
                            return fn(err, null);
                        }

                        var params = {
                            smtpapi:  new sendgrid.smtpapi(),
                            to:       [toAddress],
                            from:     fromAddress,
                            fromname: '',
                            subject:  subject,
                            html:     html,
                            date:     moment().toISOString(),
                            category: 'test'
                        };
                        if(fromName && fromName.length > 0) {
                            params.fromname = fromName;
                        }
                        if(toName && toName.length > 0) {
                            params.toname = toName;
                        }

                        self._safeStoreEmail(params, accountId, null, emailId, function(err, emailmessage){
                            //we should not have an err here
                            if(err) {
                                self.log.error('Error storing email (this should not happen):', err);
                                return fn(err);
                            } else {
                                var email = new sendgrid.Email(params);
                                email.setUniqueArgs({
                                    emailmessageId: emailmessage.id(),
                                    accountId:accountId,
                                    emailId:emailId
                                });

                                sendgrid.send(email, function(err, json) {
                                    if (err) {
                                        self.log.error('Error sending email:', err);
                                        return fn(err);
                                    } else {
                                        self.log.debug('<< sendAccountWelcomeEmail');
                                        return fn(null, json);
                                    }
                                });
                            }
                        });
                    });
                });
            }
        });

    },

    sendMailReplacement : function(from, to, cc, subject, htmlText, text, fn) {
        var self = this;

        self.log.debug('>> sendMailReplacement');


        var params = {
            smtpapi:  new sendgrid.smtpapi(),
            to:       [to],
            from:     from,
            cc:       cc,
            fromname: '',
            subject:  subject,
            date:     moment().toISOString(),
            category: 'server'
        };
        if(htmlText) {
            params.html = htmlText;
        }
        if(text) {
            params.text = text;
        }

        self._safeStoreEmail(params, 0, null, null, function(err, emailmessage){
            //we should not have an err here
            if(err) {
                self.log.error('Error storing email (this should not happen):', err);
                return fn(err);
            } else {
                var email = new sendgrid.Email(params);
                email.setUniqueArgs({
                    emailmessageId: emailmessage.id()
                });

                sendgrid.send(email, function(err, json) {
                    if (err) {
                        self.log.error('Error sending email:', err);
                        return fn(err);
                    } else {
                        self.log.debug('<< sendAccountWelcomeEmail');
                        return fn(null, json);
                    }
                });
            }
        });

    },

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
                dao.saveOrUpdate(emailMessage, function(err, value){
                    if(err) {
                        self.log.error('Error updating emailmessage:', err);
                        return fn(err);
                    } else {
                        self.log.debug('<< markMessageClicked');
                        return fn(null, value);
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
        dao.findMany(query, $$.m.Emailmessage, function(err, messages){
            if(err) {
                self.log.error(accountId, userId, 'Error finding campaign emails:', err);
                return fn(err);
            } else {
                self.log.debug(accountId, userId, '<< findMessagesByCampaign');
                return fn(err, messages);
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
                    var _data = !contactId && !_userAccount ? _account.get('subdomain') : _userAccount.get('subdomain')
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
            sender:sendgridParam.from,
            receiver:sendgridParam.to,
            content:sendgridParam.html,
            subject:sendgridParam.subject,
            emailId: emailId,
            sendDate:new Date(),
            deliveredDate:null,
            openedDate:null,
            clickedDate:null
        });
        if(sendgridParam.batchId) {
            emailmessage.set('batchId',sendgridParam.batchId);
        }
        dao.saveOrUpdate(emailmessage, function(err, value){
            if(err) {
                log.error('Error storing emailmessage:', err);
                //set a couple fields on emailmessage and return it
                emailmessage.set('_id', $$.u.idutils.generateUUID());
                emailmessage.set('created', {date:new Date()});
                fn(null, emailmessage);
            } else {
                fn(null, value);
            }
        });
    },

    _sendEmailJSON: function(json, uniqueArgs, send_at, fn) {
        var self = this;
        self.log.debug('>> _sendEmailJSON');
        self.log.debug('json:', json);
        self.log.debug('uniqueArgs:', uniqueArgs);
        self.log.debug('send_at:', send_at);
        var params = serialize.unserialize(json);
        //need to fix the to addresses... should be an array
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
        params.to = arr;

        var emailObj = new sendgrid.Email(params);
        emailObj.setUniqueArgs(serialize.unserialize(uniqueArgs));
        emailObj.setSendAt(send_at);
        sendgrid.send(emailObj, function(err, json) {
            if (err) {
                self.log.error('Error sending email:', err);
                return fn(err);
            } else {
                self.log.debug('<< _sendEmailJSON');
                return fn(null, json);
            }
        });
    },

    contentTransformations: function(email) {
        var self = this;
        var components = [];
        var keys = ['logo','title','text','text1','text2','text3'];
        var regex = new RegExp('src="//s3.amazonaws', "g");
        var emailContent = email.content || email;

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
                components.push(component);
            }
        });

        self.log.debug('components >>> ', components);

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

    }

};

$$.u = $$.u || {};
$$.u.emailMessageManager = emailMessageManager;

$$.g.mailer = $$.g.mailer || {};
$$.g.mailer.sendMail = emailMessageManager.sendMailReplacement;

module.exports = emailMessageManager;
