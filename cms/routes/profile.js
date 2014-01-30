var Profile = require('../models/profile').Profile;

exports.profileAdd = function (req, res) {
    if (req.isAuthenticated() == false) {
        return res.json({status: false, message: 'User not authenticated.'});
    }
    Profile.create(req.body, function (err, profile) {
        if (err) {
            return res.json({status: false, message: err.message});
        }
        else {
            if (profile) {
                return res.json({status: true, message: 'Profile created.'});
            }
            else {
                return res.json({status: false, message: 'Profile not created'});
            }
        }
    });
};
