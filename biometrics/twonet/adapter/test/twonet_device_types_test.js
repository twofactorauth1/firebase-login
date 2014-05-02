process.env.NODE_ENV = "testing";
var app = require('../../../../app');

var twonetDeviceTypes = require('../twonet_device_types.js');
var readingTypes = require('../../../platform/bio_reading_types.js');

exports.init_test = {
    testInitDB: function (test) {
        test.expect(1);
        readingTypes.initDB(function() {
            twonetDeviceTypes.initDB(function (err, numDeviceTypes) {
                if (err) {
                    test.ok(false, err.message);
                    return test.done();
                }

                test.equals(numDeviceTypes, 3);
                return test.done();
            })
        })
    },

    testDeviceTypeIds: function(test) {
        test.equals(twonetDeviceTypes._deviceTypeIds.length, 3);
        test.done();
    },

    testIsValidDeviceType: function(test) {
        test.ok(twonetDeviceTypes.isValidDeviceType(twonetDeviceTypes.DT_2NET_BPM));
        test.ok(twonetDeviceTypes.isValidDeviceType(twonetDeviceTypes.DT_2NET_SCALE));
        test.ok(twonetDeviceTypes.isValidDeviceType(twonetDeviceTypes.DT_2NET_PULSEOX));
        test.ok(!twonetDeviceTypes.isValidDeviceType('bad_device_type'));
        test.done();
    }
};
