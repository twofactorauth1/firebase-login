var twonetClient = require('../../twonetclient');
var uuid = require('node-uuid');

// the user uuid we'll register/unregister
var guid = uuid.v4();

exports.twonet_user_registration = {

    register: function(test) {
        test.expect(1);

        twonetClient.userRegistration.register(guid, function(err, response) {
            if (err) {
                test.ok(false, err);
            } else {
                test.equal(response, guid);
                console.log("succesfully registered guid: " + response);
            }
            test.done();
        });
    },

    unregister: function(test) {
        test.expect(1);

        twonetClient.userRegistration.unregister(guid, function(err, response) {
            if (err) {
                test.ok(false, err);
            } else {
                test.equal(response, guid);
                console.log("succesfully unregistered guid: " + response);
            }
            test.done();
        });
    }
};