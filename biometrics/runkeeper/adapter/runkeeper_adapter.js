var runkeeperClient = require('../client/runkeeper_client'),
    subscriptionDao = require('./dao/runkeepersubscription.dao'),
    valueTypes = require('../../platform/bio_value_types.js'),
    deviceManager = require('../../platform/bio_device_manager.js'),
    rkDeviceTypes = require('./runkeeper_device_types.js');

module.exports = {

    log: $$.g.getLogger("runkeeper_adapter"),

    getAuthorizationURL: function(contactId) {
        return runkeeperClient.getAuthorizationURL(contactId);
    },

    subscribe: function(contactId, authorizationCode, callback) {

        var self = this;

        runkeeperClient.authorizeUser(authorizationCode, function(err, accessToken) {
            if (err) {
                self.log.error("failed to retrieve access token from RunKeeper for contact " + contactId
                    + " and authorizationCode " + authorizationCode);
                self.log.error(err.message);
                return callback(err, null);
            }

            self.log.debug("contact " + contactId + " successfully authorized by RunKeeper");

            subscriptionDao.createSubscription(contactId, accessToken, function(err, subscription) {
                if (err) {
                    self.log.error("failed to save subscription: " + err.message);
                    self.log.info("de-authorizing contact " + contactId);

                    runkeeperClient.deAuthorizeUser(accessToken, function(err, value) {
                        if (err) {
                            self.log.error("failed to de-authorize user: " + err.message);
                        }
                        return callback(err, null);
                    })
                } else {
                    self.log.debug("RunKeeper subscription created: " + JSON.stringify(subscription));

                    /**
                     * Create "device" (source) so that we can record readings to
                     */
                    deviceManager.createDevice(
                        rkDeviceTypes.DT_RUNKEEPER,
                        null,
                        null,
                        contactId,
                        function (err, platformDevice) {
                            if (err) {
                                self.log.error("Failed to create a runkeeper device for contact " + contactId);
                                self.log.error(err.message);
                            } else {
                                self.log.debug("Created runkeeper device: " + JSON.stringify(platformDevice));
                            }

                            return callback(null, subscription);
                        })
                }
            })
        })
    },

    unsubscribe: function(contactId, callback) {
        var self = this;

        subscriptionDao.getById(contactId, function(error, subscription) {
            if (error) {
                self.log.error(error.message);
                return callback(error, null);
            }

            if (!subscription) {
                return callback(new Error("No subscription was found for contact id " + contactId), null);
            }

            runkeeperClient.deAuthorizeUser(subscription.attributes.accessToken, function(error, value) {
                if (error) {
                    self.log.error("failed to deauthorize user: " + error.message);
                    return callback(error, null);
                }

                // remove subscription
                subscriptionDao.removeById(subscription.attributes._id, function(error, value) {
                    if (error) {
                        self.log.error("failed to remove subscription " + subscription.attributes._id
                            + ": " + error.message);
                    }
                    return callback(error, value);
                })
            })

        })
    },

    recordRunkeeperActivity: function(device, runkeeperActivity, fn) {
        var self = this;

        self.log.debug(runkeeperActivity);

        deviceManager.findReadings(
            {
                externalId: runkeeperActivity.uri,
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
                    rkDeviceTypes.RT_RK_ACTIVITY,
                    self._makeRunkeeperActivityValues(runkeeperActivity),
                    runkeeperActivity.uri,
                    Math.floor(Date.parse(runkeeperActivity.start_time)/1000),
                    Math.floor(Date.parse(runkeeperActivity.start_time)/1000 + runkeeperActivity.duration),
                    function(err, platformReading) {
                        if (err) {
                            return fn(err, null);
                        }
                        return fn(null, platformReading);
                    }
                )
            })
    },

    /**
     *
     * @param runkeeperActivity
     *
     {
        "duration": 3011.815,
        "total_distance": 8975.31755549352,
        "has_path": true,
        "entry_mode": "API",
        "source": "RunKeeper",
        "start_time": "Thu, 15 May 2014 12:25:09",
        "total_calories": 762,
        "type": "Running",
        "uri": "/fitnessActivities/354605628"
     }
     *
     * @returns {*[]}
     * @private
     */
    _makeRunkeeperActivityValues: function(runkeeperActivity) {

        var value1 = {};
        value1.valueTypeId = valueTypes.VT_CALORIES;
        value1.value = runkeeperActivity.total_calories;

        var value2 = {}
        value2.valueTypeId = valueTypes.VT_DISTANCE;
        value2.value = runkeeperActivity.total_distance;

        var value3 = {}
        value3.valueTypeId = valueTypes.VT_ACTIVITY_TYPE;
        value3.value = runkeeperActivity.type;

        return [value1, value2, value3];
    }
};