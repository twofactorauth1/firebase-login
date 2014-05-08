var twonetClient = require('../client/index');
var twonetSubscriptionDao = require('./dao/twonetsubscription.dao.js');
var deviceTypeDao = require('../../platform/dao/devicetype.dao.js');
var twonetDeviceTypes = require('./twonet_device_types.js');
var deviceManager = require('../../platform/bio_device_manager.js');
var readingTypes = require('../../platform/bio_value_types.js');

module.exports = {

    log: $$.g.getLogger("twonet_adapter"),

    subscribeContact: function(contactId, fn) {
        var self = this;

        /**
         * Validate user hasn't been signed up already
         */
        twonetSubscriptionDao.getById(contactId, function(err, user) {
            if (err) {
                return fn(err, null);
            }

            if (user) {
                return fn(new Error("User " + contactId + " already exists"), null);
            }

            /**
             * Sign up the user. In the 2net world, we tell 2net what user id we want, so we'll just use our
             * Indigenous platform user id as the id.
             */
            twonetClient.userRegistration.register(contactId, function (err, response) {
                if (err) {
                    throw err;
                }

                self.log.debug("succesfully registered user: " + response);

                /**
                 * Persist registration record in the database
                 */
                twonetSubscriptionDao.createSubscription(contactId, function (createUserError, createUserResponse) {
                    if (createUserError) {
                        self.log.error("failed to create twonet user");
                        self.log.error(createUserError.message);

                        // rollback registration
                        twonetClient.userRegistration.unregister(contactId, function (err, response) {
                            return fn(createUserError, null);
                        })
                    } else {
                        return fn(null, createUserResponse);
                    }
                })
            })
        })
    },

    registerDevice: function(contactId, deviceTypeId, serialNumber, fn) {

        var self = this;

        if (!twonetDeviceTypes.isValidDeviceType(deviceTypeId)) {
            return fn(new Error("Unrecognized device type " + deviceTypeId), null);
        }

        if ($$.u.stringutils.isNullOrEmpty(serialNumber)) {
            return fn(new Error("Device serial number is required"), null);
        }

        if ($$.u.stringutils.isNullOrEmpty(contactId)) {
            return fn(new Error("Device contact id is required"), null);
        }

        /**
         * Validate user is registered
         */
        twonetSubscriptionDao.getById(contactId, function(err, user) {
            if (err) {
                return fn(err, null);
            }

            if (!user) {
                return fn(new Error("User " + contactId + " has not been registered"), null);
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
                    contactId,
                    serialNumber,
                    deviceType.attributes.model,
                    deviceType.attributes.manufacturer,
                    function (err, twonetDevice) {
                        if (err) {
                            return fn(err, null);
                        }

                        self.log.debug("Registered 2net device " + JSON.stringify(twonetDevice));

                        /**
                         * Register device with our platform
                         */
                        self._findUserDevice(contactId, serialNumber, deviceTypeId, twonetDevice.guid, function (err, device) {
                            if (err) {
                                // 2net has no api to unregister a device so not sure
                                // what happens to it
                                return fn(err, null);
                            }

                            if (device) {
                                self.log.debug("Found a matching platform device. Won't create a new one");
                                return fn(null, device);
                            }

                            deviceManager.createDevice(
                                deviceTypeId,
                                serialNumber,
                                twonetDevice.guid,
                                contactId,
                                function (err, platformDevice) {
                                    if (err) {
                                        // 2net has no api to unregister a device so not sure
                                        // what happens to it
                                        return fn(err, null);
                                    }

                                    self.log.debug("Registered platform device " + JSON.stringify(platformDevice));

                                    return fn(null, platformDevice);
                                })
                        })
                    })
            })
        })
    },

    unsubscribeContact: function(contactId, fn) {

        var self = this;

        twonetClient.userRegistration.unregister(contactId, function (err, response) {
            if (err) {
                self.log.error(err);
                return fn(err, null);
            }

            self.log.debug("succesfully unregistered user: " + response);

            /**
             * Delete registration record
             */
            twonetSubscriptionDao.removeById(contactId, function(err, res) {
                if (err) {
                    self.log.error(err);
                    return fn(err, null);
                }

                return fn(null, response);
            })
        })
    },

    pollForReadings: function(callback) {
        var self = this;

        self.log.info("polling...");

        twonetSubscriptionDao.findMany({ "_id": { $ne: "__counter__" } }, function(err, users) {
            if (err) {
                self.log.error(err.message);
                return callback(err);
            }

            if (users.length == 0) {
                self.log.info("found no users to poll")
                return callback();
            }

            // want to poll users sequentially (to avoid abusing the 2net api for now), hence this pattern
            function pollUser(user) {
                if (!user) {
                    self.log.info("no more users to poll");
                    return callback();
                }

                self.log.debug("polling devices for user " + user.attributes._id);

                deviceManager.findDevices({"userId": user.attributes._id}, function(err, devices) {
                    if (err) {
                        self.log.error(err.message);
                        return pollUser(users.shift());
                    }

                    function pollDevice(device) {
                        if (!device) {
                            // done with this user's devices, go on to next user
                            return pollUser(users.shift());
                        }

                        if (device.attributes.deviceTypeId == twonetDeviceTypes.DT_2NET_SCALE) {
                            self._recordLatestBodyMeasurement(device, function (err, response) {
                                if (err) {
                                    self.log.error(err.message);
                                }
                                pollDevice(devices.shift());
                            })
                        } else if (device.attributes.deviceTypeId == twonetDeviceTypes.DT_2NET_BPM) {
                            self._recordLatestBloodMeasurement(device, self._makeBPMReadingValues, function (err, response) {
                                if (err) {
                                    self.log.error(err.message);
                                }
                                pollDevice(devices.shift());
                            })
                        } else if (device.attributes.deviceTypeId == twonetDeviceTypes.DT_2NET_PULSEOX) {
                            self._recordLatestBloodMeasurement(device, self._makePulseOxReadingValues, function (err, response) {
                                if (err) {
                                    self.log.error(err.message);
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

    _recordLatestBloodMeasurement: function(device, valuesProvider, fn) {
        var self = this;

        self.log.info("polling device " + device.attributes._id + " (" + device.attributes.deviceTypeId
            + ") for user " + device.attributes.userId);

        twonetClient.bloodMeasurements.getLatestMeasurement(device.attributes.userId, device.attributes.externalId,
            function(err, twonetReading) {
                if (err) {
                    return fn(err, null);
                }
                self.log.debug(twonetReading);
                deviceManager.findReadings(
                    {
                        externalId: twonetReading.guid,
                        deviceId: device.attributes._id
                    }, function(err, readings) {
                        if (err) {
                            return fn(err, null);
                        }
                        if (readings.length > 0) {
                            return fn(null, null);
                        }

                        deviceManager.createReading(
                            device.attributes._id,
                            device.attributes.userId,
                            null,
                            valuesProvider(twonetReading),
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

    _recordLatestBodyMeasurement: function(device, fn) {
        var self = this;

        self.log.debug("polling device " + device.attributes._id + " (" + device.attributes.deviceTypeId
            + ") for user " + device.attributes.userId);

        twonetClient.bodyMeasurements.getLatestMeasurement(device.attributes.userId, device.attributes.externalId,
            function(err, twonetReading) {
                if (err) {
                    return fn(err, null);
                }
                self.log.debug(twonetReading);
                deviceManager.findReadings(
                    {
                        externalId: twonetReading.guid,
                        deviceId: device.attributes._id
                    }, function(err, readings) {
                        if (err) {
                            return fn(err, null);
                        }
                        if (readings.length > 0) {
                            return fn(null, null);
                        }

                        deviceManager.createReading(
                            device.attributes._id,
                            device.attributes.userId,
                            null,
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
        value[readingTypes.VT_WEIGHT] = twonetReading.body.weight;
        return [value];
    },

    _makeBPMReadingValues: function(twonetReading) {
        var value = {};
        value[readingTypes.VT_PULSE] = twonetReading.blood.pulse;
        value[readingTypes.VT_DIASTOLIC] = twonetReading.blood.diastolic;
        value[readingTypes.VT_SYSTOLIC] = twonetReading.blood.systolic;
        return [value];
    },

    _makePulseOxReadingValues: function(twonetReading) {
        var value = {};
        value[readingTypes.VT_PULSE] = twonetReading.blood.pulse;
        value[readingTypes.VT_SP02] = twonetReading.blood.spo2;
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