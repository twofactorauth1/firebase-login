/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../../base.api');
var userManager = require('../../../dao/user.manager');
var userDao = require('../../../dao/user.dao');

var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "admin/user",

    dao: userDao,

    initialize: function() {

        app.post(this.url(':id/password'), this.isAuthApi.bind(this), this.setUserPassword.bind(this));
        app.get(this.url(':id'), this.isAuthApi.bind(this), this.getUser.bind(this));
        app.post(this.url('account/:id'), this.isAuthApi.bind(this), this.createUserForAccount.bind(this));
        app.get(this.url('account/:id/users'), this.isAuthApi.bind(this), this.listUsersForAccount.bind(this));

        app.post(this.url('account/:id/user/:userId'), this.isAuthApi.bind(this), this.addUserToAccount.bind(this));
        app.delete(this.url('account/:id/user/:userId'), this.isAuthApi.bind(this), this.removeUserFromAccount.bind(this));
    },

    getUser: function(req, resp) {
        var self = this;
        self.log.debug('>> getUser');
        var userId = parseInt(req.params.id);
        self._isAdmin(req, function(err, value) {
            if (value !== true) {
                return self.send403(resp);
            } else {
                userDao.getById(userId, $$.m.User, function(err, user){
                    return self.sendResultOrError(resp, err, user, 'Error getting user');
                });
            }
        });
    },

    setUserPassword: function(req, resp) {
        var self = this;
        self.log.debug('>> setUserPassword');

        self._isAdmin(req, function(err, value){
            if(value !== true) {
                return self.send403(resp);
            } else {
                var newPassword = req.body.password;
                var userId = parseInt(req.params.id);
                userManager.setUserPassword(userId, newPassword, self.userId(req), function(err, user){
                    if(err) {
                        self.log.error('Error setting password:', err);
                        self.wrapError(resp, 500, 'Error modifying password', err, null);
                    } else {
                        self.log.debug('<< setUserPassword');
                        self.sendResult(resp, user);
                    }
                });
            }
        });


    },

    createUserForAccount: function(req, resp) {
        var self = this;
        self.log.debug('>> createUserForAccount');

        var accountId = parseInt(req.params.id);
        var username = req.body.username;
        var password = req.body.password;
        var email = req.body.username;
        var roleAry = ['super','admin','member'];
        if(req.body.roleAry) {
            roleAry = req.body.roleAry.split(',');
        }
        var callingUser = parseInt(self.userId(req));
        self._isAdmin(req, function(err, value) {
            if (value !== true) {
                return self.send403(resp);
            } else {
                userManager.createUser(accountId, username, password, email, roleAry, callingUser, function(err, user){
                    self.log.debug('<< createUserForAccount');
                    return self.sendResultOrError(resp, err, user, 'Error creating user', null);
                });
            }
        });

    },

    listUsersForAccount: function(req, resp) {
        var self = this;
        self.log.debug('>> listUsersForAccount');

        var accountId = parseInt(req.params.id);

        self._isAdmin(req, function(err, value) {
            if (value !== true) {
                return self.send403(resp);
            } else {
                userManager.getUserAccounts(accountId, function(err, users){
                    self.log.debug('<< listUsersForAccount');
                    return self.sendResultOrError(resp, err, users, 'Error listing users', null);
                });
            }
        });
    },

    addUserToAccount: function(req, resp) {
        var self = this;
        self.log.debug('>> addUserToAccount');

        var accountId = parseInt(req.params.id);
        var userId = parseInt(req.params.userId);
        var roleAry = ['super','admin','member'];
        if(req.body.roleAry) {
            roleAry = req.body.roleAry.split(',');
        }
        var callingUser = parseInt(self.userId(req));

        self._isAdmin(req, function(err, value) {
            if (value !== true) {
                return self.send403(resp);
            } else {
                userManager.addUserToAccount(accountId, userId, roleAry, callingUser, function(err, user){
                    self.log.debug('<< addUserToAccount');
                    return self.sendResultOrError(resp, err, user, 'Error adding user to account', null);
                });
            }
        });

    },

    removeUserFromAccount: function(req, resp) {
        var self = this;
        self.log.debug('>> removeUserFromAccount');

        var accountId = parseInt(req.params.id);
        var userId = parseInt(req.params.userId);

        self._isAdmin(req, function(err, value) {
            if (value !== true) {
                return self.send403(resp);
            } else {
                userManager.deleteOrRemoveUserForAccount(accountId, userId, function(err, value){
                    self.log.debug('<< removeUserFromAccount');
                    return self.sendResultOrError(resp, err, value, 'Error removing user from account', null);
                });
            }
        });
    },

    /**
     *
     * @param req
     * @param fn
     * @private
     */
    _isAdmin: function(req, fn) {
        var self = this;
        if(self.userId(req) === 1) {
            fn(null, true);
        } else {
            fn(null, false);
        }
    }

});

module.exports = new api();