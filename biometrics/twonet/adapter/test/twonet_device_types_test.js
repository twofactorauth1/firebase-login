process.env.NODE_ENV = "testing";
var app = require('../../../../app');

var twonetDeviceTypes = require('../twonet_device_types.js');

exports.init_test = {
    testInitDB: function (test) {
        test.expect(1);
        twonetDeviceTypes.initDB(function(err, numDeviceTypes) {
            if (err) {
                test.ok(false, err);
                return test.done();
            }

            test.equals(numDeviceTypes, 3);
            return test.done();
        })
    },

    testDeviceTypeIds: function(test) {
        test.equals(twonetDeviceTypes.getDeviceTypeIds().length, 3);
        test.done();
    },

    testIsValidDeviceType: function(test) {
        test.ok(twonetDeviceTypes.isValidDeviceType('2net_bpm'));
        test.ok(twonetDeviceTypes.isValidDeviceType('2net_scale'));
        test.ok(twonetDeviceTypes.isValidDeviceType('2net_pulseox'));
        test.ok(!twonetDeviceTypes.isValidDeviceType('bad_device_type'));
        test.done();
    }
};
