/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
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
var gtmConfig = require('../configs/gtm.config');
var authenticationDao = require('../dao/authentication.dao');
var accountDao = require('../dao/account.dao');

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
        app.get("/auth/internal", this.setupForSocialAuth.bind(this), this.socialAuthInternal.bind(this));

        app.get("/login/:socialtype", this.setupForSocialAuth.bind(this), this.socialLogin.bind(this));
        app.get("/signup/:socialtype", this.setupForSocialAuth.bind(this), this.socialSignup.bind(this));

        app.get("/inapplogin/:socialtype", this.isAuth.bind(this), this.inAppSocialLogin.bind(this));
        app.get("/socialconfig/:socialtype", this.isAuth.bind(this), this.addSocialConfig.bind(this));

        app.get("/oauth2/callback", this.socialLoginCallback.bind(this));
        app.get("/oauth2/postlogin", this.redirectAfterOauth.bind(this));

        return this;
    },


    getState: function(accountId, authMode, authSocialType, redirect) {
        var state = {};
        state.accountId = accountId;
        state.authMode = authMode;
        state.socialType = authSocialType;
        state.redirectUrl = redirect;
        return state;
    },


    getInternalAuthRedirect: function(state) {
        var serverUrl = appConfig.server_url;
        serverUrl += "/auth/internal?state=" + JSON.stringify(state);
        return serverUrl;
    },


    socialLogin: function(req, resp, next) {
        var state = this.getState(this.accountId(req), "login", req.params.socialtype, req.params.redirect);
        resp.redirect(this.getInternalAuthRedirect(state));
    },


    inAppSocialLogin: function(req, resp) {
        var self = this;
        self.log.debug('>> inAppSocialLogin');
        var appState = req.query.state;
        var state = this.getState(this.accountId(req), "in_app", req.params.socialtype);
        state.userId = req.user.id();
        state.appState = req.query.state;
        state.appStateDetail = req.query.detail;
        if(req.query.forceApprovalPrompt) {
            self.log.debug('state.forceApprovalPrompt = true');
            state.forceApprovalPrompt = true;
        }else {
            self.log.debug('no forceApprovalPrompt');
            console.dir(req.query);
        }

        var referringUrl = req.query['redirectTo'] || '/admin/account';
        authenticationDao.getAuthenticatedUrlForAccount(this.accountId(req), state.userId, referringUrl, 90, function(err, value){
            if(err) {
                 self.log.error('Error getting referring url for: ' + referringUrl);
                 self.log.debug('<< inAppSocialLogin redirecting to /login');
                 resp.redirect('/login');
            } else {
                 state.redirectUrl = encodeURIComponent(value);
                 self.log.debug('<< inAppSocialLogin');
                 resp.redirect(self.getInternalAuthRedirect(state));
            }
        });

    },

    addSocialConfig: function(req, resp) {
        var self = this;
        self.log.debug('>> addSocialConfig');
        var appState = req.query.state;
        var state = self.getState(self.accountId(req), 'socialconfig', req.params.socialtype);

        state.userId = req.user.id();
        state.appState = req.query.state;
        state.appStateDetail = req.query.detail;
        state.forceApprovalPrompt = true;//this may not be needed

        var referringUrl = req.query['redirectTo'] || '/admin/account';
        authenticationDao.getAuthenticatedUrlForAccount(self.accountId(req), state.userId, referringUrl, 90, function(err, value){
            if(err) {
                self.log.error('Error getting referring url for: ' + referringUrl);
                self.log.debug('<< addSocialConfig redirecting to /login');
                resp.redirect('/login');
            } else {
                state.redirectUrl = encodeURIComponent(value);
                self.log.debug('<< addSocialConfig');
                resp.redirect(self.getInternalAuthRedirect(state));
            }
        });
    },


    socialSignup: function(req, resp, next) {
        var state = this.getState(this.accountId(req), "create_in_place", req.params.socialtype, req.query.redirectTo);
        console.dir(req.query);
        console.dir(state);
        //TODO: make sure we have a temp account.
        var accountToken = cookies.getAccountToken(req);
        if(accountToken === null) {
            var tmpAccount = new $$.m.Account({
                token: $$.u.idutils.generateUUID()
            });
            accountDao.saveOrUpdateTmpAccount(tmpAccount, function(err, val){
                cookies.setAccountToken(resp, val.get('token'));
                return resp.redirect(this.getInternalAuthRedirect(state));
            });
        } else {
            return resp.redirect(this.getInternalAuthRedirect(state));
        }

    },


    socialAuthInternal: function(req, resp, next) {
        var self = this;
        self.log.debug('>> socialAuthInternal');
        var state = req.query.state;
        state = JSON.parse(state);
        self.log.debug('state:');
        console.dir(state);
        req.session.authMode = state.authMode;
        req.session.state = state;
        self.log.debug('<< socialAuthInternal');
        this._socialLogin(req, resp, state, next);
    },


    socialLoginCallback: function (req, resp, next) {
        this._socialLogin(req, resp, req.session.state, next);
    },


    _socialLogin: function(req, resp, state, next) {
        var self = this;
        self.log.debug('>> _socialLogin');
        var type
            , config
            , subdomain
            , callbackUrl;
            //, state;

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
        if(state.forceApprovalPrompt) {
            /*
             * This causes you to have to reauthorize every time, instead of just logging in.
             * It also ensures you get a refresh token.
             */
            options.approvalPrompt = "force";
            self.log.debug('approvalPrompt set to force');
        }

        self.log.debug('<< _socialLogin');
        passport.authenticate(type, options)(req,resp,next);
    },


    redirectAfterOauth: function(req, resp, next) {
        var self = this;
        self.log.debug('>> redirectAfterOauth');
        var state = req.session.state;
        var user = req.user;

        var authMode = state.authMode;

        if (state.redirectUrl != null) {
            var redirectUrl = state.redirectUrl;
            redirectUrl = decodeURIComponent(redirectUrl);
            self.log.debug('decoded redirect: ' + redirectUrl);
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
            self.log.debug('redirecting to: ' + redirectUrl);
            return resp.redirect(redirectUrl);
        }

        var redirectUrl = cookies.getRedirectUrl(req, resp, null, true);
        if (redirectUrl != null) {
            self.log.debug('redirectUrl from cookies: ' + redirectUrl);
            authenticationDao.getAuthenticatedUrl(req.user.id(), redirectUrl, null, function(err, value) {
                self.log.debug('redirecting to authenticated url: ' + redirectUrl);
                return resp.redirect(redirectUrl);
            });
            return;
        }
        self.log.debug('redirecting to default of admin');
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
        //console.log(state);
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
            case "gtm":
                return gtmConfig;
        }
    }
});

module.exports = new router();

