process.env.NODE_ENV = "testing";
var app = require('../../../../app');

var init = require('../twonet_init_device_types.js');

exports.init_test = {
    init: function (test) {
        init.initialize(function(err, numDeviceTypes) {
            if (err) {
                test.ok(false, err);
                return test.done();
            }

            test.equals(numDeviceTypes, 3);
            return test.done();
        });
    }
};
