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
var async = require('async');
var contactDao = require('../../dao/contact.dao');
var contactActivityManager = require('../../contactactivities/contactactivity_manager');
var urlUtils = require('../../utils/urlutils');
var campaignManager = require('../../campaign/campaign_manager');
var appConfig = require('../../configs/app.config');
var accountDao = require('../../dao/account.dao');
var moment = require('moment');
var emailMessageManager = require('../../emailmessages/emailMessageManager');
var organizationDao = require('../../organizations/dao/organization.dao');
require('superagent');
var sqsUtil = require('../../utils/sqsUtil');


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

        app.post(this.url('sendgrid/event'), this.filterSendgridEvents.bind(this), this.handleSendgridEvent.bind(this));
        app.get(this.url('sendgrid/event'), this.testSendgridEvent.bind(this));
        app.post(this.url('stripe/event'), this.sendStripeEventToKeen.bind(this));

        app.post(this.url('intercom/event'), this.handleIntercomEvent.bind(this));

        //visit
        app.post(this.url('session/:id/sessionStart'), this.setup.bind(this), this.storeSessionInfo.bind(this));
        app.post(this.url('session/:id/pageStart'), this.setup.bind(this), this.storePageInfo.bind(this));
        app.post(this.url('session/:id/ping'), this.setup.bind(this), this.storePingInfo.bind(this));

        app.get(this.url('reports/visitors'), this.isAuthAndSubscribedApi.bind(this), this.runVisitorsReport.bind(this));
        app.get(this.url('reports/visitorLocations'), this.isAuthAndSubscribedApi.bind(this), this.visitorLocationsReport.bind(this));
        app.get(this.url('reports/visitorLocationsByCountry'), this.isAuthAndSubscribedApi.bind(this), this.visitorLocationsReportByCountry.bind(this));
        app.get(this.url('reports/visitorDevices'), this.isAuthAndSubscribedApi.bind(this), this.visitorDeviceReport.bind(this));
        app.get(this.url('reports/users'), this.isAuthAndSubscribedApi.bind(this), this.userReport.bind(this));
        app.get(this.url('reports/pageviews'), this.isAuthAndSubscribedApi.bind(this), this.pageviewsReport.bind(this));
        app.get(this.url('reports/sessions'), this.isAuthAndSubscribedApi.bind(this), this.sessionsReport.bind(this));
        app.get(this.url('reports/sessionLength'), this.isAuthAndSubscribedApi.bind(this), this.sessionLengthReport.bind(this));
        app.get(this.url('reports/trafficSources'), this.isAuthAndSubscribedApi.bind(this), this.trafficSourcesReport.bind(this));
        app.get(this.url('reports/newVsReturning'), this.isAuthAndSubscribedApi.bind(this), this.newVsReturningReport.bind(this));
        app.get(this.url('reports/pageAnalytics'), this.isAuthAndSubscribedApi.bind(this), this.pageAnalyticsReport.bind(this));
        app.get(this.url('reports/userAgents'), this.isAuthApi.bind(this), this.getUserAgentsReport.bind(this));
        app.get(this.url('reports/revenue'), this.isAuthAndSubscribedApi.bind(this), this.getRevenue.bind(this));
        app.get(this.url('reports/404s'), this.isAuthAndSubscribedApi.bind(this), this.get404s.bind(this));
        app.get(this.url('reports/daily404s'), this.isAuthAndSubscribedApi.bind(this), this.getDaily404s.bind(this));
        app.get(this.url('reports/all'), this.isAuthAndSubscribedApi.bind(this), this.allReports.bind(this));
        app.get(this.url('reports/topSearches'), this.isAuthAndSubscribedApi.bind(this), this.topSearches.bind(this));
        app.get(this.url('reports/mostActiveUsers'), this.isAuthAndSubscribedApi.bind(this), this.mostActiveUsers.bind(this));

        app.get(this.url('admin/reports/dau'), this.isAuthAndSubscribedApi.bind(this), this.getDailyActiveUsers.bind(this));
        app.get(this.url('admin/reports/visitors'), this.isAuthAndSubscribedApi.bind(this), this.runAdminVisitorsReport.bind(this));
        app.get(this.url('admin/reports/visitorLocations'), this.isAuthAndSubscribedApi.bind(this), this.adminVisitorLocationsReport.bind(this));
        app.get(this.url('admin/reports/visitorLocationsByCountry'), this.isAuthAndSubscribedApi.bind(this), this.adminVisitorLocationsReportByCountry.bind(this));
        app.get(this.url('admin/reports/visitorDevices'), this.isAuthAndSubscribedApi.bind(this), this.adminVisitorDeviceReport.bind(this));
        app.get(this.url('admin/reports/users'), this.isAuthAndSubscribedApi.bind(this), this.adminUserReport.bind(this));
        app.get(this.url('admin/reports/pageviews'), this.isAuthAndSubscribedApi.bind(this), this.adminPageviewsReport.bind(this));
        app.get(this.url('admin/reports/sessions'), this.isAuthAndSubscribedApi.bind(this), this.adminSessionsReport.bind(this));
        app.get(this.url('admin/reports/sessionLength'), this.isAuthAndSubscribedApi.bind(this), this.adminSessionLengthReport.bind(this));
        app.get(this.url('admin/reports/trafficSources'), this.isAuthAndSubscribedApi.bind(this), this.adminTrafficSourcesReport.bind(this));
        app.get(this.url('admin/reports/newVsReturning'), this.isAuthAndSubscribedApi.bind(this), this.adminNewVsReturningReport.bind(this));
        app.get(this.url('admin/reports/pageAnalytics'), this.isAuthAndSubscribedApi.bind(this), this.adminPageAnalyticsReport.bind(this));
        app.get(this.url('admin/reports/userAgents'), this.isAuthApi.bind(this), this.getAdminUserAgentsReport.bind(this));
        app.get(this.url('admin/reports/revenue'), this.isAuthAndSubscribedApi.bind(this), this.getAdminRevenue.bind(this));
        app.get(this.url('admin/reports/os'), this.isAuthAndSubscribedApi.bind(this), this.getAdminOSReport.bind(this));
        app.get(this.url('admin/reports/emails'), this.isAuthAndSubscribedApi.bind(this), this.getAdminEmailsReport.bind(this));
        app.get(this.url('admin/reports/all'), this.isAuthAndSubscribedApi.bind(this), this.allAdminReports.bind(this));
        app.get(this.url('customer/reports/all'), this.isAuthAndSubscribedApi.bind(this), this.allCustomerReports.bind(this));

        app.get(this.url('live'), this.isAuthAndSubscribedApi.bind(this), this.getLiveVisitors.bind(this));
        app.get(this.url('liveDetails'), this.isAuthAndSubscribedApi.bind(this), this.getLiveVisitorDetails.bind(this));
        app.get(this.url('admin/liveDetails'), this.isAuthAndSubscribedApi.bind(this), this.getAdminLiveVisitorDetails.bind(this));
        app.get(this.url('admin/live'), this.isAuthAndSubscribedApi.bind(this), this.getAdminLiveVisitors.bind(this));
        app.get(this.url('admin/pageViewPerformance'), this.isAuthAndSubscribedApi.bind(this), this.getPageViewPerformance.bind(this));
        app.get(this.url('admin/404s'), this.isAuthAndSubscribedApi.bind(this), this.getAdmin404s.bind(this));
        app.get(this.url('admin/reports/daily404s'), this.isAuthAndSubscribedApi.bind(this), this.getAdminDaily404s.bind(this));

        app.get(this.url('traffic/list/fingerprint'), this.isAuthAndSubscribedApi.bind(this), this.getTrafficFingerprints.bind(this));

    },


    /**
     * This was previously used to send stripe events to Keen.  We are no longer querying Keen for this data.
     * @param req
     * @param resp
     */
    sendStripeEventToKeen: function(req, resp) {
        var self = this;
        //self.log.debug('>> sendStripeEventToKeen', req.body);
        self.send200(resp);
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
        //break up the array into chunks to ensure we don't go over a size limit
        var arrayOfEventArrays = [];
        var i, j, chunk = 100;
        for(i=0,j=events.length; i<j; i+= chunk) {
            arrayOfEventArrays.push(events.slice(i, i+chunk));
        }
        self.log.debug('breaking into '+ arrayOfEventArrays.length + ' chunks');
        if(appConfig.nonProduction) {
            var queueUrl = 'https://sqs.us-west-1.amazonaws.com/213805526570/test-analytics_sendgrid_q';
            async.eachSeries(arrayOfEventArrays, function(ary, cb){
                sqsUtil.sendMessage(queueUrl, null, ary, function(err, value){
                    if(err) {
                        self.log.error('Error from sqs:', err);
                    } else {
                        self.log.debug('Response from SQS:', value);
                    }
                    cb();
                });

            }, function(err){
                if(err) {
                    self.log.error('Error sending events:', err);
                } else {
                    self.log.debug('<< handleSendgridEvent');
                }
            });


        } else if(appConfig.nonProduction === false){
            var queueUrl = 'https://sqs.us-west-1.amazonaws.com/213805526570/analytics_sendgrid_q';
            async.eachSeries(arrayOfEventArrays, function(ary, cb){
                sqsUtil.sendMessage(queueUrl, null, ary, function(err, value){
                    if(err) {
                        self.log.error('Error from sqs:', err);
                    } else {
                        self.log.debug('Response from SQS:', value);
                    }
                    cb();
                });
            }, function(err){
                if(err) {
                    self.log.error('Error sending events:', err);
                } else {
                    self.log.debug('<< handleSendgridEvent');
                }
            });
        } else {
            //Leaving this here for now in case we need to quickly switch back.  KJM 6/27
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

                if(obj.accountId) {
                    try {
                        obj.accountId = parseInt(obj.accountId);
                    } catch(e){}
                }
                if(obj.contactId) {
                    try {
                        obj.contactId = parseInt(obj.contactId);
                    } catch(e){}
                }

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
                            emailMessageManager.markMessageClicked(event.emailmessageId, event, function(err, value, addOpenEvent){
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
                                        if(addOpenEvent) {
                                            if(campaignUpdates.opened) {
                                                campaignUpdates.opened = campaignUpdates.opened + 1;
                                            } else {
                                                campaignUpdates.opened = 1;
                                                deferredUpdates[event.campaignId] = campaignUpdates;
                                            }
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
                    emailMessageManager.handleUnsubscribe(event, function(err, value){});
                    emailMessageManager.isMessageUnsubscribed(event.emailmessageId, function(err, value){
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
                            emailMessageManager.markMessageUnsubscribed(event.emailmessageId, event, function(err, value){
                                savedEvents.push(value);
                                obj.sender = value.get('sender');
                                obj.activityType = $$.m.ContactActivity.types.EMAIL_UNSUB;
                                contactActivitiesJSON.push(obj);
                                var accountId = event.accountId ? parseInt(event.accountId) : event.accountId
                                contactDao.findContactsByEmail(accountId, event.email, function(err, contactAry){
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
                                            }
                                        });
                                    }
                                });
                                if(event.campaignId) {
                                    var campaignUpdates = deferredUpdates[event.campaignId] || {};
                                    if(campaignUpdates.unsubscribes) {
                                        campaignUpdates.unsubscribes = campaignUpdates.unsubscribes + 1;
                                    } else {
                                        campaignUpdates.unsubscribes = 1;
                                        deferredUpdates[event.campaignId] = campaignUpdates;
                                    }
                                }
                                cb();
                            });
                        }
                    })


                } else if (event.event === 'bounce'){
                    contactDao.setBouncedTag(event.accountId, null, event.contactId, function(err, value){});
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
                } else if(event.event === 'dropped'){
                    if(event.reason === 'Bounced Address') {
                        contactDao.setBouncedTag(event.accountId, null, event.contactId, function(err, value){});
                    }
                    emailMessageManager.markMessageDropped(event.emailmessageId, event, function(err, value){
                        if(value) {
                            savedEvents.push(value);
                            obj.sender = value.get('sender');
                            obj.activityType = $$.m.ContactActivity.types.EMAIL_BOUNCED;
                            contactActivitiesJSON.push(obj);
                            if(event.campaignId) {
                                var campaignUpdates = deferredUpdates[event.campaignId] || {};
                                if(campaignUpdates.dropped) {
                                    campaignUpdates.dropped = campaignUpdates.dropped + 1;
                                } else {
                                    campaignUpdates.dropped = 1;
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
                            if(err || !campaign) {
                                self.log.error('Could not update campaign with key [' + key + ']:', err);
                                cb();
                            } else {

                                var accountId = campaign.get('accountId');
                                var campaignId = campaign.id();
                                var userId = 0;
                                campaignManager.atomicUpdateCampaignStatistics(accountId, campaignId, updates, userId, cb);
                            }
                        });
                    }, function(err){
                        if (err) {
                            self.log.error('Error updating statistics:', err);
                        }
                        self.log.debug('<< handleSendgridEvent');
                    });

                });
            });
        }


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

        if(subdomainObj.isOrgRoot === true) {
            sessionEvent.set('orgDomain', subdomainObj.orgDomain);
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
        pageEvent.set('ip_address', self.ip(req));
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
        pingEvent.set('ip_address', self.ip(req));
        pingEvent.set('accountId', self.currentAccountId(req));
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
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }


        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }
        analyticsManager.getVisitorReports(accountId, userId, start, end, false, null, function(err, value){
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
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }


        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }

        analyticsManager.getVisitorLocationsReport(accountId, userId, start, end, false, null, function(err, value){
            self.log.debug(accountId, userId, '<< visitorLocationsReport');
            self.sendResultOrError(resp, err, value, 'Error getting report');
        });
    },

    visitorLocationsReportByCountry: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> visitorLocationsReport (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;


        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }


        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }

        analyticsManager.getVisitorLocationsByCountryReport(accountId, userId, start, end, false, null, function(err, results){
            self.log.debug(accountId, userId, '<< visitorLocationsReport');
            self.sendResultOrError(resp, err, results, 'Error getting report');
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
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }


        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }

        analyticsManager.getVisitorDeviceReport(accountId, userId, start, end, false, null, function(err, value){
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
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }


        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }

        var dateDiff = moment(start).diff(end, 'days');

        var previousStart = moment(start).add(dateDiff, 'days').toDate();
        var previousEnd = start;
        self.log.trace('dateDiff:', dateDiff);
        self.log.trace('start:', start);
        self.log.trace('end:', end);
        self.log.trace('previousStart:', previousStart);
        self.log.trace('previousEnd:', previousEnd);

        analyticsManager.getUserReport(accountId, userId, start, end, previousStart, previousEnd, false, null, function(err, value){
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
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }


        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }

        var dateDiff = moment(start).diff(end, 'days');

        var previousStart = moment(start).add(dateDiff, 'days').toDate();
        var previousEnd = start;
        self.log.trace('dateDiff:', dateDiff);
        self.log.trace('start:', start);
        self.log.trace('end:', end);
        self.log.trace('previousStart:', previousStart);
        self.log.trace('previousEnd:', previousEnd);

        analyticsManager.getPageViewsReport(accountId, userId, start, end, previousStart, previousEnd, false, null, function(err, value){
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
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }


        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }

        var dateDiff = moment(start).diff(end, 'days');

        var previousStart = moment(start).add(dateDiff, 'days').toDate();
        var previousEnd = start;
        self.log.trace('dateDiff:', dateDiff);
        self.log.trace('start:', start);
        self.log.trace('end:', end);
        self.log.trace('previousStart:', previousStart);
        self.log.trace('previousEnd:', previousEnd);

        analyticsManager.getSessionsReport(accountId, userId, start, end, previousStart, previousEnd, false, null, function(err, value){
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
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }


        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
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

        analyticsManager.sessionLengthReport(accountId, userId, start, end, previousStart, previousEnd, false, null, function(err, value){
            self.log.debug(accountId, userId, '<< sessionLengthReport');
            self.sendResultOrError(resp, err, value, 'Error getting report');
        });
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
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }


        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }
        analyticsManager.trafficSourcesReport(accountId, userId, start, end, false, null, function(err, value){
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
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }


        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }
        analyticsManager.newVsReturningReport(accountId, userId, start, end, false, null, function(err, value){
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
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }


        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }
        analyticsManager.pageAnalyticsReport(accountId, userId, start, end, false, null, function(err, value){
            self.log.debug(accountId, userId, '<< pageAnalyticsReport');
            self.sendResultOrError(resp, err, value, 'Error getting report');
        });
    },

    getUserAgentsReport: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> getUserAgentsReport');
        var start = req.query.start;
        var end = req.query.end;


        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }


        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }
        analyticsManager.getUserAgentReport(accountId, userId, start, end, false, null, function(err, value){
            self.log.debug(accountId, userId, '<< getUserAgentsReport');
            self.sendResultOrError(resp, err, value, 'Error getting report');
        });
    },

    getRevenue: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> getRevenue (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;

        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }

        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }

        var dateDiff = moment(start).diff(end, 'days');

        var previousStart = moment(start).add(dateDiff, 'days').toDate();
        var previousEnd = start;

        analyticsManager.getRevenueByMonth(accountId, userId, start, end, previousStart, previousEnd, false, null, function(err, results){
            self.log.debug(accountId, userId, '<< getRevenue');
            self.sendResultOrError(resp, err, results, 'Error getting report');
        });
    },

    get404s: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> get404s (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;

        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }

        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }

        analyticsManager.get404sReport(accountId, userId, start, end, false, null, function(err, results){
            self.log.debug(accountId, userId, '<< get404s');
            self.sendResultOrError(resp, err, results, 'Error getting report');
        });
    },

    topSearches: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> topSearches (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;

        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }

        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }

        analyticsManager.getTopSearches(accountId, userId, start, end, false, null, function(err, results){
            self.log.debug(accountId, userId, '<< topSearches');
            self.sendResultOrError(resp, err, results, 'Error getting report');
        });
    },

    mostActiveUsers: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> mostActiveUsers (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;

        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }

        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }

        analyticsManager.getMostActiveUsers(accountId, userId, start, end, false, null, function(err, results){
            self.log.debug(accountId, userId, '<< mostActiveUsers');
            self.sendResultOrError(resp, err, results, 'Error getting report');
        });
    },

    getDaily404s: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> getDaily404s (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;

        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }

        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }

        analyticsManager.get404sByDateAndPathReport(accountId, userId, start, end, false, null, function(err, results){
            self.log.debug(accountId, userId, '<< getDaily404s');
            self.sendResultOrError(resp, err, results, 'Error getting report');
        });

    },

    allReports: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> allReports (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;


        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }


        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
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
        var accountIdParam = req.query.accountId;
        if(accountId === appConfig.mainAccountID && accountIdParam) {
            self.log.debug('Viewing analytics as account ' + accountIdParam);
            accountId = parseInt(accountIdParam);
        }

        async.parallel({
            visitorReports: function(callback){
                analyticsManager.getVisitorReports(accountId, userId, start, end, false, null, callback);
            },
            visitorLocationsReport: function(callback) {
                analyticsManager.getVisitorLocationsReport(accountId, userId, start, end, false, null, callback);
            },
            visitorLocationsByCountryReport: function(callback) {
                analyticsManager.getVisitorLocationsByCountryReport(accountId, userId, start, end, false, null, callback);
            },
            visitorDeviceReport: function(callback) {
                analyticsManager.getVisitorDeviceReport(accountId, userId, start, end, false, null, callback);
            },
            userReport: function(callback) {
                analyticsManager.getUserReport(accountId, userId, start, end, previousStart, previousEnd, false, null, callback);
            },
            pageViewsReport: function(callback) {
                analyticsManager.getPageViewsReport(accountId, userId, start, end, previousStart, previousEnd, false, null, callback);
            },
            sessionsReport: function(callback) {
                analyticsManager.getSessionsReport(accountId, userId, start, end, previousStart, previousEnd, false, null, callback);
            },
            sessionLengthReport: function(callback) {
                analyticsManager.sessionLengthReport(accountId, userId, start, end, previousStart, previousEnd, false, null, callback);
            },
            trafficSourcesReport: function(callback) {
                analyticsManager.trafficSourcesReport(accountId, userId, start, end, false, null, callback);
            },
            newVsReturningReport: function(callback) {
                analyticsManager.newVsReturningReport(accountId, userId, start, end, false, null, callback);
            },
            pageAnalyticsReport: function(callback) {
                analyticsManager.pageAnalyticsReport(accountId, userId, start, end, false, null, callback);
            },
            userAgents: function(callback) {
                analyticsManager.getUserAgentReport(accountId, userId, start, end, false, null, callback);
            },
            revenueReport: function(callback) {
                analyticsManager.getRevenueByMonth(accountId, userId, start, end, previousStart, previousEnd, false, null, callback);
            }
        }, function(err, results){
            self.log.debug(accountId, userId, '<< allReports');
            self.sendResultOrError(resp, err, results, 'Error getting report');
        });
    },

    allCustomerReports: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> allCustomerReports (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;


        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }


        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
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
        var accountIdParam = req.query.accountId;
        if(accountId === appConfig.mainAccountID && accountIdParam) {
            self.log.debug('Viewing analytics as account ' + accountIdParam);
            accountId = parseInt(accountIdParam);
        }

        async.parallel({
            visitorReports: function(callback){
                analyticsManager.getVisitorReports(accountId, userId, start, end, false, null, callback);
            },
            visitorLocationsReport: function(callback) {
                analyticsManager.getVisitorLocationsReport(accountId, userId, start, end, false, null, callback);
            },
            visitorLocationsByCountryReport: function(callback) {
                analyticsManager.getVisitorLocationsByCountryReport(accountId, userId, start, end, false, null, callback);
            },
            visitorDeviceReport: function(callback) {
                analyticsManager.getVisitorDeviceReport(accountId, userId, start, end, false, null, callback);
            },
            userReport: function(callback) {
                analyticsManager.getUserReport(accountId, userId, start, end, previousStart, previousEnd, false, null, callback);
            },
            pageViewsReport: function(callback) {
                analyticsManager.getPageViewsReport(accountId, userId, start, end, previousStart, previousEnd, false, null, callback);
            },
            sessionsReport: function(callback) {
                analyticsManager.getSessionsReport(accountId, userId, start, end, previousStart, previousEnd, false, null, callback);
            },
            sessionLengthReport: function(callback) {
                analyticsManager.sessionLengthReport(accountId, userId, start, end, previousStart, previousEnd, false, null, callback);
            },
            trafficSourcesReport: function(callback) {
                analyticsManager.trafficSourcesReport(accountId, userId, start, end, false, null, callback);
            },
            newVsReturningReport: function(callback) {
                analyticsManager.newVsReturningReport(accountId, userId, start, end, false, null, callback);
            },
            pageAnalyticsReport: function(callback) {
                analyticsManager.pageAnalyticsReport(accountId, userId, start, end, false, null, callback);
            },
            userAgents: function(callback) {
                analyticsManager.getUserAgentReport(accountId, userId, start, end, false, null, callback);
            },
            revenueReport: function(callback) {
                analyticsManager.getRevenueByMonth(accountId, userId, start, end, previousStart, previousEnd, false, null, callback);
            },
            emailsReport: function(callback) {
                analyticsManager.getCampaignEmailsReport(accountId, userId, start, end, previousStart, previousEnd, false, null, callback);
            },
            four04sReport: function(callback) {
                analyticsManager.get404sReport(accountId, userId, start, end, false, null, callback);
            },
            daily404sReport:function(callback) {
                analyticsManager.get404sByDateAndPathReport(accountId, userId, start, end, false, null, callback);
            }
        }, function(err, results){
            self.log.debug(accountId, userId, '<< allCustomerReports');
            self.sendResultOrError(resp, err, results, 'Error getting report');
        });
    },

    getDailyActiveUsers: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> getDailyActiveUsers (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;


        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }


        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }
        if(accountId === appConfig.mainAccountID) {
            analyticsManager.getDailyActiveUsers(accountId, userId, start, end, null, function(err, results){
                self.log.debug(accountId, userId, '<< getDailyActiveUsers');
                self.sendResultOrError(resp, err, results, 'Error getting report');
            });
        } else if(urlUtils.getSubdomainFromRequest(req).isOrgRoot === true){
            /*
             * Check if we are a org admin
             */
            organizationDao.getByOrgDomain(urlUtils.getSubdomainFromRequest(req).orgDomain, function(err, organization){
                if(err || !organization) {
                    self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
                    return self.send403(resp);
                } else {
                    if(organization.get('adminAccount') === accountId) {
                        analyticsManager.getDailyActiveUsers(accountId, userId, start, end, organization.id(), function(err, results){
                            self.log.debug(accountId, userId, '<< getDailyActiveUsers');
                            self.sendResultOrError(resp, err, results, 'Error getting report');
                        });
                    } else {
                        self.log.warn(accountId, userId, 'Non-orgAdmin account attempted to call admin reports!');
                        return self.send403(resp);
                    }
                }
            });
        } else {
            organizationDao.getByOrgDomain("securematics", function(err, organization){
                if(err || !organization) {
                    self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
                    return self.send403(resp);
                } else {
                    if(organization.get('adminAccount') === accountId) {
                        analyticsManager.getDailyActiveUsers(accountId, userId, start, end, organization.id(), function(err, results){
                            self.log.debug(accountId, userId, '<< getDailyActiveUsers');
                            self.sendResultOrError(resp, err, results, 'Error getting report');
                        });
                    } else {
                        self.log.warn(accountId, userId, 'Non-orgAdmin account attempted to call admin reports!');
                        return self.send403(resp);
                    }
                }
            });
        }

    },

    runAdminVisitorsReport: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> runAdminVisitorsReport (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;


        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }


        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }
        if(accountId === appConfig.mainAccountID) {
            analyticsManager.getVisitorReports(accountId, userId, start, end, true, null, function(err, results){
                self.log.debug(accountId, userId, '<< runAdminVisitorsReport');
                self.sendResultOrError(resp, err, results, 'Error getting report');
            });
        } else if(urlUtils.getSubdomainFromRequest(req).isOrgRoot === true){
            /*
             * Check if we are a org admin
             */
            organizationDao.getByOrgDomain(urlUtils.getSubdomainFromRequest(req).orgDomain, function(err, organization){
                if(err || !organization) {
                    self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
                    return self.send403(resp);
                } else {
                    if(organization.get('adminAccount') === accountId) {
                        analyticsManager.getVisitorReports(accountId, userId, start, end, true, organization.id(), function(err, results){
                            self.log.debug(accountId, userId, '<< runAdminVisitorsReport');
                            self.sendResultOrError(resp, err, results, 'Error getting report');
                        });
                    } else {
                        self.log.warn(accountId, userId, 'Non-orgAdmin account attempted to call admin reports!');
                        return self.send403(resp);
                    }
                }
            });
        } else {
            self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
            return self.send403(resp);
        }

    },

    adminVisitorLocationsReport: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> adminVisitorLocationsReport (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;


        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }


        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }
        if(accountId === appConfig.mainAccountID) {
            analyticsManager.getVisitorLocationsReport(accountId, userId, start, end, true, null, function(err, results){
                self.log.debug(accountId, userId, '<< adminVisitorLocationsReport');
                self.sendResultOrError(resp, err, results, 'Error getting report');
            });
        } else if(urlUtils.getSubdomainFromRequest(req).isOrgRoot === true){
            /*
             * Check if we are a org admin
             */
            organizationDao.getByOrgDomain(urlUtils.getSubdomainFromRequest(req).orgDomain, function(err, organization){
                if(err || !organization) {
                    self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
                    return self.send403(resp);
                } else {
                    if(organization.get('adminAccount') === accountId) {
                        analyticsManager.getVisitorLocationsReport(accountId, userId, start, end, true, organization.id(), function(err, results){
                            self.log.debug(accountId, userId, '<< adminVisitorLocationsReport');
                            self.sendResultOrError(resp, err, results, 'Error getting report');
                        });
                    } else {
                        self.log.warn(accountId, userId, 'Non-orgAdmin account attempted to call admin reports!');
                        return self.send403(resp);
                    }
                }
            });
        } else {
            self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
            return self.send403(resp);
        }
    },

    adminVisitorLocationsReportByCountry: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> adminVisitorLocationsReport (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;


        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }


        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }
        if(accountId === appConfig.mainAccountID) {
            analyticsManager.getVisitorLocationsByCountryReport(accountId, userId, start, end, true, null, function(err, results){
                self.log.debug(accountId, userId, '<< adminVisitorLocationsReport');
                self.sendResultOrError(resp, err, results, 'Error getting report');
            });
        } else if(urlUtils.getSubdomainFromRequest(req).isOrgRoot === true){
            /*
             * Check if we are a org admin
             */
            organizationDao.getByOrgDomain(urlUtils.getSubdomainFromRequest(req).orgDomain, function(err, organization){
                if(err || !organization) {
                    self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
                    return self.send403(resp);
                } else {
                    if(organization.get('adminAccount') === accountId) {
                        analyticsManager.getVisitorLocationsByCountryReport(accountId, userId, start, end, true, organization.id(), function(err, results){
                            self.log.debug(accountId, userId, '<< adminVisitorLocationsReport');
                            self.sendResultOrError(resp, err, results, 'Error getting report');
                        });
                    } else {
                        self.log.warn(accountId, userId, 'Non-orgAdmin account attempted to call admin reports!');
                        return self.send403(resp);
                    }
                }
            });
        } else {
            self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
            return self.send403(resp);
        }
    },

    adminVisitorDeviceReport: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> adminVisitorDeviceReport (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;


        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }


        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }
        if(accountId === appConfig.mainAccountID) {
            analyticsManager.getVisitorDeviceReport(accountId, userId, start, end, true, null, function(err, results){
                self.log.debug(accountId, userId, '<< adminVisitorDeviceReport');
                self.sendResultOrError(resp, err, results, 'Error getting report');
            });
        } else if(urlUtils.getSubdomainFromRequest(req).isOrgRoot === true){
            /*
             * Check if we are a org admin
             */
            organizationDao.getByOrgDomain(urlUtils.getSubdomainFromRequest(req).orgDomain, function(err, organization){
                if(err || !organization) {
                    self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
                    return self.send403(resp);
                } else {
                    if(organization.get('adminAccount') === accountId) {
                        analyticsManager.getVisitorDeviceReport(accountId, userId, start, end, true, organization.id(), function(err, results){
                            self.log.debug(accountId, userId, '<< adminVisitorDeviceReport');
                            self.sendResultOrError(resp, err, results, 'Error getting report');
                        });
                    } else {
                        self.log.warn(accountId, userId, 'Non-orgAdmin account attempted to call admin reports!');
                        return self.send403(resp);
                    }
                }
            });
        } else {
            self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
            return self.send403(resp);
        }

    },

    adminUserReport: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> adminUserReport (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;


        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }


        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }
        var dateDiff = moment(start).diff(end, 'days');

        var previousStart = moment(start).add(dateDiff, 'days').toDate();
        var previousEnd = start;


        if(accountId === appConfig.mainAccountID) {
            analyticsManager.getUserReport(accountId, userId, start, end, previousStart, previousEnd, true, null, function(err, results){
                self.log.debug(accountId, userId, '<< adminUserReport');
                self.sendResultOrError(resp, err, results, 'Error getting report');
            });
        } else if(urlUtils.getSubdomainFromRequest(req).isOrgRoot === true){
            /*
             * Check if we are a org admin
             */
            organizationDao.getByOrgDomain(urlUtils.getSubdomainFromRequest(req).orgDomain, function(err, organization){
                if(err || !organization) {
                    self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
                    return self.send403(resp);
                } else {
                    if(organization.get('adminAccount') === accountId) {
                        analyticsManager.getUserReport(accountId, userId, start, end, previousStart, previousEnd, true, organization.id(), function(err, results){
                            self.log.debug(accountId, userId, '<< adminUserReport');
                            self.sendResultOrError(resp, err, results, 'Error getting report');
                        });
                    } else {
                        self.log.warn(accountId, userId, 'Non-orgAdmin account attempted to call admin reports!');
                        return self.send403(resp);
                    }
                }
            });
        } else {
            self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
            return self.send403(resp);
        }
    },

    adminPageviewsReport: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> adminPageviewsReport (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;


        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }


        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }
        var dateDiff = moment(start).diff(end, 'days');

        var previousStart = moment(start).add(dateDiff, 'days').toDate();
        var previousEnd = start;


        if(accountId === appConfig.mainAccountID) {
            analyticsManager.getPageViewsReport(accountId, userId, start, end, previousStart, previousEnd, true, null, function(err, results){
                self.log.debug(accountId, userId, '<< adminPageviewsReport');
                self.sendResultOrError(resp, err, results, 'Error getting report');
            });
        } else if(urlUtils.getSubdomainFromRequest(req).isOrgRoot === true){
            /*
             * Check if we are a org admin
             */
            organizationDao.getByOrgDomain(urlUtils.getSubdomainFromRequest(req).orgDomain, function(err, organization){
                if(err || !organization) {
                    self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
                    return self.send403(resp);
                } else {
                    if(organization.get('adminAccount') === accountId) {
                        analyticsManager.getPageViewsReport(accountId, userId, start, end, previousStart, previousEnd, true, organization.id(), function(err, results){
                            self.log.debug(accountId, userId, '<< adminPageviewsReport');
                            self.sendResultOrError(resp, err, results, 'Error getting report');
                        });
                    } else {
                        self.log.warn(accountId, userId, 'Non-orgAdmin account attempted to call admin reports!');
                        return self.send403(resp);
                    }
                }
            });
        } else {
            self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
            return self.send403(resp);
        }
    },

    getPageViewPerformance: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> getPageViewPerformance (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;
        var accountIds = [];
        if(req.query.accountIds) {
            accountIds = req.query.accountIds.split(',');
            accountIds =  _.map(accountIds, function(val){return parseInt(val)});
        };
        self.log.debug(accountId, userId, 'accountIds:', accountIds);


        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }


        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }

        if(accountId === appConfig.mainAccountID) {
            analyticsManager.getPageViewPerformanceReport(accountId, userId, start, end, null, accountIds, function(err, results){
                self.log.debug(accountId, userId, '<< getPageViewPerformance');
                self.sendResultOrError(resp, err, results, 'Error getting report');
            });
        } else if(urlUtils.getSubdomainFromRequest(req).isOrgRoot === true){
            /*
             * Check if we are a org admin
             */
            organizationDao.getByOrgDomain(urlUtils.getSubdomainFromRequest(req).orgDomain, function(err, organization){
                if(err || !organization) {
                    self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
                    return self.send403(resp);
                } else {
                    if(organization.get('adminAccount') === accountId) {
                        analyticsManager.getPageViewPerformanceReport(accountId, userId, start, end, organization.id(), accountIds, function(err, results){
                            self.log.debug(accountId, userId, '<< getPageViewPerformance');
                            self.sendResultOrError(resp, err, results, 'Error getting report');
                        });
                    } else {
                        self.log.warn(accountId, userId, 'Non-orgAdmin account attempted to call admin reports!');
                        return self.send403(resp);
                    }
                }
            });
        } else {
            self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
            return self.send403(resp);
        }
    },

    adminSessionsReport: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> adminSessionsReport (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;


        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }


        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }
        var dateDiff = moment(start).diff(end, 'days');

        var previousStart = moment(start).add(dateDiff, 'days').toDate();
        var previousEnd = start;


        if(accountId === appConfig.mainAccountID) {
            analyticsManager.getSessionsReport(accountId, userId, start, end, previousStart, previousEnd, true, null, function(err, results){
                self.log.debug(accountId, userId, '<< adminSessionsReport');
                self.sendResultOrError(resp, err, results, 'Error getting report');
            });
        } else if(urlUtils.getSubdomainFromRequest(req).isOrgRoot === true){
            /*
             * Check if we are a org admin
             */
            organizationDao.getByOrgDomain(urlUtils.getSubdomainFromRequest(req).orgDomain, function(err, organization){
                if(err || !organization) {
                    self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
                    return self.send403(resp);
                } else {
                    if(organization.get('adminAccount') === accountId) {
                        analyticsManager.getSessionsReport(accountId, userId, start, end, previousStart, previousEnd, true, organization.id(), function(err, results){
                            self.log.debug(accountId, userId, '<< adminSessionsReport');
                            self.sendResultOrError(resp, err, results, 'Error getting report');
                        });
                    } else {
                        self.log.warn(accountId, userId, 'Non-orgAdmin account attempted to call admin reports!');
                        return self.send403(resp);
                    }
                }
            });
        } else {
            self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
            return self.send403(resp);
        }
    },

    adminSessionLengthReport: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> adminSessionLengthReport (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;


        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }


        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }
        var dateDiff = moment(start).diff(end, 'days');

        var previousStart = moment(start).add(dateDiff, 'days').toDate();
        var previousEnd = start;


        if(accountId === appConfig.mainAccountID) {
            analyticsManager.sessionLengthReport(accountId, userId, start, end, previousStart, previousEnd, true, null, function(err, results){
                self.log.debug(accountId, userId, '<< adminSessionLengthReport');
                self.sendResultOrError(resp, err, results, 'Error getting report');
            });
        } else if(urlUtils.getSubdomainFromRequest(req).isOrgRoot === true){
            /*
             * Check if we are a org admin
             */
            organizationDao.getByOrgDomain(urlUtils.getSubdomainFromRequest(req).orgDomain, function(err, organization){
                if(err || !organization) {
                    self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
                    return self.send403(resp);
                } else {
                    if(organization.get('adminAccount') === accountId) {
                        analyticsManager.sessionLengthReport(accountId, userId, start, end, previousStart, previousEnd, true, organization.id(), function(err, results){
                            self.log.debug(accountId, userId, '<< adminSessionLengthReport');
                            self.sendResultOrError(resp, err, results, 'Error getting report');
                        });
                    } else {
                        self.log.warn(accountId, userId, 'Non-orgAdmin account attempted to call admin reports!');
                        return self.send403(resp);
                    }
                }
            });
        } else {
            self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
            return self.send403(resp);
        }
    },

    adminTrafficSourcesReport: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> adminTrafficSourcesReport (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;

        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }

        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }

        if(accountId === appConfig.mainAccountID) {
            analyticsManager.trafficSourcesReport(accountId, userId, start, end, true, null, function(err, results){
                self.log.debug(accountId, userId, '<< adminTrafficSourcesReport');
                self.sendResultOrError(resp, err, results, 'Error getting report');
            });
        } else if(urlUtils.getSubdomainFromRequest(req).isOrgRoot === true){
            /*
             * Check if we are a org admin
             */
            organizationDao.getByOrgDomain(urlUtils.getSubdomainFromRequest(req).orgDomain, function(err, organization){
                if(err || !organization) {
                    self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
                    return self.send403(resp);
                } else {
                    if(organization.get('adminAccount') === accountId) {
                        analyticsManager.trafficSourcesReport(accountId, userId, start, end, true, organization.id(), function(err, results){
                            self.log.debug(accountId, userId, '<< adminTrafficSourcesReport');
                            self.sendResultOrError(resp, err, results, 'Error getting report');
                        });
                    } else {
                        self.log.warn(accountId, userId, 'Non-orgAdmin account attempted to call admin reports!');
                        return self.send403(resp);
                    }
                }
            });
        } else {
            self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
            return self.send403(resp);
        }
    },

    adminNewVsReturningReport: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> adminNewVsReturningReport (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;

        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }

        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }

        if(accountId === appConfig.mainAccountID) {
            analyticsManager.newVsReturningReport(accountId, userId, start, end, true, null, function(err, results){
                self.log.debug(accountId, userId, '<< adminNewVsReturningReport');
                self.sendResultOrError(resp, err, results, 'Error getting report');
            });
        } else if(urlUtils.getSubdomainFromRequest(req).isOrgRoot === true){
            /*
             * Check if we are a org admin
             */
            organizationDao.getByOrgDomain(urlUtils.getSubdomainFromRequest(req).orgDomain, function(err, organization){
                if(err || !organization) {
                    self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
                    return self.send403(resp);
                } else {
                    if(organization.get('adminAccount') === accountId) {
                        analyticsManager.newVsReturningReport(accountId, userId, start, end, true, organization.id(), function(err, results){
                            self.log.debug(accountId, userId, '<< adminNewVsReturningReport');
                            self.sendResultOrError(resp, err, results, 'Error getting report');
                        });
                    } else {
                        self.log.warn(accountId, userId, 'Non-orgAdmin account attempted to call admin reports!');
                        return self.send403(resp);
                    }
                }
            });
        } else {
            self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
            return self.send403(resp);
        }
    },

    adminPageAnalyticsReport: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> adminPageAnalyticsReport (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;

        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }

        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }

        if(accountId === appConfig.mainAccountID) {
            analyticsManager.pageAnalyticsReport(accountId, userId, start, end, true, null, function(err, results){
                self.log.debug(accountId, userId, '<< adminPageAnalyticsReport');
                self.sendResultOrError(resp, err, results, 'Error getting report');
            });
        } else if(urlUtils.getSubdomainFromRequest(req).isOrgRoot === true){
            /*
             * Check if we are a org admin
             */
            organizationDao.getByOrgDomain(urlUtils.getSubdomainFromRequest(req).orgDomain, function(err, organization){
                if(err || !organization) {
                    self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
                    return self.send403(resp);
                } else {
                    if(organization.get('adminAccount') === accountId) {
                        analyticsManager.pageAnalyticsReport(accountId, userId, start, end, true, organization.id(), function(err, results){
                            self.log.debug(accountId, userId, '<< adminPageAnalyticsReport');
                            self.sendResultOrError(resp, err, results, 'Error getting report');
                        });
                    } else {
                        self.log.warn(accountId, userId, 'Non-orgAdmin account attempted to call admin reports!');
                        return self.send403(resp);
                    }
                }
            });
        } else {
            self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
            return self.send403(resp);
        }
    },

    getAdminUserAgentsReport: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> getAdminUserAgentsReport (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;

        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }

        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }

        if(accountId === appConfig.mainAccountID) {
            analyticsManager.getUserAgentReport(accountId, userId, start, end, true, null, function(err, results){
                self.log.debug(accountId, userId, '<< getAdminUserAgentsReport');
                self.sendResultOrError(resp, err, results, 'Error getting report');
            });
        } else if(urlUtils.getSubdomainFromRequest(req).isOrgRoot === true){
            /*
             * Check if we are a org admin
             */
            organizationDao.getByOrgDomain(urlUtils.getSubdomainFromRequest(req).orgDomain, function(err, organization){
                if(err || !organization) {
                    self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
                    return self.send403(resp);
                } else {
                    if(organization.get('adminAccount') === accountId) {
                        analyticsManager.getUserAgentReport(accountId, userId, start, end, true, organization.id(), function(err, results){
                            self.log.debug(accountId, userId, '<< getAdminUserAgentsReport');
                            self.sendResultOrError(resp, err, results, 'Error getting report');
                        });
                    } else {
                        self.log.warn(accountId, userId, 'Non-orgAdmin account attempted to call admin reports!');
                        return self.send403(resp);
                    }
                }
            });
        } else {
            self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
            return self.send403(resp);
        }
    },

    getAdminOSReport: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> getAdminOSReport (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;

        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }

        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }

        if(accountId === appConfig.mainAccountID) {
            analyticsManager.getOSReport(accountId, userId, start, end, true, null, function(err, results){
                self.log.debug(accountId, userId, '<< getAdminOSReport');
                self.sendResultOrError(resp, err, results, 'Error getting report');
            });
        } else if(urlUtils.getSubdomainFromRequest(req).isOrgRoot === true){
            /*
             * Check if we are a org admin
             */
            organizationDao.getByOrgDomain(urlUtils.getSubdomainFromRequest(req).orgDomain, function(err, organization){
                if(err || !organization) {
                    self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
                    return self.send403(resp);
                } else {
                    if(organization.get('adminAccount') === accountId) {
                        analyticsManager.getOSReport(accountId, userId, start, end, true, organization.id(), function(err, results){
                            self.log.debug(accountId, userId, '<< getAdminOSReport');
                            self.sendResultOrError(resp, err, results, 'Error getting report');
                        });
                    } else {
                        self.log.warn(accountId, userId, 'Non-orgAdmin account attempted to call admin reports!');
                        return self.send403(resp);
                    }
                }
            });
        } else {
            self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
            return self.send403(resp);
        }
    },

    getAdminRevenue: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> getAdminRevenue (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;

        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }

        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }

        var dateDiff = moment(start).diff(end, 'days');

        var previousStart = moment(start).add(dateDiff, 'days').toDate();
        var previousEnd = start;

        if(accountId === appConfig.mainAccountID) {
            analyticsManager.getRevenueByMonth(accountId, userId, start, end, previousStart, previousEnd, true, null, function(err, results){
                self.log.debug(accountId, userId, '<< getAdminRevenue');
                self.sendResultOrError(resp, err, results, 'Error getting report');
            });
        } else if(urlUtils.getSubdomainFromRequest(req).isOrgRoot === true){
            /*
             * Check if we are a org admin
             */
            organizationDao.getByOrgDomain(urlUtils.getSubdomainFromRequest(req).orgDomain, function(err, organization){
                if(err || !organization) {
                    self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
                    return self.send403(resp);
                } else {
                    if(organization.get('adminAccount') === accountId) {
                        analyticsManager.getRevenueByMonth(accountId, userId, start, end, previousStart, previousEnd, true, organization.id(), function(err, results){
                            self.log.debug(accountId, userId, '<< getAdminRevenue');
                            self.sendResultOrError(resp, err, results, 'Error getting report');
                        });
                    } else {
                        self.log.warn(accountId, userId, 'Non-orgAdmin account attempted to call admin reports!');
                        return self.send403(resp);
                    }
                }
            });
        } else {
            self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
            return self.send403(resp);
        }
    },

    getAdminEmailsReport: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> getAdminEmailsReport (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;

        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }

        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }

        var dateDiff = moment(start).diff(end, 'days');

        var previousStart = moment(start).add(dateDiff, 'days').toDate();
        var previousEnd = start;

        if(accountId === appConfig.mainAccountID) {
            analyticsManager.getCampaignEmailsReport(accountId, userId, start, end, previousStart, previousEnd, true, null, function(err, results){
                self.log.debug(accountId, userId, '<< getAdminEmailsReport');
                self.sendResultOrError(resp, err, results, 'Error getting report');
            });
        } else if(urlUtils.getSubdomainFromRequest(req).isOrgRoot === true){
            /*
             * Check if we are a org admin
             */
            organizationDao.getByOrgDomain(urlUtils.getSubdomainFromRequest(req).orgDomain, function(err, organization){
                if(err || !organization) {
                    self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
                    return self.send403(resp);
                } else {
                    if(organization.get('adminAccount') === accountId) {
                        analyticsManager.getCampaignEmailsReport(accountId, userId, start, end, previousStart, previousEnd, true, organization.id(), function(err, results){
                            self.log.debug(accountId, userId, '<< getAdminEmailsReport');
                            self.sendResultOrError(resp, err, results, 'Error getting report');
                        });
                    } else {
                        self.log.warn(accountId, userId, 'Non-orgAdmin account attempted to call admin reports!');
                        return self.send403(resp);
                    }
                }
            });
        } else {
            self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
            return self.send403(resp);
        }
    },

    allAdminReports: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> allAdminReports (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;
        var startTime = new Date().getTime();

        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }


        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
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

        if(accountId === appConfig.mainAccountID) {
            self._runAllAdminReports(accountId, userId, start, end, previousStart, previousEnd, null, function(err, results){
                var duration = new Date().getTime() - startTime;
                self.log.debug(accountId, userId, '<< allAdminReports [' + duration + ']');
                self.sendResultOrError(resp, err, results, 'Error getting report');
            });
        } else if(urlUtils.getSubdomainFromRequest(req).isOrgRoot === true){
            /*
             * Check if we are a org admin
             */
            organizationDao.getByOrgDomain(urlUtils.getSubdomainFromRequest(req).orgDomain, function(err, organization){
                if(err || !organization) {
                    self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
                    return self.send403(resp);
                } else {
                    if(organization.get('adminAccount') === accountId) {
                        self._runAllAdminReports(accountId, userId, start, end, previousStart, previousEnd, organization.id(), function(err, results){
                            var duration = new Date().getTime() - startTime;
                            self.log.debug(accountId, userId, '<< allAdminReports [' + duration + ']');
                            self.sendResultOrError(resp, err, results, 'Error getting report');
                        });
                    } else {
                        self.log.warn(accountId, userId, 'Non-orgAdmin account attempted to call admin reports!');
                        return self.send403(resp);
                    }
                }
            });
        } else {
            self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
            return self.send403(resp);
        }

    },

    _runAllAdminReports: function(accountId, userId, start, end, previousStart, previousEnd, orgId, fn) {
        async.parallelLimit({
            visitorReports: function(callback){
                analyticsManager.getVisitorReports(accountId, userId, start, end, true, orgId, callback);
            },
            visitorLocationsReport: function(callback) {
                analyticsManager.getVisitorLocationsReport(accountId, userId, start, end, true, orgId, callback);
            },
            visitorLocationsByCountryReport: function(callback) {
                analyticsManager.getVisitorLocationsByCountryReport(accountId, userId, start, end, true, orgId, callback);
            },
            visitorDeviceReport: function(callback) {
                analyticsManager.getVisitorDeviceReport(accountId, userId, start, end, true, orgId, callback);
            },
            userReport: function(callback) {
                analyticsManager.getUserReport(accountId, userId, start, end, previousStart, previousEnd, true, orgId, callback);
            },
            pageViewsReport: function(callback) {
                analyticsManager.getPageViewsReport(accountId, userId, start, end, previousStart, previousEnd, true, orgId, callback);
            },
            sessionsReport: function(callback) {
                analyticsManager.getSessionsReport(accountId, userId, start, end, previousStart, previousEnd, true, orgId, callback);
            },
            sessionLengthReport: function(callback) {
                analyticsManager.sessionLengthReport(accountId, userId, start, end, previousStart, previousEnd, true, orgId, callback);
            },
            trafficSourcesReport: function(callback) {
                analyticsManager.trafficSourcesReport(accountId, userId, start, end, true, orgId, callback);
            },
            newVsReturningReport: function(callback) {
                analyticsManager.newVsReturningReport(accountId, userId, start, end, true, orgId, callback);
            },
            pageAnalyticsReport: function(callback) {
                analyticsManager.pageAnalyticsReport(accountId, userId, start, end, true, orgId, callback);
            },
            dau: function(callback) {
                analyticsManager.getDailyActiveUsers(accountId, userId, start, end, orgId, callback);
            },
            userAgents: function(callback) {
                analyticsManager.getUserAgentReport(accountId, userId, start, end, true, orgId, callback);
            },
            revenueReport: function(callback) {
                analyticsManager.getRevenueByMonth(accountId, userId, start, end, previousStart, previousEnd, true, orgId, callback);
            },
            osReport: function(callback) {
                analyticsManager.getOSReport(accountId, userId, start, end, true, orgId, callback);
            },
            emailsReport: function(callback) {
                analyticsManager.getCampaignEmailsReport(accountId, userId, start, end, previousStart, previousEnd, true, orgId, callback);
            }
        }, 2, function(err, results){
            fn(err, results);
        });
    },

    getLiveVisitors: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.trace(accountId, userId, '>> getLiveVisitors');

        analyticsManager.getLiveVisitors(accountId, userId, 60, false, null, function(err, value){
            self.log.trace(accountId, userId, '<< getLiveVisitors');
            self.sendResultOrError(resp, err, value, 'Error getting report');
        });

    },

    getAdminLiveVisitors: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.trace(accountId, userId, '>> getAdminLiveVisitors');
        if(accountId === appConfig.mainAccountID) {
            analyticsManager.getLiveVisitors(accountId, userId, 60, true, null, function(err, value){
                self.log.trace(accountId, userId, '<< getAdminLiveVisitors');
                self.sendResultOrError(resp, err, value, 'Error getting report');
            });
        } else if(urlUtils.getSubdomainFromRequest(req).isOrgRoot === true){
            /*
             * Check if we are a org admin
             */
            organizationDao.getByOrgDomain(urlUtils.getSubdomainFromRequest(req).orgDomain, function(err, organization){
                if(err || !organization) {
                    self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
                    return self.send403(resp);
                } else {
                    if(organization.get('adminAccount') === accountId) {
                        analyticsManager.getLiveVisitors(accountId, userId, 60, true, organization.id(), function(err, value){
                            self.log.trace(accountId, userId, '<< getAdminLiveVisitors');
                            self.sendResultOrError(resp, err, value, 'Error getting report');
                        });
                    } else {
                        self.log.warn(accountId, userId, 'Non-orgAdmin account attempted to call admin reports!');
                        return self.send403(resp);
                    }
                }
            });
        } else {
            self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
            return self.send403(resp);
        }

    },

    getLiveVisitorDetails: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);

        self.log.trace(accountId, userId, '>> getLiveVisitorDetails');

        var lookBackInMinutes = req.query.lookBackInMinutes;

        if(!lookBackInMinutes || lookBackInMinutes === 0) {
            lookBackInMinutes = 30;
        }

        analyticsManager.getLiveVisitorDetails(accountId, userId, lookBackInMinutes, false, null, function(err, value){
            self.log.trace(accountId, userId, '<< getLiveVisitorDetails');
            self.sendResultOrError(resp, err, value, 'Error getting report');
        });
    },

    getAdminLiveVisitorDetails: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.trace(accountId, userId, '>> getLiveVisitorDetails');
        var lookBackInMinutes = req.query.lookBackInMinutes;

        if(!lookBackInMinutes || lookBackInMinutes === 0) {
            lookBackInMinutes = 60;
        }
        if(accountId === appConfig.mainAccountID) {
            analyticsManager.getLiveVisitorDetails(accountId, userId, lookBackInMinutes, true, null, function(err, value){
                self.log.trace(accountId, userId, '<< getLiveVisitorDetails');
                self.sendResultOrError(resp, err, value, 'Error getting report');
            });
        } else if(urlUtils.getSubdomainFromRequest(req).isOrgRoot === true){
            /*
             * Check if we are a org admin
             */
            organizationDao.getByOrgDomain(urlUtils.getSubdomainFromRequest(req).orgDomain, function(err, organization){
                if(err || !organization) {
                    self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
                    return self.send403(resp);
                } else {
                    if(organization.get('adminAccount') === accountId) {
                        analyticsManager.getLiveVisitorDetails(accountId, userId, lookBackInMinutes, true, organization.id(), function(err, value){
                            self.log.trace(accountId, userId, '<< getLiveVisitorDetails');
                            self.sendResultOrError(resp, err, value, 'Error getting report');
                        });
                    } else {
                        self.log.warn(accountId, userId, 'Non-orgAdmin account attempted to call admin reports!');
                        return self.send403(resp);
                    }
                }
            });
        } else {
            self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
            return self.send403(resp);
        }

    },

    getAdmin404s: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> getAdmin404s (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;

        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }

        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }

        var dateDiff = moment(start).diff(end, 'days');

        var previousStart = moment(start).add(dateDiff, 'days').toDate();
        var previousEnd = start;

        if(accountId === appConfig.mainAccountID) {
            analyticsManager.get404sReport(accountId, userId, start, end, true, null, function(err, results){
                self.log.debug(accountId, userId, '<< getAdmin404s');
                self.sendResultOrError(resp, err, results, 'Error getting report');
            });
        } else if(urlUtils.getSubdomainFromRequest(req).isOrgRoot === true){
            /*
             * Check if we are a org admin
             */
            organizationDao.getByOrgDomain(urlUtils.getSubdomainFromRequest(req).orgDomain, function(err, organization){
                if(err || !organization) {
                    self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
                    return self.send403(resp);
                } else {
                    if(organization.get('adminAccount') === accountId) {
                        analyticsManager.get404sReport(accountId, userId, start, end, true, organization.id(), function(err, results){
                            self.log.debug(accountId, userId, '<< getAdmin404s');
                            self.sendResultOrError(resp, err, results, 'Error getting report');
                        });
                    } else {
                        self.log.warn(accountId, userId, 'Non-orgAdmin account attempted to call admin reports!');
                        return self.send403(resp);
                    }
                }
            });
        } else {
            self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
            return self.send403(resp);
        }
    },


    getAdminDaily404s: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.debug(accountId, userId, '>> getAdminDaily404s (' + req.query.start + ', ' + req.query.end + ')');
        var start = req.query.start;
        var end = req.query.end;

        if(!end) {
            end = moment().toDate();
        } else {
            //2016-07-03T00:00:00 05:30
            end = moment(end, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
        }

        if(!start) {
            start = moment().add(-30, 'days').toDate();
        } else {
            start = moment(start, 'YYYY-MM-DD[T]HH:mm:ss').toDate();
            self.log.debug('start:', start);
        }

        var dateDiff = moment(start).diff(end, 'days');

        var previousStart = moment(start).add(dateDiff, 'days').toDate();
        var previousEnd = start;

        if(accountId === appConfig.mainAccountID) {
            analyticsManager.get404sByDateAndPathReport(accountId, userId, start, end, true, null, function(err, results){
                self.log.debug(accountId, userId, '<< getAdminDaily404s');
                self.sendResultOrError(resp, err, results, 'Error getting report');
            });
        } else if(urlUtils.getSubdomainFromRequest(req).isOrgRoot === true){
            /*
             * Check if we are a org admin
             */
            organizationDao.getByOrgDomain(urlUtils.getSubdomainFromRequest(req).orgDomain, function(err, organization){
                if(err || !organization) {
                    self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
                    return self.send403(resp);
                } else {
                    if(organization.get('adminAccount') === accountId) {
                        analyticsManager.get404sByDateAndPathReport(accountId, userId, start, end, true, organization.id(), function(err, results){
                            self.log.debug(accountId, userId, '<< getAdminDaily404s');
                            self.sendResultOrError(resp, err, results, 'Error getting report');
                        });
                    } else {
                        self.log.warn(accountId, userId, 'Non-orgAdmin account attempted to call admin reports!');
                        return self.send403(resp);
                    }
                }
            });
        } else {
            self.log.warn(accountId, userId, 'Non-main account attempted to call admin reports!');
            return self.send403(resp);
        }
    },


    getTrafficFingerprints: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);
        self.log.trace(accountId, userId, '>> getTrafficFingerprints');

        analyticsManager.getTrafficFingerprints(accountId, userId, null, null, function(err, value){
            self.log.trace(accountId, userId, '<< getTrafficFingerprints');
            self.sendResultOrError(resp, err, value, 'Error getting fingerprints');
        });

    },
});

module.exports = new api();

