/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var campaignManager = require('../../campaign/campaign_manager');

var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "campaignmanager",

    log: $$.g.getLogger("campaignmanager.api"),

    initialize: function() {
        app.post(this.url('campaign'), this.createCampaign.bind(this));
        app.post(this.url('campaign/:id/contact/:contactid'), this.addContactToCampaign.bind(this));
        app.delete(this.url('campaign/:id'), this.cancelCampaign.bind(this));
        app.delete(this.url('campaign/:id/contact/:contactid'), this.cancelContactCampaign.bind(this));
    },

    cancelCampaign: function(req, resp) {
        var self = this;

        self.log.debug("cancel campaign " + req.params.id);

        campaignManager.cancelMandrillCampaign(req.params.id, function(err, value) {
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

    cancelContactCampaign: function(req, resp) {
        var self = this;

        self.log.debug("cancel contact " + req.params.contactid + " in campaign " + req.params.id);

        campaignManager.cancelContactMandrillCampaign(req.params.id, parseInt(req.params.contactid), function(err, value) {
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

    createCampaign: function(req,resp) {

        var self = this;

        self.log.debug("creating campaign: " + req.body);

        campaignManager.createMandrillCampaign(
            req.body.name,
            req.body.description,
            req.body.revision,
            req.body.templateName,
            req.body.numberOfMessages,
            req.body.messageDeliveryFrequency,
            function(err, value) {
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

    addContactToCampaign: function(req, resp) {
        var self = this;

        self.log.debug("add contact " + req.params.contactid + " to campaign " + req.params.id);

        campaignManager.addContactToMandrillCampaign(
            req.params.id,
            parseInt(req.params.contactid),
            req.body.arrayOfMergeVarsArrays,
            function(err, value) {
                if (err) {
                    var errorMsg = "There was an error creating campaign: " + err.message;
                    self.log.error(errorMsg);
                    self.log.error(err.stack);
                    self.wrapError(resp, 400, errorMsg, err, value);
                } else {
                    self.sendResult(resp, value);
                }
            })
    }
});

module.exports = new api();

