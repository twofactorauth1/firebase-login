var BaseView = require('./base.view');
var UserDao = require('../dao/user.dao');
var AuthenticationDao = require('../dao/authentication.dao');

var view = function(req,resp,options) {
    this.init.apply(this, arguments);
};

_.extend(view.prototype, BaseView.prototype, {

    show: function() {
        var data = this.baseData({
            includeJs:true
        });

        this.resp.render('forgotpassword', data);
    },


    handleForgotPassword: function(username) {
        var self = this;

        AuthenticationDao.sendForgotPasswordEmailByUsernameOrEmail(username, function(err, value) {
            if (!err) {
                var data = self.baseData({
                    infoMsg: "An email has been sent to the account associated with " + username + ".  Please check your email and follow " +
                        "the instructions to reset your password"
                });

                self.resp.render('forgotpassword', data);
            } else {
                var data = self.baseData({
                    errorMsg: "Recover password failed: " + err
                });

                self.resp.render('forgotpassword', data);
            }
        });
    },


    resetByToken: function(token) {
        var self = this;

        AuthenticationDao.verifyPasswordResetToken(token, function(err, value) {
            if (!err) {
                //we have the user value, now lets load the
                var data = self.baseData({
                    reset:true,
                    token:token,
                    infoMsg:"Password recovery found."
                });

                self.resp.render('forgotpassword', data);

            } else {
                var data = self.baseData({
                    errorMsg: err
                });

                self.resp.render('forgotpassword', data);
            }
        });
    },


    handleResetByToken: function(token, password) {
        var self = this;

        AuthenticationDao.updatePasswordByToken(token, password, function(err, value) {
            if (!err) {
                self.req.login(value, function(err) {
                    if (err) {
                        var data = self.baseData({
                            reset:true,
                            token:true,
                            errorMsg: "An error occurred changing your password"
                        });
                        return self.resp.redirect("forgotpassword", data);

                    } else {
                        self.req.flash("info", "Password changed successfully");
                        return self.resp.redirect("/home");
                    }
                });
            } else {
                var data = self.baseData({
                    reset:true,
                    token:true,
                    errorMsg: err
                });

                self.resp.render('forgotpassword', data);
            }
        });
    }
});

$$.v.ForgotPasswordView = view;

module.exports = view;
