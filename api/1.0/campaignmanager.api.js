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
        app.get(this.url('campaigns/:id/pages'), this.setup.bind(this), this.getPagesWithCampaign.bind(this));
        //pipeshift
        app.post(this.url('pipeshift/courses/:courseId/subscribe'), this.subscribeToVARCourse.bind(this));
        app.post(this.url('courses/:id/subscribe'), this.subscribeToVARCourse.bind(this));//better URL
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


    /**
     * No security.  This is a public API
     * @param req
     * @param resp
     */
    subscribeToVARCourse: function (req, resp) {
        var self = this;
        self.log.debug('>> subscribeToVARCourse');
        var accountId = 0;
        accountDao.getAccountByHost(req.get("host"), function(err, value) {
            if (!err && value != null) {
                if (value === true) {
                    accountId = 0;
                } else {
                    accountId = value.id();
                }
            }
            var toEmail = req.body.email;
            var courseObj = req.body.course;
            courseObj._id = req.params.id;
            var course = new $$.m.Course(courseObj);

            var timezoneOffset = req.body.timezoneOffset;

            if (!course) {
                self.wrapError(resp,400,"","No course provided","");
            } else {
                campaignManager.subscribeToCourse(toEmail, course, accountId, timezoneOffset, function(err, result){
                    self.log.debug('<< subscribeToVARCourse');
                    self.sendResultOrError(resp, err, result, "Could not send the course-scheduled emails.", 500);
                });
            }
        });

    },

    getPipeshiftTemplates: function (req, resp) {
        var self = this;
        campaignManager.getPipeshiftTemplates(function (err, result) {
            self.sendResultOrError(resp, err, result, "Could not get templates for pipeshift.", 400);
        });
    }
});

module.exports = new api();

