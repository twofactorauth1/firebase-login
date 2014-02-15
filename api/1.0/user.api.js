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
        app.get(this.getUrlRoute(''), this.isAuthApi, this.getLoggedInUser.bind(this));
        app.get(this.getUrlRoute(':id'), this.isAuthApi, this.getUserById.bind(this));
        app.post(this.getUrlRoute(''), this.createUser.bind(this));
        app.put(this.getUrlRoute(''), this.isAuthApi, this.updateUser.bind(this));
        app.delete(this.getUrlRoute(':id'), this.isAuthApi, this.deleteUser.bind(this));
    },


    getLoggedInUser: function(req,resp) {
        var self = this;

        var user = req.user;
        resp.send(user);
    },


    getUserById: function(req,resp) {
        var self = this;
        var userId = req.params.id;

        if (!userId) {
            this.wrapError(resp, 400, null, "Invalid paramater for ID");
        }

        userId = parseInt(userId);

        UserDao.getById(userId, function(err, value) {
            if (!err) {
                resp.send(value);
            } else {
                self.wrapError(resp, 401, null, err, value);
            }
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

