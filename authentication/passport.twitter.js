var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var twitterConfig = require('../configs/twitter.config');
var constants = requirejs("constants/constants");
var passportUtil = require('./passport.socialutil');

passport.use(new TwitterStrategy({
        consumerKey: twitterConfig.CLIENT_ID,
        consumerSecret: twitterConfig.CLIENT_SECRET,
        callbackURL: twitterConfig.CALLBACK_URL_LOGIN,
        passReqToCallback: true
    },

    function (req, accessToken, refreshToken, profile, done) {
        passportUtil.handleLoginCallback($$.constants.user.credential_types.TWITTER, req, accessToken, refreshToken, profile, twitterConfig.getScope(),  done);
    }
));
