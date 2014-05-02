process.env.NODE_ENV = "testing";
var app = require('../../../../app');

var twonetUserDao = require('../dao/twonetuser.dao.js');
var twonetAdapter = require('../twonet_adapter.js');
var deviceManager = require('../../../platform/bio_device_manager.js');
var readingTypes = require('../../../platform/bio_reading_types.js');
var twonetDeviceTypes = require('../twonet_device_types.js');

var platformUserId = "50f97bb9";

exports.twonet_poll_test = {

//    test_findUserDevice: function(test) {
//        twonetAdapter._findUserDevice("50f97bb9-a38d-46eb-8e5a-d1716aed1da6", "SN001", "2net_scale", "2b6803b5-b464-16c1-12b6-b597399b7aff", function(err, device){
//            if (err) {
//                test.ok(false, err.message);
//            }
//            console.log(device);
//            test.done();
//        })
//    }

    testPoll: function(test) {

        /**
         * Init reading types
         */
        readingTypes.initDB(function (err, response) {
            if (err) {
                console.error(err.message);
            }

            /**
             * Init device types
             */
            twonetDeviceTypes.initDB(function (err, response) {
                if (err) {
                    console.error(err.message);
                }


                twonetAdapter.registerUser(platformUserId, function (err, twonetUser) {
                    if (err) {
                        console.error(err.message);
                    }

                    twonetAdapter.registerDevice(platformUserId, "2net_scale", "5130551101", function (err, platformDevice) {
                        if (err) {
                            console.error(err.message);
                        }

                        twonetAdapter.pollForReadings(15, function (err, response) {
                            if (err) {
                                console.error(err.message);
                            }

                            twonetAdapter.unregisterUser(platformUserId, function (err, unregisteredUserId) {
                                if (err) {
                                    console.error(err.message);
                                }
                                test.ok(true);
                                test.done();
                            })
                        })
                    })
                })
            })
        })
    }
};
