/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var cookies = require('../../utils/cookieutil');
var analyticsDao = require('../../analytics/dao/analytics.dao.js');
var analyticsManager = require('../../analytics/analytics_manager.js');
var keenConfig = require('../../configs/keen.config');
var async = require('async');
var contactDao = require('../../dao/contact.dao');
var contactActivityManager = require('../../contactactivities/contactactivity_manager');
var urlUtils = require('../../utils/urlutils');
var campaignManager = require('../../campaign/campaign_manager');
var appConfig = require('../../configs/app.config');
var accountDao = require('../../dao/account.dao');
var moment = require('moment');
var emailMessageManager = require('../../emailmessages/emailMessageManager');
require('superagent');


var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "analytics",

    dao: analyticsDao,

    initialize: function() {

        //segmentio webhook
        app.post(this.url('webhook/event'), this.verifyEvent.bind(this), this.saveAnalyticEvent.bind(this));
        app.get(this.url('webhook/event'), this.verifyEvent.bind(this), this.showOk.bind(this));

        //event CRUDL
        app.get(this.url('events'), this.isAuthAndSubscribedApi.bind(this), this.listEvents.bind(this));
        app.post(this.url('events'), this.isAuthAndSubscribedApi.bind(this), this.createEvent.bind(this));
        app.get(this.url('events/:id'), this.isAuthAndSubscribedApi.bind(this), this.getEvent.bind(this));
        app.post(this.url('events/:id'), this.isAuthAndSubscribedApi.bind(this), this.updateEvent.bind(this));
        app.delete(this.url('events/:id'), this.isAuthAndSubscribedApi.bind(this), this.deleteEvent.bind(this));

        app.post(this.url('mandrill/event'), this.filterMandrillEvents.bind(this), this.sendToKeen.bind(this));
        app.post(this.url('mandrill/event/unsub'), this.handleUnsubscribe.bind(this));

        app.post(this.url('sendgrid/event'), this.filterSendgridEvents.bind(this), this.handleSendgridEvent.bind(this));
        app.get(this.url('sendgrid/event'), this.testSendgridEvent.bind(this));
        app.post(this.url('stripe/event'), this.sendStripeEventToKeen.bind(this));

        app.post(this.url('intercom/event'), this.handleIntercomEvent.bind(this));

        //visit
        app.post(this.url('session/:id/sessionStart'), this.setup.bind(this), this.storeSessionInfo.bind(this));
        app.post(this.url('session/:id/pageStart'), this.setup.bind(this), this.storePageInfo.bind(this));
        app.post(this.url('session/:id/ping'), this.storePingInfo.bind(this));

        app.get(this.url('reports/visitors'), this.isAuthAndSubscribedApi.bind(this), this.runVisitorsReport.bind(this));
        app.get(this.url('reports/visitorLocations'), this.isAuthAndSubscribedApi.bind(this), this.visitorLocationsReport.bind(this));
        app.get(this.url('reports/visitorDevices'), this.isAuthAndSubscribedApi.bind(this), this.visitorDeviceReport.bind(this));
        app.get(this.url('reports/users'), this.isAuthAndSubscribedApi.bind(this), this.userReport.bind(this));
        app.get(this.url('reports/pageviews'), this.isAuthAndSubscribedApi.bind(this), this.pageviewsReport.bind(this));
        app.get(this.url('reports/sessions'), this.isAuthAndSubscribedApi.bind(this), this.sessionsReport.bind(this));
        app.get(this.url('reports/sessionLength'), this.isAuthAndSubscribedApi.bind(this), this.sessionLengthReport.bind(this));
        app.get(this.url('reports/trafficSources'), this.isAuthAndSubscribedApi.bind(this), this.trafficSourcesReport.bind(this));
        app.get(this.url('reports/newVsReturning'), this.isAuthAndSubscribedApi.bind(this), this.newVsReturningReport.bind(this));
        app.get(this.url('reports/pageAnalytics'), this.isAuthAndSubscribedApi.bind(this), this.pageAnalyticsReport.bind(this));
        app.get(this.url('reports/all'), this.isAuthAndSubscribedApi.bind(this), this.allReports.bind(this));
    },

    sendToKeen: function(req, res) {
        var self = this;
        self.log.debug('>> sendToKeen');
        //var request = require('request');
        var request = require('superagent');

        var msg = {};
        var messagesToSend = [];
        if(req.body.mandrill_events) {
            try {
                msg = JSON.parse(req.body.mandrill_events);
                if(_.isArray(msg)) {
                    //msg = {'mandrill_events': JSON.parse(req.body.mandrill_events)};
                    _.each(msg, function(value, key, list){
                        var obj = {};
                        if(value.event) {
                            var name = 'mandrill_' + value.event;
                            obj.collection = name;
                            obj.value = value;
                            messagesToSend.push(obj);
                        }
                    });
                } else {
                    messagesToSend.push(msg);
                }
            } catch(err) {
                self.log.debug('error parsing events: ' + err);
                msg = req.body;
            }

        } else {
            msg = req.body;
            messagesToSend.push(msg);
        }
        //self.log.info('Sending the following to keen:');
        //console.dir(messagesToSend);
        var url = "https://api.keen.io/3.0/projects/"+keenConfig.KEEN_PROJECT_ID+"/events/";
        var api_key = keenConfig.KEEN_WRITE_KEY;
        async.eachSeries(messagesToSend, function(message, callback){
            self.log.debug('url ', url + message.collection + '?api_key=' + api_key);
            var newrequest = request.post(url + message.collection + '?api_key=' + api_key)
                .send(message.value)
                .end(function(error, result){
                    if(error) {
                        self.log.error("received error: " + error);
                    }
                });
            callback();
        }, function(err){
            if(err) {
                self.log.error('Error during send to keen: ' + err);
            } else {
                self.log.debug('<< sendToKeen');
            }
        });

        //TODO: Verify message from mandirll
        //TODO: parameterize url
        self.sendResult(res, {'ok': 'ok'});
    },

    sendStripeEventToKeen: function(req, resp) {
        var self = this;
        self.log.debug('>> sendStripeEventToKeen', req.body);
        var request = require('superagent');

        var msg = null;
        if(req.body) {
            msg = req.body;
            self.log.debug('got message', msg);
            if(msg.data && msg.data.object && msg.data.object.customer) {
                var customerId = msg.data.object.customer;
                accountDao.getAccountByBillingCustomerId(customerId, function(err, account){
                    if(err) {
                        self.log.error('Error getting account by customerId', err);
                    } else if(account){
                        msg.customerAccountId = account.id();
                        msg.accountId = appConfig.mainAccountID;
                    } else {
                        self.log.debug('could not find account for customerId:' + customerId);
                    }
                    //https://api.keen.io/3.0/projects/547edcea46f9a776b6579e2c/events/Stripe_Events?api_key=98f22da64681d5b81e2abb7323493526d8d258f0d355e95f742335b4ff1b75af2709baa51d16b60f168158fe7cfd8d1de89d637ddf8a9ca721859b009c4b004d443728df52346307e456f0511b3e82be4a96efaa9f6dcb7f847053e97eee2b796fc3e2d1a57bb1a86fb07d2e00894966
                    var url = "https://api.keen.io/3.0/projects/"+keenConfig.KEEN_PROJECT_ID+"/events/Stripe_Events";
                    var api_key = keenConfig.KEEN_WRITE_KEY;

                    request.post(url + '?api_key=' + api_key)
                        .send(msg)
                        .end(function(error, result){
                            if(error) {
                                self.log.error('Error during send to keen: ' + err);
                            } else {
                                self.log.debug('<< sendStripeEventToKeen');
                            }
                            self.sendResult(resp, {'ok': 'ok'});
                        }
                    );
                });
            } else {
                //self.log.debug('msg.data', msg.data);
                //self.log.debug('msg.data.object', msg.data.object);
                //self.log.debug('msg.data.object.customer', msg.data.object.customer);
                self.log.debug('<< sendStripeEventToKeen (no customer)');
                self.send200(resp);
            }

        } else {
            self.log.debug('<< sendStripeEventToKeen (no event)');
            self.send200(resp);
        }

    },

    verifyEvent: function(req, res, next) {
        //TODO: verify event comes from segment
        next();
    },

    filterSendgridEvents: function(req, resp, next) {
        next();
    },

    handleSendgridEvent: function(req, resp) {
        var self = this;
        var events = req.body;
        self.log.debug('>> handleSendgridEvent:', events);
        self.send200(resp);
        var savedEvents = [];
        var contactActivitiesJSON = [];
        var deferredUpdates = {};
        async.eachSeries(events, function(event, cb){
            var obj = {
                email : event.email,
                ts : moment.unix(event.timestamp).toDate(),
                start: moment.unix(event.timestamp).toDate(),
                accountId: event.accountId,
                contactId: event.contactId
            };

            if(event.event === 'delivered') {
                emailMessageManager.isMessageDelivered(event.emailmessageId, function(err, value){
                    if(err) {
                        self.log.error('Error while processing [' + event.emailmessageId + ']', err);
                        cb();//continue if possible.
                    } else if(value) {
                        //this message is already marked as delivered.  Add another event but don't update stats.
                        emailMessageManager.addEvent(event.emailmessageId, event, function(err, value){
                            if(value) {
                                savedEvents.push(value);
                            }
                            cb(err);
                        });
                    } else {
                        emailMessageManager.markMessageDelivered(event.emailmessageId, event, function(err, value){
                            if(value) {
                                savedEvents.push(value);
                                obj.sender = value.get('sender');
                                obj.activityType = $$.m.ContactActivity.types.EMAIL_DELIVERED;
                                if(value.get('subject')){
                                    obj.extraFields = obj.extraFields || [];
                                    obj.extraFields.push({subject: value.get('subject')});
                                }
                                contactActivitiesJSON.push(obj);
                                if(event.campaignId) {
                                    var campaignUpdates = deferredUpdates[event.campaignId] || {};
                                    if(campaignUpdates.sent) {
                                        campaignUpdates.sent = campaignUpdates.sent + 1;
                                    } else {
                                        campaignUpdates.sent = 1;
                                        deferredUpdates[event.campaignId] = campaignUpdates;
                                    }
                                }
                                cb(err);
                            } else {
                                cb(err);
                            }
                        });
                    }
                });

            } else if(event.event === 'open') {
                emailMessageManager.isMessageOpened(event.emailmessageId, function(err, value){
                    if(err) {
                        self.log.error('Error while processing [' + event.emailmessageId + ']', err);
                        cb();//continue if possible.
                    } else if(value) {
                        //this message is already marked as opened.  Add another event but don't update stats.
                        emailMessageManager.addEvent(event.emailmessageId, event, function(err, value){
                            if(value) {
                                savedEvents.push(value);
                            }
                            cb(err);
                        });
                    } else {
                        emailMessageManager.markMessageOpened(event.emailmessageId, event, function(err, value){
                            if(value) {
                                savedEvents.push(value);
                                obj.sender = value.get('sender');
                                obj.activityType = $$.m.ContactActivity.types.EMAIL_OPENED;
                                if(value.get('subject')){
                                    obj.extraFields = obj.extraFields || [];
                                    obj.extraFields.push({subject: value.get('subject')});
                                }
                                contactActivitiesJSON.push(obj);
                                if(event.campaignId) {
                                    var campaignUpdates = deferredUpdates[event.campaignId] || {};
                                    if(campaignUpdates.opened) {
                                        campaignUpdates.opened = campaignUpdates.opened + 1;
                                    } else {
                                        campaignUpdates.opened = 1;
                                        deferredUpdates[event.campaignId] = campaignUpdates;
                                    }
                                    campaignManager._handleSpecificCampaignEvent(event.accountId, event.campaignId, event.contactId, 'EMAIL_OPENED', function(err, value){
                                        if(err) {
                                            self.log.error('Error handling email open event:' + err);
                                            return;
                                        } else {
                                            self.log.debug('Handled email open event.');
                                            return;
                                        }
                                    });
                                    cb(err);
                                } else {
                                    cb(err);
                                }
                            } else {
                                cb(err);
                            }
                        });
                    }
                });

            } else if(event.event === 'click') {
                emailMessageManager.isMessageClicked(event.emailmessageId, function(err, value){
                    if(err) {
                        self.log.error('Error while processing [' + event.emailmessageId + ']', err);
                        cb();//continue if possible.
                    } else if(value) {
                        //this message is already marked as clicked.  Add another event but don't update stats.
                        emailMessageManager.addEvent(event.emailmessageId, event, function(err, value){
                            if(value) {
                                savedEvents.push(value);
                            }
                            cb(err);
                        });
                    } else {
                        emailMessageManager.markMessageClicked(event.emailmessageId, event, function(err, value){
                            if(value) {
                                savedEvents.push(value);
                                obj.sender = value.get('sender');
                                obj.activityType = $$.m.ContactActivity.types.EMAIL_CLICKED;
                                if(value.get('subject')){
                                    obj.extraFields = obj.extraFields || [];
                                    obj.extraFields.push({subject: value.get('subject')});
                                }
                                contactActivitiesJSON.push(obj);
                                if(event.campaignId) {
                                    var campaignUpdates = deferredUpdates[event.campaignId] || {};
                                    if(campaignUpdates.clicked) {
                                        campaignUpdates.clicked = campaignUpdates.clicked + 1;
                                    } else {
                                        campaignUpdates.clicked = 1;
                                        deferredUpdates[event.campaignId] = campaignUpdates;
                                    }
                                }
                                cb(err);
                            } else {
                                cb(err);
                            }
                        });
                    }
                });

            } else if (event.event === 'unsubscribe') {

                contactDao.findContactsByEmail(event.accountId, event.email, function(err, contactAry){
                    if(err) {
                        self.log.error('Error finding contact for [' + event.email + '] and [' + event.accountId + ']');
                        return;
                    } else if(contactAry === null || contactAry.length ===0){
                        //this might be a user and contact on main account
                        contactDao.findContactsByEmail(appConfig.mainAccountID, event.email, function(err, contacts){
                            if(err || contacts === null || contacts.length===0) {
                                self.log.error('Error finding contact for [' + event.email + '] and [' + appConfig.mainAccountID + ']');
                                return;
                            } else {
                                var contact = contacts[0];
                                contact.set('unsubscribed', true);
                                contactDao.saveOrUpdateContact(contact, function(err, updatedContact){
                                    if(err) {
                                        self.log.error('Error marking contact unsubscribed', err);
                                        return;
                                    } else {
                                        var activity = new $$.m.ContactActivity({
                                            accountId: contact.get('accountId'),
                                            contactId: contact.id(),
                                            activityType: $$.m.ContactActivity.types.EMAIL_UNSUB,
                                            start: event.timestamp
                                        });
                                        contactActivityManager.createActivity(activity, function(err, value){});
                                    }
                                });
                            }
                        });
                    } else {
                        var contact = contactAry[0];
                        contact.set('unsubscribed', true);
                        contactDao.saveOrUpdateContact(contact, function(err, updatedContact){
                            if(err) {
                                self.log.error('Error marking contact unsubscribed', err);
                                return;
                            } else {
                                var activity = new $$.m.ContactActivity({
                                    accountId: contact.get('accountId'),
                                    contactId: contact.id(),
                                    activityType: $$.m.ContactActivity.types.EMAIL_UNSUB,
                                    start: event.timestamp
                                });
                                contactActivityManager.createActivity(activity, function(err, value){});
                            }
                        });
                    }
                });
                cb();
            } else if (event.event === 'bounce'){
                emailMessageManager.markMessageBounced(event.emailmessageId, event, function(err, value){
                    if(value) {
                        savedEvents.push(value);
                        obj.sender = value.get('sender');
                        obj.activityType = $$.m.ContactActivity.types.EMAIL_BOUNCED;
                        contactActivitiesJSON.push(obj);
                        if(event.campaignId) {
                            var campaignUpdates = deferredUpdates[event.campaignId] || {};
                            if(campaignUpdates.bounced) {
                                campaignUpdates.bounced = campaignUpdates.bounced + 1;
                            } else {
                                campaignUpdates.bounced = 1;
                                deferredUpdates[event.campaignId] = campaignUpdates;
                            }
                        }
                        cb(err);
                    } else {
                        cb(err);
                    }
                });
            } else {
                emailMessageManager.addEvent(event.emailmessageId, event, function(err, value){
                    if(value) {
                        savedEvents.push(value);
                    }
                    cb(err);
                });
            }
        }, function(err){
            if(err) {
                self.log.error('Error handling events:', err);
            }
            async.eachSeries(contactActivitiesJSON, function(obj, cb){
                var activity = new $$.m.ContactActivity(obj);
                contactActivityManager.createActivity(activity, function(err, value){
                    cb(err);
                });
            }, function(err){
                if (err) {
                    self.log.error('Error handleSendgridEvent:', err);
                }
                async.eachSeries(_.keys(deferredUpdates), function(key, cb){
                    var updates = deferredUpdates[key];
                    campaignManager.getCampaign(key, function(err, campaign){
                        if(err) {
                            self.log.error('Could not update campaign with key [' + key + ']:', err);
                            cb();
                        } else {
                            var stats = campaign.get('statistics');
                            if(updates.sent) {
                                stats.emailsSent += updates.sent;
                            }
                            if(updates.opened) {
                                stats.emailsOpened += updates.opened;
                            }
                            if(updates.clicked) {
                                stats.emailsClicked += updates.clicked;
                            }
                            if(updates.bounced) {
                                stats.emailsBounced += updates.bounced;
                            }

                            var modified = {
                                date: new Date(),
                                by: 'ADMIN'
                            };
                            campaign.set('modified', modified);
                            //TODO: updateCampaignStatistics
                            //campaignManager.updateCampaign(campaign, cb);
                            var accountId = campaign.get('accountId');
                            var campaignId = campaign.id();
                            var statistics = stats;
                            var userId = 0;
                            campaignManager.updateCampaignStatistics(accountId, campaignId, statistics, userId, cb);
                        }
                    });
                }, function(err){
                    if (err) {
                        self.log.error('Error updating statistics:', err);
                    }
                    self.log.debug('<< handleSendgridEvent', savedEvents);
                });

            });
        });
    },

    testSendgridEvent: function(req, resp) {
        var self = this;
        self.log.debug('>> testSendgridEvent');
        var body = [
            {
                "email":"example@test.com",
                "timestamp":1461788739,
                "smtp-id":"\u003c14c5d75ce93.dfd.64b469@ismtpd-555\u003e",
                "event":"delivered","category":"cat facts","sg_event_id":"vy-AmLZlCAfyRkYxLSwmsQ==","sg_message_id":"14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0",
                "response":"250 OK",
                "emailmessageId": "d0f2f69a-9613-4b12-8375-16bde5eb75f8"
            },{"email":"example@test.com","timestamp":1461788739,"smtp-id":"\u003c14c5d75ce93.dfd.64b469@ismtpd-555\u003e",
                "event":"open","category":"cat facts","sg_event_id":"GqPHf6OmLVGbTRaRCTXoig==","sg_message_id":"14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0","useragent":"Mozilla/4.0 (compatible; MSIE 6.1; Windows XP; .NET CLR 1.1.4322; .NET CLR 2.0.50727)",
                "ip":"255.255.255.255",
                "emailmessageId":'36914d17-8fa4-498f-93fa-3d61fff2941f'
            },{"email":"example@test.com","timestamp":1461788739,"smtp-id":"\u003c14c5d75ce93.dfd.64b469@ismtpd-555\u003e",
                "event":"click","category":"cat facts","sg_event_id":"jWkA13sN6mIDrbCU4rW4Lw==","sg_message_id":"14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0","useragent":"Mozilla/4.0 (compatible; MSIE 6.1; Windows XP; .NET CLR 1.1.4322; .NET CLR 2.0.50727)",
                "ip":"255.255.255.255","url":"http://www.sendgrid.com/",
                "emailmessageId":'a9f5b61d-2f3b-4a74-869a-d26f42ce3a7d'
            },{"email":"example@test.com","timestamp":1461788739,"smtp-id":"\u003c14c5d75ce93.dfd.64b469@ismtpd-555\u003e",
                "event":"bounce","category":"cat facts","sg_event_id":"7na7oN5lbWK7XZEIKPhdvQ==","sg_message_id":"14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0","reason":"500 unknown recipient",
                "status":"5.0.0",
                "emailmessageId":'f78b7a32-ed93-4e06-b4ad-b0c87224c748'
            },{"email":"example@test.com","timestamp":1461788739,"smtp-id":"\u003c14c5d75ce93.dfd.64b469@ismtpd-555\u003e",
                "event":"dropped","category":"cat facts","sg_event_id":"04_ecve7IWgrqI45xMVYBg==","sg_message_id":"14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0","reason":"Bounced Address",
                "status":"5.0.0"
            },{"email":"example@test.com","timestamp":1461788739,"smtp-id":"\u003c14c5d75ce93.dfd.64b469@ismtpd-555\u003e",
                "event":"spamreport","category":"cat facts","sg_event_id":"3JPbDKRZLShT-3xwKZey1Q==","sg_message_id":"14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0"
            },{"email":"example@test.com","timestamp":1461788739,"smtp-id":"\u003c14c5d75ce93.dfd.64b469@ismtpd-555\u003e",
                "event":"unsubscribe","category":"cat facts","sg_event_id":"2LgeW68pbifwY8JOTWtspw==","sg_message_id":"14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0"
            },{"email":"example@test.com","timestamp":1461788739,"smtp-id":"\u003c14c5d75ce93.dfd.64b469@ismtpd-555\u003e",
                "event":"group_unsubscribe","category":"cat facts","sg_event_id":"Cwv0jgI1jmILLtV1zoyz6w==","sg_message_id":"14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0","useragent":"Mozilla/4.0 (compatible; MSIE 6.1; Windows XP; .NET CLR 1.1.4322; .NET CLR 2.0.50727)","ip":"255.255.255.255","url":"http://www.sendgrid.com/","asm_group_id":10
            },{"email":"example@test.com","timestamp":1461788739,"smtp-id":"\u003c14c5d75ce93.dfd.64b469@ismtpd-555\u003e",
                "event":"group_resubscribe","category":"cat facts","sg_event_id":"XCd89PWAa9GOROCq_rt1Sw==","sg_message_id":"14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0","useragent":"Mozilla/4.0 (compatible; MSIE 6.1; Windows XP; .NET CLR 1.1.4322; .NET CLR 2.0.50727)","ip":"255.255.255.255","url":"http://www.sendgrid.com/","asm_group_id":10}];

        var savedEvents = [];
        async.eachSeries(body, function(event, cb){
            if(event.event === 'delivered') {
                emailMessageManager.markMessageDelivered(event.emailmessageId, event, function(err, value){
                    if(value) {
                        savedEvents.push(value);
                    }
                    cb(err);
                });
            } else if(event.event === 'open') {
                emailMessageManager.markMessageOpened(event.emailmessageId, event, function(err, value){
                    if(value) {
                        savedEvents.push(value);
                    }
                    cb(err);
                });
            } else if(event.event === 'click') {
                emailMessageManager.markMessageClicked(event.emailmessageId, event, function(err, value){
                    if(value) {
                        savedEvents.push(value);
                    }
                    cb(err);
                });
            } else if (event.event === 'unsubscribe') {
                //TODO: handle unsubscribe
                cb();
            } else {
                emailMessageManager.addEvent(event.emailmessageId, event, function(err, value){
                    if(value) {
                        savedEvents.push(value);
                    }
                    cb(err);
                });
            }
        }, function(err){
            self.log.debug('<< testSendgridEvent');
            self.sendResultOrError(resp, err, savedEvents, 'Error handling event');
        });
    },

    /**
     * @deprecated
     * @param req
     * @param res
     * @param next
     */
    filterMandrillEvents: function(req, res, next) {
        //TODO: create customActivities
        var self = this;
        self.log.debug('>> filterMandrillEvents');
        var msg = null;
        var objArray = [];
        if(req.body.mandrill_events) {
            try {
                msg = JSON.parse(req.body.mandrill_events);
                if(_.isArray(msg)) {
                    _.each(msg, function (value, key, list) {
                        var type = value.event;
                        var obj = {};
                        if(value.msg) {
                            obj.email = value.msg.email;
                            obj.sender = value.msg.sender;
                            obj.ts = moment.utc(value.ts*1000).toDate();
                            if (type === 'send') {
                                obj.activityType = $$.m.ContactActivity.types.EMAIL_DELIVERED;
                                objArray.push(obj);
                                if(value.msg.metadata && value.msg.metadata.campaignId) {
                                    var metadata = value.msg.metadata;
                                    self.log.debug('Using metadata', metadata);
                                    campaignManager.handleCampaignEmailSentEvent(metadata.accountId, metadata.campaignId, metadata.contactId, function(err, value){
                                        if(err) {
                                            self.log.error('Error handling email send event:' + err);
                                            return;
                                        } else {
                                            self.log.debug('Handled email sent event.');
                                            return;
                                        }
                                    });
                                }
                            } else if (type === 'open') {
                                obj.activityType = $$.m.ContactActivity.types.EMAIL_OPENED;
                                objArray.push(obj);
                                //if value.msg.metadata.campaignId, trigger campaignStep
                                if(value.msg.metadata && value.msg.metadata.campaignId) {
                                    var metadata = value.msg.metadata;
                                    self.log.debug('triggering campaign step for metadata ', metadata);
                                    campaignManager.handleCampaignEmailOpenEvent(metadata.accountId, metadata.campaignId, metadata.contactId, function(err, value){
                                        if(err) {
                                            self.log.error('Error handling email open event:' + err);
                                            return;
                                        } else {
                                            self.log.debug('Handled email open event.');
                                            return;
                                        }
                                    });
                                }
                            } else if (type === 'click') {
                                obj.activityType = $$.m.ContactActivity.types.EMAIL_CLICKED;
                                objArray.push(obj);
                                if(value.msg.metadata && value.msg.metadata.campaignId) {
                                    var metadata = value.msg.metadata;
                                    self.log.debug('Using metadata', metadata);
                                    campaignManager.handleCampaignEmailClickEvent(metadata.accountId, metadata.campaignId, metadata.contactId, function(err, value){
                                        if(err) {
                                            self.log.error('Error handling email click event:' + err);
                                            return;
                                        } else {
                                            self.log.debug('Handled email click event.');
                                            return;
                                        }
                                    });
                                }
                            } else if (type === 'unsub') {
                                obj.activityType = $$.m.ContactActivity.types.EMAIL_UNSUB;
                                objArray.push(obj);
                            }
                        }

                    });
                }
            } catch(err) {
                self.log.debug('error parsing events: ' + err);
                msg = req.body;
            }

        }

        self.log.debug('<< filterMandrillEvents');
        next();
        //create contactActivities from events.
        _.each(objArray, function(value, key, list){
            var query = {};
            //TODO: get contactId from sender Email
            //query.accountId = value.id();

            query['details.emails.email'] = value.email;

            contactDao.findMany(query, $$.m.Contact, function(err, list){
                if(err) {
                    self.log.error('Error finding contacts by email: ' + err);
                } else if(!list || list.length < 1) {
                    self.log.warn('Contact could not be found for email address: ' + value.email);
                } else if(list.length > 1) {
                    self.log.warn('Too many contacts found for email address: ' + value.email);
                } else {
                    var contact = list[0];
                    var activity = new $$.m.ContactActivity({
                        accountId: contact.get('accountId'),
                        contactId: contact.id(),
                        activityType: value.activityType,
                        start: value.ts
                    });
                    contactActivityManager.createActivity(activity, function(err, value){});
                }
            });
        });
    },

    handleUnsubscribe: function(req, resp) {
        var self = this;
        self.log.debug('>> handleUnsubscribe');
        var msg;
        var objArray = [];
        if(req.body.mandrill_events) {
            try {
                msg = JSON.parse(req.body.mandrill_events);
                if(_.isArray(msg)) {
                    _.each(msg, function (value, key, list) {
                        var type = value.event;
                        var obj = {};
                        obj.email = value.msg.email;
                        obj.sender = value.msg.sender;
                        obj.ts = moment.utc(value.ts*1000).toDate();
                        obj.accountId = value.msg.metadata.accountId;
                        if (type === 'unsub') {
                            obj.activityType = $$.m.ContactActivity.types.EMAIL_UNSUB;
                            objArray.push(obj);
                        }
                    });
                }
            } catch(err) {
                self.log.debug('error parsing events: ' + err);
                msg = req.body;
            }
        }
        self.send200(resp);
        async.each(objArray, function(obj, callback){
            /*
             *  - Get contact by accountId and email address.
             *  - Mark the contact as "unsubscribed"
             *  - create contact activity
             */
            contactDao.findContactsByEmail(obj.accountId, obj.email, function(err, contactAry){
                if(err) {
                    self.log.error('Error finding contact for [' + obj.email + '] and [' + obj.accountId + ']');
                    return;
                } else if(contactAry === null || contactAry.length ===0){
                    //this might be a user and contact on main account
                    contactDao.findContactsByEmail(appConfig.mainAccountID, obj.email, function(err, contacts){
                        if(err || contacts === null || contacts.length===0) {
                            self.log.error('Error finding contact for [' + obj.email + '] and [' + appConfig.mainAccountID + ']');
                            return;
                        } else {
                            var contact = contacts[0];
                            contact.set('unsubscribed', true);
                            contactDao.saveOrUpdateContact(contact, function(err, updatedContact){
                                if(err) {
                                    self.log.error('Error marking contact unsubscribed', err);
                                    return;
                                } else {
                                    var activity = new $$.m.ContactActivity({
                                        accountId: contact.get('accountId'),
                                        contactId: contact.id(),
                                        activityType: obj.activityType,
                                        start: obj.ts
                                    });
                                    contactActivityManager.createActivity(activity, function(err, value){});
                                }
                            });
                        }
                    });
                } else {
                    var contact = contactAry[0];
                    contact.set('unsubscribed', true);
                    contactDao.saveOrUpdateContact(contact, function(err, updatedContact){
                        if(err) {
                            self.log.error('Error marking contact unsubscribed', err);
                            return;
                        } else {
                            var activity = new $$.m.ContactActivity({
                                accountId: contact.get('accountId'),
                                contactId: contact.id(),
                                activityType: obj.activityType,
                                start: obj.ts
                            });
                            contactActivityManager.createActivity(activity, function(err, value){});
                        }
                    });
                }
            });
        });
    },

    saveAnalyticEvent: function(req, res) {
        var self = this;
        self.log.debug('>> saveAnalyticEvent');
        analyticsManager.createEventFromSegment(req.body, function(err, event){
            self.send200(res);
            if(err) {
                self.log.error('Exception storing event: ' + err);
                self.log.error(JSON.stringify(req.body));
            } else {
                self.log.debug('<< saveAnalyticEvent');
            }
        });
    },

    showOk: function(req, res) {
        var self = this;
        self.sendResult(res, {'ok': 'ok'});
    },

    listEvents: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));

        self.checkPermission(req, self.sc.privs.VIEW_ANALYTICS, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(res);
            } else {
                var skip = req.query['skip'];
                var limit = req.query['limit'];
                self.log.debug('>> listEvents');
                analyticsManager.listEvents(accountId, limit, skip, function(err, eventList){
                    self.log.debug('<< listEvents');
                    self.sendResultOrError(res, err, eventList, "Error listing Analytic Events");
                });
            }
        });
    },

    createEvent: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));

        self.log.debug('>> createEvent');
        self.checkPermission(req, self.sc.privs.MODIFY_ANALYTICS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var event = req.body;
                event.accountId = accountId;

                analyticsManager.createEvent(event, function(err, value){
                    self.log.debug('<< createEvent');
                    self.sendResultOrError(res, err, value, "Error creating Analytic Event");
                });
            }
        });

    },

    getEvent: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        self.log.debug('>> getEvent');

        self.checkPermission(req, self.sc.privs.VIEW_ANALYTICS, function(err, isAllowed){
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var eventId = req.params.id;
                analyticsManager.getEvent(eventId, function(err, value){
                    self.log.debug('<< getEvent');
                    self.sendResultOrError(res, err, value, "Error retrieving Analytic Event");
                });
            }
        });

    },

    updateEvent: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));

        self.log.debug('>> updateEvent');
        self.checkPermission(req, self.sc.privs.MODIFY_ANALYTICS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var eventId = req.params.id;
                var event = req.body;
                event._id = eventId;

                analyticsManager.updateEvent(event, function(err, value){
                    self.log.debug('<< updateEvent');
                    self.sendResultOrError(res, err, value, "Error updating Analytic Event");
                });
            }
        });

    },

    deleteEvent: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));

        self.log.debug('>> deleteEvent');
        self.checkPermission(req, self.sc.privs.MODIFY_ANALYTICS, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var eventId = req.params.id;

                analyticsManager.removeEvent(eventId, function(err, value){
                    self.log.debug('<< deleteEvent');
                    self.sendResultOrError(res, err, value, "Error deleting Analytic Event");
                });
            }
        });

    },

    handleIntercomEvent: function(req, resp) {
        var self = this;
        /*
         {
         "type" : "notification_event",
         "app_id" : "b3st2skm",
         "data" : {
         "type" : "notification_event_data",
         "item" : {
         "type" : "conversation",
         "id" : "1105161660",
         "created_at" : "2015-08-19T02:56:20.000Z",
         "updated_at" : "2015-08-19T02:56:54.000Z",
         "user" : {
         "type" : "user",
         "id" : "55cba220201cd791040018f0",
         "name" : null,
         "email" : "kyle@kyle-miller.com"
         },
         "assignee" : {
         "type" : "admin",
         "id" : "99797",
         "name" : "Kyle Miller",
         "email" : "kyle@indigenous.io"
         },
         "conversation_message" : {
         "type" : "conversation_message",
         "id" : "10908581",
         "subject" : "",
         "body" : "<p>This is Kyle.  Testing a new conversation.</p>",
         "author" : {
         "_type" : "External::User",
         "anonymous" : false,
         "app_id" : 118120,
         "browser_locale" : "en",
         "company_ids" : [ ],
         "control_group_message_ids" : [ ],
         "created_at" : "2015-08-12T19:44:32.589Z",
         "custom_data" : { },
         "email" : "kyle@kyle-miller.com",
         "email_domain" : "kyle-miller.com",
         "events" : [ ],
         "follow_ids" : [ ],
         "geoip_data" : {
         "city_name" : "Sioux City",
         "continent_code" : "NA",
         "country_code2" : "US",
         "country_code3" : "USA",
         "country_name" : "United States",
         "id" : "55d3f0442b30b7e21b0047c1",
         "latitude" : 42.4632,
         "longitude" : -96.322,
         "postal_code" : "51106",
         "region_code" : "IA",
         "region_name" : "Iowa",
         "timezone" : "America/Chicago"
         },
         "id" : "55cba220201cd791040018f0",
         "ios_device_filter_values" : [ ],
         "ip" : "96.19.5.247",
         "last_heard_from_at" : "2015-08-19T02:56:20.537Z",
         "last_request_at" : "2015-08-19T02:56:04.829Z",
         "last_session_start" : "2015-08-19T02:56:04.829Z",
         "last_visited_domain" : "",
         "last_visited_page" : "",
         "last_visited_url" : "",
         "manual_tag_ids" : [ ],
         "nexus_config" : {
         "endpoints" : [ "https://nexus-websocket-a.intercom.io/pubsub/uc-69af6231-1193-4dba-9282-4e9d5e216a92", "https://nexus-websocket-b.intercom.io/pubsub/uc-69af6231-1193-4dba-9282-4e9d5e216a92" ],
         "retrieved_at" : 1439952964
         },
         "remote_created_at" : "2015-08-19T02:56:02.000Z",
         "role" : "user_role",
         "session_count" : 11,
         "session_count_android" : 0,
         "session_count_ios" : 0,
         "social_accounts" : { },
         "tag_ids" : [ "54d84a8e1312d3132c0009eb", "54d84a8d1312d3132c0009ea" ],
         "tracked_android_user" : false,
         "tracked_ios_user" : false,
         "ua" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36",
         "unsubscribed_from_emails" : false,
         "updated_at" : "2015-08-19T02:56:46.890Z",
         "user_agent_data" : {
         "id" : "55d17059ab7439f22f0195f4",
         "mobile" : false,
         "name" : "chrome",
         "os" : "OS X 10.10.4",
         "platform" : "Macintosh",
         "source" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36",
         "version" : "44.0.2403.155"
         },
         "user_event_summaries" : [ ],
         "user_events" : [ ],
         "user_id_or_email_uniqueness_constraint" : "118120_kyle@kyle-miller.com"
         },
         "attachments" : [ ]
         },
         "conversation_parts" : {
         "type" : "conversation_part.list",
         "conversation_parts" : [ ]
         },
         "open" : null,
         "read" : true,
         "links" : {
         "conversation_web" : "https://app.intercom.io/a/apps/b3st2skm/inbox/all/conversations/1105161660"
         }
         }
         },
         "links" : { },
         "id" : "notif_8c7fc630-4620-11e5-a239-abb6bfc89a02",
         "topic" : "conversation.user.created",
         "delivery_status" : null,
         "delivery_attempts" : 1,
         "delivered_at" : 0,
         "first_sent_at" : 1439954131,
         "created_at" : 1439954131,
         "self" : null,
         "metadata" : { }
         }
         */
        self.log.debug('>> handleIntercomEvent');
        var msg = null;
        if(req.body) {
            msg = JSON.stringify(req.body);
        }
        self.log.debug('msg:', msg);
        self.log.debug('<< handleIntercomEvent');
        self.send200(resp);
    },

    storeSessionInfo: function(req, res) {
        var self = this;
        var sessionEvent = new $$.m.SessionEvent(req.body);
        sessionEvent.set('session_id', req.params.id);
        //console.log('server_time '+ new Date().getTime() + ' session_start ' +sessionEvent.get('session_start'));
        sessionEvent.set('server_time', new Date().getTime());
        sessionEvent.set('server_time_dt', new Date());
        sessionEvent.set('ip_address', self.ip(req));
        //var geoInfo = self.geo(req);
        //sessionEvent.set('ip_geo_info', geoInfo);

        /*
         * set the fingerprint to be a string
         */
        sessionEvent.set('fingerprint', ''+sessionEvent.get('fingerprint'));

        sessionEvent.set('accountId', self.currentAccountId(req));

        var subdomainObj = urlUtils.getSubdomainFromRequest(req);
        if(subdomainObj.isMainApp===true) {
            sessionEvent.set('subdomain', 'main');
        } else {
            sessionEvent.set('subdomain', subdomainObj.subdomain);
        }



        analyticsManager.storeSessionEvent(sessionEvent, function(err){
            if(err) {
                self.log.error('Error saving session event: ' + err);
            }
        });

        return self.send200(res);
    },

    storePageInfo: function(req, res) {
        var self = this;
        var pageEvent = new $$.m.PageEvent(req.body);
        pageEvent.set('session_id', req.params.id);
        pageEvent.set('server_time', new Date().getTime());
        pageEvent.set('server_time_dt', new Date());

        pageEvent.set('accountId', self.currentAccountId(req));
        if(!self.currentAccountId) {
            self.log.warn('current account ID is null for request:', req);
        }

        analyticsManager.storePageEvent(pageEvent, function(err){
            if(err) {
                self.log.error('Error saving page event: ' + err);
            }
        });

        self.send200(res);
    },

    storePingInfo: function(req, res) {
        var self = this;
        var pingEvent = new $$.m.PingEvent(req.body);
        pingEvent.set('session_id', req.params.id);
        pingEvent.set('server_time', new Date().getTime());
        pingEvent.set('server_time_dt', new Date());
        analyticsManager.storePingEvent(pingEvent, function(err){
            if(err) {
                self.log.error('Error saving ping event: ' + err);
            }
        });

        self.send200(res);
    },

    runVisitorsReport: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> runVisitorsReport');
        var start = req.query.start;
        var end = req.query.end;


        if(!end) {
            end = moment().toDate();
        } else {
            end = moment(end).toDate();
        }
        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start).toDate();
        }
        analyticsManager.getVisitorReports(accountId, userId, start, end, function(err, value){
            self.log.debug(accountId, userId, '<< runVisitorsReport');
            self.sendResultOrError(resp, err, value, 'Error getting report');
        });
    },

    visitorLocationsReport: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> visitorLocationsReport');
        var start = req.query.start;
        var end = req.query.end;


        if(!end) {
            end = moment().toDate();
        } else {
            end = moment(end).toDate();
        }
        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start).toDate();
        }

        analyticsManager.getVisitorLocationsReport(accountId, userId, start, end, function(err, value){
            self.log.debug(accountId, userId, '<< visitorLocationsReport');
            self.sendResultOrError(resp, err, value, 'Error getting report');
        });
    },

    visitorDeviceReport: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> visitorDeviceReport');
        var start = req.query.start;
        var end = req.query.end;


        if(!end) {
            end = moment().toDate();
        } else {
            end = moment(end, 'MM/DD/YYYY').toDate();
        }
        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'MM/DD/YYYY').toDate();
        }

        analyticsManager.getVisitorDeviceReport(accountId, userId, start, end, function(err, value){
            self.log.debug(accountId, userId, '<< visitorDeviceReport');
            self.sendResultOrError(resp, err, value, 'Error getting report');
        });
    },

    userReport: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> userReport');
        var start = req.query.start;
        var end = req.query.end;


        if(!end) {
            end = moment().toDate();
        } else {
            end = moment(end, 'MM/DD/YYYY').toDate();
        }
        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'MM/DD/YYYY').toDate();
            self.log.debug('start:', start);
        }

        var dateDiff = moment(start).diff(end, 'days');

        var previousStart = moment(start).add(dateDiff, 'days').toDate();
        var previousEnd = start;
        self.log.debug('dateDiff:', dateDiff);
        self.log.debug('start:', start);
        self.log.debug('end:', end);
        self.log.debug('previousStart:', previousStart);
        self.log.debug('previousEnd:', previousEnd);

        analyticsManager.getUserReport(accountId, userId, start, end, previousStart, previousEnd, function(err, value){
            self.log.debug(accountId, userId, '<< userReport');
            self.sendResultOrError(resp, err, value, 'Error getting report');
        });
    },

    pageviewsReport: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> pageviewsReport');
        var start = req.query.start;
        var end = req.query.end;


        if(!end) {
            end = moment().toDate();
        } else {
            end = moment(end, 'MM/DD/YYYY').toDate();
        }
        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'MM/DD/YYYY').toDate();
            self.log.debug('start:', start);
        }

        var dateDiff = moment(start).diff(end, 'days');

        var previousStart = moment(start).add(dateDiff, 'days').toDate();
        var previousEnd = start;
        self.log.debug('dateDiff:', dateDiff);
        self.log.debug('start:', start);
        self.log.debug('end:', end);
        self.log.debug('previousStart:', previousStart);
        self.log.debug('previousEnd:', previousEnd);

        analyticsManager.getPageViewsReport(accountId, userId, start, end, previousStart, previousEnd, function(err, value){
            self.log.debug(accountId, userId, '<< pageviewsReport');
            self.sendResultOrError(resp, err, value, 'Error getting report');
        });
    },

    sessionsReport: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> sessionsReport');
        var start = req.query.start;
        var end = req.query.end;


        if(!end) {
            end = moment().toDate();
        } else {
            end = moment(end, 'MM/DD/YYYY').toDate();
        }
        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'MM/DD/YYYY').toDate();
            self.log.debug('start:', start);
        }

        var dateDiff = moment(start).diff(end, 'days');

        var previousStart = moment(start).add(dateDiff, 'days').toDate();
        var previousEnd = start;
        self.log.debug('dateDiff:', dateDiff);
        self.log.debug('start:', start);
        self.log.debug('end:', end);
        self.log.debug('previousStart:', previousStart);
        self.log.debug('previousEnd:', previousEnd);

        analyticsManager.getSessionsReport(accountId, userId, start, end, previousStart, previousEnd, function(err, value){
            self.log.debug(accountId, userId, '<< sessionsReport');
            self.sendResultOrError(resp, err, value, 'Error getting report');
        });
    },

    sessionLengthReport: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> sessionLengthReport');
        var start = req.query.start;
        var end = req.query.end;


        if(!end) {
            end = moment().toDate();
        } else {
            end = moment(end, 'MM/DD/YYYY').toDate();
        }
        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'MM/DD/YYYY').toDate();
            self.log.debug('start:', start);
        }
        var dateDiff = moment(start).diff(end, 'days');

        var previousStart = moment(start).add(dateDiff, 'days').toDate();
        var previousEnd = start;
        self.log.debug('dateDiff:', dateDiff);
        self.log.debug('start:', start);
        self.log.debug('end:', end);
        self.log.debug('previousStart:', previousStart);
        self.log.debug('previousEnd:', previousEnd);

        analyticsManager.sessionLengthReport(accountId, userId, start, end, previousStart, previousEnd, function(err, value){
            self.log.debug(accountId, userId, '<< sessionLengthReport');
            self.sendResultOrError(resp, err, value, 'Error getting report');
        });
        //sessionLengthReport
    },

    trafficSourcesReport: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> trafficSourcesReport');
        var start = req.query.start;
        var end = req.query.end;


        if(!end) {
            end = moment().toDate();
        } else {
            end = moment(end, 'MM/DD/YYYY').toDate();
        }
        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'MM/DD/YYYY').toDate();
            self.log.debug('start:', start);
        }
        analyticsManager.trafficSourcesReport(accountId, userId, start, end,function(err, value){
            self.log.debug(accountId, userId, '<< trafficSourcesReport');
            self.sendResultOrError(resp, err, value, 'Error getting report');
        });
    },

    newVsReturningReport: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> newVsReturningReport');
        var start = req.query.start;
        var end = req.query.end;


        if(!end) {
            end = moment().toDate();
        } else {
            end = moment(end, 'MM/DD/YYYY').toDate();
        }
        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'MM/DD/YYYY').toDate();
            self.log.debug('start:', start);
        }
        analyticsManager.newVsReturningReport(accountId, userId, start, end,function(err, value){
            self.log.debug(accountId, userId, '<< newVsReturningReport');
            self.sendResultOrError(resp, err, value, 'Error getting report');
        });
    },

    pageAnalyticsReport: function(req, resp){
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> pageAnalyticsReport');
        var start = req.query.start;
        var end = req.query.end;


        if(!end) {
            end = moment().toDate();
        } else {
            end = moment(end, 'MM/DD/YYYY').toDate();
        }
        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'MM/DD/YYYY').toDate();
            self.log.debug('start:', start);
        }
        analyticsManager.pageAnalyticsReport(accountId, userId, start, end,function(err, value){
            self.log.debug(accountId, userId, '<< pageAnalyticsReport');
            self.sendResultOrError(resp, err, value, 'Error getting report');
        });
    },

    allReports: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> allReports');
        var start = req.query.start;
        var end = req.query.end;


        if(!end) {
            end = moment().toDate();
        } else {
            end = moment(end).toDate();
        }


        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start).toDate();
            self.log.debug('start:', start);
        }
        var dateDiff = moment(start).diff(end, 'days');

        var previousStart = moment(start).add(dateDiff, 'days').toDate();
        var previousEnd = start;
        self.log.debug('dateDiff:', dateDiff);
        self.log.debug('start:', start);
        self.log.debug('end:', end);
        self.log.debug('previousStart:', previousStart);
        self.log.debug('previousEnd:', previousEnd);

        async.parallel({
            visitorReports: function(callback){
                analyticsManager.getVisitorReports(accountId, userId, start, end, callback);
            },
            visitorLocationsReport: function(callback) {
                analyticsManager.getVisitorLocationsReport(accountId, userId, start, end, callback);
            },
            visitorDeviceReport: function(callback) {
                analyticsManager.getVisitorDeviceReport(accountId, userId, start, end, callback);
            },
            userReport: function(callback) {
                analyticsManager.getUserReport(accountId, userId, start, end, previousStart, previousEnd, callback);
            },
            pageViewsReport: function(callback) {
                analyticsManager.getPageViewsReport(accountId, userId, start, end, previousStart, previousEnd, callback);
            },
            sessionsReport: function(callback) {
                analyticsManager.getSessionsReport(accountId, userId, start, end, previousStart, previousEnd, callback);
            },
            sessionLengthReport: function(callback) {
                analyticsManager.sessionLengthReport(accountId, userId, start, end, previousStart, previousEnd, callback);
            },
            trafficSourcesReport: function(callback) {
                analyticsManager.trafficSourcesReport(accountId, userId, start, end, callback);
            },
            newVsReturningReport: function(callback) {
                analyticsManager.newVsReturningReport(accountId, userId, start, end, callback);
            },
            pageAnalyticsReport: function(callback) {
                analyticsManager.pageAnalyticsReport(accountId, userId, start, end, callback);
            }
        }, function(err, results){
            self.log.debug(accountId, userId, '<< allReports');
            self.sendResultOrError(resp, err, results, 'Error getting report');
        });
    }
});

module.exports = new api();

