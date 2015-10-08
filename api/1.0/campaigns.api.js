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
        app.get(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.getCampaign.bind(this));
        app.get(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.findCampaigns.bind(this));
        app.delete(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.deleteCampaign.bind(this));

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


    },

    createCampaign: function (req, resp) {

        var self = this;
        self.log.debug('>> createCampaign');
        var accountId = parseInt(self.accountId(req));

        self.checkPermission(req, self.sc.privs.MODIFY_CAMPAIGN, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var campaignObj = new $$.m.Campaign(req.body);
                campaignObj.set('accountId', accountId);
                var createdObj = campaignObj.get('created') || {};
                createdObj.by = req.user.id();
                campaignObj.set('created', createdObj);
                campaignManager.createCampaign(campaignObj, function(err, value){
                    self.log.debug('<< createCampaign');
                    self.sendResultOrError(resp, err, value, "Error creating campaign");
                    self.createUserActivity(req, 'CREATE_CAMPAIGN', null, null, function(){});
                });
            }
        });

    },

    updateCampaign: function(req, resp) {
        var self = this;
        self.log.debug('>> updateCampaign');
        var campaignId = req.params.id;
        var accountId = parseInt(self.accountId(req));

        self.checkPermission(req, self.sc.privs.MODIFY_CAMPAIGN, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var campaignObj = new $$.m.Campaign(req.body);
                campaignObj.set('_id', campaignId);
                var modified = {
                    by: req.user.id(),
                    date: new Date()
                };
                campaignObj.set('modified', modified);
                campaignManager.updateCampaign(campaignObj, function(err, value){
                    self.log.debug('<< updateCampaign');
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
        self.log.debug('>> cancelRunningCampaign');
        var campaignId = req.params.id;
        var accountId = parseInt(self.accountId(req));

        self.checkPermission(req, self.sc.privs.MODIFY_CAMPAIGN, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                campaignManager.cancelRunningCampaign(campaignId, accountId, function(err, value){
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
        self.log.debug('>> duplicateCampaign');
        var accountId = parseInt(self.accountId(req));
        var campaignId = req.params.id;
        var campaignName = req.body['name'];
        var userId = self.userId(req);
        self.checkPermission(req, self.sc.privs.MODIFY_CAMPAIGN, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                campaignManager.duplicateCampaign(accountId, campaignId, campaignName, userId, function(err, campaign){
                    self.log.debug('<< duplicateCampaign');
                    self.sendResultOrError(resp, err, campaign, 'Error duplicating campaign');
                });
            }
        });
    }


});

module.exports = new api();