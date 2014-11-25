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
var cookies = require("../utils/cookieutil");
var FacebookConfig = require('../configs/facebook.config');
var LoginView = require('../views/login.server.view');
var ForgotPasswordView = require('../views/forgotpassword.server.view');
var SignupView = require('../views/signup.server.view');
var urlUtils = require('../utils/urlutils');
var userManager = require('../dao/user.manager');


var router = function () {
    this.init.apply(this, arguments);
};

_.extend(router.prototype, BaseRouter.prototype, {

    base: "login",

    initialize: function () {

        //-------------------------------------------------
        //  LOGIN
        //-------------------------------------------------
        app.get("/login", this.setup, this.showLogin.bind(this));
        app.post("/login",
            passport.authenticate('local', { failureRedirect: "/login", failureFlash: true }),
            this.onLogin.bind(this));


        //-------------------------------------------------
        // LOGOUT
        //-------------------------------------------------
        app.get("/logout", this.handleLogout.bind(this));


        //-------------------------------------------------
        // FORGOT PASSWORD
        //-------------------------------------------------
        app.get("/forgotpassword", this.setup, this.showForgotPassword.bind(this));
        app.post("/forgotpassword", this.setup, this.handleForgotPassword.bind(this));
        app.get("/forgotpassword/reset/:token", this.setup, this.showResetPasswordByToken.bind(this));
        app.post("/forgotpassword/reset/:token", this.setup, this.handleResetPasswordByToken.bind(this));


        //-------------------------------------------------
        // SIGNUP
        //-------------------------------------------------
        // app.get("/signup", this.setup, this.showSignup.bind(this));
        // app.get("/signup/*", this.setup, this.showSignup.bind(this)); //catch all routed routes
        // app.post("/signup", this.setup, this.handleSignup.bind(this));

        app.get("/current-user", this.setup, this.getCurrentUser.bind(this));

        return this;
    },


    //region LOGIN / LOGOUT
    showLogin: function (req, resp) {
        var self = this;
        self.log.debug('>> showLogin')
        
        if (req.isAuthenticated()) {
            console.log('req.isAuthenticated is true.');
            if (self.accountId(req) > 0) {
                resp.redirect("/admin");
            } else {
                var accountIds = req.user.getAllAccountIds();
                if (accountIds.length > 1) {
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

        new LoginView(req, resp).show();
    },


    onLogin: function (req, resp) {
        var self = this;
        self.log.debug('>> onLogin');
        if (req.body.remembermepresent != null && req.body.rememberme == null) {
            self.log.warn('cookie never expires!!!')
            req.session.cookie.expires = false;
        }

        var redirectUrl = cookies.getRedirectUrl(req, resp, null, true);
        self.log.debug('onLogin redirectUrl from cookie: ' + redirectUrl);
        if (redirectUrl != null) {
            authenticationDao.getAuthenticatedUrl(req.user.id(), redirectUrl, null, function (err, value) {
                self.log.debug('onLogin authenticatedUrl: ' + redirectUrl);
                self.log.debug('<< onLogin');
                return resp.redirect(redirectUrl);
            });
            return;
        }

        this.setup(req, resp, function (err, value) {
            if (self.accountId(value) > 0) {
                self.log.debug('redirecting to /admin');
                resp.redirect("/admin");
                self = req = resp = null;
            } else {
                var accountIds = req.user.getAllAccountIds();
                if (accountIds.length > 1) {
                    self.log.debug('redirecting to /home');
                    resp.redirect("/home");
                    self = req = resp = null;
                    return;
                }

                authenticationDao.getAuthenticatedUrlForAccount(accountIds[0], self.userId(req), "admin", function (err, value) {
                    if (err) {
                        self.log.debug('redirecting to /home');
                        resp.redirect("/home");
                        self = null;
                        return;
                    }

                    self.log.debug('redirecting to ' + value);
                    resp.redirect(value);
                    self = null;
                });
            }
        });
    },


    handleLogout: function (req, resp) {
        var accountId = this.accountId(req);
        req.session.cookie = null;
        req.session.accountId = null; 
        req.logout();
        req.session.destroy();
        req.session = null;
        req.user = null;

        /*
        if (accountId > 0) {
            var appConfig = require('../configs/app.config');
            var redirect = req.protocol + '://' + req.get('host') + "/login";

            return resp.redirect(appConfig.server_url + "/logout?redirect=" + encodeURIComponent(redirect));
        } else {
            if (String.isNullOrEmpty(req.query.redirect) == false) {
                return resp.redirect(req.query.redirect);
            }
        }
        */
        setTimeout(function() {
            resp.redirect("/login");
        }, 2000);
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
        var username = req.body.username;
        new ForgotPasswordView(req, resp).handleForgotPassword(username);
    },


    showResetPasswordByToken: function (req, resp) {
        var token = req.params.token;
        new ForgotPasswordView(req, resp).resetByToken(token);
    },


    handleResetPasswordByToken: function (req, resp) {
        var password = req.body.password;
        var password2 = req.body.password2;
        var token = req.params.token;

        if (password !== password2) {
            req.flash("error", "Passwords do not match");
            return resp.redirect("/forgotpassword/reset/" + token);
        }

        new ForgotPasswordView(req, resp).handleResetByToken(token, password);
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
        var self = this, user, accountToken, deferred;
        self.log.debug('>> handleSignup');

        var username = req.body.username;
        var password1 = req.body.password;
        var password2 = req.body.password2;
        var email = req.body.username;

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


        userManager.createAccountAndUser(username, password1, email, accountToken, null, function (err, value) {
            if (!err) {

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
                    email: user.attributes.email,
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