var passport = require('passport');
var facebookStrategy = require('passport-facebook').Strategy;
var facebookConfig = require('../config/facebook.config.js');
var UserDao = require('../dao/user.dao.js');


passport.use(new facebookStrategy({
    clientID: facebookConfig.FACEBOOK_CLIENT_ID,
    clientSecret: facebookConfig.FACEBOOK_CLIENT_SECRET,
    callbackURL: facebookConfig.FACEBOOK_CALLBACK_URL
    },
   function (accessToken, refreshToken, profile, done) {
       var email = profile.emails[0];
       UserDao.getUserByEmail(email, function (err, user) {
	   if (err) {
	       return done(null, false, {message: 'An error occurred searching for user by email ID.'});
	   }
	   else {
	       if (user){
		   return done(null, user);
	       }
	       else {
		   UserDao.createUserFromUsernamePassword(email, accessToken, email, accessToken, function (err, user) {
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
);
