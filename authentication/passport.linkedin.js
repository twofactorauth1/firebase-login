/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

var passport = require('passport');
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
var linkedInConfig = require('../configs/linkedin.config');
var constants = requirejs("constants/constants");
var passportUtil = require('./passport.socialutil');
var request = require('request');

passport.use(new LinkedInStrategy({
        clientID: linkedInConfig.CLIENT_ID,
        clientSecret: linkedInConfig.CLIENT_SECRET,
        callbackURL: linkedInConfig.CALLBACK_URL_LOGIN,
        passReqToCallback: true
    },

    function (req, accessToken, refreshToken, params, profile, done) {
        //Profile doesn't come stock with Email, so we need to get it...

        var options = {
            expires: params.expires_in
        };

        var url = "https://api.linkedin.com/v1/people/~:(id,email-address)?format=json&oauth2_access_token=" + accessToken;
        request(url, function(err, resp, body) {
            var profile2 = JSON.parse(body);
            profile.emails = [{
                value: profile2.emailAddress
            }];
            passportUtil.handleLoginCallback($$.constants.user.credential_types.LINKEDIN, req, accessToken, refreshToken, options, profile, linkedInConfig.getScope(), done);
        });
    }
));
