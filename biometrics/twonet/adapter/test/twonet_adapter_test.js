process.env.NODE_ENV = "testing";
var app = require('../../../../app');

var twonetUserDao = require('../dao/twonetuser.dao.js');
var twonetAdapter = require('../twonet_adapter.js');
var deviceManager = require('../../../platform/bio_device_manager.js');

var platformUserId = "50f97bb9-a38d-46eb-8e5a-d1716aed1da6";

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
    },

    registerDevice: function(test) {
        test.expect(5);

        /**
         * Register User
         */
        twonetAdapter.registerUser(platformUserId, function (err, twonetUser) {
            if (err) {
                test.ok(false, err);
                return test.done();
            }

            console.log("registered user " + JSON.stringify(twonetUser));

            /**
             * Register device for user
             */
            twonetAdapter.registerDevice(platformUserId, "2net_scale", "SN001", function (err, platformDevice) {
                if (err) {
                    test.ok(false, err.message);
                    twonetAdapter.unregisterUser(platformUserId, function(err, response){
                        return test.done();
                    })
                }

                /**
                 * Verify device was persisted
                 */
                deviceManager.getDeviceById(platformDevice.attributes._id, function (err, device) {
                    if (err) {
                        test.ok(false, err.message);
                        twonetAdapter.unregisterUser(platformUserId, function(err, response){
                            return test.done();
                        })
                    }

                    test.equals(device.attributes._id, platformDevice.attributes._id);
                    test.equals(device.attributes.userId, platformUserId);
                    test.ok(!$$.u.stringutils.isNullOrEmpty(device.attributes.externalId));
                    test.equals(device.attributes.serialNumber, "SN001");
                    test.equals(device.attributes.deviceTypeId, "2net_scale");

                    /**
                     * We are done, unregister user
                     */
                    twonetAdapter.unregisterUser(platformUserId, function (err, unregisteredUserId) {
                        if (err) {
                            test.ok(false, err);
                        }
                        return test.done();
                    })
                })
            })
        })
    }
};
