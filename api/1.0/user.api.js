/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var userDao = require('../../dao/user.dao');
var accountDao = require('../../dao/account.dao');
var passport = require('passport');
var cookies = require('../../utils/cookieutil');

var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "user",

    dao: userDao,

    initialize: function() {
        app.get(this.url(''), this.isAuthApi, this.getLoggedInUser.bind(this));
        app.get(this.url('preferences'), this.isAuthApi, this.getUserPreferences.bind(this));
        app.post(this.url('preferences'), this.isAuthApi, this.updateUserPreferences.bind(this));
        app.get(this.url(':id'), this.isAuthApi, this.getUserById.bind(this));
        app.post(this.url(''), this.createUser.bind(this));

        app.put(this.url(':id'), this.isAuthApi, this.updateUser.bind(this));
        app.delete(this.url(':id'), this.isAuthApi, this.deleteUser.bind(this));

        app.get(this.url('exists/:username'), this.setup, this.userExists.bind(this));
        app.get(this.url(':accountId/user/exists/:username', "account"), this.setup, this.userExistsForAccount.bind(this));
    },


    getLoggedInUser: function(req,resp) {
        var self = this;

        var user = req.user;

        userDao.getById(user.id(), function(err, value) {
           if (!err) {
               return resp.send(value.toJSON("public"));
           } else {
               return self.wrapError(resp, 500, null, err, value);
           }
        });
    },


    getUserById: function(req,resp) {
        //TODO - add granular security;

        var self = this;
        var userId = req.params.id;

        if (!userId) {
            return this.wrapError(resp, 400, null, "Invalid parameter for ID");
        }

        userId = parseInt(userId);

        userDao.getById(userId, function(err, value) {
            if (!err) {
                if (value == null) {
                    return self.wrapError(resp, 404, null, "No User found with ID: [" + userId + "]");
                }
                return resp.send(value.toJSON("public", {accountId:self.accountId(req)}));
            } else {
                return self.wrapError(resp, 401, null, err, value);
            }
        });
    },


    userExists: function(req,resp) {
        var self = this;

        var username = req.params.username;

        var accountId = this.accountId(req);
        if (accountId > 0) {
            req.params.accountId = accountId;
            return this.userExistsForAccount(req, resp);
        }
        userDao.usernameExists(username, function(err, value) {
            if (err) {
                return self.wrapError(resp, 500, "An error occurred checking username", err, value);
            }
            return resp.send(value);
        });
    },


    userExistsForAccount: function(req,resp) {
        var self = this;
        var username = req.params.username;
        var accountId = req.params.accountId;

        accountId = parseInt(accountId);

        userDao.usernameExistsForAccount(accountId, username, function(err, value) {
            if (err) {
                return self.wrapError(resp, 500, "An error occurred checking username for account", err, value);
            }
            return resp.send(value);
        });
    },


    createUser: function(req,resp) {

    },


    updateUser: function(req,resp) {
        //TODO - ensure user accounts are not tampered with
        var self = this;
        var user = new $$.m.User(req.body);
        var userId=req.body._id;

  /*      userDao.saveOrUpdate(user, function(err, value) {
            if (!err) {
                self.sendResult(resp, value);
            } else {
                self.wrapError(resp, 500, "There was an error updating contact", err, value);
            }
        });*/

        userDao.getById(userId, function(err, value) {
            if (!err && value != null) {
                value.set("welcome_alert",req.body.welcome_alert);
                console.log(value);
                user.set("credentials",value.get("credentials"));

                userDao.saveOrUpdate(user, function(err, value) {
                    if (!err && value != null) {
                        resp.send(value.toJSON("public"));
                    } else {
                        self.wrapError(resp, 500, null, err, value);
                    }
                });

            } else {
                return self.wrapError(resp, 401, null, err, value);
            }
        });


    },

    getUserPreferences: function(req, res) {
        var self = this;
        self.log.debug('>> getUserPreferences');

        var user = req.user;

        userDao.getById(user.id(), function(err, value) {
            if (!err) {
                self.log.debug('<< getUserPreferences');
                return res.send(value.get('user_preferences'));
            } else {
                self.log.error('Error getting user: ' + err);
                return self.wrapError(res, 500, null, err, value);
            }
        });
    },

    updateUserPreferences: function(req, res) {
        var self = this;
        self.log.debug('>> updateUserPreferences');

        var user = req.user;
        var preferences = req.body;
        userDao.getById(user.id(), function(err, savedUser) {
            if(err) {
                self.log.error('Error getting user: ' + err);
                return self.wrapError(res, 500, null, err, value);
            } else {
                savedUser.set('user_preferences', preferences);
                userDao.saveOrUpdate(savedUser, function(err, updatedUser){
                    if(err) {
                        self.log.error('Error updating user preferences: ' + err);
                        return self.wrapError(res, 500, null, err, value);
                    } else {
                        self.log.debug('<< updateUserPreferences');
                        return res.send(updatedUser.get('user_preferences'));
                    }
                });
            }
        });
    },


    deleteUser: function(req,resp) {

    }
});

module.exports = new api();

