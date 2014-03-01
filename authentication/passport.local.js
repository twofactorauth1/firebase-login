var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , UserDao = require('../dao/user.dao.js')
    , AccountDao = require('../dao/account.dao')
    , AuthenticationDao = require('../dao/authentication.dao')
    , crypto = require('../utils/security/crypto')
    , os = require('os')
    , constants = requirejs("constants/constants");

passport.use(new LocalStrategy({
        passReqToCallback:true
    },
    function(req, username, password, done) {
        var self = this;

        AuthenticationDao.authenticateByUsernamePassword(req, username, password, function(err, value) {
            if (err) {
                return done(null, false, {message:value});
            } else if(value == null) {
                return done(null, "User not found");
            } else {
                return done(null, value);
            }
        });
    }
));