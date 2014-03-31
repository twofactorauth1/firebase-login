/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

var User = require('../models/user');
var userDao = require('./user.dao');
var accountDao = require('./account.dao');
var cookies = require('../utils/cookieutil');
var EmailTemplateUtil = require('../utils/emailtemplateutil');
var crypto = require('../utils/security/crypto');

var dao = {

    options: {
        name: "authentication.dao",
        defaultModel: $$.m.User
    },

    authenticateByUsernamePassword: function (req, username, password, fn) {
        var log = this.log;
        log.info("Authenticating by username & password: " + username);
        var host = req.get("host");
        accountDao.getAccountByHost(host, function (err, value) {
            if (err) {
                return fn(err, "An error occurred validating account");
            }

            var account = value;
            if (account !== true && (account == null || account.id() == null || account.id() == 0)) {
                log.info("No account found with username: " + username);
                return fn("Account not found", "No account found at this location");
            }

            //We are at the main indigenous level application, not at a custom subdomain
            else if (account === true) {
                log.info("Logging into main App");
                req.session.accountId = 0;
                userDao.getUserByUsername(username, function (err, value) {
                    if (!err) {
                        if (value == null) {
                            log.info("No user found");
                            return fn("User not found", "Incorrect username");
                        }

                        var user = value;

                        user.verifyPassword(password, $$.constants.user.credential_types.LOCAL, function (err, value) {
                            if (!err) {
                                if (value === false) {
                                    log.info("Incorrect password");
                                    return fn("Incorrect password", "Incorrect password");
                                } else {
                                    log.info("Login successful");
                                    return fn(null, user);
                                }
                            } else {
                                log.info("Error occurred verifying password");
                                return fn(err, "An error occurred verifying password - " + err);
                            }
                        });
                    } else {
                        fn(err, value);
                    }
                });
            } else {
                log.info("logging into account with id: " + account.id());
                req.session.accountId = account.id();
                userDao.getUserForAccount(account.id(), username, function (err, value) {
                    if (err) {
                        log.error("An error occurred retrieving user for account: ", err);
                        return fn(err, "An error occurred retrieving user for account");
                    } else {
                        if (value == null) {
                            log.info("User not found for account");
                            return fn("User not found for account", "Incorrect username");
                        } else {
                            log.info("User found for account");
                            var user = value;
                            user.verifyPasswordForAccount(account.id(), password, $$.constants.user.credential_types.LOCAL, function (err, value) {
                                if (!err) {
                                    if (value === false) {
                                        log.info("Incorrect password");
                                        return fn("Incorrect password", "Incorrect password");
                                    } else {
                                        log.info("Authentication succeeded");
                                        return fn(null, user);
                                    }
                                } else {
                                    log.info("An error occurred verifying password", err);
                                    return fn(err, "An error occurred verifying encrypted password");
                                }
                            });
                        }
                    }
                });
            }
        });
    },


    authenticateBySocialLogin: function (req, socialType, socialId, email, username, socialUrl, accessToken, refreshToken, expires, scope, fn) {
        var self = this;
        var host = req.get("host");
        accountDao.getAccountByHost(host, function (err, value) {
            if (err) {
                fn(err, "An error occurred validating account");
                fn = req = null; return;
            }

            var account = value;
            if (account !== true && (account == null || account.id() == null || account.id() == 0)) {
                fn("Account not found", "No account found at this location");
                fn = req = null;
            }

            //We are at the main indigenous level application, not at a custom subdomain
            else if (account === true) {
                req.session.accountId = 0;
                //Lets look up the user by socialId
                userDao.getUserBySocialId(socialType, socialId, function (err, value) {
                    if (err) {
                        fn(err, "An error occurred attempting to retrieve user by social profile");
                        fn = req = null;
                        return;
                    }

                    if (value == null) {
                        //look up by email
                        userDao.getUserByUsername(email, function (err, value) {
                            if (err) {
                                fn(err, "An error occurred retrieving user by username");
                                fn = req = null; return;
                            }

                            if (value == null) {
                                fn("User not found for social profile", "User not found");
                                fn = req = null; return;
                            } else {
                                value.createOrUpdateSocialCredentials(socialType, socialId, accessToken, refreshToken, expires, username, socialUrl, scope);
                                return self.saveOrUpdate(value, function(err, value) {
                                    if (!err) {
                                        userDao.refreshFromSocialProfile(value, socialType, function(err, value) {
                                            //regardless of error, always return success
                                            fn(null, value);
                                            fn = req = null;
                                        });
                                    } else {
                                        fn(err, value);
                                        fn = req = null;
                                    }
                                });
                            }
                        });
                    } else {
                        value.createOrUpdateSocialCredentials(socialType, socialId, accessToken, refreshToken, expires, username, socialUrl, scope);
                        self.saveOrUpdate(value, fn);
                        fn = req = null;
                    }
                });
            } else {
                req.session.accountId = account.id();
                userDao.getUserForAccountBySocialProfile(account.id(), socialType, socialId, function (err, value) {
                    if (err) {
                        fn(err, "An error occurred retrieving user for account by social profile");
                        fn = req = null; return;
                    }

                    if (value == null) {
                        //Look for user by email
                        userDao.getUserForAccount(account.id(), email, function (err, value) {
                            if (err) {
                                fn(err, "An error occurred retrieving user for account");
                                fn = req = null; return;
                            }

                            if (value == null) {
                                fn("User not found for account and social profile", "User not found");
                                fn = req = null; return;
                            }

                            value.createOrUpdateSocialCredentials(socialType, socialId, accessToken, refreshToken, expires, username, socialUrl, scope);
                            self.saveOrUpdate(value, function(err, value) {
                                if (!err) {
                                    userDao.refreshFromSocialProfile(value, socialType, function(err, value) {
                                        //regardless of error, always return success here.
                                        fn(null, value);
                                        fn = req = null;
                                    });
                                } else {
                                    fn(err, value);
                                    fn = req = null;
                                }
                            });
                        });
                    } else {
                        value.createOrUpdateSocialCredentials(socialType, socialId, accessToken, refreshToken, expires, username, socialUrl, scope);
                        self.saveOrUpdate(value, fn);
                        fn = req = null;
                    }
                });
            }
        });
    },


    linkSocialAccountToUser: function(userId, socialType, socialId, email, username, socialUrl, accessToken, refreshToken, expires, scope, fn) {
        var self = this;
        userDao.getById(userId, function(err, value) {
            if (err) {
                fn(err, "An error occurred retrieving user by Id");
                fn = null;
                return;
            }

            if (value == null) {
                fn("User not found with by id", "User not found");
                fn = null;
            } else {
                value.createOrUpdateSocialCredentials(socialType, socialId, accessToken, refreshToken, expires, username, socialUrl, scope);
                self.saveOrUpdate(value, function(err, value) {
                    if (!err) {
                        userDao.refreshFromSocialProfile(value, socialType, function(err, value) {
                            //regardless of error, always return success
                            fn(null, value);
                            fn = null;
                        });
                    } else {
                        fn(err, value);
                        fn = null;
                    }
                });
            }
        });
    },


    sendForgotPasswordEmailByUsernameOrEmail: function (accountId, email, fn) {
        var _email = email, promise = $.Deferred();

        if (accountId > 0) {
            userDao.getUserForAccount(accountId, email, function(err, value) {
                if (err) {
                    promise.reject();
                    return fn(err, value);
                }

                if (value == null) {
                    userDao.getUserByUsername(email, function(err, value) {
                        if (err) {
                            promise.reject();
                            return fn(err, value);
                        }

                        if (value == null) {
                            promise.reject();
                            return fn("No user found with username or email: " + _email);
                        }

                        if (value.getUserAccount(accountId) == null) {
                            promise.reject();
                            return fn("No user found for this account with username or email: " + _email);
                        }

                        promise.resolve(value);
                    });
                } else {
                    promise.resolve(value);
                }
            });
        } else {
            userDao.getUserByUsername(email, function(err, value) {
                if (err) {
                    promise.reject();
                    return fn(err, value);
                }

                if (value == null) {
                    promise.reject();
                    return fn("No user found with username or email: " + _email);
                }

                promise.resolve(value);
            });
        }


        $.when(promise)
            .done(function(user) {
                var isEmail = $$.u.validate(user.get("email"), {
                    required: true,
                    email: true
                }).success;

                if (isEmail === false) {
                    //lets at least try to see if the username is an email
                    if ($$.u.validate(user.get("username"), {required: true, email: true}).success === false) {
                        return fn("No email has been registered with the user: " + email);
                    } else {
                        email = user.get("username");
                    }
                }

                var token = user.setPasswordRecoverToken();

                userDao.saveOrUpdate(user, function (err, value) {
                    if (!err) {
                        //Send Email based on the current token
                        EmailTemplateUtil.resetPassword(accountId, token, value, email, fn);
                    } else {
                        return fn("An error occurred: " + err);
                    }
                });
            });
    },


    verifyPasswordResetToken: function (accountId, token, fn) {
        userDao.findOne({passRecover: token}, function (err, value) {
            if (!err) {
                if (value == null) {
                    return fn("Invalid recovery token. Please ensure you have clicked the link directly from your email, or resubmit the form below.");
                }

                if (accountId > 0) {
                    if (value.getUserAccount(accountId) == null) {
                        return fn("No user found for this account", "No user found for this account");
                    }
                }

                var passRecoverExp = value.get("passRecoverExp");
                if (new Date(passRecoverExp) < new Date()) {
                    return fn("Password recovery token is expired, please resubmit the form below.");
                }

                return fn(null, value);
            } else {
                return fn(err, value);
            }
        });
    },


    updatePasswordByToken: function (accountId, passwordResetToken, password, fn) {
        this.verifyPasswordResetToken(accountId, passwordResetToken, function (err, value) {
            if (!err) {
                var user = value;
                user.clearPasswordRecoverToken();

                var localCredentials;
                if (accountId > 0) {
                    user.createOrUpdateUserAccountCredentials(accountId, $$.constants.user.credential_types.LOCAL, null, password);

                    //Modify the main credentials if usernames are the same
                    localCredentials = user.getCredentials($$.constants.user.credential_types.LOCAL);
                    var socialCredentials = user.getUserAccountCredentials(accountId, $$.constants.user.credential_types.LOCAL);
                    if (localCredentials != null && socialCredentials != null && localCredentials.username == socialCredentials.username) {
                        user.createOrUpdateLocalCredentials(password);
                    }
                } else {
                    user.createOrUpdateLocalCredentials(password);

                    //See if we need to update social credentials as well
                    localCredentials = user.getCredentials($$.constants.user.credential_types.LOCAL);
                    var accountIds = user.getAllAccountIds();
                    accountIds.forEach(function(acctId) {
                        var _userAcctCreds = user.getUserAccountCredentials(acctId, $$.constants.user.credential_types.LOCAL);
                        if (_userAcctCreds != null && localCredentials != null && _userAcctCreds.username == localCredentials.username) {
                            user.createOrUpdateUserAccountCredentials(acctId, $$.constants.user.credential_types.LOCAL, null, password);
                        }
                    });
                }

                userDao.saveOrUpdate(user, function (err, value) {
                    if (!err) {
                        fn(null, value);
                    } else {
                        return fn("An error occurred: " + err);
                    }
                });
            } else {
                fn(err, value);
            }
        });
    },
    //endregion


    //region REMOTE AUTHENTICATION
    setAuthenticationToken: function(userId, expirationSeconds, fn) {
        var self = this;
        this.getById(userId, function(err, value) {
            if (err) {
                return fn(err, value);
            }

            if (value == null) {
                return fn("User not found", "User not found with ID: [" + userId + "]");
            }

            var token = value.setAuthToken(expirationSeconds);
            self.saveOrUpdate(value, function(err, value) {
                if (err) {
                    return fn(err, value);
                }

                return fn(null, token);
            });
        });
    },


    getAuthenticatedUrl: function(userId, url, expirationSeconds, fn) {
        if (_.isFunction(expirationSeconds)) {
            fn = expirationSeconds;
            expirationSeconds = null;
        }

        this.setAuthenticationToken(userId, expirationSeconds, function(err, value) {
            if (err) {
                return fn(err, value);
            }

            if (url == null) {
                return fn("URL Provided is null");
            }

            if (url.indexOf("?") == -1) {
                url += "?";
            }
            url += "&authtoken=value";
            fn(null, url);
        });
    },


    getAuthenticatedUrlForAccount: function(accountId, userId, path, expirationSeconds, fn) {
        var self = this;
        if (_.isFunction(expirationSeconds)) {
            fn = expirationSeconds;
            expirationSeconds = null;
        }

        this.setAuthenticationToken(userId, expirationSeconds, function(err, value) {
            if (err) {
                return fn(err, value);
            }

            self._constructAuthenticatedUrl(accountId, value, path, fn);
        });
    },


    verifyAuthToken: function (accountId, token, remove, fn) {
        if (_.isFunction(remove)) {
            fn = remove;
            remove = false;
        }

        userDao.findOne({authToken: token}, function (err, value) {
            if (!err) {
                if (value === null) {
                    return fn("Invalid authentication token.");
                }

                if (accountId > 0) {
                    if (value.getUserAccount(accountId) === null) {
                        return fn("No user found for this account!", "User does not have access to this account");
                    }
                }

                var authTokenExp = value.get("authTokenExp");
                if (new Date(authTokenExp) < new Date()) {
                    return fn("Authentication token is expired.");
                }

                if (remove === true) {
                    value.clearAuthToken();
                    userDao.saveOrUpdate(value, function(err, value) {});
                }
                return fn(null, value);
            } else {
                return fn(err, value);
            }
        });
    },


    _constructAuthenticatedUrl: function(accountId, authToken, path, fn) {
        accountDao.getServerUrlByAccount(accountId, function(err, value) {
            if (err) {
                return fn(err, value);
            }

            var serverUrl = value;

            if (path == null || path == "" || path == "/") {
                if (accountId > 0) {
                    path = "admin";
                } else {
                    path = "home";
                }
            }

            if (path != null && path.charAt(0) != "/") {
                path = "/" + path;
            }

            if (path != null) {
                serverUrl += path;
            }

            serverUrl += "?authtoken=" + authToken;

            fn(null, serverUrl);
        });
    }
    //endregion
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.AuthenticationDao = dao;

module.exports = dao;

