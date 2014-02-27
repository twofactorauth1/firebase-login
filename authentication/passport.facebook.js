var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var facebookConfig = require('../configs/facebook.config.js');
var UserDao = require('../dao/user.dao.js');
var constants = requirejs("constants/constants");


passport.use(new FacebookStrategy({
        clientID: facebookConfig.FACEBOOK_CLIENT_ID,
        clientSecret: facebookConfig.FACEBOOK_CLIENT_SECRET,
        callbackURL: facebookConfig.FACEBOOK_CALLBACK_URL
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
