var deepcopy = require('deepcopy');
var Profile = require('../models/profile').Profile;

exports.profileAdd = function (req, res) {
    if (req.isAuthenticated() == false) {
        return res.json({status: false, message: 'User not authenticated.'});
    }
    var insertDict = deepcopy(req.body);
    insertDict['user'] = req.user._id;
    Profile.create(insertDict, function (err, profile) {
        if (err) {
            return res.json({status: false, message: err.message});
        }
        else {
            if (profile) {
                return res.json({status: true, message: 'Profile created.', obj: profile});
            }
            else {
                return res.json({status: false, message: 'Profile not created'});
            }
        }
    });
};

exports.profileUpdate = function (req, res) {
    if (req.isAuthenticated() == false) {
        return res.json({status: false, message: 'User not authenticated.'});
    }
    var insertDict = deepcopy(req.body);
    delete insertDict['_id'];
    Profile.update({_id: req.body._id}, {$set: insertDict}, function (err, profile) {
        if (err) {
            return res.json({status: false, message: err.message});
        }
        if (profile) {
            return res.json({status: true, message: 'Profile updated.', obj: profile});
        }
        else {
            return res.json({status: false, message: 'Profile not updated.'});
        }
    });
};
