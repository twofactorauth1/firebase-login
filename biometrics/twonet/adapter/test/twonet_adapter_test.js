process.env.NODE_ENV = "testing";
var app = require('../../../../app');

var twonetSubscriptionDao = require('../dao/twonetsubscription.dao.js');
var twonetAdapter = require('../twonet_adapter.js');
var deviceManager = require('../../../platform/bio_device_manager.js');
var twonetDeviceTypes = require('../twonet_device_types.js');
var valueTypes = require('../../../platform/bio_value_types.js');

var contactId = "50f97bb9-a38d-46eb-8e5a-d1716aed1da6";

exports.twonet_adapter_test = {

    initDB: function (test) {
        valueTypes.initDB(function() {
            twonetDeviceTypes.initDB(function() {
                test.ok(true);
                return test.done();
            })
        })
    },

    subscribeContact: function(test) {
        test.expect(4);

        twonetAdapter.subscribeContact(contactId, function (err, twonetUser) {
            if (err) {
                test.ok(false, err.message);
                return test.done();
            }

            test.ok(twonetUser);
            console.log("registered user " + JSON.stringify(twonetUser));
            test.equals(twonetUser.attributes._id, contactId);

            /**
             * Validate user was created
             */
            twonetSubscriptionDao.getById(twonetUser.attributes._id, function (err, twonetUser) {
                if (err) {
                    test.ok(false, err.message);
                    return test.done();
                }

                test.ok(twonetUser);
                test.equals(twonetUser.attributes._id, contactId);
                return test.done();
            })
        })
    },

    unsubscribeContact: function(test) {

        test.expect(2);

        twonetAdapter.unsubscribeContact(contactId, function (err, unregisteredUserId) {
            if (err) {
                test.ok(false, err.message);
                test.done();
            }

            test.equals(unregisteredUserId, contactId);

            /**
             * Validate user is gone
             */
            twonetSubscriptionDao.getById(contactId, function (err, twonetUser) {
                if (err) {
                    test.ok(false, err);
                    return test.done();
                }

                test.equals(twonetUser, null);
                test.done();
            })
        })
    },

    registerDevice: function(test) {
        test.expect(7);

        /**
         * Register User
         */
        twonetAdapter.subscribeContact(contactId, function (err, twonetUser) {
            if (err) {
                test.ok(false, err);
                return test.done();
            }

            console.log("registered user " + JSON.stringify(twonetUser));

            /**
             * Register device for user
             */
            twonetAdapter.registerDevice(contactId, twonetDeviceTypes.DT_2NET_SCALE, "SN001", function (err, platformDevice) {
                if (err) {
                    console.error(err.stack);
                    test.ok(false, err.message);
                    twonetAdapter.unsubscribeContact(contactId, function(err, response){
                        return test.done();
                    })

                    return;
                }

                test.ok(platformDevice);

                /**
                 * Verify device was persisted
                 */
                deviceManager.getDeviceById(platformDevice.attributes._id, function (err, device) {
                    if (err) {
                        console.error(err.stack);
                        test.ok(false, err.message);
                        twonetAdapter.unsubscribeContact(contactId, function(err, response){
                            return test.done();
                        })

                        return;
                    }

                    test.ok(device);
                    test.equals(device.attributes._id, platformDevice.attributes._id);
                    test.equals(device.attributes.userId, contactId);
                    test.ok(!$$.u.stringutils.isNullOrEmpty(device.attributes.externalId));
                    test.equals(device.attributes.serialNumber, "SN001");
                    test.equals(device.attributes.deviceTypeId, twonetDeviceTypes.DT_2NET_SCALE);

                    /**
                     * We are done, unregister user
                     */
                    twonetAdapter.unsubscribeContact(contactId, function (err, unregisteredUserId) {
                        if (err) {
                            console.error(err.stack);
                            test.ok(false, err);
                        }
                        return test.done();
                    })
                })
            })
        })
    }
};
