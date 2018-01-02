/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var BaseRouter = require('./base.server.router.js');
var passport = require('passport');
var userDao = require('../dao/user.dao');
var authenticationDao = require('../dao/authentication.dao');
var accountDao = require('../dao/account.dao');
var accountManager = require('../accounts/account.manager');
var cookies = require("../utils/cookieutil");
var FacebookConfig = require('../configs/facebook.config');
var LoginView = require('../views/login.server.view');
var ForgotPasswordView = require('../views/forgotpassword.server.view');
var SignupView = require('../views/signup.server.view');
var UnsubscribeView = require('../views/unsubscribe.server.view');
var urlUtils = require('../utils/urlutils');
var userManager = require('../dao/user.manager');
var userActivityManager = require('../useractivities/useractivity_manager');
var appConfig = require('../configs/app.config');
var UAParser = require('ua-parser-js');

var parser = new UAParser();


var router = function () {
    this.init.apply(this, arguments);
};

_.extend(router.prototype, BaseRouter.prototype, {

    base: "login",

    initialize: function () {

        //-------------------------------------------------
        //  LOGIN
        //-------------------------------------------------
        app.get("/login", this.setup.bind(this), this.showLogin.bind(this));
        app.post("/login",
            passport.authenticate('local', { failureRedirect: "/login", failureFlash: 'An incorrect username or password was entered.', successFlash: 'Login success.' }),
            this.onLogin.bind(this));


        //-------------------------------------------------
        // LOGOUT
        //-------------------------------------------------
        app.get("/logout", this.handleLogout.bind(this));


        //-------------------------------------------------
        // UNSUBSCRIBE
        //-------------------------------------------------
        app.get("/unsubscribe", this.setup.bind(this), this.showUnsubscribe.bind(this));
        app.post("/unsubscribe", this.setup.bind(this), this.handleUnsubscribe.bind(this));


        //-------------------------------------------------
        // FORGOT PASSWORD
        //-------------------------------------------------
        app.get("/forgotpassword", this.setup.bind(this), this.showForgotPassword.bind(this));
        app.post("/forgotpassword", this.setup.bind(this), this.handleForgotPassword.bind(this));
        app.get("/forgotpassword/reset/:token", this.setup.bind(this), this.showResetPasswordByToken.bind(this));
        app.post("/forgotpassword/reset/:token", this.setup.bind(this), this.handleResetPasswordByToken.bind(this));

        //-------------------------------------------------
        // SIGNUP
        //-------------------------------------------------
        // app.get("/signup", this.setup, this.showSignup.bind(this));
        // app.get("/signup/*", this.setup, this.showSignup.bind(this)); //catch all routed routes
        // app.post("/signup", this.setup, this.handleSignup.bind(this));

        app.get("/current-user", this.setup.bind(this), this.getCurrentUser.bind(this));

        return this;
    },

    ip: function(req) {
        try {
            var ip = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;

            if(Array.isArray(ip)) {
                return ip[0];
            } else if(ip.indexOf(',') !== -1){
                return ip.split(',')[0].trim();
            } else{
                return ip;
            }
        } catch(exception) {
            return null;
        }

    },

    //region LOGIN / LOGOUT
    showLogin: function (req, resp) {
        var self = this;
        self.log.debug('>> showLogin');
        if(process.env.DOWNFORMAINTENANCE === 'true') {
            resp.render('maintenance.html');
        } else {
            if (req.isAuthenticated()) {
                self.log.debug('req.isAuthenticated is true.');
                if (self.accountId(req) > 0) {
                    resp.redirect("/admin");
                } else {
                    var accountIds = req.user.getAllAccountIds();
                    if (accountIds.length > 1) {
                        req.session.accountId = -1;
                        resp.redirect("/home");
                        self = req = resp = null;
                        return;
                    }

                    authenticationDao.getAuthenticatedUrlForAccount(accountIds[0], self.userId(req), "admin", function (err, value) {
                        if (err) {
                            resp.redirect("/home");
                            self = null;
                            return;
                        }
                        resp.redirect(value);
                        self = null;
                    });
                }
                return;
            }
            req.session.errorMsg = req.flash('error');
            new LoginView(req, resp).show();
        }

    },


    onLogin: function (req, resp) {
        var self = this;
        self.log.debug('>> onLogin');
        if(process.env.DOWNFORMAINTENANCE === 'true') {
            resp.render('maintenance.html');
        } else {
            self.log.debug('req.session.unAuthAccountId:', req.session.unAuthAccountId);
            self.log.debug('req.session.accountId:', req.session.accountId);
            if (req.body.remembermepresent != null && req.body.rememberme == null) {
                self.log.warn('cookie never expires!!!');
                req.session.cookie.expires = false;
            }

            var ua = req.headers['user-agent'];
            var result = parser.setUA(ua).getResult();
            console.dir(result);
            var redirectTo = req.query['redirectTo'];

            /*
             * Need to pull in the following data:
             * Date: December 12, 2014 10:28 AM
             * Browser: Safari
             * Operating System: OS X
             * IP Address: 00.00.00.00
             * Approximate Location: La Jolla, California, United States
             */
            var ip = self.ip(req);
            var date = moment().format('MMMM DD, YYYY hh:mm A');
            var browser = result.browser.name;
            var os = result.os.name;

            var requestorProps = {
                ip: ip,
                date: date,
                browser: browser,
                os: os
            };

            /*
             * set the session accountId
             */
            accountDao.getAccountByHost(req.get("host"), function(err, value) {
                if (!err && value != null) {
                    if (value === true) {
                        self.log.warn('We should not reach this code.  value ===true');
                        self.log.debug("host: " + req.get("host") + " -> accountId:0");
                        req.session.accountId = 0;
                    } else {
                        self.log.debug("host: " + req.get("host") + " -> accountId:" + value.id());

                        /*
                         * use the redirect from the cookie here.
                         */
                        var redirectUrl = cookies.getRedirectUrl(req, resp, null, true);
                        self.log.debug('onLogin redirectUrl from cookie: ' + redirectUrl);
                        if (redirectUrl != null) {
                            authenticationDao.getAuthenticatedUrl(req.user.id(), redirectUrl, null, function (err, authenticatedUrl) {
                                self.log.debug('onLogin authenticatedUrl: ' + redirectUrl);
                                self.log.debug('<< onLogin');

                                resp.redirect(redirectUrl);

                                userActivityManager.createUserLoginActivity(value.id(), self.userId(req), requestorProps, value.get('orgId'), function(){});

                                return;
                            });
                            return;
                        }

                        var accountId = self.authenticatedAccountId(req);
                        self.log.debug('AccountId: ' + accountId);
                        var _path = redirectTo || 'admin';
                        self.log.debug('_path is ', _path);
                        /*
                         * Get account from url.  If main app, check for multi-users
                         */
                        var accountIds = req.user.getAllAccountIds();
                        var subObject = urlUtils.getSubdomainFromRequest(req);
                        if(subObject.isMainApp && accountIds.length > 1) {
                            self.log.debug('redirecting to /home for main app');
                            req.session.accountId = -1;
                            self.log.debug('setting the redirect in cookies to ', _path);
                            cookies.setRedirectUrl(req, resp, _path);
                            self.log.debug('req.isAuthenticated():' + req.isAuthenticated());
                            resp.redirect("/home");
                            userActivityManager.createUserLoginActivity(0, self.userId(req), requestorProps, value.get('orgId'), function(){});
                            self = req = resp = null;
                            return;
                        } else if(subObject.isOrgRoot === true){
                            self.log.debug('redirecting based on organization');
                            //TODO: handle accountId != orgAdminAccount
                            if(accountIds.length > 1) {
                                self.log.debug('redirecting to /home for org root');
                                req.session.accountId = -1;
                                self.log.debug('setting the redirect in cookies to ', _path);
                                cookies.setRedirectUrl(req, resp, _path);
                                resp.redirect("/home");
                                userActivityManager.createUserLoginActivity(0, self.userId(req), requestorProps, value.get('orgId'), function(){});
                                self = req = resp = null;
                                return;
                            } else if(value.id() !== accountId){
                                authenticationDao.getAuthenticatedUrlForAccountAndOrg(parseInt(accountId), self.userId(req), _path, null, subObject.orgDomain, function (err, value) {
                                    if (err) {
                                        self.log.debug('redirecting to /home');
                                        resp.redirect("/home");
                                        self = null;
                                        return;
                                    }
                                    accountDao.getAccountByID(accountId, function(err, account){
                                        if (err) {
                                            self.log.debug('redirecting to /home');
                                            resp.redirect("/home");
                                            self = null;
                                            return;
                                        } else {
                                            self.log.debug('Setting subdomain to: ' + account.get('subdomain'));
                                            req.session.subdomain = account.get('subdomain');
                                            req.session.domain = account.get('domain');
                                            req.session.accountId = account.id();
                                            req.session.unAuthAccountId = account.id();
                                            self.log.debug('redirecting to ' + value);

                                            resp.redirect(value);
                                            userActivityManager.createUserLoginActivity(accountId, self.userId(req), requestorProps, account.get('orgId'), function(){});
                                            self = null;
                                            return;
                                        }
                                    });

                                });
                            } else {
                                authenticationDao.getAuthenticatedUrlForAccountAndOrg(value.id(), self.userId(req), _path, null, subObject.orgDomain, function (err, authUrl) {
                                    if (err) {
                                        self.log.debug('redirecting to /home');
                                        resp.redirect("/home");
                                        self = null;
                                        return;
                                    }
                                    self.log.debug('value:', value);
                                    self.log.debug('redirecting to ' + authUrl);
                                    req.session.subdomain = value.get('subdomain');
                                    req.session.domain = value.get('domain') || value.get('customDomain');
                                    req.session.accountId = value.id();
                                    req.session.unAuthAccountId = value.id();
                                    self.log.debug('req.session:', req.session);
                                    resp.redirect(authUrl);
                                    userActivityManager.createUserLoginActivity(value.id(), self.userId(req), requestorProps, value.get('orgId'), function(){});

                                    self = null;
                                });
                            }

                        } else if(subObject.domain && value.get('customDomain')===subObject.domain && accountId === value.id()){
                            self.log.debug('Redirecting based on domain');
                            authenticationDao.getAuthenticatedUrlForAccount(value.id(), self.userId(req), _path, function (err, authUrl) {
                                if (err) {
                                    self.log.debug('redirecting to /home');
                                    resp.redirect("/home");
                                    self = null;
                                    return;
                                }

                                self.log.debug('redirecting to ' + authUrl);
                                req.session.subdomain = value.get('subdomain');
                                req.session.domain = value.get('domain') || value.get('customDomain');
                                req.session.accountId = value.id();
                                req.session.unAuthAccountId = value.id();
                                resp.redirect(authUrl);
                                userActivityManager.createUserLoginActivity(value.id(), self.userId(req), requestorProps, value.get('orgId'), function(){});

                                self = null;
                            });
                        } else if((subObject.subdomain === null || subObject.subdomain === '') && _.contains(accountIds, appConfig.mainAccountID)) {
                            self.log.debug('subObject.domain:' + subObject.domain + '; value.get("domain"):' + value.get('customDomain') + '; accountId: ' + accountId + ' value.id():' + value.id());
                            self.log.debug('redirecting to main application');
                            authenticationDao.getAuthenticatedUrlForAccount(appConfig.mainAccountID, self.userId(req), _path, function (err, value) {
                                if (err) {
                                    self.log.debug('redirecting to /home');
                                    resp.redirect("/home");
                                    self = null;
                                    return;
                                }

                                self.log.debug('redirecting to ' + value);
                                resp.redirect(value);
                                userActivityManager.createUserLoginActivity(appConfig.mainAccountID, self.userId(req), requestorProps, value.get('orgId'), function(){});
                                self = null;
                                return;
                            });
                        } else if(subObject.subdomain === null || subObject.subdomain === ''){

                            self.log.debug('logged into main... redirecting to custom subdomain (' + accountId + ')');

                            authenticationDao.getAuthenticatedUrlForAccount(parseInt(accountId), self.userId(req), _path, function (err, value) {
                                if (err) {
                                    self.log.debug('redirecting to /home');
                                    resp.redirect("/home");
                                    self = null;
                                    return;
                                }
                                accountDao.getAccountByID(accountId, function(err, account){
                                    if (err) {
                                        self.log.debug('redirecting to /home');
                                        resp.redirect("/home");
                                        self = null;
                                        return;
                                    } else {
                                        self.log.debug('Setting subdomain to: ' + account.get('subdomain'));
                                        req.session.subdomain = account.get('subdomain');
                                        req.session.domain = account.get('domain');
                                        req.session.accountId = account.id();
                                        req.session.unAuthAccountId = account.id();
                                        self.log.debug('redirecting to ' + value);

                                        resp.redirect(value);
                                        userActivityManager.createUserLoginActivity(accountId, self.userId(req), requestorProps, account.get('orgId'), function(){});
                                        self = null;
                                        return;
                                    }
                                });

                            });
                        } else {
                            self.log.debug('redirecting to account by subdomain');
                            var parsedHost = urlUtils.getSubdomainFromRequest(req);
                            accountManager.getAccountBySubdomainAndOrgDomain(subObject.subdomain, parsedHost.orgDomain, function(err, value){
                                if(err) {
                                    self.log.error('Error finding account:' + err);
                                    self.log.debug('redirecting to /home');
                                    resp.redirect("/home");
                                    self = req = resp = null;
                                    return;
                                }
                                authenticationDao.getAuthenticatedUrlForAccount(value.id(), self.userId(req), _path, function (err, authUrl) {
                                    if (err) {
                                        self.log.debug('redirecting to /home');
                                        resp.redirect("/home");
                                        self = null;
                                        return;
                                    }
                                    if(req.session.locked === true) {
                                        self.log.debug('locked is true');
                                        authUrl = "/interim.html";
                                    }
                                    self.log.debug('redirecting to ' + authUrl);
                                    req.session.subdomain = value.get('subdomain');
                                    req.session.domain = value.get('domain');
                                    req.session.accountId = value.id();
                                    req.session.unAuthAccountId = value.id();
                                    resp.redirect(authUrl);
                                    userActivityManager.createUserLoginActivity(value.id(), self.userId(req), requestorProps, value.get('orgId'), function(){});

                                    self = null;
                                });
                            });

                        }

                    }
                } else {
                    self.log.warn("No account found from getAccountByHost");
                }
            });
        }

    },


    handleLogout: function (req, resp) {
        var accountId = this.accountId(req);
        var userId = this.userId(req);

        this.logout(req, resp);
        resp.redirect('/login');
        userActivityManager.createUserLogoutActivity(accountId, userId, function(){});


        /*
        userActivityManager.createUserLogoutActivity(accountId, userId, function() {
            setTimeout(function() {
                resp.redirect("/login");
            }, 2000);
        });
        */
        //return resp.redirect("/login");
    },
    //endregion


    //region FORGOT PASSWORD
    showForgotPassword: function (req, resp) {
        if (req.isAuthenticated()) {
            return resp.redirect("/");
        }

        new ForgotPasswordView(req, resp).show();
    },


    handleForgotPassword: function (req, resp) {
        var username = req.body.username.toLowerCase();
        new ForgotPasswordView(req, resp).handleForgotPassword(username);
    },


    showResetPasswordByToken: function (req, resp) {
        var token = req.params.token;
        var email = req.query.email;
        new ForgotPasswordView(req, resp).resetByToken(token, email);
    },


    handleResetPasswordByToken: function (req, resp) {
        var self = this;
        self.log.debug('>> handleResetPasswordByToken');
        var email = req.body.username.toLowerCase();
        var password = req.body.password;
        var password2 = req.body.password2;
        var token = req.params.token;
        self.log.debug('email: ' + email);
        if (password !== password2) {

            new ForgotPasswordView(req, resp).ForgotPasswordMismatch(token, email);
            // req.flash("error", "Passwords do not match");
            // self.log.error('Passwords do not match');
            // return resp.redirect("/forgotpassword/reset/" + token);
        } else {
            new ForgotPasswordView(req, resp).handleResetByToken(token, password, email);
        }

    },
    //endregion

    //region Unsubscribe

    showUnsubscribe: function (req, resp) {
        if (req.isAuthenticated()) {
            return resp.redirect("/");
        }/* else if (this.accountId(req) > 0) {
            return resp.redirect("/login");
        }*/

        new UnsubscribeView(req, resp).show();
    },

    handleUnsubscribe: function (req, resp) {
        // TO DO
        //var username = req.body.username;
        //new ForgotPasswordView(req, resp).handleForgotPassword(username);
    },

    //endregion

    //region SIGNUP
    showSignup: function (req, resp) {
        if (req.isAuthenticated()) {
            return resp.redirect("/");
        }/* else if (this.accountId(req) > 0) {
            return resp.redirect("/login");
        }*/

        new SignupView(req, resp).show();
    },

    handleSignup: function (req, resp) {
        var self = this, user, deferred;
        self.log.debug('>> handleSignup');

        var username = req.body.username;
        var password1 = req.body.password;
        var password2 = req.body.password2;
        var email = req.body.username.toLowerCase();

        if (username == null || username.trim() == "") {
            req.flash("error", "You must enter a valid username");
            return resp.redirect("/signup");
        }

        if (password1 !== password2) {
            req.flash("error", "Passwords do not match");
            return resp.redirect("/signup");
        }

        if (password1 == null || password1.trim() == "" || password1.length < 5) {
            req.flash("error", "You must enter a valid password at least 5 characters long");
            return resp.redirect("/signup");
        }

        var isEmail = $$.u.validate(email, { required: true, email: true }).success;
        if (isEmail === false) {
            req.flash("error", "You must enter a valid email");
            return resp.redirect("/signup");
        }

        //ensure we don't have another user with this username;
        var accountToken = cookies.getAccountToken(req);


        userManager.createAccountAndUser(username, password1, email, accountToken, null, null, null, {}, 0, function (err, accountAndUser) {
            if (!err) {
                var value = accountAndUser.user;
                req.login(value, function (err) {
                    if (err) {
                        return resp.redirect("/");
                    } else {

                        var accountId = value.getAllAccountIds()[0];
                        authenticationDao.getAuthenticatedUrlForAccount(accountId, self.userId(req), "admin", function (err, value) {
                            if (err) {
                                resp.redirect("/home");
                                self = null;
                                return;
                            }
                            resp.redirect(value);
                            self = null;
                        });
                    }
                });
            } else {
                req.flash("error", value.toString());
                return resp.redirect("/signup");
            }
        });
    },

    getCurrentUser: function (req, resp) {
        resp.json(this._filterUser(req.user));
    },

    _filterUser: function (user) {
        if (user && user.attributes) {
            return {
                user: {
                    id: user.attributes._id,
                    email: user.attributes.email.toLowerCase(),
                    admin: false
                }
            };
        } else {
            return {
                user: null
            };
        }
    }
//endregion
})
;

module.exports = new router();
