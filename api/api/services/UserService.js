exports.UserExists = function (id, uid, accessToken, callback) {
    var query = {access_token: accessToken, isActive: true};
    if (id) {
        query._id = id;
    }
    if (uid) {
        query.uid = uid;
    }
    User.findOne(query).done(function (err, user) {
        if (err) {
            callback(false);
        }
        else {
            if (user) {
                callback(true);
            }
            else {
                callback(false);
            }
        }
    });
};
