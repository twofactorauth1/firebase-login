var passport = require('passport');
var authRoutes = require('../routes/auth');

var router = function() {
};

_.extend(router.prototype, {

    initialize: function() {
        var app = global.app;

        app.post('/login/', authRoutes.login);
        app.get('/logout/', authRoutes.logout);
        app.get('/login/facebook/', passport.authenticate('facebook', {scope: ['email']}));
        app.get('/login/facebook/callback/', passport.authenticate('facebook', {successRedirect: '/', failureRedirect: '/login/facebook/'}));

        return this;
    }
});

module.exports.router = new router().initialize();

