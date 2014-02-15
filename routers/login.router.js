var BaseRouter = require('./base.router');
var passport = require('passport');
var UserDao = require('../dao/user.dao');
var AccountDao = require('../dao/account.dao');
var cookies = require("../utils/cookieutil");

var LoginView = require('../views/login.view');
var SignupView = require('../views/signup.view');

var router = function() {
    this.init.apply(this, arguments);
};

_.extend(router.prototype, BaseRouter.prototype, {

    base: "login",

    initialize: function() {
        app.get("/login", this.showLogin.bind(this));
        app.post("/login", passport.authenticate('local', { failureRedirect: "/login", failureFlash:true } ), this.onLogin.bind(this));

        app.get("/logout", this.handleLogout.bind(this));

        app.get("/signup", this.showSignup.bind(this));
        app.post("/signup", this.handleSignup.bind(this));

        return this;
    },


    showLogin: function(req,resp) {
        if (req.isAuthenticated()) {
            return resp.redirect("/");
        }

        new LoginView(req,resp).show();
    },


    onLogin: function(req,resp) {
        if (req.body.remembermepresent != null && req.body.rememberme == null) {
            req.session.cookie.expires = false;
        }
        resp.redirect("/");
    },


    handleLogout: function(req,resp) {
        req.logout();
        return resp.redirect("/");
    },


    showSignup: function(req,resp) {
        if (req.isAuthenticated()) {
            return resp.redirect("/");
        }

        new SignupView(req,resp).show();
    },


    handleSignup: function(req,resp) {
        var self = this, user, accountToken, deferred;

        var username = req.body.username;
        var password1 = req.body.password;
        var password2 = req.body.password2;

        if (password1 !== password2) {
            req.flash("error", "Passwords do not match");
            return resp.redirect("/signup");
        }

        //ensure we don't have another user with this username;
        var accountToken = cookies.getAccountToken(req);

        UserDao.createUserFromUsernamePassword(username, password1, accountToken, function(err, value) {
            if (!err) {
                req.login(value, function(err) {
                    if (err) {
                        return resp.redirect("/");
                    } else {
                        req.flash("info", "Account created successfully");
                        return resp.redirect("/");
                    }
                });
            } else {
                req.flash("error", value.toString());
                return resp.redirect("/signup");
            }
        });
    }
});

module.exports = new router();

