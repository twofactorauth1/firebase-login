var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var facebookConfig = require('../configs/facebook.config');
var constants = requirejs("constants/constants");
var passportUtil = require('./passport.socialutil');


passport.use(new FacebookStrategy({
        clientID: facebookConfig.CLIENT_ID,
        clientSecret: facebookConfig.CLIENT_SECRET,
        callbackURL: facebookConfig.CALLBACK_URL_LOGIN,
        passReqToCallback: true
    },

    function (req, accessToken, refreshToken, params, profile, done) {
        var options = {
            expires:params.expires
        };
        passportUtil.handleLoginCallback($$.constants.user.credential_types.FACEBOOK, req, accessToken, refreshToken, options, profile, facebookConfig.getScope(), done);
    }
));
