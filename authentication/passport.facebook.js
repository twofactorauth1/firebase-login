var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var facebookConfig = require('../configs/facebook.config.js');
var UserDao = require('../dao/user.dao.js');
var constants = requirejs("constants/constants");


passport.use(new FacebookStrategy({
        clientID: facebookConfig.FACEBOOK_CLIENT_ID,
        clientSecret: facebookConfig.FACEBOOK_CLIENT_SECRET,

        //TODO - Jaideep - Make this dynamic, pass accounttoken information (see below for more information)
        callbackURL: facebookConfig.FACEBOOK_CALLBACK_URL

        //TODO - Jaideep - See about using this param to access the request object
        //        at this level (passReqToCallback:true).  See passport.local for example
    },

    function (accessToken, refreshToken, profile, done) {
        var email = profile.emails[0].value;
	    var type = $$.constants.user.credential_types.FACEBOOK;


        //TODO - Jaideep - First do a lookup by Access Token, its possible the user may have changed their username at the social site,
        //but we want to continue to be able to find them at our site. If no user is found by access token, then
        //do the getUserByOauthProfile(email) search

        //TODO - Jaideep - We may want to combine all of this into a single method on UserDao called "getOrCreateUserByOauthProfile",
        //      this would handle looking up the user first by token, then by email, then creating or updating the user and the
        //      user credentials, and only a single response would be required here. This will give consistency across all the
        //      oauth strategies and prevent having to duplicate so much code in each of the passport.* files.

        //TODO - Jaideep - When creating a new user, we want to try to create the account at the same time.  Assuming we have access
        //       to the request object through the passReqToCallback method, or we use a custom callback as defined in the posts
        //       you sent on Stack Overflow and which enable custom callbackURLs, we can access an AccountToken either via the request,
        //       or it can be the extra bit of data we pass through in the state params and retrieve on the other end.
        //       If retrievin it through the request object, you would do so as:  var accountToken = cookies.getAccountToken(req);
        //       see login.server.router for an example.  If you pass it as a param to the OAuth callback URL, you can access it from
        //       the router that is managing the callback.  Once we have the account token, you can see how it's used in
        //       #createUserFromUsernamePassword() in user.dao.  You would want to do the same in the #createUserFromOauthProfile() method

        UserDao.getUserByOauthProfile(email, type, function (err, user) {
            if (err) {
                return done(null, false, {message: 'An error occurred searching for user by email ID.'});
            }
            else {
                if (user) {
                    //TODO - Jaideep - In this case, before returning we want to update the FB Credentials on the existing
                    //      User, including setting AccessToken and username
                    return done(null, user);
                }
                else {
                    UserDao.createUserFromOauthProfile(accessToken, profile, type, function (err, user) {
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
