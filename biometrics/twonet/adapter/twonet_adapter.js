var twonetClient = require('../client/index');
var twonetUserDao = require('./dao/twonetuser.dao.js');
var deviceTypeDao = require('../../platform/dao/devicetype.dao.js');
var twonetDeviceTypes = require('./twonet_device_types.js');
var deviceManager = require('../../platform/bio_device_manager.js');
var readingTypes = require('../../platform/bio_reading_types.js');

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

                console.log("succesfully registered user: " + response);

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

        var self = this;

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
                        self._findUserDevice(platformUserId, serialNumber, deviceTypeId, twonetDevice.guid, function (err, device) {
                            if (err) {
                                // 2net has no api to unregister a device so not sure
                                // what happens to it
                                return fn(err, null);
                            }

                            if (device) {
                                console.debug("Found a matching platform device. Won't create a new one");
                                return fn(null, device);
                            }

                            deviceManager.createDevice(
                                deviceTypeId,
                                serialNumber,
                                twonetDevice.guid,
                                platformUserId,
                                function (err, platformDevice) {
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
        })
    },

    unregisterUser: function(platformUserId, fn) {

        twonetClient.userRegistration.unregister(platformUserId, function (err, response) {
            if (err) {
                console.error(err);
                return fn(err, null);
            }

            console.log("succesfully unregistered user: " + response);

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
    },

    pollForReadings: function(period, fn) {
        var self = this;
        twonetUserDao.findMany({ "_id": { $ne: "__counter__" } }, function(err, users) {
            if (err) {
                console.log(err.message);
                return fn(err, null);
            }

            // want to poll users sequentially (to avoid abusing the 2net api for now), hence this pattern
            function pollUser(user) {
                if (!user) {
                    return fn(null, null);
                }

                deviceManager.findDevices({"userId": user.attributes._id}, function(err, devices) {
                    if (err) {
                        console.log(err.message);
                        return pollUser(users.shift());
                    }

                    function pollDevice(device) {
                        if (!device) {
                            // done with this user's devices, go on to next user
                            return pollUser(users.shift());
                        }

                        if (device.attributes.deviceTypeId == twonetDeviceTypes.DT_2NET_SCALE) {
                            self._poll2netScale(device, function(err, response) {
                                if (err) {
                                    console.error(err.message);
                                }
                                pollDevice(devices.shift());
                            })
                        } else {
                            pollDevice(devices.shift());
                        }
                    }

                    pollDevice(devices.shift());
                })
            }

            pollUser(users.shift());
        })
    },

    _poll2netScale: function(device, fn) {
        var self = this;

        console.debug("Fetching last reading for " + device.attributes.deviceTypeId + ": " + device.attributes._id);
        twonetClient.bodyMeasurements.getLatestMeasurement(device.attributes.userId, device.attributes.externalId,
            function(err, twonetReading) {
                if (err) {
                    return fn(err, null);
                }
                console.debug(twonetReading);
                deviceManager.findReadings(
                    {
                        externalId: twonetReading.guid,
                        deviceId: device.attributes._id
                    }, function(err, readings) {
                        if (err) {
                            return fn(err, null);
                        }
                        if (readings.length > 0) {
                            console.debug("Matching reading already in the database, won't record it again");
                            return fn(null, null);
                        }

                        deviceManager.createReading(
                            device.attributes._id,
                            self._makeScaleReadingValues(twonetReading),
                            twonetReading.guid,
                            twonetReading.time,
                            function(err, platformReading) {
                                if (err) {
                                    return fn(err, null);
                                }
                                return fn(null, null);
                            }
                        )
                })
            }
        )
    },

    _makeScaleReadingValues: function(twonetReading) {
        var value = {};
        value[readingTypes.RT_WEIGHT] = twonetReading.body.weight;
        return [value];
    },

    _findUserDevice: function(userId, serialNumber, deviceTypeId, externalId, fn) {
        deviceManager.findDevices(
            {
                serialNumber: serialNumber,
                deviceTypeId: deviceTypeId,
                externalId: externalId,
                userId: userId
            }, function (err, devices) {
                if (err) {
                    return fn(err, null);
                }

                if (devices.length > 0) {
                    return fn(null, devices[0]);
                }

                return fn(null, null);
            })
    }
};