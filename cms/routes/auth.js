var passport = require('passport');

exports.login = function (req, res, next) {
    passport.authenticate('local', function (err, user) {
        if (err) {
            return res.json({status: false, message: err.message});
        }
        else {
            if (user) {
                req.logIn(user, function (err) {
                    if (err) {
                        return res.json({status: false, message: err.message});
                    }
                    else {
                        return res.json({status: true, message: 'Login Successful.'});
                    }
                });
            }
            else {
                return res.json({status: false, message: 'Invalid Email / Password.'});
            }
        }
    })(req, res, next);
};

exports.logout = function (req, res) {
    req.logout();
    return res.json({status: true, message: 'Logout Successful.'});
};

