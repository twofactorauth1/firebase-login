/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('./dao/campaign.dao.js');
require('./dao/campaign_message.dao.js');

var accountDao = require('../dao/account.dao');
var contactDao = require('../dao/contact.dao');
var courseDao = require('../dao/course.dao');
var userDao = require('../dao/user.dao');

var mandrillConfig = require('../configs/mandrill.config');

var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(mandrillConfig.CLIENT_API_KEY);

//todo: change it to dynamic resolution depending on env
var hostSuffix = 'indigenous.local:3000';

/**
 * Constants for pipeshift
 * */

var LINK_VAR_NAME = "link";
var PREVIEW_IMAGE_VAR_NAME = "preview_image";
var TITLE_VAR_NAME = "title";
var SUBTITLE_VAR_NAME = "subtitle";
var BODY_VAR_NAME = "body";

module.exports = {

    /**
     * Supported Campaign Types
     */
    MANDRILL_CAMPAIGN: "Mandrill",

    /**
     * Supported delivery frequencies
     */
    EVERY_OTHER_DAY: "Every other day",
    EVERY_DAY: "Every day",


    MSG_DELIVERY_FREQUENCIES: [this.EVERY_OTHER_DAY, this.EVERY_DAY],

    log: $$.g.getLogger("campaign_manager"),

    getCampaign: function (campaignId, fn) {
        $$.dao.CampaignDao.getById(campaignId, fn);
    },

    findCampaigns: function (query, fn) {
        $$.dao.CampaignDao.findMany(query, fn);
    },

    findCampaignMessages: function (query, fn) {
        $$.dao.CampaignMessageDao.findMany(query, fn);
    },

    createMandrillCampaign: function (name, description, revision, templateName, numberOfMessages, messageDeliveryFrequency, callback) {

        var self = this;

        /**
         * Validate Interval
         */
        if (_.contains(this.MSG_DELIVERY_FREQUENCIES, messageDeliveryFrequency)) {
            return callback(new Error("No message delivery frequency was specified"), null);
        }

        /**
         * Validate template exists in Mandrill
         */
        mandrill_client.templates.info({"name": templateName}, function (result) {
            self.log.debug("Successfully fetched template from Mandrill");
            self.log.debug(result);

            $$.dao.CampaignDao.createCampaign(
                name,
                description,
                revision,
                templateName,
                result.subject,
                result.from_name,
                result.from_email,
                numberOfMessages,
                messageDeliveryFrequency,
                self.MANDRILL_CAMPAIGN,
                callback);

        }, function (e) {
            return callback(new Error("Unable to retrieve template " + templateName + " from Mandrill. ("
                + e.name + ": " + e.message + ")"), null);
        });
    },

    /**
     *
     * @param campaignId campaign id
     * @param contactId contact id
     * @param arrayOfMessageVarArrays The number of entries in this array must match the number of messages
     * in the campaign that this message refers to. Each entry in the array is itself an array of message vars.
     * For example, the array below is for a campaign that will send two messages.
     [
     // variables in the first message
     [
     {
         "name": "header",
         "content": "This is your first campaign message"
     },
     {
         "name": "dueDate",
         "content": "Your payment due date is 2014-06-14"
     },
     {
         "name": "footer",
         "content": "We look forward to your payment"
     },
     ],
     // variables in the second message
     [
     {
         "name": "header",
         "content": "This is your second campaign message"
     },
     {
         "name": "dueDate",
         "content": "Your payment due date is 2014-06-14"
     },
     {
         "name": "footer",
         "content": "This is our last communication"
     },
     ]
     ]

     * @param callback callback
     */
    addContactToMandrillCampaign: function (campaignId, contactId, arrayOfMessageVarArrays, callback) {
        var self = this;

        /**
         * Make sure contact is not already in campaign
         */
        $$.dao.CampaignMessageDao.findOne({'campaignId': campaignId, 'contactId': contactId}, function (err, value) {
            if (err) {
                self.log.error(err.message);
                return callback(err, null);
            }

            if (value) {
                return callback(new Error("Contact " + contactId + " has already been added to campaign " + campaignId), null);
            }

            self._getCampaign(campaignId, self.MANDRILL_CAMPAIGN, function (err, campaign) {
                if (err) {
                    return callback(err, null);
                }

                self.log.debug("Found campaign " + JSON.stringify(campaign, null, 2));

                var messageDates = self._getMessageDates(campaign.attributes.numberOfMessages,
                    campaign.attributes.messageDeliveryFrequency);

                if (messageDates.length < 1) {
                    return callback(new Error("Was unable to determine what messages to send"), null);
                }

                self.log.debug("Will schedule " + messageDates.length + " messages");

                if (arrayOfMessageVarArrays) {
                    if (!Array.isArray(arrayOfMessageVarArrays)) {
                        return callback(new Error("arrayOfMessageVarArrays must be an array"), null);
                    }

                    if (messageDates.length != arrayOfMessageVarArrays.length) {
                        return callback(new Error("Expected either null or " + messageDates.length
                            + " arrays in arrayOfMessageVarArrays"), null);
                    }
                }

                self._getContactInfo(contactId, function (err, contactInfo) {
                    if (err) {
                        return callback(err, null);
                    }

                    self.log.debug("Found contact " + JSON.stringify(contactInfo, null, 2));

                    var messages = [];

                    function sendMessage(sendAt) {
                        if (!sendAt) {
                            return callback(null, messages);
                        }

                        var mergeVars = arrayOfMessageVarArrays ? arrayOfMessageVarArrays.shift() : null;

                        self._sendMessageToMandrill(
                            campaign,
                            contactId,
                            contactInfo.name,
                            contactInfo.email,
                            sendAt,
                            mergeVars,
                            function (err, mandrillMessage) {
                                if (err) {
                                    return callback(err, messages);
                                }

                                self.log.debug("Wrote to Mandrill: " + JSON.stringify(mandrillMessage, null, 2));

                                /**
                                 * Write it to our database
                                 */
                                $$.dao.CampaignMessageDao.createCampaignMessage(
                                    campaign,
                                    contactId,
                                    contactInfo.name,
                                    contactInfo.email,
                                    sendAt,
                                    mergeVars,
                                    mandrillMessage.status,
                                    mandrillMessage._id,
                                    function (err, message) {
                                        if (err) {
                                            return callback(err, null);
                                        }
                                        self.log.debug("Wrote dao message: " + JSON.stringify(message, null, 2));
                                        messages.push(message);
                                        return sendMessage(messageDates.shift());
                                    }
                                )
                            });
                    }

                    sendMessage(messageDates.shift());
                })
            })
        })
    },

    cancelMandrillCampaign: function (campaignId, callback) {
        this._cancelMandrillCampaignMessages({'campaignId': campaignId }, callback);
    },

    cancelContactMandrillCampaign: function (campaignId, contactId, callback) {
        this._cancelMandrillCampaignMessages({'campaignId': campaignId, 'contactId': contactId}, callback);
    },

    subscribeToPipeshiftCourse: function (toEmail, courseMock, timezoneOffset, curUserId, callback) {
        var self = this;
        courseDao.getCourseById(courseMock._id, curUserId, function (err, course) {
            if (err || !course) {
                self.log.warn("Can't find course: " + "\t" + JSON.stringify(err, null, 2));
                callback(err, null);
            } else {
                contactDao.createUserContactFromEmail(course.get('userId'), toEmail, function (err, value) {
                        if (err) {
                            self.log.warn("Error creating contact: " + "\t" + JSON.stringify(value, null, 2));
                        }
                        accountDao.getFirstAccountForUserId(course.get('userId'), function (err, account) {
                            if (err || !account) {
                                callback(err, null);
                            } else {
                                var host = account.get('subdomain') + "." + hostSuffix;
                                var templateName = course.get('template').name;
                                //base message
                                var message = self._initPipeshiftMessage(toEmail);
                                var async = false;
                                var successItemsCounter = 0;
                                //loop through course videos
                                for (var i = 0; i < course.get('videos').length; i++) {
                                    var video = course.get('videos')[i];
                                    message.subject = video.subject || course.get('title');
                                    // adjust values for current video
                                    self._setGlobalVarValue(message, LINK_VAR_NAME, "http://" + host + "/courses/" + course.get('subdomain') + "/video/" + video.videoId);
                                    self._setGlobalVarValue(message, PREVIEW_IMAGE_VAR_NAME, video.videoBigPreviewUrl);
                                    self._setGlobalVarValue(message, TITLE_VAR_NAME, video.videoTitle);
                                    self._setGlobalVarValue(message, SUBTITLE_VAR_NAME, video.videoSubtitle);
                                    self._setGlobalVarValue(message, BODY_VAR_NAME, video.videoBody);
                                    var sendObj = self._initVideoTemplateSendObject(templateName, message, async);
                                    // schedule email
                                    // if time is in the past mandrill sends email immediately
                                    sendObj.send_at = self._getScheduleUtcDateTimeIsoString(video.scheduledDay, video.scheduledHour, video.scheduledMinute, timezoneOffset);
                                    // send template
                                    mandrill_client.messages.sendTemplate(sendObj, function (result) {
                                        self.log.debug(result);
                                        //
                                        successItemsCounter++;
                                        if (successItemsCounter == course.get('videos').length) {
                                            callback(null, {});
                                        }
                                    }, function (e) {
                                        self.log.warn('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                                        callback(e, null);
                                    });
                                }
                            }
                        });
                    }
                );
            }
        });

    },

    getPipeshiftTemplates: function (callback) {
        mandrill_client.templates.list({}, function (result) {
            callback(null, result);
        }, function (err) {
            callback(err, null);
        });
    },

    getPipeshiftTemplateByName: function (templateName, callback) {
        mandrill_client.templates.info({name: templateName}, function (template) {
                callback(null, template)
            }, function (err) {
                callback(err, null);
            }
        );
    },

    _cancelMandrillCampaignMessages: function (query, callback) {
        var self = this;

        $$.dao.CampaignMessageDao.findMany(query, function (err, messages) {
            if (err) {
                self.log.error(err.message);
                return callback(err, null);
            }

            self.log.debug("Will need to remove " + messages.length + " messages matching " + JSON.stringify(query));

            function cancelMessage(message) {
                if (!message) {
                    return callback(null);
                }

                $$.dao.CampaignMessageDao.removeById(message.attributes._id, function (err, value) {
                    if (err) {
                        self.log.error("Failed to remove campaign message " + message.attributes._id +
                            ": " + err.message);
                    }

                    if (message.attributes.messageStatus == 'scheduled') {
                        self.log.debug("need to cancel message " + message.attributes.externalId);
                        mandrill_client.messages.cancelScheduled({"id": message.attributes.externalId}, function (result) {
                            self.log.debug("Mandrill message " + message.attributes.externalId + " cancelled: " +
                                JSON.stringify(result));
                        }, function (e) {
                            self.log.error("Failed to cancel mandrill message " + message.attributes.externalId + ": " +
                                e.name + ' - ' + e.message);
                        });
                    }

                    cancelMessage(messages.shift());
                })
            }

            cancelMessage(messages.shift());
        })
    },

    _sendMessageToMandrill: function (campaign, contactId, contactName, contactEmail, sendAt, mergeVarsArray, callback) {

        var self = this;

        var message = {
            "subject": campaign.attributes.subject,
            "from_email": campaign.attributes.fromEmail,
            "from_name": campaign.attributes.fromName,
            "to": [
                {
                    "email": contactEmail,
                    "name": contactName,
                    "type": "to"
                }
            ],
            "headers": {
                "Reply-To": campaign.attributes.fromEmail
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
            "merge": true,
            "global_merge_vars": mergeVarsArray,
            "merge_vars": null,
            "tags": [
                campaign.attributes._id
            ],
            "subaccount": null,
            "google_analytics_domains": [
                "indigenous.io"
            ],
            "google_analytics_campaign": null,
            "metadata": {
                "campaignId": campaign.attributes._id
            },
            "recipient_metadata": [
                {
                    "rcpt": contactEmail,
                    "values": {
                        "contactId": contactId
                    }
                }
            ],
            "attachments": null,
            "images": null
        }

        self.log.debug("Sending to Mandrill => templateName: " + campaign.attributes.templateName +
            " on " + sendAt + " message: " + JSON.stringify(message, null, 2));

        mandrill_client.messages.sendTemplate(
            {
                "template_name": campaign.attributes.templateName,
                "template_content": null,
                "message": message,
                "async": false,
                "send_at": sendAt
            }, function (result) {
                self.log.debug(result);
                /*
                 [{
                 "email": "recipient.email@example.com",
                 "status": "sent",
                 "reject_reason": "hard-bounce",
                 "_id": "abc123abc123abc123abc123abc123"
                 }]
                 */
                return callback(null, result[0]);
            }, function (e) {
                // Mandrill returns the error as an object with name and message keys
                self.log.error('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                return callback(new Error('A mandrill error occurred: ' + e.name + ' - ' + e.message), null);
            });
    },

    _getCampaign: function (campaignId, campaignType, callback) {
        $$.dao.CampaignDao.getById(campaignId, function (err, campaign) {
            if (err) {
                return callback(err, null);
            }

            if (!campaign) {
                return callback(new Error("Campaign with id " + campaignId + " was not found"), null);
            }

            if (campaign.attributes.type != campaignType) {
                return callback(new Error("Campaign specified " + campaignId + " is not a " + campaignType + " campaign"), null);
            }

            return callback(null, campaign);
        })
    },

    _getMessageDates: function (numberOfMessages, messageDeliveryFrequency) {
        var self = this;

        var messageDates = [];
        var twentyfour_hours = 86400000;
        var sendAtDate = new Date();

        for (var i = 0; i < numberOfMessages; i++) {
            if (messageDeliveryFrequency == self.EVERY_OTHER_DAY) {
                sendAtDate = new Date(sendAtDate.getTime() + (2 * twentyfour_hours));
                messageDates.push(self._toMandrillDate(sendAtDate));
            } else if (messageDeliveryFrequency == self.EVERY_DAY) {
                sendAtDate = new Date(sendAtDate.getTime() + twentyfour_hours);
                messageDates.push(self._toMandrillDate(sendAtDate));
            }
        }

        return messageDates;
    },

    _getContactInfo: function (contactId, callback) {
        contactDao.getById(contactId, function (err, contact) {
            if (err) {
                return callback(err, null)
            }

            if (!contact) {
                return callback(new Error("No contact with id " + contactId + " was found"));
            }

            var contactInfo = {};
            contactInfo.name = contact.attributes.first + " " + contact.attributes.last;

            var emails = contact.getEmails();

            if (Array.isArray(emails)) {
                contactInfo.email = emails[0];
            } else {
                contactInfo.email = emails;
            }

            if ($$.u.stringutils.isNullOrEmpty(contactInfo.email)) {
                return callback(new Error("No email address found in contact " + contactId));
            }

            return callback(null, contactInfo);
        })
    },

    _toTwoDigit: function (val) {
        return val <= 9 ? '0' + val : val;
    },

    _toMandrillDate: function (aDate) {
        var d = aDate.getDate();
        var m = aDate.getMonth() + 1;
        var y = aDate.getFullYear();
        var hh = aDate.getHours();
        var mm = aDate.getMinutes();
        var ss = aDate.getSeconds();
        return '' + y + '-' + this._toTwoDigit(m) + '-' + this._toTwoDigit(d)
            + ' ' + this._toTwoDigit(hh) + ":" + this._toTwoDigit(mm) + ":" + this._toTwoDigit(ss);
    },

    _getUtcDateIsoString: function () {
        var now = new Date();
        var nowUtc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
        return nowUtc.toISOString();
    },
    _getScheduleUtcDateTimeIsoString: function (daysShift, hoursValue, minutesValue, timezoneOffset) {
        var now = new Date();
        var shiftedUtcDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysShift, now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
        shiftedUtcDate.setUTCHours(hoursValue);
        shiftedUtcDate.setUTCMinutes(minutesValue + timezoneOffset);
        shiftedUtcDate.setUTCSeconds(0);
        return shiftedUtcDate.toISOString();
    },
    _initVideoTemplateSendObject: function (templateName, message, async) {
        return {template_name: templateName,
            template_content: [

            ],
            "message": message,
            "async": async}
    },
    _initPipeshiftMessage: function (toEmail) {
        return {
            "html": "<p>Empty</p>",
            "subject": "example subject",
            "from_email": "info@pipeshift.com",
            "from_name": "Pipeshift",
            "to": [
                {
                    "email": toEmail,
                    "name": "User",
                    "type": "to"
                }
            ],
            "global_merge_vars": [
                {
                    "name": LINK_VAR_NAME,
                    "content": "http://pipeshift.herokuapp.com"
                },
                {
                    "name": PREVIEW_IMAGE_VAR_NAME,
                    "content": "http://img.brightcove.com/player-template-chromeless.jpg"
                },
                {
                    "name": TITLE_VAR_NAME,
                    "content": "Title"
                },
                {
                    "name": SUBTITLE_VAR_NAME,
                    "content": ""
                },
                {
                    "name": BODY_VAR_NAME,
                    "content": ""
                }
            ]
        };
    },

    _setGlobalVarValue: function (message, varName, value) {
        var globalVar = this._findGlobalVarByName(message, varName);
        globalVar.content = value;
    },

    _findGlobalVarByName: function (message, varName) {
        var result = null;
        for (var i = 0; i < message.global_merge_vars.length; i++) {
            var globalVar = message.global_merge_vars[i];
            if (globalVar.name == varName) {
                result = globalVar;
            }
        }
        return result;
    }

}
;