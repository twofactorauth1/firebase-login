/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var User = require('../models/user');
var userDao = require('./user.dao');
var accountDao = require('./account.dao');
var cookies = require('../utils/cookieutil');
var EmailTemplateUtil = require('../utils/emailtemplateutil');
var crypto = require('../utils/security/crypto');
var appConfig = require('../configs/app.config');
var urlUtils = require('../utils/urlutils');
var userActivityManager = require('../useractivities/useractivity_manager');

var dao = {

    options: {
        name: "authentication.dao",
        defaultModel: $$.m.User
    },

    authenticateByUsernamePassword: function (req, username, password, fn) {
        var log = this.log;
        log.info("Authenticating by username & password: " + username);
        var host = req.get("host");
        var parsedHost = urlUtils.getSubdomainFromHost(host);
        accountDao.getAccountByHost(host, function (err, value) {
            if (err) {
                return fn(err, "An error occurred validating account");
            }

            var account = value;
            if (account !== true && (account == null || account.id() == null || account.id() == 0 ) ) {
                log.info("No account found with username: " + username);
                return fn("Account not found", "No account found at this location");
            }




            //We are at the main indigenous level application, not at a custom subdomain
            else if (parsedHost.subdomain !== 'main' && (account === true || account.id() === appConfig.mainAccountID) ) {
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

                                    if(user.getAllAccountIds().length > 1) {
                                        req.session.accounts = user.getAllAccountIds();
                                        req.session.accountId = -1;//this is a bogus accountId.  It means that account has not yet been set.
                                    } else {
                                        req.session.accounts = user.getAllAccountIds();
                                        req.session.accountId = user.getAllAccountIds()[0];
                                        req.session.unAuthAccountId = user.getAllAccountIds()[0];
                                        req.session.subdomain = account.get('subdomain');
                                        req.session.domain = account.get('domain');
                                    }
                                    log.info("Login successful. AccountId is now " + req.session.accountId);
                                    log.info('UnAuthAccountId is ' + req.session.unAuthAccountId);
                                    accountDao.getPreviewData(req.session.accounts, function(err, data){
                                        log.debug('got preview data');
                                        req.session.accounts = data;
                                        return fn(null, user);
                                    });

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
                                        req.session.accountId = account.id();
                                        req.session.subdomain = account.get('subdomain');
                                        req.session.domain = account.get('domain');
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
        self.log.debug('>> authenticateBySocialLogin');
        self.log.debug('(req, ' + socialType + ',' + socialId + ',' + email + ',' + username + ',' + socialUrl + ',' + accessToken + ','
            + refreshToken + ',' + expires + ',' + scope + ',fn)');
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
            else if (account === true || account.id() === appConfig.mainAccountID) {
                req.session.accountId = 0;
                //Lets look up the user by socialId
                self.log.debug('Setting accountId to 0');
                userDao.getUserBySocialId(socialType, socialId, function (err, value) {
                    if (err) {
                        fn(err, "An error occurred attempting to retrieve user by social profile");
                        fn = req = null;
                        return;
                    }

                    if (value == null) {
                        //look up by email
                        self.log.debug('looking up user by email');
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

                                        if(value.getAllAccountIds().length > 1) {
                                            req.session.accounts = value.getAllAccountIds();
                                            req.session.accountId = -1;//this is a bogus accountId.  It means that account has not yet been set.
                                        } else {
                                            req.session.accounts = value.getAllAccountIds();
                                            req.session.accountId = value.getAllAccountIds()[0];
                                            req.session.unAuthAccountId = value.getAllAccountIds()[0];
                                            req.session.subdomain = account.get('subdomain');
                                            req.session.domain = account.get('domain');
                                        }
                                        self.log.info("Login successful. AccountId is now " + req.session.accountId);
                                        accountDao.getPreviewData(req.session.accounts, function(err, data){
                                            self.log.debug('got preview data');
                                            req.session.accounts = data;
                                            userDao.refreshFromSocialProfile(value, socialType, false, false, function(err, value) {
                                                //regardless of error, always return success
                                                fn(null, value);
                                                fn = req = null;
                                            });
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
                        if(value.getAllAccountIds().length > 1) {
                            req.session.accounts = value.getAllAccountIds();
                            req.session.accountId = -1;//this is a bogus accountId.  It means that account has not yet been set.
                            accountDao.getPreviewData(req.session.accounts, function(err, data){
                                self.log.debug('got preview data');
                                req.session.accounts = data;
                                self.saveOrUpdate(value, fn);
                                fn = req = null;
                                return;
                            });
                        } else {
                            req.session.accounts = value.getAllAccountIds();
                            req.session.accountId = value.getAllAccountIds()[0];
                            req.session.unAuthAccountId = value.getAllAccountIds()[0];
                            self.log.debug('req.session.accountId: ' + req.session.accountId);
                            accountDao.getAccountByID(req.session.accountId, function(err, account){
                                if(err) {
                                    return fn(err, null);
                                }
                                req.session.subdomain = account.get('subdomain');
                                req.session.domain = account.get('domain');
                                self.log.info("Login successful. AccountId is now " + req.session.accountId);
                                accountDao.getPreviewData(req.session.accounts, function(err, data){
                                    self.log.debug('got preview data');
                                    req.session.accounts = data;
                                    self.saveOrUpdate(value, fn);
                                    fn = req = null;
                                    return;
                                });
                            });
                        }

                    }
                });
            } else {
                req.session.accountId = account.id();
                req.session.unAuthAccountId = account.id();
                req.session.subdomain = account.get('subdomain');
                req.session.domain = account.get('domain');
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
                                    userDao.refreshFromSocialProfile(value, socialType, false, false, function(err, value) {
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
                        userDao.refreshFromSocialProfile(value, socialType, false, false, function(err, value) {
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


    /*
     * requestorProps = {
     *      ip: ip,
     *      date: date,
     *      browser: browser,
     *      os: os
     *  };
     */
    sendForgotPasswordEmailByUsernameOrEmail: function (accountId, email, requestorProps, fn) {
        var _email = email, promise = $.Deferred();

        if (accountId !== appConfig.mainAccountID) {//TODO: != mainApp
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
                        EmailTemplateUtil.resetPassword(accountId, token, value, email, requestorProps, fn);
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

                if (accountId !== appConfig.mainAccountID) {
                    if (value.getUserAccount(accountId) == null) {
                        console.log('Could not find user for accountId: ' + accountId);
                        console.dir(value);
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

    verifyPasswordResetTokenWithEmail: function (accountId, token, email, fn) {
        userDao.findOne({passRecover: token, email: email}, function (err, value) {
            if (!err) {
                if (value == null) {
                    console.log('Could not find recovery token for account [' + accountId + '] token [' + token + '] and email [' + email + ']');
                    return fn("Invalid recovery token. Please ensure you have clicked the link directly from your email, or resubmit the form below.");
                }

                if (accountId !== appConfig.mainAccountID) {
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

    updatePasswordByToken: function (accountId, passwordResetToken, password, email, fn) {
        this.verifyPasswordResetTokenWithEmail(accountId, passwordResetToken, email, function (err, value) {
            if (!err) {
                var user = value;
                user.clearPasswordRecoverToken();
                user.encryptPasswordAsync(password, function(err, hash){
                    if(err) {
                        this.log.error('Error encrypting password: ' + err);
                        return fn(err, null);
                    }
                    var localCredentials;
                    if (accountId > 0) {
                        user.createOrUpdateUserAccountCredentials(accountId, $$.constants.user.credential_types.LOCAL, null, hash, null, null);

                        //Modify the main credentials if usernames are the same
                        localCredentials = user.getCredentials($$.constants.user.credential_types.LOCAL);
                        var socialCredentials = user.getUserAccountCredentials(accountId, $$.constants.user.credential_types.LOCAL);
                        if (localCredentials != null && socialCredentials != null && localCredentials.username == socialCredentials.username) {
                            user.createOrUpdateLocalCredentials(hash);
                        }
                        var accountIds = user.getAllAccountIds();
                        accountIds.forEach(function(acctId) {
                            var _userAcctCreds = user.getUserAccountCredentials(acctId, $$.constants.user.credential_types.LOCAL);
                            if (_userAcctCreds != null && localCredentials != null && _userAcctCreds.username == localCredentials.username) {
                                user.createOrUpdateUserAccountCredentials(acctId, $$.constants.user.credential_types.LOCAL, null, hash, null, null);
                            }
                        });
                    } else {
                        user.createOrUpdateLocalCredentials(hash);

                        //See if we need to update social credentials as well
                        localCredentials = user.getCredentials($$.constants.user.credential_types.LOCAL);
                        var accountIds = user.getAllAccountIds();
                        accountIds.forEach(function(acctId) {
                            var _userAcctCreds = user.getUserAccountCredentials(acctId, $$.constants.user.credential_types.LOCAL);
                            if (_userAcctCreds != null && localCredentials != null && _userAcctCreds.username == localCredentials.username) {
                                user.createOrUpdateUserAccountCredentials(acctId, $$.constants.user.credential_types.LOCAL, null, hash, null, null);
                            }
                        });
                    }

                    userDao.saveOrUpdate(user, function (err, value) {
                        if (!err) {
                            var userActivity = new $$.m.UserActivity({accountId:accountId, userId:user.id(), type:'RESET_PASSWORD'});
                            userActivityManager.createUserActivity(userActivity, function(){});
                            fn(null, value);
                        } else {
                            return fn("An error occurred: " + err);
                        }
                    });
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
                url += "?authtoken=value";
            } else {
                url += "&authtoken=value";
            }


            fn(null, url);
        });
    },

    getAuthenticatedUrlForRedirect: function(accountId, userId, path, fn) {
        var self = this;
        self.log.debug('>> getAuthenticatedUrlForRedirect(' + accountId + ',' + userId + ',' + path +',fn)');
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


            self.log.debug('<< getAuthenticatedUrlForRedirect(' + serverUrl + ')');
            fn(null, serverUrl);
        });
    },


    getAuthenticatedUrlForAccount: function(accountId, userId, path, expirationSeconds, fn) {
        var self = this;
        self.log.debug('>> getAuthenticatedUrlForAccount(' + accountId +',' + userId + ',' + path + ',' + expirationSeconds + ',fn)');
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
        var self = this;
        if (_.isFunction(remove)) {
            fn = remove;
            remove = false;
        }
        self.log.debug('>> verifyAuthToken for accountId:' + accountId);
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

