/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var passport = require('passport');
var userDao = require('../dao/user.dao');

//  STRATEGIES IN USE
require('./passport.local');
require('./passport.facebook');
require('./passport.twitter');
require('./passport.google');
require('./passport.linkedin');

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
