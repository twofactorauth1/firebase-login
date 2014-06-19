/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('./dao/campaign.dao.js');
require('./dao/campaign_message.dao.js');

var contactDao = require('../dao/contact.dao');

var mandrillConfig = require('../configs/mandrill.config');

//var mandrill = require('mandrill-api/mandrill');
//var mandrill_client = new mandrill.Mandrill(mandrillConfig.CLIENT_API_KEY);

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

    getCampaign: function(campaignId, fn) {
        $$.dao.CampaignDao.getById(campaignId, fn);
    },

    findCampaigns: function(query, fn) {
        $$.dao.CampaignDao.findMany(query, fn);
    },

    findCampaignMessages: function(query, fn) {
        $$.dao.CampaignMessageDao.findMany(query, fn);
    },

    createMandrillCampaign: function(
        name,
        description,
        revision,
        templateName,
        numberOfMessages,
        messageDeliveryFrequency,
        callback) {

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
        mandrill_client.templates.info({"name": templateName}, function(result) {
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

        }, function(e) {
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
    addContactToMandrillCampaign: function(campaignId, contactId, arrayOfMessageVarArrays, callback) {
        var self = this;

        /**
         * Make sure contact is not already in campaign
         */
        $$.dao.CampaignMessageDao.findOne({'campaignId': campaignId, 'contactId': contactId}, function(err, value) {
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

    cancelMandrillCampaign: function(campaignId, callback) {
        this._cancelMandrillCampaignMessages({'campaignId': campaignId }, callback);
    },

    cancelContactMandrillCampaign: function(campaignId, contactId, callback) {
        this._cancelMandrillCampaignMessages({'campaignId': campaignId, 'contactId': contactId}, callback);
    },

    _cancelMandrillCampaignMessages: function(query, callback) {
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

    _sendMessageToMandrill: function(
        campaign,
        contactId,
        contactName,
        contactEmail,
        sendAt,
        mergeVarsArray,
        callback) {

        var self = this;

        var message = {
            "subject": campaign.attributes.subject,
            "from_email": campaign.attributes.fromEmail,
            "from_name": campaign.attributes.fromName,
            "to": [{
                "email": contactEmail,
                "name": contactName,
                "type": "to"
            }],
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
            "recipient_metadata": [{
                "rcpt": contactEmail,
                "values": {
                    "contactId": contactId
                }
            }],
            "attachments": null,
            "images": null
        }

        self.log.debug("Sending to Mandrill => templateName: " +  campaign.attributes.templateName +
            " on " + sendAt + " message: " + JSON.stringify(message, null, 2));

        mandrill_client.messages.sendTemplate(
            {
                "template_name": campaign.attributes.templateName,
                "template_content": null,
                "message": message,
                "async": false,
                "send_at": sendAt
            }, function(result) {
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
        }, function(e) {
            // Mandrill returns the error as an object with name and message keys
            self.log.error('A mandrill error occurred: ' + e.name + ' - ' + e.message);
            return callback(new Error('A mandrill error occurred: ' + e.name + ' - ' + e.message), null);
        });
    },

    _getCampaign: function(campaignId, campaignType, callback) {
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

    _getMessageDates: function(numberOfMessages, messageDeliveryFrequency) {
        var self = this;

        var messageDates = [];
        var twentyfour_hours = 86400000;
        var sendAtDate = new Date();

        for (var i=0; i < numberOfMessages; i++) {
            if (messageDeliveryFrequency == self.EVERY_OTHER_DAY) {
                sendAtDate = new Date(sendAtDate.getTime() + (2*twentyfour_hours));
                messageDates.push(self._toMandrillDate(sendAtDate));
            } else if (messageDeliveryFrequency == self.EVERY_DAY) {
                sendAtDate = new Date(sendAtDate.getTime() + twentyfour_hours);
                messageDates.push(self._toMandrillDate(sendAtDate));
            }
        }

        return messageDates;
    },

    _getContactInfo: function(contactId, callback) {
        contactDao.getById(contactId, function(err, contact) {
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

    _toTwoDigit: function(val) {
        return val <= 9 ? '0' + val : val;
    },

    _toMandrillDate: function(aDate) {
        var d = aDate.getDate();
        var m = aDate.getMonth() + 1;
        var y = aDate.getFullYear();
        var hh = aDate.getHours();
        var mm = aDate.getMinutes();
        var ss = aDate.getSeconds();
        return '' + y + '-' + this._toTwoDigit(m) + '-' + this._toTwoDigit(d)
            + ' ' + this._toTwoDigit(hh) + ":" + this._toTwoDigit(mm) + ":" + this._toTwoDigit(ss);
    }
};