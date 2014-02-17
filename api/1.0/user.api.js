var BaseApi = require('../base.api');
var UserDao = require('../../dao/user.dao');
var AccountDao = require('../../dao/account.dao');
var passport = require('passport');
var cookies = require('../../utils/cookieutil');

var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, BaseApi.prototype, {

    base: "user",

    dao: UserDao,

    initialize: function() {
        app.get(this.getUrlRoute(''), this.isAuthApi.bind(this), this.getLoggedInUser.bind(this));
        app.get(this.getUrlRoute('exists/username=:username'), this.userExists.bind(this));
        app.get(this.getUrlRoute(':id'), this.isAuthApi.bind(this), this.getUserById.bind(this));
        app.post(this.getUrlRoute(''), this.createUser.bind(this));
        app.put(this.getUrlRoute(''), this.isAuthApi.bind(this), this.updateUser.bind(this));
        app.delete(this.getUrlRoute(':id'), this.isAuthApi.bind(this), this.deleteUser.bind(this));
    },


    getLoggedInUser: function(req,resp) {
        var self = this;

        var user = req.user;
        resp.send(user.toJSON());
    },


    getUserById: function(req,resp) {
        var self = this;
        var userId = req.params.id;

        if (!userId) {
            return this.wrapError(resp, 400, null, "Invalid paramater for ID");
        }

        userId = parseInt(userId);

        UserDao.getById(userId, function(err, value) {
            if (!err) {
                if (value == null) {
                    return self.wrapError(resp, 404, null, "No User found with ID: [" + userId + "]");
                }
                return resp.send(value.toJSON());
            } else {
                return self.wrapError(resp, 401, null, err, value);
            }
        });
    },


    userExists: function(req,resp) {
        var self = this;

        var username = req.params.username;

        UserDao.usernameExists(username, function(err, value) {
            if (err) {
                return self.wrapError(resp, 500, null, err, value);
            }
            return resp.send(value);
        });
    },


    createUser: function(req,resp) {

    },


    updateUser: function(req,resp) {

    },


    deleteUser: function(req,resp) {

    }
});

module.exports = new api();

