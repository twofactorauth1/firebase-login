process.env.NODE_ENV = "testing";
var app = require('../../../../app');

var twonetUserDao = require('../dao/twonetuser.dao.js');
var twonetAdapter = require('../twonet_adapter.js');

var platformUserId = "50f97bb9-a38d-46eb-8e5a-d1716aed1da4";

exports.twonet_adapter_test = {

    registerUser: function(test) {
        test.expect(2);

        twonetAdapter.registerUser(platformUserId, function (err, twonetUser) {
            if (err) {
                test.ok(false, err);
                return test.done();
            }

            console.log("registered user " + JSON.stringify(twonetUser));
            test.equals(twonetUser.attributes._id, platformUserId);

            /**
             * Validate user was created
             */
            twonetUserDao.getById(twonetUser.attributes._id, function (err, twonetUser) {
                if (err) {
                    test.ok(false, err);
                    return test.done();
                }

                test.equals(twonetUser.attributes._id, platformUserId);
                return test.done();
            })
        })
    },

    unregisterUser: function(test) {

        test.expect(2);

        twonetAdapter.unregisterUser(platformUserId, function (err, unregisteredUserId) {
            if (err) {
                test.ok(false, err);
                test.done();
            }

            test.equals(unregisteredUserId, platformUserId);

            /**
             * Validate user is gone
             */
            twonetUserDao.getById(platformUserId, function (err, twonetUser) {
                if (err) {
                    test.ok(false, err);
                    return test.done();
                }

                test.equals(twonetUser, null);
                test.done();
            })
        })
    }
};
