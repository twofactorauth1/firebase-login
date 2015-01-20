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
        app.post(this.url('campaigns/running/contact/:id/steps/:stepNumber'), this.triggerCampaignStep.bind(this));
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

    bulkAddContactToCampaign: function(req, resp) {
        //TODO: this.
    },

    cancelRunningCampaign: function(req, resp) {
        //TODO: this.
    },

    cancelContactInCampaign: function(req, resp) {
        //TODO: this.
    },

    getCampaign: function (req, resp) {
        var self = this;
        //TODO: add security - VIEW_CAMPAIGN
        campaignManager.getCampaign(req.params.id, function (err, value) {
            if (err) {
                var errorMsg = "There was an error getting campaign " + req.params.id + ": " + err.message;
                self.log.error(errorMsg);
                self.log.error(err.stack);
                self.wrapError(resp, 500, errorMsg, err, value);
            } else {
                self.sendResult(resp, value);
            }
        })
    },

    findCampaigns: function (req, resp) {
        var self = this;

        var accountId = parseInt(self.accountId(req));
        //TODO: add security - VIEW_CAMPAIGN
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
        })
    },



    _cancelCampaign: function (req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        //TODO: add security - MODIFY_CAMPAIGN

        self.log.debug("cancel campaign " + req.params.id);

        campaignManager.cancelMandrillCampaign(req.params.id, function (err, value) {
            if (err) {
                var errorMsg = "There was an error cancelling campaign " + req.params.id + ": " + err.message;
                self.log.error(errorMsg);
                self.log.error(err.stack);
                self.wrapError(resp, 400, errorMsg, err, value);
            } else {
                self.sendResult(resp, value);
            }
        })
    },

    _cancelContactCampaign: function (req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        //TODO: add security - MODIFY_CAMPAIGN

        self.log.debug("cancel contact " + req.params.contactid + " in campaign " + req.params.id);

        campaignManager.cancelContactMandrillCampaign(req.params.id, parseInt(req.params.contactid), function (err, value) {
            if (err) {
                var errorMsg = "There was an error cancelling contact " + req.params.contactid + " in campaign "
                    + req.params.id + ": " + err.message;
                self.log.error(errorMsg);
                self.log.error(err.stack);
                self.wrapError(resp, 400, errorMsg, err, value);
            } else {
                self.sendResult(resp, value);
            }
        })
    },



    _addContactToCampaign: function (req, resp) {
        var self = this;

        var accountId = parseInt(self.accountId(req));
        //TODO: add security - MODIFY_CAMPAIGN

        self.log.debug("add contact " + req.params.contactid + " to campaign " + req.params.id);

        campaignManager.addContactToMandrillCampaign(
            req.params.id,
            parseInt(req.params.contactid),
            req.body.arrayOfMergeVarsArrays,
            function (err, value) {
                if (err) {
                    var errorMsg = "There was an error creating campaign: " + err.message;
                    self.log.error(errorMsg);
                    self.log.error(err.stack);
                    self.wrapError(resp, 400, errorMsg, err, value);
                } else {
                    self.sendResult(resp, value);
                }
            })
    },

    getPagesWithCampaign: function(req, resp) {
        var self = this;
        self.log.debug('>> getPagesWithCampaign');

        var accountId = parseInt(self.accountId(req));
        var campaignId = req.params.id;

        //TODO: add security - VIEW_CAMPAIGN

        campaignManager.getPagesByCampaign(accountId, campaignId, function(err, pages){
            self.log.debug('<< getPagesWithCampaign');
            self.sendResultOrError(resp, err, pages, 'Error getting pages');
        });
    },

    getRunningCampaign: function(req, resp) {
        //TODO: this
    },

    getRunningCampaigns: function(req, resp) {
        //TODO: this
    },

    getRunningCampaignsForContact: function(req, resp) {
        //TODO: this
    },

    triggerCampaignStep: function(req, resp) {
        //TODO: this
    }


});

module.exports = new api();

