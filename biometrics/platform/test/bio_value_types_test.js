process.env.NODE_ENV = "testing";
var app = require('../../../app');

var valueTypes = require('../bio_value_types.js');

exports.bio_vaLue_types_test = {
    testInitDB: function (test) {
        valueTypes.initDB(function(err, numValueTypes) {
            if (err) {
                test.ok(false, err);
                return test.done();
            }

            test.equals(numValueTypes, 5);
            return test.done();
        });
    }
};
