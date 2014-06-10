/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
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

    function (req, accessToken, refreshToken, params, profile, done) {
        var options = {expires:params.expires_in};

        passportUtil.handleLoginCallback($$.constants.user.credential_types.GOOGLE, req, accessToken, refreshToken, options, profile, googleConfig.getScope(), done);
    }
));
