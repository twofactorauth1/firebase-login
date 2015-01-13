/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var userDao = require('../../dao/user.dao');
var accountDao = require('../../dao/account.dao');
var passport = require('passport');
var cookies = require('../../utils/cookieutil');
var authenticationDao = require('../../dao/authentication.dao');
var userManager = require('../../dao/user.manager');
var paymentsManager = require('../../payments/payments_manager');
var async = require('async');
var UAParser = require('ua-parser-js');
var parser = new UAParser();

var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "user",

    dao: userDao,

    initialize: function() {
        app.get(this.url(''), this.isAuthApi.bind(this), this.getLoggedInUser.bind(this));
        app.get(this.url('accounts'), this.isAuthApi.bind(this), this.getUserAccounts.bind(this));
        app.post(this.url('accounts/:id'), this.isAuthApi.bind(this), this.setActiveAccount.bind(this));

        app.get(this.url('social'), this.isAuthApi.bind(this), this.getLoggedInUserSocialCredentials.bind(this));
        app.delete(this.url('social/:type'), this.isAuthApi.bind(this), this.removeSocialCredentials.bind(this));

        app.get(this.url('security'), this.isAuthApi.bind(this), this.initializeSecurity.bind(this));

        app.get(this.url('preferences'), this.isAuthAndSubscribedApi.bind(this), this.getUserPreferences.bind(this));
        app.post(this.url('preferences'), this.isAuthAndSubscribedApi.bind(this), this.updateUserPreferences.bind(this));


        app.post(this.url(''), this.createUser.bind(this));
        app.post(this.url('member'), this.isAuthAndSubscribedApi.bind(this), this.createUserForAccount.bind(this));
        app.get(this.url('members'), this.isAuthAndSubscribedApi.bind(this), this.getUsersForAccount.bind(this));
        app.post(this.url('member/:id/resetpassword'), this.isAuthAndSubscribedApi.bind(this), this.resetPassword.bind(this));
        app.post(this.url('initialize'), this.initializeUserAndAccount.bind(this));

        app.get(this.url(':id'), this.isAuthApi.bind(this), this.getUserById.bind(this));
        app.put(this.url(':id'), this.isAuthApi.bind(this), this.updateUser.bind(this));
        app.delete(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.deleteUser.bind(this));

        app.get(this.url('exists/:username'), this.setup.bind(this), this.userExists.bind(this));
        app.get(this.url(':accountId/user/exists/:username', "account"), this.setup.bind(this), this.userExistsForAccount.bind(this));
    },

    /**
     * No security needed.
     * @param req
     * @param resp
     */
    getUserAccounts: function(req, resp) {
        var self = this;
        self.log.debug('>> getUserAccounts');
        /*
         * This method assumes a user has been authenticated.  It will only return the accounts that were present at
         * authentication-time.
         */
        var result = {
            activeAccount: req.session.accountId,
            accounts: req.session.accounts
        }
        self.log.debug('<< getUserAccounts');
        self.sendResult(resp, result);
    },

    /** No security needed.
     *
     * @param req
     * @param resp
     */
    setActiveAccount: function(req, resp) {
        var self = this;
        self.log.debug('>> setActiveAccount');
        var activeAccountId = parseInt(req.params.id);
        req.session.accountId = activeAccountId;
        self.log.debug('<< setActiveAccount (' + req.session.accountId + ')');
        self.send200(resp);
    },

    /**
     * No security needed.
     * @param req
     * @param resp
     */
    getLoggedInUser: function(req,resp) {
        var self = this;

        var user = req.user;

        userDao.getById(user.id(), function(err, value) {
           if (!err) {
               return resp.send(value.toJSON("public"));
           } else {
               return self.wrapError(resp, 500, null, err, value);
           }
        });
    },

    getLoggedInUserSocialCredentials: function(req, resp) {
        var self = this;
        self.log.debug('>> getLoggedInUserSocialCredentials');
        var user = req.user;

        userDao.getById(user.id(), function(err, value) {
            if (!err) {
                var userObj = value.toJSON('public');
                self.log.debug('<< getLoggedInUserSocialCredentials');
                return resp.send(userObj.credentials);
            } else {
                self.log.error('Error getting user by id: ' + err);
                return self.wrapError(resp, 500, null, err, value);
            }
        });
    },

    removeSocialCredentials: function(req, resp) {
        var self = this;
        self.log.debug('>> removeSocialCredentials');

        var type = req.params.type;
        if(!type || type.length < 1) {
            return self.wrapError(resp, 400, 'Bad Request', 'Invalid type parameter.');
        }

        userDao.getById(req.user.id(), $$.m.User, function(err, user){
            if(err) {
                self.log.error('Error occurred loading user: ' + err);
                return self.wrapError(resp, 500, null, err);
            }
            var targetIndex = -1;
            var credentials = user.get('credentials');
            for(var i=0; i<credentials.length; i++) {
                if(credentials[i].type === type) {
                    targetIndex = i;
                }
            }
            if(targetIndex !== -1) {
                credentials.splice(targetIndex, 1);
            }
            user.set('credentials', credentials);
            //user.removeCredentials(type);
            userDao.saveOrUpdate(user, function(err, value){
                if(err) {
                    self.log.error('Error occurred removing social credentials: ' + err);
                    return self.wrapError(resp, 500, null, err);
                }
                return resp.send(value.toJSON('public'));
            });
        });

    },

    /**
     * Utilized for testing.
     * @param req
     * @param res
     */
    initializeSecurity: function(req, res) {
        var self = this;
        var user = req.user;
        self.sm.initializeUserPrivileges(user.id(), user.get('username'), user.get('accounts')[0].permissions, self.accountId(req), function(err, result){
            res.send(result);
        });
    },


    getUserById: function(req,resp) {
        var self = this;
        var userId = req.params.id;
        self.log.debug('>> getUserById');

        if (!userId) {
            return this.wrapError(resp, 400, null, "Invalid parameter for ID");
        }

        //userId = parseInt(userId);

        userDao.getById(userId, function(err, value) {
            if (!err) {

                if (value == null) {
                    self.log.debug('<< getUserById(404)');
                    return self.wrapError(resp, 404, null, "No User found with ID: [" + userId + "]");
                }
                var accountId = parseInt(self.accountId(req));
                if(_.contains(value.getAllAccountIds(), accountId)) {
                    var responseObj =  value.toJSON("public", {accountId:self.accountId(req)})
                    self.log.debug('<< getUserById');
                    self.checkPermissionAndSendResponse(req, self.sc.privs.VIEW_USER, resp, responseObj);
                } else {
                    self.log.debug('<< getUserById(404p)');
                    return self.wrapError(resp, 404, null, "No User found with ID: [" + userId + "]");
                }
                //return resp.send(value.toJSON("public", {accountId:self.accountId(req)}));
            } else {
                self.log.debug('<< getUserById(401)');
                return self.wrapError(resp, 401, null, err, value);
            }
        });
    },

    /**
     * No security required.
     * @param req
     * @param resp
     * @returns {*}
     */
    userExists: function(req,resp) {
        var self = this;

        var username = req.params.username;
        self.log.debug('>> userExists ', username);

        // var accountId = this.accountId(req);
        // if (accountId > 0) {
        //     req.params.accountId = accountId;
        //     return this.userExistsForAccount(req, resp);
        // }
        userDao.usernameExists(username, function(err, value) {
            self.log.debug('>> usernameExists ', value);
            if (err) {
                return self.wrapError(resp, 500, "An error occurred checking username", err, value);
            }
            return resp.send(value);
        });
    },


    userExistsForAccount: function(req,resp) {
        var self = this;
        var username = req.params.username;
        var accountId = req.params.accountId;

        accountId = parseInt(accountId);

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_USER, accountId, function (err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                userDao.usernameExistsForAccount(accountId, username, function(err, value) {
                    if (err) {
                        return self.wrapError(resp, 500, "An error occurred checking username for account", err, value);
                    }
                    return resp.send(value);
                });
            }
        });


    },

    initializeUserAndAccount: function(req, res) {
        var self = this, user, accountToken, deferred;
        self.log.debug('>> initializeUserAndAccount');
        console.dir(req.body);

        var username = req.body.username;
        var password1 = req.body.password;
        var password2 = req.body.password2;
        var email = req.body.username;
        var accountToken = req.body.accountToken;
        var anonymousId = req.body.anonymousId;
        var coupon = req.body.coupon;
        var fingerprint = req.body.fingerprint;
        var setupFee = req.body.setupFee;

        var cardToken = req.body.cardToken;
        var plan = req.body.plan || 'NO_PLAN_ARGUMENT';//TODO: make sure this gets passed

        var sendWelcomeEmail = true;//this can be overridden in the request.
        if(req.body.sendWelcomeEmail && req.body.sendWelcomeEmail === false) {
            sendWelcomeEmail = false;
        }

        //createStripeCustomer
        //updateCurrentAccountBilling

        //ensure we don't have another user with this username;
        var accountToken = cookies.getAccountToken(req);

        self.log.debug('>> username', username);
        self.log.debug('>> password1', password1);
        self.log.debug('>> email', email);
        self.log.debug('>> accountToken', accountToken);
        self.log.debug('>> cardToken', cardToken);
        self.log.debug('>> plan', plan);
        self.log.debug('>> anonymousId', anonymousId);
        self.log.debug('>> coupon', coupon);


        async.waterfall([
            function(callback){
                if(password1 === null) {
                    self.log.debug('Creating user from social');
                    userManager.createAccountAndUserFromTempAccount(accountToken, fingerprint, sendWelcomeEmail, function(err, accountAndUser){
                        if(err) {
                            self.log.error('Error creating account or user: ' + err);
                            return self.wrapError(res, 500, 'Error', 'Error creating account or user.');
                        }
                        callback(null, user, accountAndUser.account);
                    });
                } else {
                    userManager.createAccountAndUser(username, password1, email, accountToken, anonymousId, fingerprint, sendWelcomeEmail, function (err, accountAndUser) {
                        if (err) {
                            self.log.error('Error creating account or user: ' + err);
                            return self.wrapError(res, 500, 'Error', 'Error creating account or user.');
                        }
                        callback(null, accountAndUser.user, accountAndUser.account);
                    });
                }
            },
            function(user, account, callback){
                self.log.debug('Created user[' + user.id() + '] and account[' + account.id() + '] objects.');
                paymentsManager.createStripeCustomerForUser(cardToken, user, account.id(), function(err, stripeCustomer) {
                    if (err) {
                        self.log.error('Error creating Stripe customer: ' + err);
                        return self.wrapError(res, 500, 'Error creating Stripe Customer', err);
                    }
                    callback(null, stripeCustomer, user, account);
                });
            },
            function(stripeCustomer, user, account, callback){
                self.log.debug('Created Stripe customer: ' +  stripeCustomer.id);
                paymentsManager.createStripeSubscription(stripeCustomer.id, plan, account.id(), user.id(), coupon, setupFee, function(err, sub) {
                    if (err) {
                        self.log.error('Error creating Stripe subscription: ' + err);
                        return self.wrapError(res, 500, 'Error creating Stripe Subscription', err);
                    }
                    callback(null, sub, stripeCustomer, user, account);
                });

            },
            function(sub, stripeCustomer, user, account, callback){
                self.log.debug('Created subscription: ' + sub.id);
                accountDao.getAccountByID(account.id(), function(err, account) {
                    if (err || account === null) {
                        self.log.error('Error retrieving new account: ' + err);
                        return self.wrapError(res, 500, 'Error getting new account', err);
                    }
                    var billingObj = account.get('billing');
                    billingObj.stripeCustomerId = stripeCustomer.id;
                    billingObj.subscriptionId = sub.id;
                    account.set('billing', billingObj);
                    accountDao.saveOrUpdate(account, function (err, updatedAccount) {
                        if (err) {
                            self.log.error('Error saving billing information to account: ' + err);
                            return self.wrapError(res, 500, 'Error saving billing information to account', err);
                        }
                        req.session.accountId = updatedAccount.id();
                        req.session.subdomain = updatedAccount.get('subdomain');
                        req.session.domain = updatedAccount.get('domain');
                        callback(null, account.id(), sub.id, user);
                    });
                });
            },
            function(accountId, subId, user, callback) {
                self.log.debug('Updated account billing.');
                self.sm.addSubscriptionToAccount(accountId, subId, plan, user.id(), function(err, value){
                    authenticationDao.getAuthenticatedUrlForAccount(accountId, user.id(), "admin", function (err, value) {
                        self.log.debug('Redirecting to: ' + value);
                        if (err) {
                            res.redirect("/home");
                            self = null;
                            return;
                        }
                        user.set("accountUrl", value.toLowerCase());
                        var json = user.toJSON('public', {accountId:accountId});
                        self.log.debug('<< initalizeUserAndAccount: ', json);
                        res.send(json);
                    });
                });
            }
        ], function(err, result){
            //we don't really need to do anything here.
            self.log.warn('Unexpected method call!!!')
        });




    },


    createUser: function(req,resp) {
        var self = this, user, accountToken, deferred;
        self.log.debug('>> createUser');

        var username = req.body.username;
        var password1 = req.body.password;
        var password2 = req.body.password2;
        var email = req.body.username;
        var accountToken = req.body.accountToken;
        var anonymousId = req.body.anonymousId;
        var fingerprint = req.body.fingerprint;

        var sendWelcomeEmail = true;//this can be overridden in the request.
        if(req.body.sendWelcomeEmail && req.body.sendWelcomeEmail === false) {
            sendWelcomeEmail = false;
        }

        // if (username == null || username.trim() == "") {
        //     req.flash("error", "You must enter a valid username");
        //     return resp.redirect("/signup/create");
        // }

        // if (password1 !== password2) {
        //     req.flash("error", "Passwords do not match");
        //     return resp.redirect("/signup/create");
        // }

        // if (password1 == null || password1.trim() == "" || password1.length < 5) {
        //     req.flash("error", "You must enter a valid password at least 5 characters long");
        //     return resp.redirect("/signup/create");
        // }

        // var isEmail = $$.u.validate(email, { required: true, email: true }).success;
        // if (isEmail === false) {
        //     req.flash("error", "You must enter a valid email");
        //     return resp.redirect("/signup/create");
        // }

        //ensure we don't have another user with this username;
        var accountToken = cookies.getAccountToken(req);

        self.log.debug('>> username', username);
        self.log.debug('>> password1', password1);
        self.log.debug('>> email', email);
        self.log.debug('>> accountToken', accountToken);
        self.log.debug('>> anonymousId', anonymousId);


        userManager.createAccountAndUser(username, password1, email, accountToken, anonymousId, fingerprint, sendWelcomeEmail, function (err, accountAndUser) {
            var userObj = accountAndUser.user;
            self.log.debug('createUserFromUsernamePassword >>>');
                if (!err) {
                    var value = accountAndUser.user;
                    req.login(value, function (err) {
                        if (err) {
                            return resp.redirect("/");
                        } else {

                            var accountId = accountAndUser.account.id();
                            self.log.debug('createUserFromUsernamePassword accountId >>>', accountId);
                            authenticationDao.getAuthenticatedUrlForAccount(accountId, self.userId(req), "admin", function (err, value) {
                                console.log('value url >>> ', value);
                                if (err) {
                                    resp.redirect("/home");
                                    self = null;
                                    return;
                                }
                                userObj.set("accountUrl",value.toLowerCase());
                                resp.send(userObj);
                                self = null;
                            });
                        }
                    });
                } else {
                    self.log.debug('createUserFromUsernamePassword >>> ERROR');
                    req.flash("error", value.toString());
                    return resp.redirect("/page/signup");//TODO: Fix this
                }
        });

        // userDao.createUserFromUsernamePassword(username, password1, email, accountToken, function(err, value) {
        //     if (err) {
        //         return self.wrapError(resp, 500, "An error occurred checking username", err, value);
        //     }
        //     return resp.send(value);
        // });
    },

    /**
     * This method will create a 'member' for an account.  It expects two body params:
     * req.body.user contains a *limited* public/js/models/user.js object.  The only fields examined are username, email, first, last
     * req.body.password contains the password to encrypt and set.
     * @param req
     * @param resp
     */
    createUserForAccount: function(req, resp) {
        var self = this;
        self.log.debug('>> createUserForAccount');
        var user = req.body.user;
        var password = req.body.password;
        var accountId = parseInt(self.accountId(req));

        self.checkPermission(req, self.sc.privs.MODIFY_USER, function (err, isAllowed) {
            if (isAllowed !== true || !_.contains(value.getAllAccountIds(), self.accountId(req))) {
                return self.send403(res);
            } else {
                userManager.createAccountUser(accountId, user.username, password, user.email, user.first, user.last, req.user, function(err, user){
                    self.log.debug('<< createUserForAccount');
                    var responseObj = null;
                    if(user) {
                        responseObj =  user.toJSON("public", {accountId:self.accountId(req)});
                    }

                    return self.sendResultOrError(resp, err, responseObj, 'Error creating user');
                });
            }
        });


    },

    /**
     *
     * @param req
     * @param resp
     */
    getUsersForAccount: function(req, resp) {
        var self = this;
        self.log.debug('>> getUsersForAccount');

        var accountId = parseInt(self.accountId(req));
        self.checkPermission(req, self.sc.privs.VIEW_USER, function (err, isAllowed) {
            if (isAllowed !== true || !_.contains(req.user.getAllAccountIds(), self.accountId(req)) || !_.contains(req.user.getPermissionsForAccount(accountId), 'admin')) {
                return self.send403(res);
            } else {
                userManager.getUserAccounts(accountId, function(err, userAry){
                    if(err) {
                        self.log.error('Error finding user accounts: ' + err);
                        return self.wrapError(resp, 500, null, 'Error finding account');
                    } else {
                        var results = [];
                        _.each(userAry, function(element){
                            results.push(element.toJSON('manage', {accountId:accountId}));
                        });
                        return self.sendResult(resp, results);
                    }

                });

            }
        });

    },

    resetPassword: function(req, resp) {
        var self = this;
        self.log.debug('>> resetPassword');
        var ua = req.headers['user-agent'];
        var result = parser.setUA(ua).getResult();
        var ip = self.ip(self.req);
        var date = moment().format('MMMM DD, YYYY hh:mm A');
        var browser = result.browser.name;
        var os = result.os.name;
        var accountId = parseInt(self.accountId(req));

        var requestorProps = {
            ip: ip,
            date: date,
            browser: browser,
            os: os
        };
        self.checkPermission(req, self.sc.privs.VIEW_USER, function (err, isAllowed) {
            if (isAllowed !== true || !_.contains(req.user.getAllAccountIds(), accountId) || !_.contains(req.user.getPermissionsForAccount(accountId), 'admin')) {
                return self.send403(res);
            } else {
                var userId = parseInt(req.params.id);
                userDao.getById(userId, $$.m.User, function(err, value){
                    if(err || value === null) {
                        self.log.error('Error getting user by id: ' + err);
                        return self.wrapError(resp, 500, null, 'Error getting user by id');
                    }
                    authenticationDao.sendForgotPasswordEmailByUsernameOrEmail(accountId, value.get('username'), requestorProps, function(err, value) {
                        if(err) {
                            self.log.error('Error sending email: ' + err);
                            return self.wrapError(resp, 500, null, 'Error sending forgot password email.');
                        } else {
                            self.log.debug('<< resetPassword');
                            return self.sendResult(resp, 'sent');
                        }
                    });
                });
            }
        });

    },


    /**
     * This method WILL NOT update credentials for the user nor the account/credentials object.
     * @param req
     * @param resp
     */
    updateUser: function(req,resp) {
        //TODO - ensure user accounts are not tampered with
        var self = this;
        var user = new $$.m.User(req.body);
        var userId=req.body._id;

  /*      userDao.saveOrUpdate(user, function(err, value) {
            if (!err) {
                self.sendResult(resp, value);
            } else {
                self.wrapError(resp, 500, "There was an error updating contact", err, value);
            }
        });*/

        userDao.getById(userId, function(err, value) {
            if (!err && value != null) {
                value.set("welcome_alert",req.body.welcome_alert);
                //console.log(value);
                user.set("credentials",value.get("credentials"));
                user.set('accounts', value.get('accounts'));

                self.checkPermission(req, self.sc.privs.MODIFY_USER, function (err, isAllowed) {
                    if (isAllowed !== true || !_.contains(value.getAllAccountIds(), self.accountId(req))) {
                        return self.send403(res);
                    } else {
                        userDao.saveOrUpdate(user, function(err, value) {
                            if (!err && value != null) {
                                resp.send(value.toJSON("public"));
                            } else {
                                self.wrapError(resp, 500, null, err, value);
                            }
                        });
                    }
                });


            } else {
                return self.wrapError(resp, 401, null, err, value);
            }
        });


    },

    getUserPreferences: function(req, res) {
        var self = this;
        self.log.debug('>> getUserPreferences');

        var user = req.user;
        self.checkPermission(req, self.sc.privs.VIEW_USER, function (err, isAllowed) {

            if (isAllowed !== true ) {
                return self.send403(res);
            } else {
                userDao.getById(user.id(), function(err, value) {
                    if (!err) {
                        self.log.debug('<< getUserPreferences');
                        return res.send(value.get('user_preferences'));
                    } else {
                        self.log.error('Error getting user: ' + err);
                        return self.wrapError(res, 500, null, err, value);
                    }
                });
            }
        });


    },

    updateUserPreferences: function(req, res) {
        var self = this;
        self.log.debug('>> updateUserPreferences');
        self.checkPermission(req, self.sc.privs.MODIFY_USER, function (err, isAllowed) {
            if (isAllowed !== true ) {
                return self.send403(res);
            } else {
                var user = req.user;
                var preferences = req.body;
                userDao.getById(user.id(), function(err, savedUser) {
                    if(err) {
                        self.log.error('Error getting user: ' + err);
                        return self.wrapError(res, 500, null, err, value);
                    } else {
                        savedUser.set('user_preferences', preferences);
                        userDao.saveOrUpdate(savedUser, function(err, updatedUser){
                            if(err) {
                                self.log.error('Error updating user preferences: ' + err);
                                return self.wrapError(res, 500, null, err, value);
                            } else {
                                self.log.debug('<< updateUserPreferences');
                                return res.send(updatedUser.get('user_preferences'));
                            }
                        });
                    }
                });
            }
        });


    },


    deleteUser: function(req,resp) {
        var self = this;
        self.log.debug('>> deleteUser');
        var userId = parseInt(req.params.id);
        var accountId = parseInt(self.accountId(req));

        self.checkPermission(req, self.sc.privs.MODIFY_USER, function (err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                userManager.deleteOrRemoveUserForAccount(accountId, userId, function(err, value){
                    self.log.debug('<< deleteUser');
                    return self.sendResultOrError(resp, err, value, 'Error deleting user');
                });
            }
        });
    }
});

module.exports = new api();

