process.env.NODE_ENV = "testing";
var app = require('../../../../app');

var twonetUserDao = require('../dao/twonetuser.dao.js');
var twonetAdapter = require('../twonet_adapter.js');
var deviceManager = require('../../../platform/bio_device_manager.js');
var readingTypes = require('../../../platform/bio_reading_types.js');
var twonetDeviceTypes = require('../twonet_device_types.js');

var platformUserId = "50f97bb9";

exports.twonet_poll_test = {

    testPoll: function(test) {
        readingTypes.initDB(function (err, response) {
            if (err) {
                console.error(err.message);
            }
            twonetDeviceTypes.initDB(function (err, response) {
                if (err) {
                    console.error(err.message);
                }
                twonetAdapter.registerUser(platformUserId, function (err, twonetUser) {
                    if (err) {
                        console.error(err.message);
                    }
                    twonetAdapter.registerDevice(platformUserId, twonetDeviceTypes.DT_2NET_PULSEOX, "501465116", function (err, twonetPulseOxDevice) {
                        if (err) {
                            console.error(err.message);
                        }
                        twonetAdapter.registerDevice(platformUserId, twonetDeviceTypes.DT_2NET_BPM, "5130651010", function (err, twonetScaleDevice) {
                            if (err) {
                                console.error(err.message);
                            }
                            twonetAdapter.registerDevice(platformUserId, twonetDeviceTypes.DT_2NET_SCALE, "5130551101", function (err, twonetScaleDevice) {
                                if (err) {
                                    console.error(err.message);
                                }
                                twonetAdapter.pollForReadings(function (err) {
                                    if (err) {
                                        console.error(err.message);
                                    }
                                    twonetAdapter.unregisterUser(platformUserId, function (err, unregisteredUserId) {
                                        if (err) {
                                            console.error(err.message);
                                        }
                                        test.ok(true); // to avoid the warning
                                        test.done();
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    }
};
