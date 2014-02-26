var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , UserDao = require('../dao/user.dao.js')
    , AccountDao = require('../dao/account.dao')
    , crypto = require('../utils/security/crypto')
    , os = require('os')
    , constants = requirejs("constants/constants");

passport.use(new LocalStrategy({
        passReqToCallback:true
    },
    function(req, username, password, done) {
        var self = this;

        var host = req.get("host");
        AccountDao.getAccountByHost(host, function(err, value) {
            if (err) {
                return done(null, false, {message:"An error occurred validating account"});
            }

            var account = value;
            if (account !== true && (account == null || account.id() == null || account.id() == 0)) {
                return done(null, false, {message:"No account found at this location"});
            }

            //We are at the main indigenous level application, not at a custom subdomain
            else if (account === true) {
                UserDao.getUserByUsernameOrEmail(username, function(err, value) {
                    if (!err) {
                        if (value == null) {
                            return done(null, false, {message:"Incorrect username"});
                        }

                        var user = value;

                        user.verifyPassword(password, $$.constants.user.credential_types.LOCAL, function(err, value) {
                            if (!err) {
                                if (value === false) {
                                    return done(null, false, {message:"Incorrect password"});
                                } else {
                                    req.session.accountId = 0;
                                    return done(null, user);
                                }
                            } else {
                                return done(null, false, {message:"An error occurred verifying password - " + err});
                            }
                        });
                    } else {
                        fn(err, value);
                    }
                });
            } else {
                UserDao.getUserForAccount(account.id(), username, function(err, value) {
                    if (err) {
                        return done(null, false, {message:"An error occurred retrieving user for account"});
                    } else {
                        if (value == null) {
                            return done(null, false, {message:"Incorrect username"});
                        } else {
                            var user = value;
                            user.verifyPasswordForAccount(account.id(), password, $$.constants.user.credential_types.LOCAL, function(err, value) {
                                if (!err) {
                                    if (value === false) {
                                        return done(null, false, {message:"Incorrect password"});
                                    } else {
                                        req.session.accountId = account.id();
                                        return done(null, user);
                                    }
                                } else {
                                    return done(null, false, {message:"An error occurred verifying encrypted password"});
                                }
                            });
                        }
                    }
                });
            }
        });
    }
));