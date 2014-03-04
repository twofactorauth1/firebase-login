var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var FacebookConfig = require('../configs/facebook.config');
var UserDao = require('../dao/user.dao');
var AuthenticationDao = require('../dao/authentication.dao');
var constants = requirejs("constants/constants");
var cookies = require("../utils/cookieutil");


passport.use(new FacebookStrategy({
        clientID: FacebookConfig.CLIENT_ID,
        clientSecret: FacebookConfig.CLIENT_SECRET,
        callbackURL: FacebookConfig.CALLBACK_URL_LOGIN,
        passReqToCallback: true
    },

    function (req, accessToken, refreshToken, profile, done) {
        var socialType = $$.constants.user.credential_types.FACEBOOK;
        var email = profile.emails[0].value;
        var firstName = profile.givenName;
        var lastName = profile.familyName;
        var socialId = profile.id;
        var username = profile.username;
        var profileUrl = profile.profileUrl;

        var authMode = req.session.authMode;
        delete req.session.authMode;

        if (authMode == "create") {
            // creating new account
            var accountToken = cookies.getAccountToken(req);

            UserDao.createUserFromSocialProfile(socialType, socialId, email, firstName, lastName, username, profileUrl, accessToken, accountToken, function(err, value) {
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
            AuthenticationDao.authenticateBySocialLogin(req, socialType, socialId, email, username, profileUrl, accessToken, function(err, value) {
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
