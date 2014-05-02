process.env.NODE_ENV = "testing";
var app = require('../../../app');

var readingTypes = require('../bio_reading_types.js');

exports.bio_reading_types_test = {
    testInitDB: function (test) {
        readingTypes.initDB(function(err, numReadingTypes) {
            if (err) {
                test.ok(false, err);
                return test.done();
            }

            test.equals(numReadingTypes, 5);
            return test.done();
        });
    }
};
