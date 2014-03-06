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
        //var state = req.query.state;
        //req.session.state = state;
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

        passport.authenticate(type, options)(req,resp,next);
    },


    redirectAfterOauth: function(req, resp, next) {
        var state = req.session.state;
        var user = req.user;

        authenticationDao.getAuthenticatedUrlForAccount(state.accountId, user.id(), "/", null, function(err, value) {
            if (err) {
                resp.redirect("/");
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

