var twonetClient = require('../../twonetclient');

// the user uuid we'll register/unregister
var user_guid = "50f97bb9-a38d-46eb-8e5a-d1716aed1da3";

// devices we'll register
var bpm_guid;
var scale1_guid;
var scale2_guid;

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

    register2netScale1: function(test) {
        test.expect(2);
        twonetClient.deviceRegistration.register2netDevice(user_guid, '5130551101', 'UC-321PBT', 'A&D',
            function(err, response) {
                if (err) {
                    test.ok(false, err);
                } else {
                    test.ok(response);
                    scale1_guid = response['trackRegistrationResponse']['trackDetail']['guid'];
                    console.log("scale1_guid " + scale1_guid);
                    test.ok(typeof scale1_guid == 'string' && scale1_guid);
                }
                test.done();
            });
    },

    register2netScale2: function(test) {
        test.expect(2);
        twonetClient.deviceRegistration.register2netDevice(user_guid, '5130550900', 'UC-321PBT', 'A&D',
            function(err, response) {
                if (err) {
                    test.ok(false, err);
                } else {
                    test.ok(response);
                    scale2_guid = response['trackRegistrationResponse']['trackDetail']['guid'];
                    console.log("scale2_guid " + scale2_guid);
                    test.ok(typeof scale2_guid == 'string' && scale2_guid);
                }
                test.done();
            });
    },

    getUserDevices: function(test) {
        test.expect(7);

        twonetClient.deviceRegistration.getUserDevices(user_guid, function(err, response) {
            if (err) {
                test.ok(false, err);
            } else {
                test.ok(response);
                this.deviceArray = response['trackDetailsResponse']['trackDetails']['trackDetail'];
                test.ok(this.deviceArray instanceof Array);
                test.equals(this.deviceArray.length, 3);
                this.guidArray = [];
                for(var i=0; i < this.deviceArray.length; i++) {
                    console.log('in device array:' + this.deviceArray[i]['guid']);
                    this.guidArray.push(this.deviceArray[i]['guid']);
                }
                test.equals(this.guidArray.length, this.deviceArray.length);
                test.ok(_.contains(this.guidArray, scale1_guid));
                test.ok(_.contains(this.guidArray, scale2_guid));
                test.ok(_.contains(this.guidArray, bpm_guid));
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