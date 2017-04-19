/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../../base.api');
var userManager = require('../../../dao/user.manager');
var userDao = require('../../../dao/user.dao');
var appConfig = require('../../../configs/app.config');

var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "admin/user",

    dao: userDao,

    initialize: function() {

        app.post(this.url(':id/password'), this.isAuthApi.bind(this), this.setUserPassword.bind(this));
        app.get(this.url('search'), this.isAuthApi.bind(this), this.searchForUser.bind(this));
        app.get(this.url(':id'), this.isAuthApi.bind(this), this.getUser.bind(this));

        app.post(this.url('account/:id'), this.isAuthApi.bind(this), this.createUserForAccount.bind(this));
        app.post(this.url('account/:id/evergreen'), this.isAuthApi.bind(this), this.convertAccountToInternal.bind(this));
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

    searchForUser: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = parseInt(self.accountId(req));
        self.log.debug(accountId, userId, '>> searchForUser');
        var term = req.query.term;
        self._isAdminOrOrgAdmin(req, function(err, value){
            if(value !== true) {
                return self.send403(resp);
            } else {
                self.getOrgAdminId(accountId, userId, req, function(err, orgId){
                    userManager.searchForUser(accountId, userId, orgId, term, function(err, users) {
                        self.log.debug(accountId, userId, '<< searchForUser');
                        return self.sendResultOrError(resp, err, users, 'Error searching for users', null);
                    });
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

    convertAccountToInternal: function(req, resp) {
        var self = this;
        self.log.debug('>> convertAccountToInternal');

        self._isAdmin(req, function(err, value) {
            if (value !== true) {
                return self.send403(resp);
            } else {
                var accountId = parseInt(req.params.id);
                var subscriptionId = appConfig.internalSubscription;
                var planId = appConfig.internalSubscription;
                var userId = self.userId(req);
                self.sm.setPlanAndSubOnAccount(accountId, subscriptionId, planId, userId, function(err, value){
                    self.log.debug('<< convertAccountToInternal');
                    return self.sendResultOrError(resp, err, value, 'Error converting account', null);
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
        if(req.body.roleAry){
            if(!_.isArray(req.body.roleAry)){
                roleAry = req.body.roleAry.split(',');
            } else {
                roleAry = req.body.roleAry;
            }
        }
        var params = _.omit(req.body, ['username', 'password', 'roleAry']);
        var callingUser = parseInt(self.userId(req));
        self._isAdminOrOrgAdmin(req, function(err, value) {
            if (value !== true) {
                return self.send403(resp);
            } else {
                userManager.createUser(accountId, username, password, email, roleAry, callingUser, params, function(err, user){
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

        self._isAdminOrOrgAdmin(req, function(err, value) {
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

        self._isAdminOrOrgAdmin(req, function(err, value) {
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
        //console.log(req);
        
        if(self.userId(req) === 1 || self.userId(req)===4) {
            fn(null, true);
        } else if(_.contains(req.session.permissions, 'manager')){
            fn(null, true);
        } else {
            fn(null, false);
        }
    },

    _isAdminOrOrgAdmin: function(req, fn) {
        var self = this;
        if(self.userId(req) === 1 || self.userId(req)===4) {
            fn(null, true);
        } else if(_.contains(req.session.permissions, 'manager')){
            fn(null, true);
        } else {
            var accountId = parseInt(self.accountId(req));
            var userId = self.userId(req);
            return self.isOrgAdmin(accountId, userId, req, fn);
        }
    }

});

module.exports = new api();