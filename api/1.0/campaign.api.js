/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var campaignManager = require('../../campaign/campaign_manager');
var accountDao = require('../../dao/account.dao');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "campaign",

    log: $$.g.getLogger("campaign.api"),

    initialize: function () {
        app.post(this.url('campaign'), this.isAuthAndSubscribedApi.bind(this), this.createCampaign.bind(this));
        app.post(this.url('campaign/:id'), this.isAuthAndSubscribedApi.bind(this), this.updateCampaign.bind(this));
        app.post(this.url('campaign/:id/contact/:contactid'), this.isAuthAndSubscribedApi.bind(this), this.addContactToCampaign.bind(this));
        app.post(this.url('campaign/:id/contacts'), this.isAuthAndSubscribedApi.bind(this), this.bulkAddContactToCampaign.bind(this));
        app.delete(this.url('campaign/:id'), this.isAuthAndSubscribedApi.bind(this), this.cancelRunningCampaign.bind(this));
        app.delete(this.url('campaign/:id/contact/:contactid'), this.isAuthAndSubscribedApi.bind(this), this.cancelContactCampaign.bind(this));
        app.get(this.url('campaign/:id'), this.isAuthAndSubscribedApi.bind(this), this.getCampaign.bind(this));

        app.get(this.url('campaigns'), this.isAuthAndSubscribedApi.bind(this), this.findCampaigns.bind(this));
        app.get(this.url('campaigns/:id/pages'), this.isAuthAndSubscribedApi.bind(this), this.getPagesWithCampaign.bind(this));
        app.get(this.url('campaigns/:id/running'), this.isAuthAndSubscribedApi.bind(this), this.getRunningCampaign.bind(this));
        app.get(this.url('campaigns/running'), this.isAuthAndSubscribedApi.bind(this), this.getRunningCampaigns.bind(this));
        app.get(this.url('campaigns/running/contact/:id'), this.isAuthAndSubscribedApi.bind(this), this.getRunningCampaignsForContact.bind(this));
        app.post(this.url('campaigns/:id/running/contact/:contactid/steps/:stepNumber'), this.setup.bind(this), this.triggerCampaignStep.bind(this));
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
                var createdObj = campaignObj.get('created');
                createdObj.by = req.user;
                campaignObj.set('created', createdObj);
                campaignManager.createCampaign(campaignObj, function(err, value){
                    self.log.debug('<< createCampaign');
                    self.sendResultOrError(resp, err, value, "Error creating campaign");
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
                    by: req.user,
                    date: new Date()
                };
                campaignObj.set('modified', modified);
                campaignManager.updateCampaign(campaignObj, function(err, value){
                    self.log.debug('<< updateCampaign');
                    self.sendResultOrError(resp, err, value, "Error updating campaign");
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
        var contactIdAry = req.body.ids;
        self.log.debug('Got ids: ', contactIdAry);
        var accountId = parseInt(self.accountId(req));

        self.checkPermission(req, self.sc.privs.MODIFY_CAMPAIGN, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                campaignManager.bulkAddContactToCampaign(contactIdAry, campaignId, accountId, function(err, value){
                    self.log.debug('<< bulkAddContactToCampaign');
                    self.sendResultOrError(resp, err, value, "Error adding contacts to campaign");
                });
            }
        });

    },

    /**
     * This method expects campaign ID in the URL
     * @param req
     * @param resp
     */
    cancelRunningCampaign: function(req, resp) {
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
        //TODO: this
        //campaigns/:id/running/contact/:contactid/steps/:stepNumber
        var self = this;
        self.log.debug('>> triggerCampaignStep');

        var accountId = parseInt(self.accountId(req));
        var campaignId = req.params.id;
        var contactId = parseInt(req.params.contactid);
        var stepNumber = parseInt(req.params.stepNumber);

        campaignManager.triggerCampaignStep(accountId, campaignId, contactId, stepNumber, function(err, value){
            self.log.debug('<< triggerCampaignStep');
            self.sendResultOrError(resp, err, value, 'Error triggering campaign step');
        });


    }


});

module.exports = new api();

