/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

var baseDao = require('./base.dao');
requirejs('constants/constants');
var async = require('async');
var userDao = require('./user.dao');
var contextioDao = require('./integrations/contextio.dao');

var Message = require('../models/message');

var dao = {

    options: {
        name: "emaildata.dao",
        defaultModel: null
    },


    getEmailSources: function (user, accountId, fn) {
        var sources = user.getAllEmailSources(accountId);
        process.nextTick(function () {
            fn(null, sources);
        });
    },


    createEmailSource: function (user, accountId, email, username, password, emailType, imapServer, port, fn) {
        contextioDao.createContextIOAccountAndMailboxForUser(user, accountId, email, username, password, emailType, imapServer, port, fn);
    },


    removeEmailSource: function (user, emailSourceId, fn) {
        var emailSource = user.getEmailSource(emailSourceId);
        if (emailSource == null) {
            process.nextTick(function () {
                fn(null);
            });
            return;
        }

        var fxn = function (err, value) {
            if (!err) {
                user.removeEmailSource(emailSourceId);
                userDao.saveOrUpdate(user, function (err, value) {
                    if (err) {
                        return fn(err, value);
                    } else {
                        return fn(null);
                    }
                });
            } else {
                fn(err, value);
            }
        };

        switch (emailSource.type) {
            case $$.constants.email_sources.CONTEXTIO:
                return contextioDao.removeContextIOAccount(emailSource.providerId, fxn);
            default:
                return process.nextTick(fn(null));
        }
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
    getMessages: function (user, accountId, emailSourceId, options, fn) {
        if (_.isFunction(options)) {
            fn = options;
            options = {};
        }

        var emailSource = user.getEmailSource(emailSourceId);
        if (emailSource == null) {
            return fn($$.u.errors.createError(403, "Failed to retrieve messages for email", "No Email Source found with id: " + emailSourceId));
        }

        if (options.limit == null) {
            options.limit = 25;
        }

        if (emailSource.type === $$.constants.email_sources.CONTEXTIO) {
            contextioDao.getMessages(emailSource.providerId, options, function (err, value) {
                if (err) {
                    return fn(err, value);
                }

                var result = {
                    source: emailSource,
                    options: options,
                    data: value
                };

                if (value != null && value.length > 0) {
                    result.data = [];

                    var processMessage = function(email, cb) {
                        var message = new Message();
                        message.convertFromContextIOEmail(email);
                        result.data.push(message);
                        cb();
                    };

                    async.eachLimit(value, 10, processMessage, function(cb) {
                        return fn(null, result);
                    });
                } else {
                    return fn(null, result);
                }
            });
        } else {
            return fn($$.u.errors.createError(403, "Failed to retrieve messages for email", "No Email Source found"));
        }
    },


    getMessageById: function (user, accountId, emailSourceId, messageId, fn) {
        var emailSource = user.getEmailSource(emailSourceId);
        if (emailSource == null) {
            return fn($$.u.errors.createError(403, "No Could not retrieve Message", "No Email Source Found with ID: " + emailSourceId));
        }

        if (emailSource.type == $$.constants.email_sources.CONTEXTIO) {
            contextioDao.getMessageById(emailSource.providerId, messageId, true, function (err, value) {
                if (err) {
                    return fn(err, value);
                }

                var result = {
                    source: emailSource,
                    data: new Message().convertFromContextIOEmail(value)
                };

                return fn(null, result);
            });
        }
    }
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.ContactDao = dao;

module.exports = dao;
