/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

/**
 * Note:
 * - the base URL for this API endpoint is 'campaign' which makes API URLs look like '/campaign/campaign/something' etc.
 */

var baseApi = require('../base.api');
var campaignManager = require('../../campaign/campaign_manager');
var accountDao = require('../../dao/account.dao');
var emailMessageManager = require('../../emailmessages/emailMessageManager');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "campaigns",

    log: $$.g.getLogger("campaigns.api"),

    initialize: function () {

        app.post(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.createCampaign.bind(this));
        app.post(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.updateCampaign.bind(this));
        app.post(this.url(':id/duplicate'), this.isAuthAndSubscribedApi.bind(this), this.duplicateCampaign.bind(this));
        app.post(this.url(':id/activate'), this.isAuthAndSubscribedApi.bind(this), this.activateCampaign.bind(this));
        app.get(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.getCampaign.bind(this));
        app.get(this.url(':id/statistics'), this.isAuthAndSubscribedApi.bind(this), this.getCampaignStatistics.bind(this));
        app.get(this.url(':id/statistics/reconcile'), this.isAuthAndSubscribedApi.bind(this), this.reconcileCampaignStatistics.bind(this));//TODO
        app.get(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.findCampaigns.bind(this));
        app.delete(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.deleteCampaign.bind(this));//TODO
        app.delete(this.url(':id/cancel'), this.isAuthAndSubscribedApi.bind(this), this.cancelCampaign.bind(this));//TODO
        app.get(this.url(':id/campaigns/:title'), this.isAuthAndSubscribedApi.bind(this), this.checkIfCampaignExists.bind(this));
        app.get(this.url('campaigns/exists/:title'), this.isAuthAndSubscribedApi.bind(this), this.checkIfCampaignExists.bind(this));

        app.post(this.url(':id/contact/:contactid'), this.isAuthAndSubscribedApi.bind(this), this.addContactToCampaign.bind(this));
        app.post(this.url(':id/contacts'), this.isAuthAndSubscribedApi.bind(this), this.bulkAddContactToCampaign.bind(this));
        app.post(this.url(':id/running/contact/:contactid/steps/:stepNumber'), this.setup.bind(this), this.triggerCampaignStep.bind(this));

        app.get(this.url(':id/contacts'), this.isAuthAndSubscribedApi.bind(this), this.getContactsForCampaign.bind(this));



        /*
         * Not sure if these are needed
         */

        app.delete(this.url(':id/contact/:contactid'), this.isAuthAndSubscribedApi.bind(this), this.cancelContactCampaign.bind(this));
        app.get(this.url(':id/pages'), this.isAuthAndSubscribedApi.bind(this), this.getPagesWithCampaign.bind(this));
        app.get(this.url(':id/running'), this.isAuthAndSubscribedApi.bind(this), this.getRunningCampaign.bind(this));
        //app.get(this.url('campaigns/running'), this.isAuthAndSubscribedApi.bind(this), this.getRunningCampaigns.bind(this));
        app.get(this.url('running/contact/:id'), this.isAuthAndSubscribedApi.bind(this), this.getRunningCampaignsForContact.bind(this));
        app.get(this.url('emails/:id'), this.isAuthAndSubscribedApi.bind(this), this.getEmailData.bind(this));

    },



    createCampaign: function (req, resp) {

        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> createCampaign');


        self.checkPermission(req, self.sc.privs.MODIFY_CAMPAIGN, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var campaignObj = new $$.m.CampaignV2(req.body);
                campaignObj.set('accountId', accountId);

                var createdObj = {date: new Date(), by: req.user.id()};
                campaignObj.set('created', createdObj);
                campaignObj.set('modified', createdObj);
                campaignManager.createCampaign_v2(campaignObj, function(err, value){
                    if(err) {
                        self.log.error('Error creating campaign:', err);
                    }
                    self.log.debug('<< createCampaign');
                    self.sendResultOrError(resp, err, value, "Error creating campaign");
                    self.createUserActivity(req, 'CREATE_CAMPAIGN', null, null, function(){});
                });
            }
        });

    },

    updateCampaign: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> updateCampaign');
        var campaignId = req.params.id;


        self.checkPermission(req, self.sc.privs.MODIFY_CAMPAIGN, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                /*
                var campaignObj = new $$.m.Campaign(req.body);
                campaignObj.set('_id', campaignId);
                var modified = {
                    by: req.user.id(),
                    date: new Date()
                };
                 var created = campaignObj.get('created');

                if (created && _.isString(campaignObj.get('created').date)) {
                    created.date = moment(campaignObj.date).toDate();
                }
                campaignObj.set('modified', modified);
                */
                var campaignJSON = req.body;
                campaignManager.updateCampaign(accountId, userId, campaignId, campaignJSON, function(err, value){
                    self.log.debug(accountId, userId, '<< updateCampaign');
                    self.sendResultOrError(resp, err, value, "Error updating campaign");
                    self.createUserActivity(req, 'UPDATE_CAMPAIGN', null, null, function(){});
                });
            }
        });


    },

    addContactToCampaign: function(req, resp) {
        var self = this;
        self.log.debug('>> addContactToCampaign');
        var campaignId = req.params.id;
        var contactId = parseInt(req.params.contactid);
        var accountId = parseInt(self.accountId(req));
        if(!contactId || contactId ===0) {
            return self.wrapError(resp, 400, 'Bad Request', 'Parameter contactId required.');
        }

        self.checkPermission(req, self.sc.privs.MODIFY_CAMPAIGN, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                campaignManager.addContactToCampaign(contactId, campaignId, accountId, function(err, value){
                    self.log.debug('<< addContactToCampaign');
                    self.sendResultOrError(resp, err, value, "Error adding contact to campaign");
                    self.createUserActivity(req, 'UPDATE_CAMPAIGN', null, null, function(){});
                });
            }
        });

    },

    /**
     * This method expects an array called "ids" in the body of the request.
     * @param req
     * @param resp
     */
    bulkAddContactToCampaign: function(req, resp) {
        var self = this;
        self.log.debug('>> bulkAddContactToCampaign');
        var campaignId = req.params.id;
        var contactIdAry = req.body;
        self.log.debug('Got ids: ', contactIdAry);
        var accountId = parseInt(self.accountId(req));

        self.checkPermission(req, self.sc.privs.MODIFY_CAMPAIGN, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                campaignManager.bulkAddContactToCampaign(contactIdAry, campaignId, accountId, function(err, value){
                    self.log.debug('<< bulkAddContactToCampaign');
                    self.sendResultOrError(resp, err, value, "Error adding contacts to campaign");
                    self.createUserActivity(req, 'UPDATE_CAMPAIGN', null, null, function(){});
                });
            }
        });

    },

    /**
     * This method expects campaign ID in the URL
     * @param req
     * @param resp
     */
    deleteCampaign: function(req, resp) {
        var self = this;
        self.log.debug('>> deleteCampaign');
        var campaignId = req.params.id;
        var accountId = parseInt(self.accountId(req));

        self.checkPermission(req, self.sc.privs.MODIFY_CAMPAIGN, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                campaignManager.deleteCampaign(campaignId, accountId, function(err, value){
                    if(err) {
                        self.wrapError(resp, 500, err, "Error deleting campaign");
                    } else {
                        self.log.debug('<< deleteCampaign');
                        self.send200(resp);
                        self.createUserActivity(req, 'DELETE_CAMPAIGN', null, null, function(){});
                    }
                });
            }
        });
    },

    cancelCampaign: function(req, resp) {
        var self = this;
        self.log.debug('>> cancelRunningCampaign');
        var campaignId = req.params.id;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.checkPermission(req, self.sc.privs.MODIFY_CAMPAIGN, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                campaignManager.cancelRunningCampaign(campaignId, accountId, userId, function(err, value){
                    self.log.debug('<< cancelRunningCampaign');
                    self.sendResultOrError(resp, err, value, "Error cancelling campaign");
                    self.createUserActivity(req, 'CANCEL_CAMPAIGN', null, null, function(){});
                });
            }
        });
    },

    getCampaign: function (req, resp) {
        var self = this;
        self.checkPermission(req, self.sc.privs.VIEW_CAMPAIGN, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                campaignManager.getCampaign(req.params.id, function (err, value) {
                    if (err) {
                        var errorMsg = "There was an error getting campaign " + req.params.id + ": " + err.message;
                        self.log.error(errorMsg);
                        self.log.error(err.stack);
                        self.wrapError(resp, 500, errorMsg, err, value);
                    } else {
                        self.sendResult(resp, value);
                    }
                });
            }
        });
    },


    checkIfCampaignExists: function (req, resp) {
        var self = this;
        var title = decodeURIComponent(req.params.title);
        console.log(req.params);
        var accountId = parseInt(self.accountId(req));
        self.checkPermission(req, self.sc.privs.VIEW_CAMPAIGN, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                campaignManager.checkIfCampaignExists(accountId, req.params.id, title, function (err, value) {
                    if (err) {
                        var errorMsg = "There was an error getting campaign " + req.params.id + ": " + err.message;
                        self.log.error(errorMsg);
                        self.log.error(err.stack);
                        self.wrapError(resp, 500, errorMsg, err, value);
                    } else {
                        self.sendResult(resp, value);
                    }
                });
            }
        });
    },

    getCampaignStatistics: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getCampaignStatistics');
        var campaignId = req.params.id;
        self.checkPermission(req, self.sc.privs.VIEW_CAMPAIGN, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                emailMessageManager.findMessagesByCampaign(accountId, campaignId, userId, function(err, messages){
                    self.log.debug(accountId, userId, '<< getCampaignStatistics');
                    self.sendResultOrError(resp, err, messages, "Error finding campaign messages");
                });
            }
        });
    },

    reconcileCampaignStatistics: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> reconcileCampaignStatistics');
        var campaignId = req.params.id;
        self.checkPermission(req, self.sc.privs.VIEW_CAMPAIGN, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                emailMessageManager.findMessagesByCampaign(accountId, campaignId, userId, function(err, messages){
                    if(messages) {
                        campaignManager.reconcileCampaignStatistics(campaignId, messages, function(err, campaign){
                            self.log.debug(accountId, userId, '<< reconcileCampaignStatistics');
                            self.sendResultOrError(resp, err, messages, "Error finding campaign messages");
                        });
                    } else {
                        self.wrapError(resp, 500, 'Error', 'Error finding campaign messages');
                    }

                });

            }
        });
    },

    findCampaigns: function (req, resp) {
        var self = this;

        var accountId = parseInt(self.accountId(req));
        self.checkPermission(req, self.sc.privs.VIEW_CAMPAIGN, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                if (!req.query._id) {
                    req.query._id = { $ne: "__counter__" };
                }
                req.query.accountId = accountId;

                campaignManager.findCampaigns(req.query, function (err, value) {
                    if (err) {
                        var errorMsg = "There was an error finding campaign: " + err.message;
                        self.log.error(errorMsg);
                        self.log.error(err.stack);
                        self.wrapError(resp, 500, errorMsg, err, value);
                    } else {
                        self.sendResult(resp, value);
                    }
                });
            }
        });

    },

    /**
     * This method expects campaignId and contactId in url
     * @param req
     * @param resp
     */
    cancelContactCampaign: function (req, resp) {
        var self = this;
        self.log.debug('>> cancelContactCampaign');

        var accountId = parseInt(self.accountId(req));
        var campaignId = req.params.id;
        var contactId = parseInt(req.params.contactid);


        self.checkPermission(req, self.sc.privs.MODIFY_CAMPAIGN, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                campaignManager.cancelCampaignForContact(accountId, campaignId, contactId, function(err, value){
                    self.log.debug('<< cancelContactCampaign');
                    self.sendResultOrError(resp, err, value, "Error cancelling campaign");
                    self.createUserActivity(req, 'CANCEL_CAMPAIGN', null, null, function(){});
                });
            }
        });
    },

    getPagesWithCampaign: function(req, resp) {
        var self = this;
        self.log.debug('>> getPagesWithCampaign');

        var accountId = parseInt(self.accountId(req));
        var campaignId = req.params.id;

        self.checkPermission(req, self.sc.privs.VIEW_CAMPAIGN, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                campaignManager.getPagesByCampaign(accountId, campaignId, function(err, pages){
                    self.log.debug('<< getPagesWithCampaign');
                    self.sendResultOrError(resp, err, pages, 'Error getting pages');
                });
            }
        });


    },

    /**
     * This method expects id url param
     * @param req
     * @param resp
     */
    getRunningCampaign: function(req, resp) {
        var self = this;
        self.log.debug('>> getRunningCampaign');

        var runningCampaignId = req.params.id;
        var accountId = parseInt(self.accountId(req));

        self.checkPermission(req, self.sc.privs.VIEW_CAMPAIGN, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                campaignManager.getRunningCampaign(accountId, runningCampaignId, function(err, value){
                    self.log.debug('<< getRunningCampaign');
                    self.sendResultOrError(resp, err, value, 'Error getting running campaign');
                });
            }
        });

    },

    /**
     *
     * @param req
     * @param resp
     */
    getRunningCampaigns: function(req, resp) {
        var self = this;
        self.log.debug('>> getRunningCampaigns');

        var accountId = parseInt(self.accountId(req));

        self.checkPermission(req, self.sc.privs.VIEW_CAMPAIGN, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                campaignManager.getRunningCampaigns(accountId, function(err, value){
                    self.log.debug('<< getRunningCampaigns');
                    self.sendResultOrError(resp, err, value, 'Error getting running campaign');
                });
            }
        });
    },

    /**
     * This method expects id url param
     * @param req
     * @param resp
     */
    getRunningCampaignsForContact: function(req, resp) {
        var self = this;
        self.log.debug('>> getRunningCampaignsForContact');

        var accountId = parseInt(self.accountId(req));
        var contactId = parseInt(req.params.id);

        self.checkPermission(req, self.sc.privs.VIEW_CAMPAIGN, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                campaignManager.getRunningCampaignsForContact(accountId, contactId, function(err, value){
                    self.log.debug('<< getRunningCampaignsForContact');
                    self.sendResultOrError(resp, err, value, 'Error getting running campaigns for contact');
                });
            }
        });
    },

    /**
     * This method has the following url params:
     *  - id: campaignId
     *  - contactid: contactId
     *  - stepNumber: stepNumber
     * @param req
     * @param resp
     * *NOTE* this method has NO security.  It can be invoked from anywhere.
     */
    triggerCampaignStep: function(req, resp) {
        //campaigns/:id/running/contact/:contactid/steps/:stepNumber
        var self = this;
        self.log.debug('>> triggerCampaignStep');

        var accountId = parseInt(self.currentAccountId(req));
        var campaignId = req.params.id;
        var contactId = parseInt(req.params.contactid);
        var stepNumber = parseInt(req.params.stepNumber);

        campaignManager.triggerCampaignStep(accountId, campaignId, contactId, stepNumber, function(err, value){
            self.log.debug('<< triggerCampaignStep');
            self.sendResultOrError(resp, err, value, 'Error triggering campaign step');
        });


    },

    /**
     *
     * @param req
     * @param resp
     */
    getContactsForCampaign: function(req, resp) {
        var self = this;
        self.log.debug('>> getContactsForCampaign');
        var accountId = parseInt(self.accountId(req));
        var campaignId = req.params.id;
        self.checkPermission(req, self.sc.privs.VIEW_CAMPAIGN, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                campaignManager.getContactsForCampaign(accountId, campaignId, function(err, contacts){
                    self.log.debug('<< getContactsForCampaign');
                    self.sendResultOrError(resp, err, contacts, 'Error getting contacts');
                });
            }
        });

    },

    duplicateCampaign: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = parseInt(self.accountId(req));
        self.log.debug(accountId, userId, '>> duplicateCampaign');

        var campaignId = req.params.id;
        var campaignName = req.body['name'] + ' (copy) ' + moment().toDate().getTime();

        self.checkPermission(req, self.sc.privs.MODIFY_CAMPAIGN, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                campaignManager.duplicateCampaign(accountId, campaignId, campaignName, userId, function(err, campaign){
                    self.log.debug(accountId, userId, '<< duplicateCampaign');
                    self.sendResultOrError(resp, err, campaign, 'Error duplicating campaign');
                });
            }
        });
    },

    activateCampaign: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = parseInt(self.accountId(req));
        var campaignId = req.params.id;
        self.log.debug(accountId, userId, '>> activateCampaign [' + campaignId + ']');

        self.checkPermission(req, self.sc.privs.MODIFY_CAMPAIGN, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                campaignManager.activateCampaign(accountId, userId, campaignId, function(err, campaign){
                    self.log.debug(accountId, userId, '<< activateCampaign');
                    self.sendResultOrError(resp, err, campaign, 'Error activating campaign');
                });
            }
        });
    },

    getEmailData: function(req, resp) {
        var self = this;
        self.log.debug('>> getEmailData');
        var accountId = parseInt(self.accountId(req));
        var emailId = req.params.id;
        self.checkPermission(req, self.sc.privs.MODIFY_CAMPAIGN, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                campaignManager.getCampaignEmailData(emailId, function(err, data){
                    self.log.debug('<< getEmailData');
                    self.sendResultOrError(resp, err, data, 'Error getting email data');
                });
            }
        });
    }


});

module.exports = new api();
