process.env.NODE_ENV = "testing";
var app = require('../../../../app'),
    rkClient = require('../../client/runkeeper_client'),
    deviceManager = require('../../../platform/bio_device_manager.js'),
    rkDeviceTypes = require('../runkeeper_device_types.js'),
    rkAdapter = require('../runkeeper_adapter.js'),
    valueTypes = require('../../../platform/bio_value_types.js');

var mikeAccessToken = "0672fa0c951144e59685f5175a149358";
var rkDevice = null;
var rkReading = null;
var contactId = "mike";

exports.runkeeper_adapter_test = {

    setUp: function(cb) {
        valueTypes.initDB(function() {
            rkDeviceTypes.initDB(function () {
                deviceManager.createDevice(
                    rkDeviceTypes.DT_RUNKEEPER,
                    null,
                    null,
                    contactId,
                    function (err, platformDevice) {
                        if (err) {
                            console.error("Failed to create a runkeeper device for contact " + contactId);
                            console.error(err.message);
                        } else {
                            console.debug("Created runkeeper device: " + JSON.stringify(platformDevice));
                        }

                        rkDevice = platformDevice;
                        cb();
                    })
            })
        })
    },

    tearDown: function(cb) {
        $$.dao.DeviceDao.removeById(rkDevice.attributes._id, function(err, res) {
            if (err) {
                console.error("failed to remove device " + rkDevice.attributes._id);
                console.error(err.message);
            } else {
                console.log("device removed");
            }
            $$.dao.ReadingDao.removeById(rkReading.attributes._id, function(err, res) {
                if (err) {
                    console.error("failed to remove reading " + rkReading.attributes._id);
                } else {
                    console.log("reading removed");
                }
                cb();
            })
        })
    },

    testFitnessActivityFeed: function (test) {

        var sinceSeconds = 1400126400;
        var untilSeconds = 1400212740;

        rkClient.getFitnessActivityFeed(mikeAccessToken, sinceSeconds, untilSeconds, function(err, value) {
            test.expect(15);
            if (err) {
                test.ok(false, err.message);
            } else {
                console.log(JSON.stringify(value, undefined, 2));
                /**
                 {
                  "items": [
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
                    },
                    {
                      "duration": 3849.641,
                      "total_distance": 13093.8837974208,
                      "has_path": true,
                      "entry_mode": "API",
                      "source": "RunKeeper",
                      "start_time": "Thu, 15 May 2014 05:05:52",
                      "total_calories": 1068,
                      "type": "Running",
                      "uri": "/fitnessActivities/354346783"
                    }
                  ],
                  "size": 2
                }
                 */
                test.equals(value.items.length, 2);
                test.equals(value.size, 2);

                rkAdapter.recordRunkeeperActivity(rkDevice, value.items[0], function(err, reading) {
                    if (err) {
                        console.error(err.message);
                        test.ok(false, "Failed to record runkeeper activity");
                        test.done();
                    } else {
                        console.log("Got reading: " + JSON.stringify(reading));
                        test.equals(reading.attributes.deviceId, rkDevice.attributes._id);
                        test.equals(reading.attributes.contactId, contactId);
                        test.equals(reading.attributes.externalId, "/fitnessActivities/354605628");
                        test.equals(reading.attributes.readingTypeId, rkDeviceTypes.RT_RK_ACTIVITY);
                        test.equals(reading.attributes.time, 1400171109);
                        test.equals(reading.attributes.endTime, 1400174120);
                        test.equals(reading.attributes.values.length, 3);
                        test.equals(reading.attributes.values[0].valueTypeId, valueTypes.VT_CALORIES);
                        test.equals(reading.attributes.values[0].value, 762);
                        test.equals(reading.attributes.values[1].valueTypeId, valueTypes.VT_DISTANCE);
                        test.equals(reading.attributes.values[1].value, 8975.31755549352);
                        test.equals(reading.attributes.values[2].valueTypeId, valueTypes.VT_ACTIVITY_TYPE);
                        test.equals(reading.attributes.values[2].value, "Running");
                        rkReading = reading;
                        test.done();
                    }
                })
            }
        })
    }

//    testFitnessActivity: function (test) {
//
//        rkClient.getFitnessActivity(mikeAccessToken, "348749601", function(err, value) {
//            if (err) {
//                test.ok(false, err.message);
//            } else {
//                console.log(JSON.stringify(value, undefined, 2));
//            }
//            test.done();
//        })
//    }
};
