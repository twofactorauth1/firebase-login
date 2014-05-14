process.env.NODE_ENV = "testing";
var app = require('../../../app');

var valueTypeDao = require('../dao/valuetype.dao.js');
var readingTypeDao = require('../dao/readingtype.dao.js');
var deviceTypeDao = require('../dao/devicetype.dao.js');
var deviceDao = require('../dao/device.dao.js');

var valueType1key = "kilograms";
var readingType1key = "weight";
var deviceType1key = "scale";

exports.device_dao_test = {
    setUp: function(cb) {
        valueTypeDao.createValueType(valueType1key, "kg", "body weight", function(err, vt) {
            if (err) {
                console.log(err.stack);
                throw err;
            }
            readingTypeDao.createReadingType(readingType1key, "weight_rt", [vt.attributes._id], function (err, rt) {
                if (err) {
                    console.log(err.stack);
                    throw err;
                }
                deviceTypeDao.createDeviceType(deviceType1key, "desc", "1", "acme", [rt.attributes._id],
                    function (err, dt) {
                        if (err) {
                            console.log(err.stack);
                            throw err;
                        }
                        cb();
                    });
            });
        });
    },

    tearDown: function(cb) {
        deviceTypeDao.removeById(deviceType1key, function(err, res) {
            if (err) {
                throw err;
            }
            readingTypeDao.removeById(readingType1key, function (err, res) {
                if (err) {
                    throw err;
                }
                valueTypeDao.removeById(valueType1key, function (err, res) {
                    if (err) {
                        throw err;
                    }
                    cb();
                })
            })
        })
    },

    createDeviceNoDeviceType: function(test) {
        deviceDao.createDevice("a device type", null, null, null, function(err, device) {
            test.ok(err);
            test.ok(err.toString().indexOf("not found") > -1);
            test.ok(!device);
            test.done();
        })
    },

    createDevice: function(test) {
        test.expect(5);
        deviceDao.createDevice(deviceType1key, "SN001", "EI001", null, function(err, device) {
            if (err) {
                test.ok(false, err);
                return test.done();
            }

            deviceDao.getById(device.attributes._id, function(err, result) {
                if (err) {
                    test.ok(false, err);
                    return test.done();
                }
                console.log(result);
                test.equals(result.attributes.serialNumber, "SN001");
                test.equals(result.attributes.externalId, "EI001");
                test.equals(result.attributes.deviceTypeId, deviceType1key);
                test.equals(result.attributes.userId, null);

                deviceDao.removeById(result.attributes._id, function (err, resp) {
                    test.ok(!err);
                    test.done();
                });
            })
        })
    },

    createDeviceNoSerial: function(test) {
        test.expect(5);
        deviceDao.createDevice(deviceType1key, null, null, null, function(err, device) {
            if (err) {
                test.ok(false, err);
                return test.done();
            }

            deviceDao.getById(device.attributes._id, function(err, result) {
                if (err) {
                    test.ok(false, err);
                    return test.done();
                }
                test.equals(result.attributes.serialNumber, null);
                test.equals(result.attributes.externalId, null);
                test.equals(result.attributes.deviceTypeId, deviceType1key);
                test.equals(result.attributes.userId, null);

                deviceDao.removeById(result.attributes._id, function (err, resp) {
                    test.ok(!err);
                    test.done();
                });
            })
        })
    }
};
