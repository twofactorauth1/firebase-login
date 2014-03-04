var BaseRouter = require('./base.server.router.js');
var passport = require('passport');
var cookies = require("../utils/cookieutil");
var SignupView = require('../views/signup.server.view');
var urlUtils = require('../utils/urlutils');

var FacebookConfig = require('../configs/facebook.config');
var TwitterConfig = require('../configs/twitter.config');
var GoogleConfig = require('../configs/google.config');


var router = function() {
    this.init.apply(this, arguments);
};

_.extend(router.prototype, BaseRouter.prototype, {

    base: "login",

    initialize: function() {

        //-------------------------------------------------
        //  LOGIN
        //-------------------------------------------------
        app.get("/login/:socialtype", this.socialLogin.bind(this));
        app.get("/signup/:socialtype", this.socialSignup.bind(this));
        app.get("/login/:socialtype/callback", this.socialLoginCallback.bind(this));

//
//        app.get("/login/facebook", this.facebookLogin.bind(this));
//        app.get("/login/facebook/callback", this.facebookLoginCallback.bind(this));
//
//        app.get("/login/twitter", this.twitterLogin.bind(this));
//        app.get("/login/twitter/callback", this.twitterLoginCallback.bind(this));


        //-------------------------------------------------
        // SIGNUP
        //-------------------------------------------------
        //app.get("/signup/:socialtype/callback", this.socialSignupCallback.bind(this));

//        app.get("/signup/facebook", this.facebookSignup.bind(this));
//        app.get("/signup/facebook/callback", this.facebookSignupCallback.bind(this));
//
//        app.get("/signup/twitter", this.twitterSignup.bind(this));
//        app.get("/signup/twitter/callback", this.twitterSignupCallback.bind(this));

        return this;
    },


    socialLogin: function(req, resp, next) {
        req.session.authMode = "login";
        this._socialLogin(req, resp, next);
    },


    socialSignup: function(req, resp, next) {
        req.session.authMode = "create";
        this._socialLogin(req, resp, next);
    },


    _socialLogin: function(req, resp, next) {
        var type = req.params.socialtype;

        var config = this._getSocialConfigFromType(type);

        var subdomain = urlUtils.getSubdomainFromRequest(req);
        var callbackUrl;

        if (subdomain.isMainApp == true) {
            callbackUrl = config.CALLBACK_URL_LOGIN;
        } else if (subdomain.subdomain != null) {
            callbackUrl = config.getDynamicCallbackUrlLogin(subdomain.subdomain);
        } else if (subdomain.domain != null) {
            //TODO - we need to handle fully custom domains
        }

        var options = {
            callbackURL: callbackUrl,
            successRedirect: "/",
            failureRedirect: "/login", failureFlash:true
        };

        var scope = this._getScopeFromType(type);
        if (scope != null) {
            options.scope = scope;
        }

        passport.authenticate(type, options)(req,resp,next);
    },


    socialLoginCallback: function (req, resp, next) {
        var type = req.params.socialtype;

        var authMode = req.session.authMode;
        var failureCallback = "";
        if (authMode = "login") {
            failureCallback = "/login";
        } else if (authMode == "create") {
            failureCallback = "/signup/create";
        }

        passport.authenticate(type, {
            successRedirect: '/',
            failureRedirect: failureCallback, failureFlash:true
        })(req, resp, next);
    },


    _getSocialConfigFromType: function(type) {
        switch(type) {
            case "facebook":
                return FacebookConfig;
            case "twitter":
                return TwitterConfig;
            case "google":
                return GoogleConfig;
        }
    },


    _getScopeFromType: function(type) {
        switch(type) {
            case "facebook":
                return ["basic_info", "email"];
        }
        return null;
    },


    //region FACEBOOK
    facebookLogin: function(req, resp, next) {
        req.session.authMode = "login";

        var subdomain = urlUtils.getSubdomainFromRequest(req);
        var callbackUrl;

        if (subdomain.isMainApp == true) {
            callbackUrl = FacebookConfig.CALLBACK_URL_LOGIN;
        } else if (subdomain.subdomain != null) {
            callbackUrl = FacebookConfig.getDynamicCallbackUrlLogin(subdomain.subdomain);
        } else if (subdomain.domain != null) {
            //TODO - we need to handle fully custom domains
        }

        passport.authenticate('facebook', {
            scope: ["basic_info", "email"],
            callbackURL: callbackUrl,
            successRedirect: '/',
            failureRedirect: "/login", failureFlash:true
        })(req,resp,next);
    },


    facebookLoginCallback: function (req, resp, next) {
        passport.authenticate('facebook', {
            successRedirect: '/',
            failureRedirect: '/login', failureFlash:true
        })(req, resp, next);
    },


    facebookSignup: function(req, resp, next) {
        req.session.authMode = "create";
        var subdomain = urlUtils.getSubdomainFromRequest(req);
        var callbackUrl;

        if (subdomain.isMainApp == true) {
            callbackUrl = FacebookConfig.CALLBACK_URL_SIGNUP;
        } else if (subdomain.subdomain != null) {
            callbackUrl = FacebookConfig.getDynamicCallbackUrlSignup(subdomain.subdomain);
        } else if (subdomain.domain != null) {
            //TODO - we need to handle fully custom domains
        }

        passport.authenticate('facebook', {
            scope: ["basic_info", "email"],
            callbackURL: callbackUrl,
            successRedirect: '/',
            failureRedirect: "/signup/create", failureFlash:true
        })(req,resp,next);
    },


    facebookSignupCallback: function (req, resp, next) {
        passport.authenticate('facebook', {
            successRedirect: '/',
            failureRedirect: '/signup/create', failureFlash:true
        })(req, resp, next);
    },
    //endregion


    //region TWITTER
    twitterLogin: function(req, resp, next) {
        req.session.authMode = "login";

        var subdomain = urlUtils.getSubdomainFromRequest(req);
        var callbackUrl;

        if (subdomain.isMainApp == true) {
            callbackUrl = TwitterConfig.CALLBACK_URL_LOGIN;
        } else if (subdomain.subdomain != null) {
            callbackUrl = TwitterConfig.getDynamicCallbackUrlLogin(subdomain.subdomain);
        } else if (subdomain.domain != null) {
            //TODO - we need to handle fully custom domains
        }

        passport.authenticate('twitter', {
            callbackURL: callbackUrl,
            successRedirect: '/',
            failureRedirect: "/login", failureFlash:true
        })(req,resp,next);
    },


    twitterLoginCallback: function (req, resp, next) {
        passport.authenticate('twitter', {
            successRedirect: '/',
            failureRedirect: '/login', failureFlash:true
        })(req, resp, next);
    },


    twitterSignup: function(req, resp, next) {
        req.session.authMode = "create";
        var subdomain = urlUtils.getSubdomainFromRequest(req);
        var callbackUrl;

        if (subdomain.isMainApp == true) {
            callbackUrl = TwitterConfig.CALLBACK_URL_SIGNUP;
        } else if (subdomain.subdomain != null) {
            callbackUrl = TwitterConfig.getDynamicCallbackUrlSignup(subdomain.subdomain);
        } else if (subdomain.domain != null) {
            //TODO - we need to handle fully custom domains
        }

        passport.authenticate('twitter', {
            callbackURL: callbackUrl,
            successRedirect: '/',
            failureRedirect: "/signup/create", failureFlash:true
        })(req,resp,next);
    },


    twitterSignupCallback: function (req, resp, next) {
        passport.authenticate('twitter', {
            successRedirect: '/',
            failureRedirect: '/signup/create', failureFlash:true
        })(req, resp, next);
    }
});

module.exports = new router();

