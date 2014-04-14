process.env.NODE_ENV = "testing";
var app = require('../../app');

var init = require('../bio_init_reading_types.js');

exports.init_test = {
    init: function (test) {
        init.initialize(function(err, numReadingTypes) {
            if (err) {
                test.ok(false, err);
                return test.done();
            }

            test.equals(numReadingTypes, 5);
            return test.done();
        });
    }
};