process.env.NODE_ENV = "testing";
var app = require('../../../app');

var readingTypeDao = require('../dao/readingtype.dao.js');
var deviceTypeDao = require('../dao/devicetype.dao.js');
var deviceDao = require('../dao/device.dao.js');
var readingDao = require('../dao/reading.dao.js');

var readingType1key = "device_dao_rt1_Weight";
var deviceType1key = "device.dao.dt1:Scale";

var device1key;

exports.reading_dao_test = {
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

                    deviceDao.createDevice(deviceType1key, "SN001", "EI001", null, function(err, device) {
                        if (err) {
                            throw err;
                        }
                        device1key = device.attributes._id;
                        cb();
                    })
                })
        })
    },

    tearDown: function(cb) {
        deviceTypeDao.removeById(deviceType1key, function(err, res) {
            if (err) {
                console.error(err.message);
            }
            readingTypeDao.removeById(readingType1key, function(err, res){
                if (err) {
                    console.error(err.message);
                }
                deviceDao.removeById(device1key, function(err, res) {
                    if (err) {
                        console.error(err.message);
                    }
                    cb();
                })
            })
        })
    },

    createReadingNoDevice: function(test) {
        readingDao.createReading("bad device id", "a contact id", [], null, null, function(err, reading) {
            test.ok(err);
            test.ok(err.toString().indexOf(" found ") > -1);
            test.ok(!reading);
            test.done();
        })
    },

    createReading: function(test) {
        test.expect(6);

        var readingValue1 = {}
        readingValue1[readingType1key] = "213";

        readingDao.createReading(device1key, "a contact id", [readingValue1], "EXTID1", null, function(err, reading) {
            if (err) {
                test.ok(false, err.message);
                return test.done();
            }

            readingDao.getById(reading.attributes._id, function(err, result) {
                if (err) {
                    test.ok(false, err.message);
                    return test.done();
                }
                console.debug(JSON.stringify(result));
                test.equals(result.attributes.externalId, "EXTID1");
                test.equals(result.attributes.deviceId, device1key);
                test.equals(result.attributes.values.length, 1);
                test.equals(result.attributes.values[0][readingType1key], "213");
                test.ok(result.attributes.time);

                readingDao.removeById(result.attributes._id, function (err, resp) {
                    test.ok(!err);
                    test.done();
                });
            })
        })
    }
};
