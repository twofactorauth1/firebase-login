var crypto = require('../utils/security/crypto');
var AccountDao = require('./account.dao');
var UserDao = require('./user.dao');
var cookies = require('../utils/cookieutil');

var dao = {

    options: {
        name:"authentication.dao",
        defaultModel: $$.m.User
    },

    //region PASSWORD RECOVERY
    sendForgotPasswordEmail: function(email, fn) {
        var self = this;
        this.log.info("Sending password recovery email to: " + email);

        //ensure user exists
        UserDao.getUserByEmail(email, function(err, value) {
            if (!err) {
                var forgotPassword = {
                    _id: $$.u.idutils.generateUniqueAlphaNumeric(),
                    _type: "forgotpassword",
                    Email: email
                };

                self.saveOrUpdate(forgotPassword, $$.u.dateutils.DAY_IN_SEC, function(err, result) {
                    if (!err) {
                        emailTemplateUtil.resetPassword(forgotPassword._id, email, function(err, value) {
                            if (!err) {
                                self.log.info("Sending password recovery email to: " + email + " succeeded");
                                fn(null, "ok");
                            } else {
                                self.log.error("Sending password recovery email failed: " + err);
                                fn(err, value);
                            }
                        });
                    } else {
                        fn(err, result);
                    }
                });
            } else {
                self.log.error("Sending password recovery email failed: " + err);
                fn(err, value);
            }
        });
    },


    verifyPasswordResetId: function(passwordResetId, remove, fn) {
        var self = this;
        this.getById(passwordResetId, function(err, result) {
            if (!err) {
                if (result && result.value != null) {
                    var value = result.value;
                    if (remove == true) {
                        self.remove(passwordResetId, function(err, result) {
                            if (err) {
                                self.log.error("An error occurred removing password reset value with id: " + passwordResetId + ". [" + err + "]");
                            }
                        });
                    }
                    fn(null, value.Email);
                } else {
                    fn("No Password Reset Value found with ID: " + passwordResetId);
                }
            } else {
                fn(err, result);
            }
        });
    },


    deletePasswordResetId: function(passwordResetId, fn) {
        this.remove(passwordResetId, function(err, result){
            if (err) {
                self.log.error("An error occurred removing password reset value with id: " + passwordResetId + ". [" + err + "]");
            }
            fn(err, result);
        });
    }
    //endregion
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.AuthenticationDao = dao;

module.exports = dao;

