/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var campaignManager = require('../../campaign/campaign_manager');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "campaignmanager", //TODO: this should be renamed.  campaigns

    log: $$.g.getLogger("campaignmanager.api"),

    initialize: function () {
        app.post(this.url('campaign'), this.createCampaign.bind(this));
        app.post(this.url('campaign/:id/contact/:contactid'), this.addContactToCampaign.bind(this));
        app.delete(this.url('campaign/:id'), this.cancelCampaign.bind(this));
        app.delete(this.url('campaign/:id/contact/:contactid'), this.cancelContactCampaign.bind(this));
        app.get(this.url('campaigns'), this.findCampaigns.bind(this));
        app.get(this.url('campaign/:id/messages'), this.findCampaignMessages.bind(this));
        app.get(this.url('campaign/:id'), this.getCampaign.bind(this));
        //pipeshift
        app.post(this.url('pipeshift/courses/:courseId/subscribe'), this.subscribeToVARCourse.bind(this));
        app.get(this.url('pipeshift/templates'), this.getPipeshiftTemplates.bind(this));
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

    findCampaignMessages: function (req, resp) {
        var self = this;

        var accountId = parseInt(self.accountId(req));
        //TODO: add security - VIEW_CAMPAIGN
        req.query.campaignId = req.params.id;
        req.query.accountId = accountId;

        if (!req.query._id) {
            req.query._id = { $ne: "__counter__" };
        }

        if (req.query.contactId) {
            req.query.contactId = parseInt(req.query.contactId);
        }

        campaignManager.findCampaignMessages(req.query, function (err, value) {
            if (err) {
                var errorMsg = "There was an error finding campaign messages: " + err.message;
                self.log.error(errorMsg);
                self.log.error(err.stack);
                self.wrapError(resp, 500, errorMsg, err, value);
            } else {
                self.sendResult(resp, value);
            }
        })
    },

    cancelCampaign: function (req, resp) {
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

    cancelContactCampaign: function (req, resp) {
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

    createCampaign: function (req, resp) {

        var self = this;
        var accountId = parseInt(self.accountId(req));
        //TODO: add security - MODIFY_CAMPAIGN


        self.log.debug("creating campaign: " + req.body);

        campaignManager.createMandrillCampaign(//TODO: Add accountId
            req.body.name,
            req.body.description,
            req.body.revision,
            req.body.templateName,
            req.body.numberOfMessages,
            req.body.messageDeliveryFrequency,
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

    addContactToCampaign: function (req, resp) {
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


    subscribeToVARCourse: function (req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        //TODO: add security - MODIFY_CAMPAIGN

        var toEmail = req.body.email;
        var course = req.body.course;
        var timezoneOffset = req.body.timezoneOffset;

        if (!course) {
            self.wrapError(resp,500,"","No course provided","");
        } else {
            campaignManager.subscribeToVARCourse(toEmail, course, timezoneOffset, this.userId(req), function (err, result) {
                self.sendResultOrError(resp, err, result, "Could not send videoautoresponder scheduled emails.", 400);
            });
        }
    },

    getPipeshiftTemplates: function (req, resp) {
        var self = this;
        campaignManager.getPipeshiftTemplates(function (err, result) {
            self.sendResultOrError(resp, err, result, "Could not get templates for pipeshift.", 400);
        });
    }
});

module.exports = new api();

