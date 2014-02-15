var passport = require('passport');
var UserDao = require('../dao/user.dao');

//  STRATEGIES IN USE
require('./passport.local.js');


//  Store only the User Id in the session
passport.serializeUser(function(user, done) {
    done(null, user.id());
});


//  Retrieve the user via our standard DAO access
passport.deserializeUser(function(id, done) {
    UserDao.getById(id, function(err, value) {
        return done(err, value);
    });
});
