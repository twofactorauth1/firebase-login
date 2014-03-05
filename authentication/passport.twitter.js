var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var twitterConfig = require('../configs/twitter.config');
var UserDao = require('../dao/user.dao');
var AuthenticationDao = require('../dao/authentication.dao');
var constants = requirejs("constants/constants");
var cookies = require("../utils/cookieutil");


passport.use(new TwitterStrategy({
        consumerKey: twitterConfig.CLIENT_ID,
        consumerSecret: twitterConfig.CLIENT_SECRET,
        callbackURL: twitterConfig.CALLBACK_URL_LOGIN,
        passReqToCallback: true
    },

    function (req, accessToken, refreshToken, profile, done) {
        var socialType = $$.constants.user.credential_types.TWITTER
            , email, firstName, lastName, socialId, username, profileUrl, name;

        if (profile.emails != null && profile.emails.length > 0) {
            email = profile.emails[0].value;
        }
        name = profile.displayName;
        firstName = profile.givenName;
        lastName = profile.familyName;
        socialId = profile.id;
        username = profile.username;
        profileUrl = profile.profileUrl;

        if (firstName == null && lastName == null && name != null) {
            var nameParts = $$.u.stringutils.splitFullname(name);
            firstName = nameParts[0];
            lastName = nameParts[2];
        }

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
