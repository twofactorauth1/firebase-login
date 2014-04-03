/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

var baseRouter = require('./base.server.router.js');
var passport = require('passport');
var cookies = require("../utils/cookieutil");
var urlUtils = require('../utils/urlutils');
var appConfig = require('../configs/app.config');
var facebookConfig = require('../configs/facebook.config');
var twitterConfig = require('../configs/twitter.config');
var googleConfig = require('../configs/google.config');
var linkedInConfig = require('../configs/linkedin.config');
var authenticationDao = require('../dao/authentication.dao');

var SignupView = require('../views/signup.server.view');


var router = function() {
    this.init.apply(this, arguments);
};

_.extend(router.prototype, baseRouter.prototype, {

    base: "login",

    initialize: function() {

        //-------------------------------------------------
        //  LOGIN
        //-------------------------------------------------
        app.get("/auth/internal", this.setup, this.socialAuthInternal.bind(this));

        app.get("/login/:socialtype", this.setup, this.socialLogin.bind(this));
        app.get("/signup/:socialtype", this.setup, this.socialSignup.bind(this));

        app.get("/inapplogin/:socialtype", this.isAuth, this.inAppSocialLogin.bind(this));

        app.get("/oauth2/callback", this.socialLoginCallback.bind(this));
        app.get("/oauth2/postlogin", this.redirectAfterOauth.bind(this));

        return this;
    },


    getState: function(accountId, authMode, authSocialType) {
        var state = {};
        state.accountId = accountId;
        state.authMode = authMode;
        state.socialType = authSocialType;
        return state;
    },


    getInternalAuthRedirect: function(state) {
        var serverUrl = appConfig.server_url;
        serverUrl += "/auth/internal?state=" + JSON.stringify(state);
        return serverUrl;
    },


    socialLogin: function(req, resp, next) {
        var state = this.getState(this.accountId(req), "login", req.params.socialtype);
        resp.redirect(this.getInternalAuthRedirect(state));
    },


    inAppSocialLogin: function(req, resp) {
        var appState = req.query.state;
        var state = this.getState(this.accountId(req), "in_app", req.params.socialtype);
        state.userId = req.user.id();
        state.appState = req.query.state;
        state.appStateDetail = req.query.detail;
        var referringUrl = req.headers['referer'];
        state.redirectUrl = encodeURIComponent(referringUrl);
        resp.redirect(this.getInternalAuthRedirect(state));
    },


    socialSignup: function(req, resp, next) {
        var state = this.getState(this.accountId(req), "create", req.params.socialtype);
        resp.redirect(this.getInternalAuthRedirect(state));
    },


    socialAuthInternal: function(req, resp, next) {
        var state = req.query.state;
        state = JSON.parse(state);

        req.session.authMode = state.authMode;
        req.session.state = state;
        this._socialLogin(req, resp, state, next);
    },


    socialLoginCallback: function (req, resp, next) {
        this._socialLogin(req, resp, req.session.state, next);
    },


    _socialLogin: function(req, resp, state, next) {
        var type
            , config
            , subdomain
            , callbackUrl
            , state;

        if (state != null) {
            type = state.socialType;
            config = this._getSocialConfigFromType(type);
        }

        callbackUrl = config.CALLBACK_URL_LOGIN;

        var accountId = state.accountId;

        var options = {
            callbackURL: callbackUrl,
            returnURL: callbackUrl,
            successRedirect: "/oauth2/postlogin",
            failureRedirect: "/login", failureFlash:true
        };

        var scope = config.getScope();
        if (scope != null) {
            options.scope = scope;
        }

        if (state != null) {
            options.state = JSON.stringify(state);
        }

        options.accessType = "offline";
        //options.approvalPrompt = "force"; //-- this causes you to have to reauthorize every time, instead of just logging in

        passport.authenticate(type, options)(req,resp,next);
    },


    redirectAfterOauth: function(req, resp, next) {
        var state = req.session.state;
        var user = req.user;

        var authMode = state.authMode;

        if (state.redirectUrl != null) {
            var redirectUrl = state.redirectUrl;
            redirectUrl = decodeURIComponent(redirectUrl);

            if (authMode == "in_app") {
                if (redirectUrl.indexOf("?") == -1) {
                    redirectUrl += "?";
                }

                if (state.appState != null) {
                    redirectUrl += "&state=" + state.appState;
                }
                if (state.appStateDetail != null) {
                    redirectUrl += "&detail=" + state.appStateDetail;
                }
            }

            return resp.redirect(redirectUrl);
        }

        var redirectUrl = cookies.getRedirectUrl(req, resp, null, true);
        if (redirectUrl != null) {
            authenticationDao.getAuthenticatedUrl(req.user.id(), redirectUrl, null, function(err, value) {
                return resp.redirect(redirectUrl);
            });
            return;
        }

        var accountId = null;
        var path = "admin";
        if (state.accountId > 0) {
            accountId = state.accountId;
        } else {
            var accountIds = user.getAllAccountIds();
            if (accountIds.length == 1) {
                accountId = accountIds[0];
            } else {
                path = "/home";
            }
        }
        authenticationDao.getAuthenticatedUrlForAccount(accountId, user.id(), path, null, function(err, value) {
            if (err) {
                resp.redirect("/home");
            } else {
                resp.redirect(value);
            }
        });
        console.log(state);
    },


    _getSocialConfigFromType: function(type) {
        switch(type) {
            case "facebook":
                return facebookConfig;
            case "twitter":
                return twitterConfig;
            case "google":
                return googleConfig;
            case "linkedin":
                return linkedInConfig;
        }
    }
});

module.exports = new router();

