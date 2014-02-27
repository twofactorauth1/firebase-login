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

	UserDao.getOrCreateUserFromOauthProfile(accessToken, profile, type, accountToken, function (err, user) {
	    if (err) {
		return done(null, false, err);
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
));
