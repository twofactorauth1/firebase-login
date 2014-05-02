process.env.NODE_ENV = "testing";
var app = require('../../../../app');

var twonetClient = require('../index');

// the user uuid we'll register/unregister
var user_guid = "50f97bb9-a38d-46eb-8e5a-d1716aed1da3";
var scale_model = "UC-321PBT";
var scale_serial = "5130551101";
var scale_maker = "A&D";
var scale_guid;

exports.twonet_body = {

    /**
     * We need a user and a scale assigned
     */
    register: function(test) {
        /*
         *
         */
        twonetClient.userRegistration.register(user_guid, function(err, response) {
            if (err) throw err;

            twonetClient.deviceRegistration.register2netDevice(user_guid, scale_serial, scale_model, scale_maker,
                function (err, response) {
                    if (err) throw err;

                    scale_guid = response.guid;
                    if (typeof scale_guid == 'string' && scale_guid) {
                        test.done();
                    } else {
                        throw new Error("Unable to register device");
                    }
                }
            );
        });
    },

    getLatestMeasurement: function(test) {
        test.expect(3);
        twonetClient.bodyMeasurements.getLatestMeasurement(user_guid, scale_guid, function(err, reading) {
            if (err) {
                test.ok(false, err);
            } else {
                test.ok(reading);
                // they suddenly changed everything to string
                //test.equals(typeof reading.body.weight, 'number');
                //test.equals(typeof reading.time, 'number');
                test.ok(reading.body.weight);
                test.ok(reading.time);
                console.log("weight: " + reading.body.weight + " on " + new Date(reading.time * 1000));
                test.done();
            }
        });
    },

    getMeasurementsByRange: function(test) {
        test.expect(6);
        var startDate = 1395100800; // 3/18/2014
        var endDate = 1395668450; // 3/24/2014
        twonetClient.bodyMeasurements.getMeasurementsByRange(user_guid, scale_guid, startDate, endDate,
            function(err, readings) {
                if (err) {
                    test.ok(false, err);
                } else {
                    test.ok(readings);
                    test.equals(readings.length, 5);

                    // sort readings so we can do some comparisons
                    readings.sort(function(a,b){
                        return a.time - b.time;
                    });
                    test.equals(readings[0].time, 1395149628);
                    test.equals(readings[0].body.weight, 174.80452);
                    test.equals(readings[0].device.time, "2014-03-18 13:44:49");
                    test.equals(readings[0].guid, "9d5087ab-49c8-4e85-f3e0-04b42cb56d39");
                }
                test.done();
        });
    },

    /**
     * Unregister the user
     */
    unregister: function(test) {
        /*
         * Unregister
         */
        twonetClient.userRegistration.unregister(user_guid, function(err, response) {
            if (err) throw err;

            test.done();
        });
    }
};