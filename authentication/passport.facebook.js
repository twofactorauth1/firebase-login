var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var facebookConfig = require('../configs/facebook.config');
var UserDao = require('../dao/user.dao');
var AuthenticationDao = require('../dao/authentication.dao');
var constants = requirejs("constants/constants");
var cookies = require("../utils/cookieutil");


passport.use(new FacebookStrategy({
        clientID: facebookConfig.FACEBOOK_CLIENT_ID,
        clientSecret: facebookConfig.FACEBOOK_CLIENT_SECRET,
        callbackURL: facebookConfig.FACEBOOK_CALLBACK_URL_SIGNUP,
        passReqToCallback: true
    },

    function (req, accessToken, refreshToken, profile, done) {
        var socialType = $$.constants.user.credential_types.FACEBOOK;
        var email = profile.emails[0].value;
        var firstName = profile.givenName;
        var lastName = profile.familyName;
        var socialId = profile.id;

        var authMode = req.session.authMode;
        delete req.session.authMode;

        if (authMode == "create") {
            // creating new account
            var accountToken = cookies.getAccountToken(req);

            UserDao.createUserFromSocialProfile(socialType, socialId, email, firstName, lastName, accessToken, accountToken, function(err, value) {
                if (err) {
                    return done(null, false, err);
                } else {
                    if (value != null) {
                        return done(null, value);
                    } else {
                        return done(null, false, {message:"User not created"});
                    }
                }
            });
        } else {
            //Logging in as usual.
            AuthenticationDao.authenticateBySocialLogin(req, socialType, socialId, email, accessToken, function(err, value) {
                if (err) {
                    return done(null, false, {message:value});
                }

                if (value != null) {
                    return done(null, value);
                } else {
                    return done(null, false, {message:value});
                }
            });
        }
    }
));
