var User = require('../models/user');
var UserDao = require('./user.dao');
var AccountDao = require('./account.dao');
var cookies = require('../utils/cookieutil');
var EmailTemplateUtil = require('../utils/emailtemplateutil');
var crypto = require('../utils/security/crypto');

var dao = {

    options: {
        name:"authentication.dao",
        defaultModel: $$.m.User
    },

    authenticateByUsernamePassword: function(req, username, password, fn) {
        var host = req.get("host");
        AccountDao.getAccountByHost(host, function(err, value) {
            if (err) {
                return fn(err, "An error occurred validating account");
            }

            var account = value;
            if (account !== true && (account == null || account.id() == null || account.id() == 0)) {
                return fn("Account not found", "No account found at this location");
            }

            //We are at the main indigenous level application, not at a custom subdomain
            else if (account === true) {
                req.session.accountId = 0;
                UserDao.getUserByUsername(username, function(err, value) {
                    if (!err) {
                        if (value == null) {
                            return fn("User not found", "Incorrect username");
                        }

                        var user = value;

                        user.verifyPassword(password, $$.constants.user.credential_types.LOCAL, function(err, value) {
                            if (!err) {
                                if (value === false) {
                                    return fn("Incorrect password", "Incorrect password");
                                } else {
                                    return fn(null, user);
                                }
                            } else {
                                return fn(err, "An error occurred verifying password - " + err);
                            }
                        });
                    } else {
                        fn(err, value);
                    }
                });
            } else {
                req.session.accountId = account.id();
                UserDao.getUserForAccount(account.id(), username, function(err, value) {
                    if (err) {
                        return fn(err, "An error occurred retrieving user for account");
                    } else {
                        if (value == null) {
                            return fn("User not found for account", "Incorrect username");
                        } else {
                            var user = value;
                            user.verifyPasswordForAccount(account.id(), password, $$.constants.user.credential_types.LOCAL, function(err, value) {
                                if (!err) {
                                    if (value === false) {
                                        return fn("Incorrect password","Incorrect password");
                                    } else {
                                        return fn(null, user);
                                    }
                                } else {
                                    return fn(err, "An error occurred verifying encrypted password");
                                }
                            });
                        }
                    }
                });
            }
        });
    },


    authenticateBySocialLogin: function(req, socialType, socialId, email, accessToken, fn) {
        var self = this;
        var host = req.get("host");
        AccountDao.getAccountByHost(host, function(err, value) {
            if (err) {
                return fn(err, "An error occurred validating account");
            }

            var account = value;
            if (account !== true && (account == null || account.id() == null || account.id() == 0)) {
                return fn("Account not found", "No account found at this location");
            }

            //We are at the main indigenous level application, not at a custom subdomain
            else if (account === true) {
                req.session.accountId = 0;
                //Lets look up the user by socialId
                UserDao.getUserBySocialId(socialType, socialId, function(err, value) {
                    if (err) {
                        return fn(err, "An error occurred attempting to retrieve user by social profile");
                    }

                    if (value == null) {
                        //look up by email
                        UserDao.getUserByUsername(email, function(err, value) {
                            if (err) {
                                return fn(err, "An error occurred retrieving user by username");
                            }

                            if (value == null) {
                                return fn("User not found for social profile", "User not found");
                            } else {
                                value.createOrUpdateSocialCredentials(socialType, socialId, accessToken);
                                return self.saveOrUpdate(value, fn);
                            }
                        });
                    } else {
                        value.createOrUpdateSocialCredentials(socialType, socialId, accessToken);
                        return self.saveOrUpdate(value, fn);
                    }
                });
            } else {
                req.session.accountId = account.id();
                UserDao.getUserForAccountBySocialProfile(account.id(), socialType, socialId, function(err, value) {
                    if (err) {
                        return fn(err, "An error occurred retrieving user for account by social profile");
                    }

                    if (value == null) {
                        //Look for user by email
                        UserDao.getUserForAccount(account.id(), email, function(err, value) {
                            if (err) {
                                return fn(err, "An error occurred retrieving user for account");
                            }

                            if (value == null) {
                                return fn("User not found for account and social profile", "User not found");
                            }

                            value.createOrUpdateSocialCredentials(socialType, socialId, accessToken);
                            return self.saveOrUpdate(value, fn);
                        });
                    } else {
                        value.createOrUpdateSocialCredentials(socialType, socialId, accessToken);
                        return self.saveOrUpdate(value, fn);
                    }
                });
            }
        });
    },


    sendForgotPasswordEmailByUsernameOrEmail: function(email, fn) {
        var _email = email;
        UserDao.getUserByUsername(email)
            .done(function(value) {
                if (value == null) {
                    fn("No user found with username or email: " + _email);
                } else {
                    var user = value;


                    var isEmail = $$.u.validate(user.get("email"), {
                        required:true,
                        email:true
                    }).success;

                    if (isEmail === false) {
                        //lets at least try to see if the username is an email
                        if ($$.u.validate(user.get("username"), {required:true, email:true}).success === false) {
                            return fn("No email has been registered with the user: " + email);
                        } else {
                            email = user.get("username");
                        }
                    }

                    var token = user.setPasswordRecoverToken();

                    UserDao.saveOrUpdate(user, function(err, value) {
                        if (!err) {
                            //Send Email based on the current token
                            EmailTemplateUtil.resetPassword(token, value, email, fn);
                        } else {
                            return fn("An error occurred: " + err);
                        }
                    });
                }
            })
            .fail(function(err) {
                return fn(err);
            });
    },


    verifyPasswordResetToken: function(token, fn) {
        UserDao.findOne({passRecover:token}, function(err, value) {
            if (!err) {
                if (value == null) {
                    return fn("Invalid recovery token. Please ensure you have clicked the link directly from your email, or resubmit the form below.");
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


    updatePasswordByToken: function(passwordResetToken, password, fn) {
        this.verifyPasswordResetToken(passwordResetToken, function(err, value) {
            if (!err) {
                var user = value;
                user.clearPasswordRecoverToken();

                user.createOrUpdateLocalCredentials(password);

                UserDao.saveOrUpdate(user, function(err, value) {
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
    }
    //endregion
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.AuthenticationDao = dao;

module.exports = dao;

