/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('./dao/campaign.dao.js');
require('./dao/campaign_message.dao.js');

var accountDao = require('../dao/account.dao');
var campaignDao = require('./dao/campaign.dao');
var cmsDao = require('../cms/dao/cms.dao');
var contactDao = require('../dao/contact.dao');
var contactActivityManager = require('../contactactivities/contactactivity_manager');
var courseDao = require('../dao/course.dao');
var emailDao = require('../cms/dao/email.dao');
var subscriberDao = require('../dao/subscriber.dao');
var userDao = require('../dao/user.dao');
var appConfig = require('../configs/app.config');

/*
 * These three mandrill artifacts are deprecated.
 */
var mandrillConfig = require('../configs/mandrill.config');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(mandrillConfig.CLIENT_API_KEY);


var emailMessageManager = require('../emailmessages/emailMessageManager');

var hostSuffix = appConfig.subdomain_suffix;
var async = require('async');

var gtmDao = require('../dao/social/gtm.dao');
var gtmConfig = require('../configs/gtm.config');

/**
 * Constants for pipeshift
 * */

var LINK_VAR_NAME = "link";
var PREVIEW_IMAGE_VAR_NAME = "preview_image";
var TITLE_VAR_NAME = "title";
var SUBTITLE_VAR_NAME = "subtitle";
var BODY_VAR_NAME = "body";
var PERCENTS_VAR_NAME = "percents";
var VIDEO_INDEX_VAR_NAME = "video_index";
var TOTAL_VIDEOS_VAR_NAME = "total_videos";


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

    getCampaignFlowsByCampaign: function(accountId, campaignId, fn) {
        var query = {
            accountId:accountId,
            campaignId:campaignId
        };

        campaignDao.findMany(query, $$.m.CampaignFlow, fn);
    },

    createCampaign: function(campaignObj, fn) {
        var self = this;
        self.log.debug('>> createCampaign');
        var contactIdAry = [];
        var initialStatus = $$.m.Campaign.status.DRAFT;
        if(campaignObj.get('contacts')) {
            /*
             * We need to create the campaign in draft status, add the contacts, and then set the status to its initial value.
             *
             */
            contactIdAry = campaignObj.get('contacts');
            delete campaignObj.attributes.contacts;
            initialStatus = campaignObj.get('status');
        }
        campaignObj.set('status', $$.m.Campaign.status.DRAFT);
        campaignDao.saveOrUpdate(campaignObj, function(err, value){
            if(err) {
                self.log.error('Error creating campaign: ' + err);
                return fn(err, null);
            } else {
                if(contactIdAry.length > 0) {
                    self.bulkAddContactToCampaign(contactIdAry, value.id(), value.get('accountId'), function(err, campaign){
                        if(err) {
                            self.log.error('Error adding contacts to campaign:', err);
                            return fn(err);
                        }
                        if(campaign.get('status') !== initialStatus) {
                            campaign.set('status', initialStatus);
                            self.updateCampaign(campaign, function(err, updatedCampaign){
                                if(err) {
                                    self.log.error('Error updating campaign status:', err);
                                    return fn(err);
                                } else {
                                    self.log.debug('<< createCampaign');
                                    return fn(null, updatedCampaign);
                                }
                            });
                        } else {
                            self.log.debug('<< createCampaign');
                            return fn(null, campaign);
                        }
                    });
                }
                else if(campaignObj.get('status') !== initialStatus) {
                    campaignObj.set('status', initialStatus);
                    self.updateCampaign(campaignObj, function(err, updatedCampaign){
                        if(err) {
                            self.log.error('Error updating campaign status:', err);
                            return fn(err);
                        } else {
                            self.log.debug('<< createCampaign');
                            return fn(null, updatedCampaign);
                        }
                    });
                }
                else {
                    self.log.debug('<< createCampaign');
                    return fn(null, value);
                }
            }
        });

    },

    updateCampaign: function(campaignObj, fn) {
        var self = this;
        self.log.debug('>> updateCampaign');
        /*
         * Get the campaign.  If the status is RUNNING, return an error
         * If the new status is RUNNING, kick off the steps
         */
        // need this
        var campaignId = campaignObj.id();
        var accountId = campaignObj.get('accountId');
        var query = {
            _id: campaignId,
            accountId: accountId
        };

        campaignDao.findOne(query, $$.m.Campaign, function(err, campaign){
            if(err || !campaign) {
                self.log.error('Error finding campaign:', err);
                return fn(err);
            } else if(campaign.get('status') === $$.m.Campaign.status.RUNNING){
                self.log.warn('Attempted to update a running campaign');
                return fn('Attempted to update a running campaign');
            } else {
                var contactIdAry = [];
                if(campaignObj.get('contacts')) {
                    /*
                     * If there is a 'contacts' field on the input object, we need to create new flows.
                     */
                    contactIdAry = campaignObj.get('contacts');
                    delete campaignObj.attributes.contacts;

                }
                campaignDao.saveOrUpdate(campaignObj, function(err, updatedCampaign){
                    if(err) {
                        self.log.error('Error updating campaign: ' + err);
                        return fn(err, null);
                    } else {
                        if(contactIdAry.length > 0) {
                            self.bulkReplaceContactsInCampaign(contactIdAry, campaignId, accountId, function (err, campaign) {
                                if (err) {
                                    self.log.error('Error adding contacts to campaign:', err);
                                    return fn(err);
                                } else {
                                    //we can return here.  We have deleted existing flows and created new (correct) ones.
                                    self.log.debug('<< updateCampaign');
                                    fn(null, updatedCampaign);
                                    if(updatedCampaign.get('status') === $$.m.Campaign.status.RUNNING) {
                                        //kick off the flows
                                        self._startCampaignFlows(updatedCampaign);
                                    }
                                    return;
                                }
                            });
                        } else {
                            self.log.debug('<< updateCampaign');
                            fn(null, updatedCampaign);
                            /*
                             * check if we need to update flows.
                             *
                             */
                            var updateNeeded = false;
                            var initialSteps = campaignObj.get('steps');
                            var updatedSteps = updatedCampaign.get('steps');
                            if(initialSteps.length !== updatedSteps.length) {
                                updateNeeded = true;
                            }
                            _.each(updatedSteps, function(step, i){
                                if(!initialSteps[i] || _.isEqual(step, initialSteps[i]) !== true ) {
                                    updateNeeded = true;
                                }
                            });

                            if(updateNeeded === true) {
                                campaignDao.findMany({campaignId:campaignId, accountId: accountId}, $$.m.CampaignFlow, function(err, flows){
                                    if(err) {
                                        self.log.error('Error updating flows.  Campaign steps will NOT start.', err);
                                        return;
                                    } else {
                                        async.each(flows, function(flow, cb){
                                            flow.set('steps', updatedSteps);
                                            campaignDao.saveOrUpdate(flow, function(err, value){
                                                cb(err);
                                            });
                                        }, function done(err){
                                            if(err) {
                                                self.log.error('Error updating flow steps.  Campaign steps will NOT start.', err);
                                            } else {
                                                if(updatedCampaign.get('status') === $$.m.Campaign.status.RUNNING) {
                                                    //kick off the flows
                                                    self._startCampaignFlows(updatedCampaign);
                                                }
                                                return;
                                            }
                                        });
                                    }
                                });
                            } else {
                                if(updatedCampaign.get('status') === $$.m.Campaign.status.RUNNING) {
                                    //kick off the flows
                                    self._startCampaignFlows(updatedCampaign);
                                }
                                return;
                            }
                        }
                    }
                });
            }
        });


    },

    duplicateCampaign: function(accountId, campaignId, campaignName, userId, fn) {
        var self = this;
        self.log.debug('>> duplicateCampaign');
        campaignDao.findOne({accountId:accountId, _id:campaignId}, $$.m.Campaign, function(err, campaign){
            if(err) {
                self.log.error('Error finding campaign:', err);
                return fn(err);
            } else {
                campaign.set('_id', null);
                var createdObj = {
                    'date':new Date(),
                    'by':userId
                };
                campaign.set('created', createdObj);
                campaign.set('modified', createdObj);
                campaign.set('status', $$.m.Campaign.status.DRAFT);
                campaign.set('name', campaignName);
                campaign.set('statistics', {
                    emailsClicked: 0,
                    emailsOpened: 0,
                    emailsSent: 0,
                    participants: 0
                });
                campaignDao.saveOrUpdate(campaign, function(err, savedCampaign){
                    if(err) {
                        self.log.error('Error saving campaign:', err);
                        return fn(err);
                    } else {
                        self.log.debug('<< duplicateCampaign');
                        return fn(null, savedCampaign);
                    }
                });
            }
        });
    },

    addContactToCampaign: function(contactId, campaignId, accountId, fn) {
        var self = this;
        self.log.debug('>> addContactToCampaign');

        /*
         * Get or create campaign flow.
         * Add contact to running campaign
         * Schedule first step.
         */
        var query = {
            campaignId: campaignId,
            accountId: accountId,
            contactId: contactId
        };
        contactDao.getById(contactId, function(err, contact){
            if(err) {
                self.log.error('Error fetching contact', err);
                return fn(err, null);
            } else {
                if(contact === null || contact.get('accountId') !== accountId) {
                    self.log.error('Could not find contact for account.');
                    return fn('Could not find contact for account', null);
                } else {
                    campaignDao.findMany(query, $$.m.CampaignFlow, function(err, value){
                        self.log.debug('value ', value);
                        self.log.debug('err ', err);
                        if(err) {
                            self.log.error('Error finding campaign flow: ' + err);
                            return fn(err, null);
                        } else if(value !== null && value.length < 0) {
                            self.log.debug('Contact already part of this campaign.');
                            return fn(null, value);
                        } else {
                            campaignDao.getById(campaignId, $$.m.Campaign, function(err, campaign){
                                if(err) {
                                    self.log.error('Error finding campaign: ' + err);
                                    return fn(err, null);
                                }
                                if(campaign === null){
                                   self.log.error('Could not find campaign with campaignId: ' + campaignId);
                                   return fn('Could not find campaign with campaignId: ' + campaignId, null); 
                                }
                                //need to create flow.
                                var flow = new $$.m.CampaignFlow({
                                    campaignId: campaignId,
                                    accountId: accountId,
                                    contactId: contactId,
                                    startDate: new Date(),
                                    lastStep: 0,
                                    steps: campaign.get('steps')
                                });
                                campaignDao.saveOrUpdate(flow, function(err, savedFlow){
                                    if(err) {
                                        self.log.error('Error saving campaign flow: ' + err);
                                        return fn(err, null);
                                    }
                                    self.log.debug('Added contact to campaign flow.');
                                    self.updateCampaignParticipants(accountId, campaignId, function(err, value){});
                                    /*
                                     * We no longer auto start the steps.  This happens when we "start" the campaign
                                     */
                                    self.log.debug('<< addContactToCampaign');
                                    return fn(err, savedFlow);

                                    /*
                                    self.handleStep(flow, 0, function(err, value){
                                        if(err) {
                                            self.log.error('Error handling initial step of campaign: ' + err);
                                            return fn(err, null);
                                        } else {
                                            self.updateCampaignStatus(accountId, campaignId, function(err, value){});
                                            self.log.debug('<< addContactToCampaign');
                                            return fn(err, savedFlow);
                                        }
                                    });
                                    */
                                });
                            });

                        }
                    });
                }
            }
        });


    },

    /**
     * This method will execute the step in stepNumber, setting the lastStep var to stepNumber.
     * @param campaignFlow
     * @param stepNumber 0-based index of steps.
     * @param fn
     */
    handleStep: function(campaignFlow, stepNumber, fn) {

        var self = this;
        self.log.debug('>> handleStep (' + stepNumber + ')');

        var step = campaignFlow.get('steps')[stepNumber];
        self.log.debug('>> getSteps ', campaignFlow.get('steps'));
        self.log.debug('>> step ', step);
        if(step === null) {
            var errorString = 'Error getting steps';
            self.log.error(errorString);
            return fn(errorString, null);
        }

        if(step && step.type === 'email' && (step.trigger === null || step.trigger === 'WAIT' ||
            (step.trigger === 'SIGNUP' && step.triggered) || (step.trigger === 'EMAIL_OPENED' && step.triggered))) {
            /*
             * Schedule the email.
             */
             accountDao.getAccountByID(campaignFlow.get('accountId'), function(err, account){
                if(err) {
                    self.log.error('Error getting account: ' + err);
                    self.log.error('No email will be sent.');
                } else {
                    contactDao.getById(campaignFlow.get('contactId'), $$.m.Contact, function(err, contact){
                        if(err) {
                            self.log.error('Error getting contact for step: ' + err);
                            return fn(err, null);
                        } else if(contact === null) {
                            self.log.debug('>> campaignFlow ', campaignFlow);
                            self.log.error('Could not find contact for contactId: ' + campaignFlow.get('contactId'));
                            return fn('Could not find contact for contactId: ' + campaignFlow.get('contactId'), null);
                        } else {
                            var fromAddress = step.settings.fromEmail;
                            var fromName = step.settings.fromName;
                            var toAddress = contact.getEmails()[0].email;
                            self.log.debug('contact.getEmails: ', contact.getEmails());
                            self.log.debug('contact:', contact);
                            var toName = contact.get('first') + ' ' + contact.get('last');
                            var subject = step.settings.subject;

                            var accountId = campaignFlow.get('accountId');
                            var vars = step.settings.vars || [];

                            var emailId = step.settings.emailId;
                            
                            emailDao.getEmailById(emailId, function(err, email){
                                if(err || !email) {
                                    self.log.error('Error getting email to render: ' + err);
                                    return fn(err, null);
                                }
                                // var component = email.get('components')[0];
                                // if (!component.bg.color) {
                                //     component.bg.color = '#eaeaea';
                                // }

                                // if (!component.emailBg) {
                                //     component.emailBg = '#ffffff';
                                // }
                                // if (component.bg.img && component.bg.img.show && component.bg.img.url) {
                                //     component.emailBgImage = component.bg.img.url.replace('//s3.amazonaws', 'http://s3.amazonaws');
                                // }

                                // component.logo = component.logo.replace('src="//s3.amazonaws', 'src="http://s3.amazonaws');
                                // component.text = component.text.replace('src="//s3.amazonaws', 'src="http://s3.amazonaws');
                                // component.title = component.title.replace('src="//s3.amazonaws', 'src="http://s3.amazonaws');
                                var components = [];
                                var keys = ['logo','title','text','text1','text2','text3'];
                                var regex = new RegExp('src="//s3.amazonaws', "g");

                                email.get('components').forEach(function(component){
                                    if(component.visibility){
                                        for (var i = 0; i < keys.length; i++) {
                                            if (component[keys[i]]) {
                                            component[keys[i]] = component[keys[i]].replace(regex, 'src="http://s3.amazonaws');
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
                                
                                app.render('emails/base_email_v2', { components: components }, function(err, html) {
                                    if (err) {
                                        self.log.error('error rendering html: ' + err);
                                        self.log.warn('email will not be sent.');
                                    } else {
                                        var campaignId = campaignFlow.get('campaignId');
                                        var contactId = campaignFlow.get('contactId');
                                        emailMessageManager.sendCampaignEmail(fromAddress, fromName, toAddress, toName, subject, html, accountId, campaignId, contactId, vars, step.settings, emailId, function(err, value){
                                            if(err) {
                                                self.log.error('Error sending email: ', err);
                                                return fn(err, null);
                                            }
                                            campaignFlow.set('lastStep', stepNumber);
                                            step.executed = new Date();
                                            if(value && value[0]) {
                                                step.mandrillId = value[0]._id;
                                            }
                                            campaignDao.saveOrUpdate(campaignFlow, function(err, updatedFlow){
                                                if(err) {
                                                    self.log.error('Error saving campaign flow: ' + err);
                                                    return fn(err, null);
                                                } else {
                                                    //try to handle the next step:
                                                    var steps = campaignFlow.get('steps');
                                                    if(steps.length -1 > stepNumber) {
                                                        self.handleStep(campaignFlow, stepNumber+1, function(err, value){
                                                            if(err) {
                                                                self.log.error('Error handling campaign step: ' + stepNumber+1 + ": " + err);
                                                                self.log.warn('Future step handling issue.  There will be problems with this campaign_flow: ', campaignFlow);
                                                                return fn(null, updatedFlow);
                                                            } else {
                                                                self.log.debug('<< handleStep');
                                                                return fn(null, updatedFlow);
                                                            }
                                                        });
                                                    } else {
                                                        self.log.debug('<< handleStep (no more steps)');
                                                        return fn(null, updatedFlow);
                                                    }
                                                }
                                            });
                                        });
                                    }
                                });
                            });
                        }
                    });
                }
            });

        } else if(step && step.type === 'landing'){
            //there is nothing to do here.
            campaignFlow.set('lastStep', stepNumber);
            step.executed = new Date();
            campaignDao.saveOrUpdate(campaignFlow, function(err, updatedFlow){
                if(err) {
                    self.log.error('Error saving campaign flow: ' + err);
                    return fn(err, null);
                } else {
                    //try to handle the next step:
                    var steps = campaignFlow.get('steps');
                    if(steps.length -1 > stepNumber) {
                        self.handleStep(campaignFlow, stepNumber+1, function(err, value){
                            if(err) {
                                self.log.error('Error handling campaign step: ' + stepNumber+1 + ": " + err);
                                self.log.warn('Future step handling issue.  There will be problems with this campaign_flow: ', campaignFlow);
                                return fn(null, updatedFlow);
                            } else {
                                self.log.debug('<< handleStep');
                                return fn(null, updatedFlow);
                            }
                        });
                    } else {
                        self.log.debug('<< handleStep (no more steps)');
                        return fn(null, updatedFlow);
                    }
                }
            });
        } else if(step && step.type === 'webinar'){

            contactDao.getById(campaignFlow.get('contactId'), $$.m.Contact, function(err, contact) {
                if (err) {
                    self.log.error('Error getting contact for step: ' + err);
                    return fn(err, null);
                } else if (contact === null) {
                    self.log.error('Could not find contact for contactId: ' + campaignFlow.get('contactId'));
                    return fn('Could not find contact for contactId: ' + campaignFlow.get('contactId'), null);
                } else {
                    var registrantInfo = {
                        "firstName": contact.get('first'),
                        "lastName": contact.get('last'),
                        "email": contact.getEmails()[0].email
                    };
                    var organizerId = step.settings.organizerId;
                    var webinarId = step.settings.webinarId;
                    var resendConfirmation = true;
                    if(step.settings.resendConfirmation) {
                        resendConfirmation = step.settings.resendConfirmation;
                    }
                    var accessToken = gtmConfig.accessToken;
                    gtmDao.addRegistrant(organizerId, webinarId, resendConfirmation, accessToken, registrantInfo, function(err, value){
                        if(err) {
                            self.log.error('Error registering for webinar: ' + err);
                            return fn(err, null);
                        }
                        campaignFlow.set('lastStep', stepNumber);
                        step.executed = new Date();
                        campaignDao.saveOrUpdate(campaignFlow, function(err, updatedFlow){
                            if(err) {
                                self.log.error('Error saving campaign flow: ' + err);
                                return fn(err, null);
                            } else {
                                //try to handle the next step:
                                var steps = campaignFlow.get('steps');
                                if(steps.length -1 > stepNumber) {
                                    self.handleStep(campaignFlow, stepNumber+1, function(err, value){
                                        if(err) {
                                            self.log.error('Error handling campaign step: ' + stepNumber+1 + ": " + err);
                                            self.log.warn('Future step handling issue.  There will be problems with this campaign_flow: ', campaignFlow);
                                            return fn(null, updatedFlow);
                                        } else {
                                            self.log.debug('<< handleStep');
                                            return fn(null, updatedFlow);
                                        }
                                    });
                                } else {
                                    self.log.debug('<< handleStep (no more steps)');
                                    return fn(null, updatedFlow);
                                }
                            }
                        });
                    });
                }
            });

        } else {
            return fn(null, null);
        }
    },

    bulkReplaceContactsInCampaign: function(contactIdAry, campaignId, accountId, fn) {
        var self = this;
        self.log.debug('>> bulkReplaceContactsInCampaign');
        var query = {accountId:accountId, campaignId:campaignId};
        campaignDao.removeByQuery(query, $$.m.CampaignFlow, function(err, value){
            if(err) {
                self.log.error('Error removing campaign flows:', err);
                return fn(err);
            } else {
                self.log.debug('<< bulkReplaceContactsInCampaign');
                return self.bulkAddContactToCampaign(contactIdAry, campaignId, accountId, fn);
            }
        });
    },

    bulkAddContactToCampaign: function(contactIdAry, campaignId, accountId, fn) {
        var self = this;
        self.log.debug('>> bulkAddContactToCampaign');
        campaignDao.getById(campaignId, $$.m.Campaign, function(err, campaign){
            if(err) {
                self.log.error('Error finding campaign: ' + err);
                return fn(err, null);
            }
            async.each(contactIdAry, function(contactId, callback){
                //need to create flow.
                contactDao.getById(contactId, function(err, contact){
                    if(err) {
                        self.log.warn('Could not fetch contact [' + contactId + '].');
                        callback();
                    } else if(contact.get('accountId') !== accountId) {
                        self.log.warn('Contact [' + contactId + '] does not belong to account [' + accountId + '].');
                        callback();
                    } else {
                        var flow = new $$.m.CampaignFlow({
                            campaignId: campaignId,
                            accountId: accountId,
                            contactId: contactId,
                            startDate: new Date(),
                            lastStep: 0,
                            steps: campaign.get('steps')
                        });
                        campaignDao.saveOrUpdate(flow, function(err, savedFlow){
                            if(err) {
                                self.log.error('Error saving campaign flow: ' + err);
                                return fn(err, null);
                            }
                            self.log.debug('Added contact to campaign flow.');
                        });
                    }
                    self.log.debug('Added contact to campaign flow.');
                    /*
                     * We no longer auto-start the campaign steps.  This is done after we "start" the campaign.
                     */
                    callback();
                    /*
                    self.handleStep(flow, 0, function(err, value){
                        if(err) {
                            self.log.error('Error handling initial step of campaign: ' + err);
                            callback(err);
                        } else {
                            self.log.debug('added contact.');
                            callback();
                        }
                    });
                    */
                });

            }, function(err){
                if(err) {
                    self.log.error('Error adding contacts to campaign: ' + err);
                    return fn(err, null);
                } else {
                    //check if we need to update the status
                    self.updateCampaignParticipants(accountId, campaignId, function(err, value){
                        self.log.debug('<< bulkAddContactToCampaign');
                        return fn(err, value);
                    });
                }
            });

        });

    },

    /**
     * Updates the number of participants in the campaign statistics
     * @param accountId
     * @param campaignId
     * @param fn
     */
    updateCampaignParticipants: function(accountId, campaignId, fn) {
        var self = this;
        self.log.debug('>> updateCampaignParticipants');
        self.getCampaignFlowsByCampaign(accountId, campaignId, function(err, flows){
            if(err) {
                self.log.error('Error getting campaign flows: ', err);
                return fn(err, null);
            }
            var numParticipants = 0;
            if(flows) {
                numParticipants = flows.length;
            }
            self.getCampaign(campaignId, function(err, campaign){
                if(err) {
                    self.log.error('Error getting campaign: ', err);
                    return fn(err, null);
                }
                var stats = campaign.get('statistics');
                stats.participants = numParticipants;
                campaignDao.saveOrUpdate(campaign, fn);
            });

        });
    },

    /**
     * Check if this campaign should be 'running' or 'completed'
     * @param campaignId
     * @param accountId
     * @param fn
     */
    updateCampaignStatus: function(accountId, campaignId, fn) {
        var self = this;
        /*
         * Get all the flows for the campaign.
         * If each flow has executed the final step, the status of the campaign should be 'completed'
         */
        self.log.debug('>> updateCampaignStatus');
        self.getCampaignFlowsByCampaign(accountId, campaignId, function(err, flows){
            var isDone = true;
            _.each(flows, function(flow){
                var flowSteps = flow.get('steps');
                if(!flowSteps[flowSteps.length-1].executed) {
                    isDone = false;
                }
            });

            if(isDone === true) {
                campaignDao.getById(campaignId, $$.m.Campaign, function(err, campaign){
                    if(err) {
                        self.log.error('Error updating campaign status:', err);
                        return fn(err, null);
                    } else {
                        campaign.set('status', $$.m.Campaign.status.COMPLETED);
                        var modified = {
                            date: new Date(),
                            by: 'Admin'
                        };
                        campaign.set('modified', modified);
                        return campaignDao.saveOrUpdate(campaign, fn);
                    }
                });
            } else {
                return fn(null, null);
            }
        });
    },

    /**
     * This method will delete any active campaign_flow objects for this campaign and account.
     * @param campaignId
     * @param accountId
     * @param fn
     */
    cancelRunningCampaign: function(campaignId, accountId, fn) {
        var self = this;
        self.log.debug('>> cancelRunningCampaign');
        var query = {
            accountId: accountId,
            campaignId: campaignId
        };

        campaignDao.removeByQuery(query, $$.m.CampaignFlow, function(err, value){
            if(err) {
                self.log.error('Error deleting campaign flow: ' + err);
                return fn(err, null);
            } else {
                self.log.debug('<< cancelRunning Campaign');
                return fn(null, value);
            }
        });
    },

    /**
     * This method will cancel a campaign flow for a particular contact
     * @param accountId
     * @param campaignId
     * @param contactId
     * @param fn
     */
    cancelCampaignForContact: function(accountId, campaignId, contactId, fn) {
        var self = this;
        self.log.debug('>> cancelRunningCampaign');
        var query = {
            accountId: accountId,
            campaignId: campaignId,
            contactId: contactId
        };

        campaignDao.removeByQuery(query, $$.m.CampaignFlow, function(err, value){
            if(err) {
                self.log.error('Error deleting campaign flow: ' + err);
                return fn(err, null);
            } else {
                self.log.debug('<< cancelRunning Campaign');
                return fn(null, value);
            }
        });
    },

    getContactsForCampaign: function(accountId, campaignId, fn) {
        var self = this;
        
        var campaignQuery = {
            accountId: accountId,
            campaignId: campaignId
        };

        var contacts = [];

        self.log.debug('>> getContactsForCampaign');
        
        async.waterfall([
            function(callback) {
                campaignDao.findMany(campaignQuery, $$.m.CampaignFlow, function(err, value){
                    if(err) {
                        self.log.error('Error finding campaign flow: ' + err);
                        return callback(err, null);
                    } else {
                        return callback(null, value)
                    }
                })
            },
            function(flows) {
                var contactIds = flows.map(function(flow) { return flow.get('contactId') });
                var query = { _id: { $in: contactIds} };
                self.log.debug('contactIds:', contactIds);
                contactDao.findMany(query, $$.m.Contact, function(err, list){
                    if(err) {
                        self.log.error('Error getting contacts for campaign: ' + err);
                        return fn(err, null);
                    }
                    return fn(null, list);
                });
            }
        ]);
    },

    getRunningCampaign: function(accountId, runningCampaignId, fn) {
        var self = this;
        self.log.debug('>> getRunningCampaign');
        var query = {
            accountId: accountId,
            campaignId: runningCampaignId
        };
        campaignDao.findMany(query, $$.m.CampaignFlow, function(err, flow){
            if(err) {
                self.log.error('Error getting campaign: ' + err);
                return fn(err, null);
            } else {
                self.log.debug('<< getRunningCampaign');
                return fn(null, flow);
            }
        });
    },

    getRunningCampaigns: function(accountId, fn) {
        var self = this;
        self.log.debug('>> getRunningCampaigns');

        var query = {
            accountId: accountId
        };
        campaignDao.findMany(query, $$.m.CampaignFlow, function(err, flow){
            if(err) {
                self.log.error('Error getting campaign: ' + err);
                return fn(err, null);
            } else {
                self.log.debug('<< getRunningCampaigns');
                return fn(null, flow);
            }
        });
    },

    getRunningCampaignsForContact: function(accountId, contactId, fn) {
        var self = this;
        self.log.debug('>> getRunningCampaignsForContact');

        var query = {
            accountId: accountId,
            contactId: contactId
        };
        campaignDao.findMany(query, $$.m.CampaignFlow, function(err, flow){
            if(err) {
                self.log.error('Error getting campaign: ' + err);
                return fn(err, null);
            } else {
                self.log.debug('<< getRunningCampaignsForContact');
                return fn(null, flow);
            }
        });
    },

    triggerCampaignStep: function(accountId, campaignId, contactId, stepNumber, fn) {
        var self = this;
        self.log.debug('>> triggerCampaignStep');

        var query = {
            accountId:accountId,
            campaignId:campaignId,
            contactId:contactId
        };

        campaignDao.findOne(query, $$.m.CampaignFlow, function(err, flow){
            if(err || flow==null) {
                self.log.error('Error finding running campaign: ' + err);
                return fn(err, null);
            }
            if(flow.get('steps').size() > stepNumber) {
                var errorString = 'StepNumber ' + stepNumber + ' is greater than the number of steps: ' + flow.get('steps').size();
                self.log.error(errorString);
                return fn(errorString, null);
            }
            return self.handleStep(flow, stepNumber, fn);
        });

    },

    /**
     * This method will getOrCreate a campaignFlow object, mark the first signupStep as triggered, handle the next.
     * @param accountId
     * @param campaignId
     * @param contactId
     * @param fn
     */
    handleCampaignSignupEvent: function(accountId, campaignId, contactId, fn) {
        var self = this;
        return self._handleSpecificCampaignEvent(accountId, campaignId, contactId, 'SIGNUP', fn);
    },

    /**
     * This method will getOrCreate a campaignFlow object, mark the first EMAIL_OPENED as triggered, handle the next.
     * @param accountId
     * @param campaignId
     * @param contactId
     * @param fn
     */
    handleCampaignEmailOpenEvent: function(accountId, campaignId, contactId, fn) {
        var self = this;
        self.log.debug('>> handleCampaignEmailOpenEvent', campaignId);
        self._handleSpecificCampaignEvent(accountId, campaignId, contactId, 'EMAIL_OPENED', function(err, value){
            self.log.debug('marking email opened.');
            self.getCampaign(campaignId, function(err, campaign){
                if(err || !campaign) {
                    self.log.error('Error fetching campaign', err);
                    return fn(err, null);
                } else {
                    self.log.debug('got campaign');
                    var stats = campaign.get('statistics');
                    stats.emailsOpened = stats.emailsOpened + 1;
                    var modified = {
                        date: new Date(),
                        by: 'ADMIN'
                    };
                    campaign.set('modified', modified);
                    campaignDao.saveOrUpdate(campaign, fn);
                }
            });
        });

    },

    /**
     * This method will update the campaign statistics
     * @param accountId
     * @param campaignId
     * @param contactId
     * @param fn
     */
    handleCampaignEmailSentEvent: function(accountId, campaignId, contactId, fn) {
        var self = this;
        self.log.debug('>> handleCampaignEmailSentEvent');
        self.getCampaign(campaignId, function(err, campaign){
            if(err || !campaign) {
                self.log.error('Error fetching campaign', err);
                return fn(err, null);
            } else {
                var stats = campaign.get('statistics');
                stats.emailsSent = stats.emailsSent + 1;
                var modified = {
                    date: new Date(),
                    by: 'ADMIN'
                };
                campaign.set('modified', modified);
                campaignDao.saveOrUpdate(campaign, fn);
            }
        });
    },

    /**
     * This method will update the campaign statistics
     * @param accountId
     * @param campaignId
     * @param contactId
     * @param fn
     */
    handleCampaignEmailClickEvent: function(accountId, campaignId, contactId, fn) {
        var self = this;
        self.log.debug('>> handleCampaignEmailClickEvent');
        self.getCampaign(campaignId, function(err, campaign){
            if(err || !campaign) {
                self.log.error('Error fetching campaign', err);
                return fn(err, null);
            } else {
                var stats = campaign.get('statistics');
                stats.emailsClicked = stats.emailsClicked + 1;
                var modified = {
                    date: new Date(),
                    by: 'ADMIN'
                };
                campaign.set('modified', modified);
                campaignDao.saveOrUpdate(campaign, fn);
            }
        });
    },

    _handleSpecificCampaignEvent: function(accountId, campaignId, contactId, trigger, fn) {
        var self = this;
        self.log.debug('>> _handleSpecificCampaignEvent (' + trigger + ')');
        async.waterfall([
            function(callback){
                var query = {
                    accountId: accountId,
                    campaignId: campaignId,
                    contactId: contactId
                };
                campaignDao.findOne(query, $$.m.CampaignFlow, function(err, flow) {
                    if (err ) {
                        self.log.error('Error finding running campaign: ' + err);
                        callback(err);
                    } else if(flow === null) {
                        self.log.debug('Creating campaign flow for contact '+ contactId + ' in campaign ' + campaignId);
                        self.addContactToCampaign(contactId, campaignId, accountId, function(err, value){
                            if(err) {
                                self.log.error('Error adding contact to campaign: ' + err);
                                callback(err);
                            } else {
                                callback(null, value);
                            }
                        });
                    } else {
                        self.log.debug('Found campaign flow');
                        callback(null, flow);
                    }

                });
            },
            function(flow, callback){
                var steps = flow.get('steps');
                var i = flow.get('lastStep');
                var nextStep = steps[i];
                if (nextStep) {
                    while(nextStep && nextStep.executed) {
                        i++;
                        nextStep = steps[i];
                    }
                    if(!nextStep) {
                        return callback(null, null, i);
                    }
                    if(nextStep && nextStep.trigger === trigger) {
                        nextStep.triggered = new Date();
                        campaignDao.saveOrUpdate(flow, function(err, updatedFlow){
                            if(err) {
                                callback(err);
                            } else {
                                self.log.debug('set step as triggered');
                                callback(null, flow, i);
                            }
                        });

                    } else {
                        //self.log.warn('Next step has a trigger of ' + nextStep.trigger + ' but was expected to have type ' + trigger);
                        callback('Unexpected trigger type');
                    }
                } else {
                    callback(null, null, i);
                }
            },
            function(flow, stepNumber, callback) {
                if(!flow) {
                    self.log.debug('No step to handle. Exiting');
                    callback(null);
                } else {
                    self.handleStep(flow, stepNumber, function(err, value){
                        if(err) {
                            callback(err);
                        } else {
                            self.log.debug('handled step ' + stepNumber);
                            callback(null);
                        }
                    });
                }

            }
        ], function(err){
            if(err) {
                self.log.error('Error condition: ' + err);
                return fn(err, null);
            } else {
                self.log.debug('<< _handleSpecificCampaignEvent');
                return fn(null, 'OK');
            }
        });
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

    subscribeToCourse: function(toEmail, course, accountId, timezoneOffset, callback) {
        var self = this;
        self.log.debug('>> subscribeToCourse');

        //getOrCreateContact for account/email
        var p1 = $.Deferred();
        //If customer does not exist, create as a lead
        contactDao.getContactByEmailAndAccount(toEmail, accountId, function(err, value){
            if(err) {
                self.log.error('Error searching for contact: ' + err);
                p1.reject();
            } else if(value === null) {
                //sweet.  The contact doesn't exist.  Let's create him/her
                contactDao.createContactLeadFromEmail(toEmail, accountId, function(err, savedContact){
                    if(err) {
                        self.log.error('Error creating contact: ' + err);
                        p1.reject();
                    } else {
                        self.log.debug('Created contact');
                        p1.resolve(savedContact);
                    }
                });
            } else {
                self.log.debug('contact already exists');
                p1.resolve(value);
            }
        });

        $.when(p1).done(function(contact){
            //create contact activity for subscribing to course
            var contactActivity = new $$.m.ContactActivity({
                accountId: accountId,
                contactId: contact.id(),
                activityType: $$.m.ContactActivity.types.COURSE_SUBSCRIBE,
                start:new Date(), //datestamp
                end:new Date()   //datestamp
            });
            contactActivityManager.createActivity(contactActivity, function(err, value){
                if(err) {
                    self.log.error('Error creating contact activity: ' + err);
                    return callback(err, null);
                }
                self.log.debug('Created subscribe to course activity');
                //addSubscriber
                self._addSubscriberByAccount(toEmail, course, accountId, timezoneOffset, contact.id(), function(err, value){
                    if(err) {
                        self.log.error('Error creating subscriber: ' + err);
                        return callback(err, null);
                    } else {
                        self.log.debug('Added subscriber');
                        accountDao.getAccountByID(accountId, function(err, account){
                            if(err) {
                                self.log.error('Error retrieving account: ' + err);
                                return callback(err, null);
                            }
                            self.log.debug('Got account.');
                            self.log.debug('toEmail: ' + toEmail + ', course: ' + course +', timezoneOffset:' + timezoneOffset + ', account: ' + account);
                            self._sendVAREmails(toEmail, course, timezoneOffset, account, function (result) {
                                self.log.debug('<< subscribeToCourse');
                                callback(null, result);
                            });
                        });

                    }
                });

            });
        });





    },

    subscribeToVARCourse: function (toEmail, courseMock, timezoneOffset, curUserId, callback) {
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
                                self._addSubscriber(toEmail, course, curUserId, timezoneOffset, function (error) {
                                    if (error) {
                                        callback('Error creating subscriber.', null);
                                    } else {
                                        self._sendVAREmails(toEmail, course, timezoneOffset, account, function (result) {
                                            callback(null, result);
                                        });
                                    }
                                });
                            }
                        });
                    }
                );
            }
        });

    },

    /**
     *
     * @param subAry of objects: {email: x, courseId: x, subscribeTime: x}
     * @param fn
     */
    bulkSubscribeToCourse: function(subAry, userId, accountId, fn) {
        var self = this;
        self.log.debug('>> bulkSubscribeToCourse');
        var timezoneOffset = 0;//TODO: calculate this.
        accountDao.getAccountByID(accountId, function(err, account){
            async.each(subAry, function(sub, callback){
                courseDao.getById(sub.courseId, $$.m.Course, function(err, course){
                    if(err) {
                        callback('Error finding course.');
                    }
                    self._addSubscriber(sub.email, course, userId, timezoneOffset, function (error) {
                        if (error) {
                            callback('Error creating subscriber.');
                        } else {
                            self._sendVAREmails(sub.email, course, timezoneOffset, account, function (result) {
                                callback();
                            });
                        }
                    });
                });

            }, function(err){
                if(err) {
                    self.log.error('Error creating subscriptions: ' + err);
                    fn(err, null);
                } else {
                    self.log.debug('<< bulkSubscribe');
                    fn(null, 'SUCCESS');
                }
            });
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

    getPagesByCampaign: function(accountId, campaignId, fn) {
        var self = this;
        self.log.debug('>> getPagesByCampaign(' + accountId + ',' + campaignId + ')');

        var query = {accountId:accountId, 'components.campaignId':campaignId};

        cmsDao.findMany(query, $$.m.cms.Page, function(err, pages){
            if(err) {
                self.log.error('Error getting pages: ' + err);
                return fn(err, null);
            } else {
                self.log.debug('<< getPagesByCampaign');
                return fn(null, pages);
            }
        });
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
        self.log.debug("_sendMessageToMandrill >>> ");

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
                "indigenous.io" //TODO: This should be dynamic
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
        };

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

    _getNowDateUtc: function () {
        var now = new Date();
        return now.toISOString();
    },

    _getUtcDateIsoString: function () {
        var now = new Date();
        var nowUtc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
        return nowUtc.toISOString();
    },
    _getScheduleUtcDateTimeIsoString: function (daysShift, hoursValue, minutesValue, timezoneOffset) {
        var now = new Date();
        now.setHours(hoursValue);
        now.setMinutes(minutesValue);
        now.setSeconds(0);
        var shiftedUtcDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysShift,
            now.getUTCHours(), now.getUTCMinutes() - timezoneOffset, now.getUTCSeconds());
        return shiftedUtcDate.toISOString();
    },

    _getScheduleUtcDateTimeIsoStringOLD: function (daysShift, hoursValue, minutesValue, timezoneOffset) {
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
            "from_email": "info@videoautoresponder.com",
            "from_name": "Video Autoresponder",
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
                    "content": "http://videoautoresponder.com"
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
                },
                {
                    "name": PERCENTS_VAR_NAME,
                    "content": ""
                },
                {
                    "name": VIDEO_INDEX_VAR_NAME,
                    "content": ""
                },
                {
                    "name": TOTAL_VIDEOS_VAR_NAME,
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
    },

    _addSubscriberByAccount: function(toEmail, course, accountId, timezoneOffset, contactId, callback) {
        var userNowDateUtc = this._getNowDateUtc();
        var subscriber = new $$.m.Subscriber({
            accountId: accountId,
            email: toEmail,
            contactId: contactId,
            courseId: course.id(),
            subscribeDate: userNowDateUtc,
            timezoneOffset: timezoneOffset
        });
        subscriberDao.saveOrUpdate(subscriber, function(err, value){
            callback(err, value);
        });
    },

    _addSubscriber: function (toEmail, course, userId, timezoneOffset, callback) {
        var userNowDateUtc = this._getNowDateUtc();
        subscriberDao.createSubscriber({email: toEmail, courseId: course.id(), subscribeDate: userNowDateUtc, userId: userId, timezoneOffset: timezoneOffset}, function (error, subscriber) {
            if (error || !subscriber) {
                return callback(error);
            } else {
                return callback();
            }
        });
    },

    _sendVAREmails: function (toEmail, course, timezoneOffset, account, callback) {
        var self = this;
        self.log.debug('>> _sendVAREmails');
        var host = account.get('subdomain') + "." + hostSuffix;
        var templateName = course.get('template').name;

        //base message
        var message = self._initPipeshiftMessage(toEmail);
        //var async = false;
        var successItemsCounter = 0;
        var videos = course.get('videos');
        var emails = course.get('emails');
        var messages = [];
        _.each(videos, function(_video){
            messages.push({video:_video});
        });
        _.each(emails, function(_email){
            messages.push({email:_email});
        });


        //loop through course videos and emails
        var i = 0;
        async.each(messages, function(msg, cb){
            var sendObj = {};
            if(msg.video) {
                var video = msg.video;
                message.subject = video.subject || course.get('title');
                // adjust values for current video
                self._setGlobalVarValue(message, LINK_VAR_NAME, "http://" + host + "/course/" + course.get('subdomain') + "/" + video.videoId);
                self._setGlobalVarValue(message, PREVIEW_IMAGE_VAR_NAME, video.videoBigPreviewUrl);
                self._setGlobalVarValue(message, TITLE_VAR_NAME, video.videoTitle);
                self._setGlobalVarValue(message, SUBTITLE_VAR_NAME, video.videoSubtitle);
                self._setGlobalVarValue(message, BODY_VAR_NAME, video.videoBody);
                self._setGlobalVarValue(message, PERCENTS_VAR_NAME, Math.round(100 * (i + 1) / videos.length));
                self._setGlobalVarValue(message, VIDEO_INDEX_VAR_NAME, i + 1);
                self._setGlobalVarValue(message, TOTAL_VIDEOS_VAR_NAME, videos.length);

                sendObj = self._initVideoTemplateSendObject(templateName, message, async);
                // schedule email
                // if time is in the past mandrill sends email immediately
                sendObj.send_at = self._getScheduleUtcDateTimeIsoString(video.scheduledDay, video.scheduledHour, video.scheduledMinute, timezoneOffset);

            } else if(msg.email) {
                var email = msg.email;
                message.subject = email.subject || email.title || course.get('title');
                //TODO: need to set title, picture, content
                sendObj = self._initVideoTemplateSendObject(templateName, message, async);
                // schedule email
                // if time is in the past mandrill sends email immediately
                sendObj.send_at = self._getScheduleUtcDateTimeIsoString(email.scheduledDay, email.scheduledHour, email.scheduledMinute, timezoneOffset);

            }
            // send template
            console.dir(sendObj);
            i++;
            mandrill_client.messages.sendTemplate(sendObj, function (result) {
                self.log.debug(result);
                cb();
            }, function (e) {
                self.log.warn('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                cb(e.name + ' - ' + e.message);
            });
        }, function(err){
            if(err) {
                self.log.warn('An error occurred calling mandrill: ' + err);
                return callback(err, null);
            } else {
                self.log.debug('<< _sendVAREmails');
                return callback(null, {});
            }
        });


    },

    _startCampaignFlows: function(campaign) {
        var self = this;
        self.log.debug('>> _startCampaignFlows');
        var accountId = campaign.get('accountId');
        var campaignId = campaign.id();
        var query = {
            accountId:accountId,
            campaignId:campaignId
        };

        campaignDao.findMany(query, $$.m.CampaignFlow, function(err, flows){
            if(err || !flows) {
                self.log.error('Error finding flows for campaign [' + campaign.id() + ']:', err);
                return;
            } else {
                async.each(flows, function startFlow(flow, cb){
                    self.handleStep(flow, 0, function(err, value){
                        if(err) {
                            self.log.error('Error handling step of campaign: ' + err);
                            self.log.debug('This error was for the flow', flow);
                        } else {
                            self.log.debug('<< addContactToCampaign');
                            cb();
                        }
                    });
                }, function done(err){
                    self.updateCampaignStatus(accountId, campaignId, function(err, value){
                        self.log.debug('<< _startCampaignFlows');
                        return;
                    });

                });
            }
        });
    },

    getCampaignEmailData: function(emailId, fn) {
        var self = this;
        self.log.debug('>> getCampaignEmailData');
        emailMessageManager.getMessageInfo(emailId, fn);
    }

}
;