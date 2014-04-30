var twonetClient = require('../client/index');
var twonetUserDao = require('./dao/twonetuser.dao.js');
var deviceTypeDao = require('../../platform/dao/devicetype.dao.js');
var twonetDeviceTypes = require('./twonet_device_types.js');
var deviceManager = require('../../platform/bio_device_manager.js');

module.exports = {

    registerUser: function(platformUserId, fn) {
        /**
         * Validate user hasn't been signed up already
         */
        twonetUserDao.getById(platformUserId, function(err, user) {
            if (err) {
                return fn(err, null);
            }

            if (user) {
                return fn(new Error("User " + platformUserId + " already exists"), null);
            }

            /**
             * Sign up the user. In the 2net world, we tell 2net what user id we want, so we'll just use our
             * Indigenous platform user id as the id.
             */
            twonetClient.userRegistration.register(platformUserId, function (err, response) {
                if (err) {
                    throw err;
                }

                console.log("succesfully registered guid: " + response);

                /**
                 * Persist registration record in the database
                 */
                twonetUserDao.createUser(platformUserId, function (createUserError, createUserResponse) {
                    if (createUserError) {
                        console.log("failed to persist twonet user");
                        console.error(createUserError);

                        // rollback registration
                        twonetClient.userRegistration.unregister(platformUserId, function (err, response) {
                            return fn(createUserError, null);
                        })
                    } else {
                        return fn(null, createUserResponse);
                    }
                })
            })
        })
    },

    registerDevice: function(platformUserId, deviceTypeId, serialNumber, fn) {

        if (!twonetDeviceTypes.isValidDeviceType(deviceTypeId)) {
            return fn(new Error("Unrecognized device type " + deviceTypeId), null);
        }

        /**
         * Validate user is registered
         */
        twonetUserDao.getById(platformUserId, function(err, user) {
            if (err) {
                return fn(err, null);
            }

            if (!user) {
                return fn(new Error("User " + platformUserId + " has not been registered"), null);
            }

            /**
             * Retrieve device type
             */
            deviceTypeDao.getById(deviceTypeId, function (err, deviceType) {
                if (err) {
                    return fn(err, null);
                }

                if (!deviceType) {
                    return fn(new Error("No device type identified by " + deviceTypeId + " was found"), null);
                }

                twonetClient.deviceRegistration.register2netDevice(
                    platformUserId,
                    serialNumber,
                    deviceType.attributes.model,
                    deviceType.attributes.manufacturer,
                    function (err, twonetDevice) {
                        if (err) {
                            return fn(err, null);
                        }

                        console.log("Registered 2net device " + JSON.stringify(twonetDevice));

                        /**
                         * Register device with our platform
                         */
                        deviceManager.createDevice(
                            deviceTypeId,
                            serialNumber,
                            twonetDevice.guid,
                            platformUserId,
                            function(err, platformDevice) {
                                if (err) {
                                    // 2net has no api to unregister a device so not sure
                                    // what happens to it
                                    return fn(err, null);
                                }

                                console.log("Registered platform device " + JSON.stringify(platformDevice));

                                return fn(null, platformDevice);
                            })
                    })
            })
        })
    },

    unregisterUser: function(platformUserId, fn) {

        twonetClient.userRegistration.unregister(platformUserId, function (err, response) {
            if (err) {
                console.error(err);
                return fn(err, null);
            }

            console.log("succesfully unregistered guid: " + response);

            /**
             * Delete registration record
             */
            twonetUserDao.removeById(platformUserId, function(err, res) {
                if (err) {
                    console.error(err);
                    return fn(err, null);
                }

                return fn(null, response);
            })
        })
    }
};