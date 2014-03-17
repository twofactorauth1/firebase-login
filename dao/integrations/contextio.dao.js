var baseDao = require('../base.dao.js');
var userDao = require('../user.dao.js');
var contextioConfig = require('../../configs/context.io.config.js');
var emailServerConfig = require('../../configs/emailservers.config.js');

var ContextIO = require('contextio');

var dao = {

    options: {
        name:"contextio.dao",
        defaultModel: null
    },

    contextIO: new ContextIO.Client("2.0", contextioConfig.keys),


    getContextIOAccountById: function(providerId, fn) {
        this.contextIO.accounts(providerId).get(function(err, resp) {
            if (err) {
                return fn(err, resp);
            }
            fn(err, resp.body);
        })
    },


    getAllContextIOAccounts: function(fn) {
        this.contextIO.accounts().get(function(err, resp) {
            if (err) {
                return fn(err, resp);
            }
            fn(err, resp.body);
        });
    },


    getContextIOAccountsByEmail: function(email, fn) {
        this.contextIO.accounts().get({email:email}, function(err, resp) {
            if (err) {
                return fn(err, resp);
            }
            fn(err, resp.body);
        });
    },


    getContextIOAccountForUserAndAccount: function(user, accountId, fn) {
        var source = user.getEmailSourceByType(accountId, $$.constants.email_sources.CONTEXTIO);
        if (source != null) {
            return this.getContextIOAccountById(source.providerId, fn);
        }
        fn(null);
    },


    createContextIOAccountAndMailboxForUser: function(user, accountId, email, username, password, emailType, imapServer, port, fn) {
        if (_.isFunction(imapServer)) {
            fn = imapServer;
            imapServer = null;
            port = null;

            var emailSource = emailServerConfig.getByEmailType(emailType);
            if (emailSource == null) {
                return fn($$.u.errors.createError(403, "Error creating ContextIO Account", "Email type not recognized and no imap server or port provided"));
            }
            imapServer = emailServerConfig.getIMAPServer(emailType);
            port = emailServerConfig.getIMAPPort(emailType);
        }


        var postOptions = {
            email: email,
            username: username,
            password: password,
            first_name: user.get("first"),
            last_name: user.get("last"),
            server: imapServer,
            port:port,
            use_ssl: 1,
            type: "IMAP",
            expunge_on_deleted_flag: 1,
            sync_flags: 1
        };

        this.contextIO.accounts().post(postOptions, function(err, value, request) {
            if (err) {
                return fn(err, value);
            }

            var isSuccess = value.success;
            if (isSuccess === false) {
                var msg = "";
                if (value.feedback_code) {
                    msg += value.feedback_code + ": ";
                }
                if (value.connection_log) {
                    msg += value.connection_log;
                }

                var error = $$.u.errors.createError(500, "Account not created", msg);
                return fn(error);
            }

            value = value.body;
            var providerId = value.id;
            var resourceUrl = value.resource_url;

            var source = {};
            if (value.source) {
                source.label = value.source.label;
                source.resourceUrl = value.source.resource_url;
            }

            var emailSource = user.createOrUpdateEmailSource(accountId, $$.constants.email_sources.CONTEXTIO, providerId, null, email);
            if (value.source != null) {
                user.createOrUpdateMailboxForSource(emailSource._id, email, emailType, source.label, imapServer, port);
            }

            userDao.saveOrUpdate(user, function(err, value) {
                if (!err) {
                    return fn(null, emailSource);
                } else {
                    return fn(err, value);
                }
            })
        });
    },


    removeContextIOAccount: function(providerId, fn) {
        this.contextIO.accounts(providerId).delete(fn);
    },


    /**
     * Retrieves email messages between a user and a specific email address
     *
     * @param user
     * @param accountId
     * @param options: {email, limit, offset, includeBody, start, end}
     * @param fn
     * @returns {*}
     */
    getMessages: function(providerId, options, fn) {
        var self = this;

        var _options = {};
        if (options.email) { _options.email = options.email; }
        if (options.limit) { _options.limit = options.limit; }
        if (options.offset) { _options.offset = options.offst; }
        if (options.includeBody) { _options.include_body = options.includeBody; }
        if (options.start) {
            if (_.isDate(options.start)) {
                _options.date_after = options.start.getTime();
            } else {
                _options.date_after = options.start;
            }
        }

        if (options.end) {
            if (_.isDate(options.end)) {
                _options.date_before = options.end.getTime();
            } else {
                _options.date_before = options.end;
            }
        }

        self.contextIO.accounts(providerId).messages().get(_options, function(err, value) {
            if (err) {
                return fn(err, value);
            }
            self.log.info(value.body.length + " messages retreived");
            return fn(err, value.body);
        });
    },


    getMessageById: function(providerId, messageId, includeBody, fn) {
        var options ={};
        if (includeBody == true) { options.include_body = 1; }

        this.contextIO.accounts(providerId).messages(messageId).get(options, function(err, value) {
            if (err) {
                return fn(err, value);
            }

            return fn(err, value.body);
        });
    }
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.ContextIODao = dao;

module.exports = dao;
