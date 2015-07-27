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

