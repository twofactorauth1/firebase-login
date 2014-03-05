var passport = require('passport');
var GoogleStrategy = require('passport-google').Strategy;
var googleConfig = require('../configs/google.config');
var constants = requirejs("constants/constants");
var passportUtil = require('./passport.socialutil');


passport.use(new GoogleStrategy({
        clientID: googleConfig.CLIENT_ID,
        clientSecret: googleConfig.CLIENT_SECRET,
        callbackURL: googleConfig.CALLBACK_URL_LOGIN,
        returnURL: googleConfig.CALLBACK_URL_LOGIN,
        passReqToCallback: true
    },

    function (req, accessToken, refreshToken, profile, done) {
        if (_.isObject(refreshToken)) {
            done = profile;
            profile = refreshToken;
            refreshToken = null;
        }
        passportUtil.handleLoginCallback($$.constants.user.credential_types.GOOGLE, req, accessToken, refreshToken, profile, googleConfig.getScope(), done);
    }
));
