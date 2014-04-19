/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var emailDataDao = require('../../dao/emaildata.dao');


var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "emaildata",

    dao: emailDataDao,

    initialize: function() {
        //EMAIL SOURCES
        app.get(this.url('sources'), this.isAuthApi, this.getEmailSources.bind(this));
        app.post(this.url('source'), this.isAuthApi, this.createEmailSource.bind(this));

        //MESSAGES
        app.get(this.url(':sourceid/messages'), this.isAuthApi, this.getMessages.bind(this));
        app.get(this.url(':sourceid/message/:messageid'), this.isAuthApi, this.getMessageById.bind(this));
    },


    getEmailSources: function(req, resp) {
        //Todo, implement security
        var self = this;
        var accountId = this.accountId(req);
        if (accountId == null) {
            return this.wrapError(resp, 403, "Cannot retrieve ContextIO information", "An account id must be specific to return this information");
        }

        emailDataDao.getEmailSources(req.user, accountId, function(err, value) {
            self.sendResultOrError(resp, err, value, "Error retrieving email sources");
        });
    },


    createEmailSource: function(req, resp) {
        //Todo, implement security
        var self = this;
        var accountId = this.accountId(req);
        if (accountId == null) {
            return this.wrapError(resp, 403, "Cannot create Email Source", "An account id must be specific to return this information");
        }

        var body = req.body;
        emailDataDao.createEmailSource(req.user, accountId, body.email, body.username, body.password, body.imapServer, body.port, function(err, value) {
            self.sendResultOrError(resp, err, value, "Error creating email source");
        });
    },


    getMessages: function(req, resp) {
        //TODO: Implement security
        var self = this;
        var sourceId = req.params.sourceid;
        var accountId = this.accountId(req);

        var includeBody = req.query.includebody;
        var options = {
            email: req.query.email,
            limit: req.query.limit,
            offset: req.query.offset,
            start: req.query.start,
            end: req.query.end,
            includeBody: (includeBody == "t" || includeBody == "true" || includeBody == 1 || includeBody == "1" || includeBody == true)
        };

        emailDataDao.getMessages(req.user, accountId, sourceId, options, function(err, value) {
            this.sendResultOrError(resp, err, value, "Error retrieving messages for source");
        });
    },


    getMessageById: function(req, resp) {
        //TODO: Implement security
        var self = this;
        var sourceId = req.params.sourceid;
        var messageId = req.paams.messageid;

        emailDataDao.getMessageById(req.user, this.accountId(req), sourceId, messageId, function(err, value) {
            self.sendResultOrError(resp, err, value, "Error retrieving message by id");
        });
    }
});

module.exports = new api();

