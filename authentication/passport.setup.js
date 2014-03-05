var passport = require('passport');
var userDao = require('../dao/user.dao');

//  STRATEGIES IN USE
require('./passport.local');
require('./passport.facebook');
require('./passport.twitter');
require('./passport.google');

//  Store only the User Id in the session
passport.serializeUser(function(user, done) {
    done(null, user.id());
});


//  Retrieve the user via our standard DAO access
passport.deserializeUser(function(id, done) {
    userDao.getById(id, function(err, value) {
        return done(err, value);
    });
});
