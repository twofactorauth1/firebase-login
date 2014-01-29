var User = require('../models/user').User;

exports.localStrategyCallback = function (email, password, callback) {
    //TODO: add encryption logic for password.
    User.findOne({email: email, password: password}, function (err, user) {
        if (err) {
            return callback(err);
        }
        if (user) {
            return callback(null, user);
        }
        else {
            return callback(null, false, {message: 'Invalid Username / Password.'});
        }
    });
};

exports.deserializeUser = function (id, callback) {
    User.findOne({_id: id}, function (err, user) {
        callback(err, user);
    });
};
