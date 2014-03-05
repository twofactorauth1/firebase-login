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


    socialLoginCallback: function (req, resp, next) {
        this._socialLogin(req,resp,next);
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
    }
});

module.exports = new router();

