var baseDao = require('./base.dao');
requirejs('constants/constants');
var userDao = require('./user.dao');
var contextioConfig = require('../configs/context.io.config');
var emailServerConfig = require('../configs/emailservers.config');

var ContextIO = require('contextio');

var dao = {

    options: {
        name:"emaildata.dao",
        defaultModel: null
    },

    contextIO: new ContextIO.Client("2.0", contextioConfig.keys),


    getAllContextIOAccounts: function(fn) {
        this.contextIO.accounts().get(function(err, resp) {
            if (err) {
                return fn(err, resp);
            }
            fn(err, resp.body);
        });
    },


    getContextIOAccountById: function(id, fn) {
        this.contextIO.accounts(id).get(function(err, resp) {
            if (err) {
                return fn(err, resp);
            }
            fn(err, resp.body);
        })
    },


    getContextIOAccountByEmail: function(email, fn) {
        this.contextIO.accounts().get({email:email}, function(err, resp) {
            if (err) {
                return fn(err, resp);
            }
            fn(err, resp.body);
        });
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
            if (!isSuccess) {
                return fn("Account was not created", value);
            }

            var id = value.id;
            var resourceUrl = value.resource_url;

            var source = {};
            if (value.source) {
                source.label = value.source.label;
                source.resourceUrl = value.source.resource_url;
            }

            var emailSource = user.createOrUpdateEmailSource($$.constants.email_sources.CONTEXTIO, id, null, email);
            if (value.source != null) {
                user.createOrUpdateMailboxForSource(emailSource._id, accountId, email, emailType, source.label, imapServer, port);
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


    removeContextIOAccount: function(accountId, fn) {
        this.contextIO.accounts(accountId).delete(function(err, value, request) {
            fn(err, value);
        });
    }

};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.ContactDao = dao;

module.exports = dao;
