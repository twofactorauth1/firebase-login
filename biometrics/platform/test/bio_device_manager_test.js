process.env.NODE_ENV = "testing";
var app = require('../../../app');

var DeviceManager = require('../bio_device_manager.js');

var readingTypeDao = require('../dao/readingtype.dao.js');
var deviceTypeDao = require('../dao/devicetype.dao.js');
var deviceDao = require('../dao/device.dao.js');

var readingType1key = "bio_device_manager_test.Weight";
var deviceType1key = "bio_device_manager_test.Scale";
var device1key;

exports.bio_device_manager_test = {
    setUp: function(cb) {
        readingTypeDao.createReadingType(readingType1key, "kg", "body weight", function(err, rt) {
            if (err) {
                throw err;
            }

            deviceTypeDao.createDeviceType(deviceType1key, "desc", "1", "acme", [rt.attributes._id],
                function(err, dt) {
                    if (err) {
                        throw err;
                    }

                    deviceDao.createDevice(deviceType1key, "SN001", "EI001", function(err, device) {
                        if (err) {
                            test.ok(false, err);
                            return test.done();
                        }
                        device1key = device.attributes._id;
                        cb();
                    });
                });
        });
    },

    tearDown: function(cb) {
        deviceDao.removeById(device1key, function(err, res) {
            if (err) {
                throw err;
            }
            deviceTypeDao.removeById(deviceType1key, function (err, res) {
                if (err) {
                    throw err;
                }
                readingTypeDao.removeById(readingType1key, function (err, res) {
                    if (err) {
                        throw err;
                    }
                    cb();
                })
            })
        });
    },

    testAssignUnassign: function(test) {
        test.expect(3);
        deviceDao.getById(device1key, function(err, originalDevice) {
            if (err) {
                test.ok(false, err);
                return test.done();
            }

            // verify it's currently unassigned
            test.equals(originalDevice.attributes.userId, null);

            DeviceManager.assignDevice(device1key, "hannibal", function(err, result) {
                if (err) {
                    test.ok(false, err);
                    return test.done();
                }
                test.equals(result.attributes.userId, "hannibal");
                DeviceManager.unassignDevice(device1key, function(err, result) {
                    if (err) {
                        test.ok(false, err);
                        return test.done();
                    }
                    test.equals(result.attributes.userId, null);
                    test.done();
                })
            });
        });
    },

    testBadAssignUnassign: function(test) {
        test.expect(4);
        DeviceManager.assignDevice("bad_device", "hannibal", function(err, result) {
            test.ok(err);
            test.equals(result, null);

            DeviceManager.unassignDevice("bad_device", function(err, result) {
                test.ok(err);
                test.equals(result, null);
                test.done();
            });
        });
    }
};