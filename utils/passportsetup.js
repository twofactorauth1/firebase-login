var passport = require('passport');
var passportHelper = require('../helpers/passport');
var facebookConfig = require('../configs/facebook.config');

var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;


// SERIALIZE USER
passport.serializeUser(function(user, done) {
    done(null, user._id);
});


//  DESERIALIZE USER
passport.deserializeUser(function(id, done) {
    passportHelper.deserializeUser(id, done);
});


//  LOCAL STRATEGY
passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    function (email, password, done) {
        return passportHelper.localStrategyCallback(email, password, done);
    }
));


//  FACEBOOK STRATEGY
passport.use(new FacebookStrategy(
    {
        clientID: facebookConfig.FACEBOOK_CLIENT_ID,
        clientSecret: facebookConfig.FACEBOOK_CLIENT_SECRET,
        callbackURL: facebookConfig.FACEBOOK_CALLBACK_URL
    },
    function (accessToken, refreshToken, profile, done) {
        passportHelper.createFacebookUser(accessToken, refreshToken, profile, done);
    }
));

