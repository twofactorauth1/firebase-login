var BaseRouter = require('./base.server.router.js');
var passport = require('passport');
var cookies = require("../utils/cookieutil");
var FacebookConfig = require('../configs/facebook.config');
var TwitterConfig = require('../configs/twitter.config');
var SignupView = require('../views/signup.server.view');
var urlUtils = require('../utils/urlutils');

var router = function() {
    this.init.apply(this, arguments);
};

_.extend(router.prototype, BaseRouter.prototype, {

    base: "login",

    initialize: function() {

        //-------------------------------------------------
        //  LOGIN
        //-------------------------------------------------
        app.get("/login/facebook", this.facebookLogin.bind(this));
        app.get("/login/facebook/callback", this.facebookLoginCallback.bind(this));

        app.get("/login/twitter", this.twitterLogin.bind(this));
        app.get("/login/twitter/callback", this.twitterLoginCallback.bind(this));


        //-------------------------------------------------
        // SIGNUP
        //-------------------------------------------------
        app.get("/signup/facebook", this.facebookSignup.bind(this));
        app.get("/signup/facebook/callback", this.facebookSignupCallback.bind(this));

        app.get("/signup/twitter", this.twitterSignup.bind(this));
        app.get("/signup/twitter/callback", this.twitterSignupCallback.bind(this));

        return this;
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
            //callbackURL: callbackUrl,
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

