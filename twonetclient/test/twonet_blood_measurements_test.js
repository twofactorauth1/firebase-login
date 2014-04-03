var twonetClient = require('../../twonetclient');

// the user uuid we'll register/unregister
var user_guid = "50f97bb9-a38d-46eb-8e5a-d1716aed1da3";
var bpm_model = "UA-767PBT";
var bpm_serial = "5130651010";
var bpm_maker = "A&D";
var bpm_guid;

var pulseox_model = "9560 Onyx II";
var pulseox_serial = "501465116";
var pulseox_maker = "Nonin";
var pulseox_guid;

exports.twonet_blood = {

    /**
     * We need a user and devices
     */
    register: function(test) {

        // register user
        twonetClient.userRegistration.register(user_guid, function(err, response) {
            if (err) throw err;

            // register BPM
            twonetClient.deviceRegistration.register2netDevice(user_guid, bpm_serial, bpm_model, bpm_maker,
                function (err, response) {
                    if (err) throw err;
                    bpm_guid = response.guid;

                    // register pulseox
                    twonetClient.deviceRegistration.register2netDevice(user_guid, pulseox_serial, pulseox_model,
                        pulseox_maker, function (err, response) {
                            if (err) throw err;
                            pulseox_guid = response.guid;
                            test.done();
                        });
                }
            );
        });
    },

    getLatestMeasurementBPM: function(test) {
        test.expect(3);
        twonetClient.bloodMeasurements.getLatestMeasurement(user_guid, bpm_guid, function(err, reading) {
            if (err) {
                test.ok(false, err);
            } else {
                test.ok(reading);
                test.ok(reading.time);
                test.ok(reading.blood);
                test.done();
            }
        });
    },

    getLatestMeasurementPulseOx: function(test) {
        test.expect(3);
        twonetClient.bloodMeasurements.getLatestMeasurement(user_guid, pulseox_guid, function(err, reading) {
            if (err) {
                test.ok(false, err);
            } else {
                test.ok(reading);
                test.ok(reading.time);
                test.ok(reading.blood);
                test.done();
            }
        });
    },

    getMeasurementsByRangeBPM: function(test) {
        test.expect(7);
        var startDate = 1395100800;
        var endDate = 1396555185;
        twonetClient.bloodMeasurements.getMeasurementsByRange(user_guid, bpm_guid, startDate, endDate,
            function(err, readings) {
                if (err) {
                    test.ok(false, err);
                } else {
                    test.ok(readings);
                    test.equals(readings.length, 9);

                    // sort readings so we can do some comparisons
                    readings.sort(function(a,b){
                        return a.time - b.time;
                    });
                    test.equals(readings[0].time, 1395668223);
                    test.equals(readings[0].blood.pulse, 116.0);
                    test.equals(readings[0].blood.systolic, 106.0);
                    test.equals(readings[0].blood.diastolic, 86.0)
                    test.equals(readings[0].guid, "fbe588b1-153f-35a2-b94c-d57ec3595eea");
                }
                test.done();
        });
    },

    getMeasurementsByRangePulseOx: function(test) {
        test.expect(6);
        var startDate = 1395100800;
        var endDate = 1396555185;
        twonetClient.bloodMeasurements.getMeasurementsByRange(user_guid, pulseox_guid, startDate, endDate,
            function(err, readings) {
                if (err) {
                    test.ok(false, err);
                } else {
                    test.ok(readings);
                    test.equals(readings.length, 7);

                    // sort readings so we can do some comparisons
                    readings.sort(function(a,b){
                        return a.time - b.time;
                    });

                    test.equals(readings[0].time, 1395668210);
                    test.equals(readings[0].blood.pulse, 109.0);
                    test.equals(readings[0].blood.spo2, 96.0);
                    test.equals(readings[0].guid, "52916783-7f1d-6c17-f6e0-6f5d73b1a0d5");
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