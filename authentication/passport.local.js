/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , userDao = require('../dao/user.dao.js')
    , accountDao = require('../dao/account.dao')
    , authenticationDao = require('../dao/authentication.dao')
    , crypto = require('../utils/security/crypto')
    , os = require('os')
    , constants = requirejs("constants/constants")
    , cookies = require("../utils/cookieutil");

passport.use(new LocalStrategy({
        passReqToCallback:true
    },
    function(req, username, password, done) {
        var self = this;
        
        var redirectTo = req.body.from.toString().replace(/.*\?/gi, '').replace('/#', '').replace('redirectTo=', '');
        if(redirectTo !== '/login' && redirectTo !== '/admin/') {
            req.query.redirectTo = redirectTo;
        }

        //console.log('in passport: ' + req.query.redirectTo);
        authenticationDao.authenticateByUsernamePassword(req, username.toLowerCase(), password, function(err, value) {
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