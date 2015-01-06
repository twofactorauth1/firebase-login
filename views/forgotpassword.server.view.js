/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var BaseView = require('./base.server.view');
var userDao = require('../dao/user.dao');
var authenticationDao = require('../dao/authentication.dao');
var UAParser = require('ua-parser-js');
var parser = new UAParser();


var view = function(req,resp,options) {
    this.init.apply(this, arguments);
};

_.extend(view.prototype, BaseView.prototype, {

    show: function() {
        var data = this.baseData({
            includeJs:true,
            includeHeader:false,
            includeFooter:false
        });
        var ua = this.req.headers['user-agent'];
        var result = parser.setUA(ua).getResult();
        console.dir(result);
        this.resp.render('forgotpassword', data);

        this.cleanUp();
        data = null;
    },


    handleForgotPassword: function(username) {
        var self = this;
        var ua = self.req.headers['user-agent'];
        var result = parser.setUA(ua).getResult();
        console.dir(result);
        /*
         * Need to pull in the following data:
         * Date: December 12, 2014 10:28 AM
         * Browser: Safari
         * Operating System: OS X
         * IP Address: 00.00.00.00
         * Approximate Location: La Jolla, California, United States
         */
        var ip = self.ip(self.req);
        var date = new Date();
        var browser = result.browser.name;
        var os = result.os.name;

        var requestorProps = {
            ip: ip,
            date: date,
            browser: browser,
            os: os
        };


        authenticationDao.sendForgotPasswordEmailByUsernameOrEmail(this.accountId(), username, requestorProps, function(err, value) {
            if (!err) {
                var data = self.baseData({
                    infoMsg: "An email has been sent to the account associated with " + username + ".  Please check your email and follow " +
                        "the instructions to reset your password"
                });

                self.resp.render('forgotpassword', data);

                self.cleanUp();
                data = self = null;
            } else {
                var data = self.baseData({
                    errorMsg: "Recover password failed: " + err
                });

                self.resp.render('forgotpassword', data);

                self.cleanUp();
                data = self = null;
            }
        });
    },


    resetByToken: function(token) {
        var self = this;

        authenticationDao.verifyPasswordResetToken(this.accountId(), token, function(err, value) {
            if (!err) {
                //we have the user value, now lets load the
                var data = self.baseData({
                    reset:true,
                    token:token,
                    infoMsg:"Password recovery found."
                });

                self.resp.render('forgotpassword', data);
                self.cleanUp();
                data = self = null;
            } else {
                var data = self.baseData({
                    errorMsg: err
                });

                self.resp.render('forgotpassword', data);
                self.cleanUp();
                data = self = null;
            }
        });
    },


    handleResetByToken: function(token, password, email) {
        var self = this;

        authenticationDao.updatePasswordByToken(this.accountId(), token, password, email, function(err, value) {
            if (!err) {
                self.req.flash("info", "Password changed successfully");
                self.resp.redirect("/login");
                self.cleanUp();
                data = self = null;

                /*
                self.req.login(value, function(err) {
                    if (err) {
                        var data = self.baseData({
                            reset:true,
                            token:true,
                            errorMsg: "An error occurred changing your password"
                        });
                        self.resp.redirect("forgotpassword", data);
                        self.cleanUp();
                        data = self = null;
                    } else {
                        self.req.flash("info", "Password changed successfully");
                        self.resp.redirect("/login");
                        self.cleanUp();
                        data = self = null;
                    }
                });
                */
            } else {
                var data = self.baseData({
                    reset:true,
                    token:true,
                    errorMsg: err
                });

                self.resp.render('forgotpassword', data);
                self.cleanUp();
                data = self = null;
            }
        });
    }
});

$$.v.ForgotPasswordView = view;

module.exports = view;
