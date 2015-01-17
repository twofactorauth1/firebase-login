/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
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
        app.get(this.url('sources'), this.isAuthAndSubscribedApi.bind(this), this.getEmailSources.bind(this));
        app.post(this.url('source'), this.isAuthAndSubscribedApi.bind(this), this.createEmailSource.bind(this));

        //MESSAGES
        app.get(this.url(':sourceid/messages'), this.isAuthAndSubscribedApi.bind(this), this.getMessages.bind(this));
        app.get(this.url(':sourceid/message/:messageid'), this.isAuthAndSubscribedApi.bind(this), this.getMessageById.bind(this));
    },


    getEmailSources: function(req, resp) {

        var self = this;
        var accountId = this.accountId(req);

        if (accountId == null) {
            return this.wrapError(resp, 403, "Cannot retrieve ContextIO information", "An account id must be specific to return this information");
        }
        self.checkPermission(req, self.sc.privs.VIEW_EMAIL_SOURCE, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                emailDataDao.getEmailSources(req.user, accountId, function(err, value) {
                    self.sendResultOrError(resp, err, value, "Error retrieving email sources");
                });
            }
        });


    },


    createEmailSource: function(req, resp) {

        var self = this;
        var accountId = this.accountId(req);
        if (accountId == null) {
            return this.wrapError(resp, 403, "Cannot create Email Source", "An account id must be specific to return this information");
        }

        self.checkPermission(req, self.sc.privs.MODIFY_EMAIL_SOURCE, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var body = req.body;
                emailDataDao.createEmailSource(req.user, accountId, body.email, body.username, body.password, body.imapServer, body.port, function(err, value) {
                    self.sendResultOrError(resp, err, value, "Error creating email source");
                });
            }
        });


    },


    getMessages: function(req, resp) {

        var self = this;
        var sourceId = req.params.sourceid;
        var accountId = this.accountId(req);

        self.checkPermission(req, self.sc.privs.VIEW_EMAIL_SOURCE, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
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
            }
        });


    },


    getMessageById: function(req, resp) {

        var self = this;
        var sourceId = req.params.sourceid;
        var messageId = req.paams.messageid;
        var accountId = parseInt(self.accountId(req));

        self.checkPermission(req, self.sc.privs.VIEW_EMAIL_MESSAGE, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                emailDataDao.getMessageById(req.user, accountId, sourceId, messageId, function(err, value) {
                    self.sendResultOrError(resp, err, value, "Error retrieving message by id");
                });
            }
        });


    }
});

module.exports = new api();

