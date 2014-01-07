/**
 * Passport middleware
 *
 * For more information on routes, check out:
 * http://passportjs.org/guide/
 */
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

module.exports = {
    express: {
        passportMiddleware: function (app) {
            sails.log.info('Passport middleware');
            app.use(passport.initialize());
            app.use(passport.session());
        }
    }
};
