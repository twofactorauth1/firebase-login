var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

function findById (id, callback) {
    AuthUser.findOne(id).done(function (err, authUser) {
        if (err) {
            sails.log.error(err);
            return callback(null, null);
        }
        else {
            return callback(null, authUser);
        }
    }); 
}

function findByUsername (username, callback) {
    AuthUser.findOne({username: username}).done(function (err, authUser) {
        if (err) {
            sails.log.error(err);
            return callback(null, null);
        }
        else {
            return callback(null, authUser);
        }
    });
}

passport.serializeUser(function (authUser, done) {
    done(null, authUser.id);
});

passport.deserializeUser(function (id, done) {
    findById(id, function (err, authUser) {
        done(err, authUser);
    });
});

passport.use(new LocalStrategy(function (username, password, done) {
    process.nextTick(function () {
        findByUsername(username, function (err, authUser) {
            if (err) {
                return done(null, err);
            }
            else {
                if (authUser) {
                    bcrypt.compare(password, authUser.password, function (err, res) {
                        if (res) {
                            var resUser = {
                                username: authUser.username,
                                createdAt: authUser.createdAt,
                                id: authUser.id
                            };
                            return done(null, resUser, ErrorMessageService.errorMessage(29047));
                        }
                        else {
                            return done(null, false, ErrorMessageService.errorMessage(290410));
                        }
                    });
                }
                else {
                    return done(null, false, ErrorMessageService.errorMessage(29049));
                }
            }
        });
    });
}));
