exports.checkOrganizationExist = function (id, callback) {
    //check existence of a organization.
    Organization.findOne(id).done(function (err, organization) {
        if (err) {
            console.log('checkOrganizationExist', err);
            callback(false);
        }
        else {
            if (organization) {
                callback(true);
            }
            else {
                callback(false);
            }
        }
    });
};
