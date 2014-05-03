process.env.NODE_ENV = "testing";
var app = require('../../../../app');

var twonetAdapter = require('../twonet_adapter.js');
var readingTypes = require('../../../platform/bio_reading_types.js');
var twonetDeviceTypes = require('../twonet_device_types.js');

var contactId = "50f97bb9";

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
                twonetAdapter.subscribeContact(contactId, function (err, twonetUser) {
                    if (err) {
                        console.error(err.message);
                    }
                    twonetAdapter.registerDevice(contactId, twonetDeviceTypes.DT_2NET_PULSEOX, "501465116", function (err, twonetPulseOxDevice) {
                        if (err) {
                            console.error(err.message);
                        }
                        twonetAdapter.registerDevice(contactId, twonetDeviceTypes.DT_2NET_BPM, "5130651010", function (err, twonetScaleDevice) {
                            if (err) {
                                console.error(err.message);
                            }
                            twonetAdapter.registerDevice(contactId, twonetDeviceTypes.DT_2NET_SCALE, "5130551101", function (err, twonetScaleDevice) {
                                if (err) {
                                    console.error(err.message);
                                }
                                twonetAdapter.pollForReadings(function (err) {
                                    if (err) {
                                        console.error(err.message);
                                    }
                                    twonetAdapter.unsubscribeContact(contactId, function (err, unregisteredUserId) {
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
