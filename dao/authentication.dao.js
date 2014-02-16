var User = require('../models/user');
var UserDao = require('./user.dao');
var cookies = require('../utils/cookieutil');
var EmailTemplateUtil = require('../utils/emailtemplateutil');

var dao = {

    options: {
        name:"authentication.dao",
        defaultModel: $$.m.User
    },

    sendForgotPasswordEmailByUsernameOrEmail: function(email, fn) {
        var _email = email;
        UserDao.getUserByUsernameOrEmail(email)
            .done(function(value) {
                if (value == null) {
                    fn("No user found with username or email: " + _email);
                } else {
                    var user = value;


                    var isEmail = $$.u.validate(user.get("email"), {
                        required:true,
                        email:true
                    }).success;

                    if (isEmail === false) {
                        //lets at least try to see if the username is an email
                        if ($$.u.validate(user.get("username"), {required:true, email:true}).success === false) {
                            return fn("No email has been registered with the user: " + email);
                        } else {
                            email = user.get("username");
                        }
                    }

                    var token = user.setPasswordRecoverToken();

                    UserDao.saveOrUpdate(user, function(err, value) {
                        if (!err) {
                            //Send Email based on the current token
                            EmailTemplateUtil.resetPassword(token, value, email, fn);
                        } else {
                            return fn("An error occurred: " + err);
                        }
                    });
                }
            })
            .fail(function(err) {
                return fn(err);
            });
    },


    verifyPasswordResetToken: function(token, fn) {
        UserDao.findOne({passRecover:token}, function(err, value) {
            if (!err) {
                if (value == null) {
                    return fn("Invalid recovery token. Please ensure you have clicked the link directly from your email, or resubmit the form below.");
                }
                var passRecoverExp = value.get("passRecoverExp");
                if (new Date(passRecoverExp) < new Date()) {
                    return fn("Password recovery token is expired, please resubmit the form below.");
                }

                return fn(null, value);
            } else {
                return fn(err, value);
            }
        });
    },


    updatePasswordByToken: function(passwordResetToken, password, fn) {
        this.verifyPasswordResetToken(passwordResetToken, function(err, value) {
            if (!err) {
                var user = value;
                user.clearPasswordRecoverToken();

                UserDao.saveOrUpdate(user, function(err, value) {
                    if (!err) {
                        fn(null, value);
                    } else {
                        return fn("An error occurred: " + err);
                    }
                });
            } else {
                fn(err, value);
            }
        });
    }
    //endregion
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.AuthenticationDao = dao;

module.exports = dao;

