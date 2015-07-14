/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var mandrillConfig = require('../configs/mandrill.config');

var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(mandrillConfig.CLIENT_API_KEY);
var moment = require('moment');
var notificationConfig = require('../configs/notification.config');
var log =  $$.g.getLogger("mandrillhelper");
var fs = require('fs');
var contactDao = require('../dao/contact.dao');

var mandrillHelper =  {

    sendAccountWelcomeEmail: function(fromAddress, fromName, toAddress, toName, subject, htmlContent, accountId, userId, vars, fn) {
        var self = this;
        //console.log('Sending mail from ' + fromName + ' with address ' + fromAddress);
        //console.dir(htmlContent);

        self._checkForUnsubscribe(accountId, toAddress, function(err, isUnsubscribed){
            if(isUnsubscribed ==true) {
                fn('skipping email for user on unsubscribed list');
            } else {
                vars.push({
                    "name": "SENDDATE",
                    "content": moment().format('MMM Do, YYYY')
                });

                var message = {
                    'html': htmlContent,
                    'subject': subject,
                    'from_email':fromAddress,
                    //'from_name': fromName,
                    'to': [
                        {
                            'email': toAddress,
                            //'name': toName,
                            'type': 'to'
                        }
                    ],
                    "headers": {
                        'encoding': 'UTF8'
                    },
                    "important": false,
                    "track_opens": true,
                    "track_clicks": true,
                    "auto_text": null,
                    "auto_html": null,
                    "inline_css": null,
                    "url_strip_qs": null,
                    "preserve_recipients": null,
                    "view_content_link": false,
                    "bcc_address": null,
                    "tracking_domain": null,
                    "signing_domain": null,
                    "return_path_domain": null,
                    "merge": false,
                    "merge_vars": [
                        {
                            "rcpt": toAddress,
                            "vars": vars
                        }
                    ],
                    "subaccount": null,
                    "google_analytics_domains": [
                        "indigenous.io" //TODO: This should be dynamic
                    ],
                    "google_analytics_campaign": null,
                    "metadata": {
                        "accountId": accountId
                    },
                    "recipient_metadata": [
                        {
                            "rcpt": toAddress,
                            "values": {
                                "userId": userId
                            }
                        }
                    ],
                    "attachments": null,
                    "images": null
                };
                if(fromName && fromName.length > 0) {
                    message.from_name = fromName;
                }
                if(toName && toName.length > 0) {
                    message.to.name = toName;
                }
                var async = false;
                var ip_pool = "Main Pool";
                var send_at = moment.utc().format('YYYY-MM-DD HH:mm:ss');
                //console.dir(message);
                mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool, "send_at": send_at}, function(result) {
                    console.log(result);
                    /*
                     [{
                     "email": "recipient.email@example.com",
                     "status": "sent",
                     "reject_reason": "hard-bounce",
                     "_id": "abc123abc123abc123abc123abc123"
                     }]
                     */
                    fn(null, result);
                }, function(e) {
                    // Mandrill returns the error as an object with name and message keys
                    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
                    fn(e, null);
                });
            }
        });


    },


    sendCampaignEmail: function(fromAddress, fromName, toAddress, toName, subject, htmlContent, accountId, campaignId, contactId, vars, stepSettings, fn) {
        var self = this;
        self.log = log;
        console.log('sendCampaignEmail >>>');
        self._checkForUnsubscribe(accountId, toAddress, function(err, isUnsubscribed) {
            if (isUnsubscribed == true) {
                fn('skipping email for user on unsubscribed list');
            } else {
                vars.push({
                    "name": "SENDDATE",
                    "content": moment().format('MMM Do, YYYY')
                });
                var message = {
                    'html': htmlContent,
                    'subject': subject,
                    'from_email':fromAddress,
                    'to': [
                        {
                            'email': toAddress,
                            'type': 'to'
                        }
                    ],
                    "headers": {
                        'encoding': 'UTF8'
                    },
                    "important": false,
                    "track_opens": true,
                    "track_clicks": true,
                    "auto_text": null,
                    "auto_html": null,
                    "inline_css": null,
                    "url_strip_qs": null,
                    "preserve_recipients": null,
                    "view_content_link": false,
                    "bcc_address": null,
                    "tracking_domain": null,
                    "signing_domain": null,
                    "return_path_domain": null,
                    "merge": false,
                    "merge_vars": [
                        {
                            "rcpt": toAddress,
                            "vars": vars
                        }
                    ],
                    "subaccount": null,
                    "google_analytics_domains": [
                        "indigenous.io" //TODO: This should be dynamic
                    ],
                    "google_analytics_campaign": null,
                    "metadata": {
                        "accountId": accountId
                    },
                    "recipient_metadata": [
                        {
                            "rcpt": toAddress,
                            "values": {

                            }
                        }
                    ],
                    "attachments": null,
                    "images": null
                };
                if(fromName && fromName.length > 0) {
                    message.from_name = fromName;
                }
                if(toName && toName.length > 0) {
                    message.to.name = toName;
                }
                var async = false;
                var ip_pool = "Main Pool";

                //stepSettings.scheduled.minute, stepSettings.scheduled.hour, stepSettings.scheduled.day
                //var sendMoment = moment().hours(stepSettings.scheduled.hour).minutes(stepSettings.scheduled.minute).add(stepSettings.scheduled.day , 'days');
                var send_at = null;
                if(stepSettings.scheduled) {
                    send_at = self._getScheduleUtcDateTimeIsoString(stepSettings.scheduled.day, stepSettings.scheduled.hour,
                        stepSettings.scheduled.minute, stepSettings.offset||0);
                } else if(stepSettings.sendAt) {
                    console.log('send at month >>> ', stepSettings.sendAt.month);
                    send_at = self._getUtcDateTimeIsoString(stepSettings.sendAt.year, stepSettings.sendAt.month-1,
                        stepSettings.sendAt.day, stepSettings.sendAt.hour, stepSettings.sendAt.minute, stepSettings.offset||0);
                    if(moment(send_at).isBefore()) {
                        self.log.debug('Skipping email because ' + send_at + ' is in the past.');
                        return fn(null, "Skipped.");
                    }
                } else {
                    //send it now?
                    self.log.debug('No scheduled or sendAt specified.');
                    send_at = moment().utc().toISOString();
                }

                self.log.debug('message: ' + JSON.stringify(message));
                self.log.debug('async: ' + async);
                self.log.debug('ip_pool: ' + ip_pool);
                self.log.debug('send_at: ' + send_at);


                mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool, "send_at": send_at}, function(result) {
                    self.log.debug('result >>> ', result);
                    fn(null, result);
                }, function(e) {
                    // Mandrill returns the error as an object with name and message keys
                    self.log.error('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
                    fn(e, null);
                });
            }
        });




    },

    sendOrderEmail: function(fromAddress, fromName, toAddress, toName, subject, htmlContent, accountId, orderId, vars, fn) {
        var self = this;
        self.log = log;
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
                    });
                var message = {
                    'html': htmlContent,
                    'subject': subject,
                    'from_email':fromAddress,
                    'to': [
                        {
                            'email': toAddress,
                            'type': 'to'
                        }
                    ],
                    "headers": {
                        'encoding': 'UTF8'
                    },
                    "important": false,
                    "track_opens": true,
                    "track_clicks": true,
                    "auto_text": null,
                    "auto_html": null,
                    "inline_css": null,
                    "url_strip_qs": null,
                    "preserve_recipients": null,
                    "view_content_link": false,
                    "bcc_address": null,
                    "tracking_domain": null,
                    "signing_domain": null,
                    "return_path_domain": null,
                    "merge": false,
                    "merge_vars": [
                        {
                            "rcpt": toAddress,
                            "vars": vars
                        }
                    ],
                    "subaccount": null,
                    "google_analytics_domains": [
                        "indigenous.io" //TODO: This should be dynamic
                    ],
                    "google_analytics_campaign": null,
                    "metadata": {
                        "accountId": accountId
                    },
                    "recipient_metadata": [
                        {
                            "rcpt": toAddress,
                            "values": {

                            }
                        }
                    ],
                    "attachments": null,
                    "images": null
                };
                if(fromName && fromName.length > 0) {
                    message.from_name = fromName;
                }
                if(toName && toName.length > 0) {
                    message.to.name = toName;
                }
                var async = false;
                var ip_pool = "Main Pool";

                var send_at = moment().utc().toISOString();

                self.log.debug('message: ' + JSON.stringify(message));
                self.log.debug('async: ' + async);
                self.log.debug('ip_pool: ' + ip_pool);
                self.log.debug('send_at: ' + send_at);


                mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool, "send_at": send_at}, function(result) {
                    self.log.debug('result >>> ', result);
                    fn(null, result);
                }, function(e) {
                    // Mandrill returns the error as an object with name and message keys
                    self.log.error('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
                    fn(e, null);
                });
            }
        });



    },

    sendNewCustomerEmail: function(toAddress, toName, accountId, vars, fn) {
        var self = this;
        self.log =log;
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
                    //app.render('emails/new_customer_created', {}, function(err, htmlContent) {
                    if (err) {
                        self.log.error('Error getting new customer email file.  Welcome email not sent for accountId ' + accountId, err);
                    } else {
                        var subject = 'You have a new customer!';
                        var fromAddress = notificationConfig.WELCOME_FROM_EMAIL;
                        var fromName = notificationConfig.WELCOME_FROM_NAME;
                        var message = {
                            'html': htmlContent,
                            'subject': subject,
                            'from_email':fromAddress,
                            'to': [
                                {
                                    'email': toAddress,
                                    'type': 'to'
                                }
                            ],
                            "headers": {
                                'encoding': 'UTF8'
                            },
                            "important": false,
                            "track_opens": true,
                            "track_clicks": true,
                            "auto_text": null,
                            "auto_html": null,
                            "inline_css": null,
                            "url_strip_qs": null,
                            "preserve_recipients": null,
                            "view_content_link": false,
                            "bcc_address": null,
                            "tracking_domain": null,
                            "signing_domain": null,
                            "return_path_domain": null,
                            "merge": false,
                            "merge_vars": [
                                {
                                    "rcpt": toAddress,
                                    "vars": vars
                                }
                            ],
                            "subaccount": null,
                            "google_analytics_domains": [
                                "indigenous.io" //TODO: This should be dynamic
                            ],
                            "google_analytics_campaign": null,
                            "metadata": {
                                "accountId": accountId
                            },
                            "recipient_metadata": [
                                {
                                    "rcpt": toAddress,
                                    "values": {

                                    }
                                }
                            ],
                            "attachments": null,
                            "images": null
                        };
                        if(fromName && fromName.length > 0) {
                            message.from_name = fromName;
                        }
                        if(toName && toName.length > 0) {
                            message.to.name = toName;
                        }
                        var async = false;
                        var ip_pool = "Main Pool";

                        var send_at = moment().utc().toISOString();

                        self.log.debug('message: ' + JSON.stringify(message));
                        self.log.debug('async: ' + async);
                        self.log.debug('ip_pool: ' + ip_pool);
                        self.log.debug('send_at: ' + send_at);


                        mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool, "send_at": send_at}, function(result) {
                            self.log.debug('result >>> ', result);
                            fn(null, result);
                        }, function(e) {
                            // Mandrill returns the error as an object with name and message keys
                            self.log.error('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                            // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
                            fn(e, null);
                        });
                    }
                });
            }
        });

    },

    sendBasicEmail: function(fromAddress, fromName, toAddress, toName, subject, htmlContent, accountId, vars, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> sendBasicEmail');
        self._checkForUnsubscribe(accountId, toAddress, function(err, isUnsubscribed) {
            if (isUnsubscribed == true) {
                fn('skipping email for user on unsubscribed list');
            } else {
                vars.push({
                    "name": "SENDDATE",
                    "content": moment().format('MMM Do, YYYY')
                });
                var message = {
                    'html': htmlContent,
                    'subject': subject,
                    'from_email':fromAddress,
                    'to': [
                        {
                            'email': toAddress,
                            'type': 'to'
                        }
                    ],
                    "headers": {
                        'encoding': 'UTF8'
                    },
                    "important": false,
                    "track_opens": true,
                    "track_clicks": true,
                    "auto_text": null,
                    "auto_html": null,
                    "inline_css": null,
                    "url_strip_qs": null,
                    "preserve_recipients": null,
                    "view_content_link": false,
                    "bcc_address": null,
                    "tracking_domain": null,
                    "signing_domain": null,
                    "return_path_domain": null,
                    "merge": false,
                    "merge_vars": [
                        {
                            "rcpt": toAddress,
                            "vars": vars
                        }
                    ],
                    "subaccount": null,
                    "google_analytics_domains": [
                        "indigenous.io" //TODO: This should be dynamic
                    ],
                    "google_analytics_campaign": null,
                    "metadata": {
                        "accountId": accountId
                    },
                    "recipient_metadata": [
                        {
                            "rcpt": toAddress,
                            "values": {

                            }
                        }
                    ],
                    "attachments": null,
                    "images": null
                };
                if(fromName && fromName.length > 0) {
                    message.from_name = fromName;
                }
                if(toName && toName.length > 0) {
                    message.to.name = toName;
                }
                var async = false;
                var ip_pool = "Main Pool";

                var send_at = moment().utc().toISOString();

                self.log.debug('message: ' + JSON.stringify(message));
                self.log.debug('async: ' + async);
                self.log.debug('ip_pool: ' + ip_pool);
                self.log.debug('send_at: ' + send_at);


                mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool, "send_at": send_at}, function(result) {
                    self.log.debug('result >>> ', result);
                    fn(null, result);
                }, function(e) {
                    // Mandrill returns the error as an object with name and message keys
                    self.log.error('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
                    fn(e, null);
                });
            }
        });

    },

    _getScheduleUtcDateTimeIsoString: function (daysShift, hoursValue, minutesValue, timezoneOffset) {
        /*var now = new Date();
        now.setHours(hoursValue);
        now.setMinutes(minutesValue);
        now.setSeconds(0);
        var offsetToUse = timezoneOffset - now.getTimezoneOffset();
        console.log('Pieces: ' + now.getHours() + ", " + now.getMinutes() + "," + timezoneOffset + "," + offsetToUse);
        var shiftedUtcDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysShift,
            now.getUTCHours(), now.getUTCMinutes() - offsetToUse, now.getUTCSeconds());
        console.log('shiftedUTCDate: ' + shiftedUtcDate);*/
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
    }
};

$$.u = $$.u || {};
$$.u.mandrillHelper = mandrillHelper;

module.exports = mandrillHelper;
