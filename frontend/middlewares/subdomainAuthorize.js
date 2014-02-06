var mongoose = require('mongoose');

module.exports = function () {
    return function (req, res, next) {
        if (req.isAuthenticated()) {
            var userType = req.user.role;
            if (userType===1) {
                next();
            }
            else if (userType===2) {
                next();
            }
            else {
                next();
            }
        }
        else {
            return res.send(404, 'View does not exist.');
        }
    }
};
