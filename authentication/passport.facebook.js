var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var facebookConfig = require('../configs/facebook.config.js');
var UserDao = require('../dao/user.dao.js');


passport.use(new FacebookStrategy({
        clientID: facebookConfig.FACEBOOK_CLIENT_ID,
        clientSecret: facebookConfig.FACEBOOK_CLIENT_SECRET,
        callbackURL: facebookConfig.FACEBOOK_CALLBACK_URL
    },

    function (accessToken, refreshToken, profile, done) {
        var email = profile.emails[0].value;

        //TODO - Jaideep, first look up user by FB accessToken, in case they have already linked and session was destroyed.
        //UserDao.getUserByFacebookAccessToken(.....)

        //TODO - Jaideep, this should lookup ONLY by Facebook username. (User.credentials => type == $$.constants.user.credential_types.FACEBOOK).
        //       Otherwise it creates a potential security risk.

        //TODO - Jaideep, relating to the above two items, you can do them in a single query as well, UserDao.getUserByFacebookAccessTokenOrEmail(...)

        UserDao.getUserByEmail(email, function (err, user) {
            if (err) {
                return done(null, false, {message: 'An error occurred searching for user by email ID.'});
            }
            else {
                if (user) {
                    //TODO - Jaideep, in this case, we want to update the FB Credentials on the existing User, including setting AccessToken
                    return done(null, user);
                }
                else {
                    UserDao.createUserFromFacebookProfile(accessToken, profile, function (err, user) {
                        if (err) {
                            return done(null, false, {message: 'An error occurred trying to create the user.'});
                        }
                        else {
                            if (user) {
                                return done(null, user);
                            }
                            else {
                                return done(null, false, {message: 'User not created.'});
                            }
                        }
                    });
                }
            }
        });
    }
));
