var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , UserDao = require('../dao/user.dao.js')
    , crypto = require('../utils/security/crypto');

passport.use(new LocalStrategy(
    function(username, password, done) {
        var self = this;

        UserDao.getUserByUserName(username, function(err, value) {

            if (!err) {
                if (value == null) {
                    return done(null, false, {message:"Incorrect username"});
                }

                var user = value;

                var credentials = user.getCredentials($$.m.User.CREDENTIAL_TYPES.LOCAL);
                if (credentials == null) {
                    return done(null, false, {message:"No login credentials found"});
                }

                var encryptedPass = credentials.password;
                var isValid = crypto.verify(password, encryptedPass, function(err, value) {
                    if (!err) {
                        if (value === false) {
                            return done(null, false, {message:"Incorrect password"});
                        } else {
                            return done(null, user);
                        }
                    } else {
                        return done(null, false, {message:"An error occurred verifying encrypted password"});
                    }
                });
            } else {
                fn(err, value);
            }
        });
    }
));