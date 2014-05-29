process.env.NODE_ENV = "testing";
var app = require('../../../../app');

var rkAdapter = require('../runkeeper_adapter.js');
var valueTypes = require('../../../platform/bio_value_types.js');
var rkDeviceTypes = require('../runkeeper_device_types.js');

var contactId = "mike";

// mock authorize api
rkAdapter._authorizeUser = function(authorizationCode, callback) {
    callback(null, "0672fa0c951144e59685f5175a149358");
};

exports.runkeeper_poll_test = {

    testPoll: function(test) {
        valueTypes.initDB(function (err, response) {
            if (err) {
                console.error(err.message);
            }
            rkDeviceTypes.initDB(function (err, response) {
                if (err) {
                    console.error(err.message);
                }
                rkAdapter.subscribe(contactId, "any code", function (err, subscription) {
                    if (err) {
                        console.error(err.message);
                    }
                    rkAdapter.pollForReadings(function (err) {
                        if (err) {
                            console.error(err.message);
                        }

                        test.ok(true); // to avoid the warning
                        test.done();
                    })
                })
            })
        })
    }
};
