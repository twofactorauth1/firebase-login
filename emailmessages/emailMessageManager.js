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


module.exports = {

    log:log,

    sendAccountWelcomeEmail: function(fromAddress, fromName, toAddress, toName, subject, htmlContent, accountId, userId,
                                      vars, emailId, contactId, fn) {
        var self = this;
        self.log.debug('>> sendAccountWelcomeEmail');
        self._checkForUnsubscribe(accountId, toAddress, function(err, isUnsubscribed) {
            if (isUnsubscribed == true) {
                fn('skipping email for user on unsubscribed list');
            } else {
                self._findReplaceMergeTags(accountId, contactId, htmlContent, function(mergedHtml) {
                    var params = {
                        smtpapi:  new sendgrid.smtpapi(),
                        //to:       [toAddress],
                        //toname:   [],
                        from:     fromAddress,
                        fromname: '',
                        subject:  subject,
                        //text:     '',
                        html:     mergedHtml,
                        //bcc:      [],
                        //cc:       [],
                        //replyto:  '',
                        date:     moment().format('MMM Do, YYYY')
                        //headers:    {}
                    };
                    if(fromName && fromName.length > 0) {
                        params.fromname = fromName;
                    }
                    if(toName && toName.length > 0) {
                        message.toname = toName;
                    }
                    params.addCategory('welcome');
                    self._safeStoreEmail(params, function(err, emailmessage){
                        //we should not have an err here
                        if(err) {
                            self.log.error('Error storing email (this should not happen):', err);
                            return fn(err);
                        } else {
                            params.setUniqueArgs({
                                emailmessageId: emailmessage.id(),
                                accountId:accountId
                            });

                            var email = new sendgrid.Email(params);
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

    sendCampaignEmail: function(fromAddress, fromName, toAddress, toName, subject, htmlContent, accountId, campaignId,
                                contactId, vars, stepSettings, emailId, fn) {
        //TODO: this
    },

    sendOrderEmail: function(fromAddress, fromName, toAddress, toName, subject, htmlContent, accountId, orderId, vars,
                             emailId, fn) {
        //TODO: this
    },

    sendFulfillmentEmail: function(fromAddress, fromName, toAddress, toName, subject, htmlContent, accountId, orderId,
                                   vars, emailId, fn) {
        //TODO: this
    },

    sendNewCustomerEmail: function(toAddress, toName, accountId, vars, fn) {
        //TODO: this
    },

    sendBasicEmail: function(fromAddress, fromName, toAddress, toName, subject, htmlContent, accountId, vars, emailId, fn) {
        //TODO: this
    },

    sendTestEmail: function(fromAddress, fromName, toAddress, toName, subject, htmlContent, accountId, vars, emailId, fn) {
        //TODO: this
    },

    sendMailReplacement : function(from, to, cc, subject, htmlText, text, fn) {
        //TODO: this
    },

    getMessageInfo: function(messageId, fn) {
        //TODO: this
    },

    _getScheduleUtcDateTimeIsoString: function (daysShift, hoursValue, minutesValue, timezoneOffset) {
        var shiftedUtcDate = moment().utc().hours(hoursValue).minutes(minutesValue).add('minutes', timezoneOffset).add('days', daysShift);
        return shiftedUtcDate.toISOString();
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

    _findReplaceMergeTags : function(accountId, contactId, htmlContent, fn) {
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

    _safeStoreEmail: function(sendgridParam, accountId, userId, fn) {
        var emailmessage = new $$.m.Emailmessage({
            accountId: accountId,
            userId:userId,
            sender:sendgridParam.from,
            receiver:sendgridParam.to,
            content:sendgridParam.html,
            sendDate:new Date(),
            deliveredDate:null,
            openedDate:null,
            clickedDate:null
        });
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
    }


}