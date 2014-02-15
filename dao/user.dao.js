var baseDao = require('./base.dao');
var AccountDao = require('./account.dao');

var crypto = require('../utils/security/crypto');
require('../models/user');


var dao = {

    options: {
        name:"user.dao",
        defaultModel: $$.m.User
    },


    getUserBySessionId: function(sessionId, fn) {
        this.findOne( { 'sessions.id':sessionid }, fn)
    },


    getUserIdBySessionId: function(sessionId, fn) {
        this.getUserBySessionId(sessionId, function(err, value) {
            if (!err ) {
                if (value != null) {
                    fn(null, value.id());
                } else {
                    fn(null, null);
                }
            } else {
                fn(err, value);
            }
        });
    },


    getUserByUserName: function(username, fn) {
        this.findOne( {'username':username}, fn);
    },


    getUserByEmail: function(email, fn) {
        this.findOne( {'email':email}, fn);
    },


    createUserFromUsernamePassword: function(username, password, accountToken, fn) {
        var self = this;
        this.getUserByUserName(username, function(err, value) {
            if (err) {
                return fn(err, value);
            }

            if (value != null) {
                return fn(true, "An account with this username already exists");
            }

            var deferred = $.Deferred();

            /*
             If we don't have an account id yet, they are probably in the process
             of creating one at startup, lets try to convert the account now that
             they are actually signing up.
             */
            if (accountToken != null) {
                AccountDao.convertTempAccount(token, function(err, value) {
                    if (!err) {
                        deferred.resolve(value);
                    } else {
                        return fn(err, value);
                    }
                });
            } else {
                AccountDao.createAccount("", $$.m.Account.COMPANY_TYPES.PROFESSIONAL, $$.m.Account.COMPANY_SIZE.SMALL, null, function(err, value) {
                    if (!err) {
                        deferred.resolve(value);
                    } else {
                        return fn(err, value);
                    }
                });
            }

            deferred
                .done(function(account) {
                    var accountId;
                    if (account != null) {
                        accountId = account.id();
                    }

                    if (accountId == null) {
                        return fn(true, "Failed to create user, no account found");
                    }

                    var user = new $$.m.User({
                        username:username,
                        accountId:accountId
                    });

                    user.setCredentials({
                        username:username,
                        password:crypto.hash(password),
                        type: $$.m.User.CREDENTIAL_TYPES.LOCAL
                    });

                    self.saveOrUpdate(user, fn);
                });
        });
    }
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.UserDao = dao;

module.exports = dao;
