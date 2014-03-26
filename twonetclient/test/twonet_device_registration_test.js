var twonetClient = require('../../twonetclient');

// the user uuid we'll register/unregister
var user_guid = "50f97bb9-a38d-46eb-8e5a-d1716aed1da3";

// devices we'll register
var bpm_guid;
var scale_guid;
var pulseox_guid;
var earthermo_guid;

exports.twonet_device_registration = {

    register: function(test) {
        twonetClient.userRegistration.register(user_guid, function(err, response) {
            if (err) {
                test.ok(false, err);
            }
            test.done();
        });
    },

    getRegisterableDevices: function(test) {
        test.expect(1);

        twonetClient.deviceRegistration.getRegisterableDevices(user_guid, function(err, response) {
            if (err) {
                test.ok(false, err);
            } else {
                test.ok(response);
            }
            test.done();
        });
    },

    register2netBPM: function(test) {
        test.expect(2);
        twonetClient.deviceRegistration.register2netDevice(user_guid, '5130651010', 'UA-767PBT', 'A&D',
            function(err, response) {
                if (err) {
                    test.ok(false, err);
                } else {
                    test.ok(response);
                    bpm_guid = response['trackRegistrationResponse']['trackDetail']['guid'];
                    console.log("bpm_guid " + bpm_guid);
                    test.ok(typeof bpm_guid == 'string' && bpm_guid);
                }
                test.done();
            });
    },

    register2netScale: function(test) {
        test.expect(2);
        twonetClient.deviceRegistration.register2netDevice(user_guid, '5130551101', 'UC-321PBT', 'A&D',
            function(err, response) {
                if (err) {
                    test.ok(false, err);
                } else {
                    test.ok(response);
                    scale_guid = response['trackRegistrationResponse']['trackDetail']['guid'];
                    console.log("scale_guid " + scale_guid);
                    test.ok(typeof scale_guid == 'string' && scale_guid);
                }
                test.done();
            });
    },

    register2netPulseOx: function(test) {
        test.expect(2);
        twonetClient.deviceRegistration.register2netDevice(user_guid, '501465116', '9560 Onyx II', 'Nonin',
            function(err, response) {
                if (err) {
                    test.ok(false, err);
                } else {
                    test.ok(response);
                    pulseox_guid = response['trackRegistrationResponse']['trackDetail']['guid'];
                    console.log("pulseox_guid " + pulseox_guid);
                    test.ok(typeof pulseox_guid == 'string' && pulseox_guid);
                }
                test.done();
            });
    },

    register2netEarThermometer: function(test) {
        test.expect(2);
        // It appears the 2net API does not support the IR20b model, IR21B was accepted but will see whether we can
        // actually pull readings later
        twonetClient.deviceRegistration.register2netDevice(user_guid, '1261612110005497', 'IR21B', 'Fora',
            function(err, response) {
                if (err) {
                    test.ok(false, err);
                } else {
                    test.ok(response);
                    earthermo_guid = response['trackRegistrationResponse']['trackDetail']['guid'];
                    console.log("earthermo_guid " + earthermo_guid);
                    test.ok(typeof earthermo_guid == 'string' && earthermo_guid);
                }
                test.done();
            });
    },

    getUserDevices: function(test) {
        test.expect(8);

        twonetClient.deviceRegistration.getUserDevices(user_guid, function(err, response) {
            if (err) {
                test.ok(false, err);
            } else {
                test.ok(response);
                this.deviceArray = response['trackDetailsResponse']['trackDetails']['trackDetail'];
                test.ok(this.deviceArray instanceof Array);
                test.equals(this.deviceArray.length, 4);
                this.guidArray = [];
                for(var i=0; i < this.deviceArray.length; i++) {
                    console.log('in device array:' + this.deviceArray[i]['guid']);
                    this.guidArray.push(this.deviceArray[i]['guid']);
                }
                test.equals(this.guidArray.length, this.deviceArray.length);
                test.ok(_.contains(this.guidArray, scale_guid));
                test.ok(_.contains(this.guidArray, pulseox_guid));
                test.ok(_.contains(this.guidArray, bpm_guid));
                test.ok(_.contains(this.guidArray, earthermo_guid));
            }
            test.done();
        });
    },

    unregister: function(test) {
        twonetClient.userRegistration.unregister(user_guid, function(err, response) {
            if (err) {
                test.ok(false, err);
            }
            test.done();
        });
    }
};