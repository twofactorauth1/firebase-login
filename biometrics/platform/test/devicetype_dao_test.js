process.env.NODE_ENV = "testing";
var app = require('../../../app');

var valueTypeDao = require('../dao/valuetype.dao.js');
var deviceTypeDao = require('../dao/devicetype.dao.js');

exports.devicetype_dao_test = {
    createBadDeviceType: function(test) {
        test.expect(2);
        deviceTypeDao.createDeviceType("bad_scale", "a desc", "1", "acme", ["weightkgs"], function(err, response) {
            test.notEqual(err, null);
            test.equal(response, null);
            test.done();
        });
    },

    createDeviceType: function (test) {
        test.expect(14);

        // a reading type
        var rt = { id: "weightkgs", unit: "kg", description: "force on the body due to gravity"};

        // a device type using the above reading type
        var dt = {
            id: "my_scale",
            desc: "a fancy scale",
            model: "1.0",
            make: "Acme",
            readingtypes: [rt.id]
        };

        var p1 = $.Deferred();

        // need to create reading type first
        valueTypeDao.createValueType(rt.id, rt.unit, rt.description, function(err, response) {
            if (err) {
                test.ok(false, err);
                return test.done();
            }
            test.notEqual(response, null);
            p1.resolve();
        });

        $.when(p1)
            .done(function() {

                deviceTypeDao.createDeviceType(dt.id, dt.desc, dt.model, dt.make, dt.readingtypes,
                    function(err, response) {
                        if (err) {
                            test.ok("false", err);
                            return test.done();
                        }

                        test.equals(response.attributes._id, dt.id);
                        test.equals(response.attributes.model, dt.model);
                        test.equals(response.attributes.description, dt.desc);
                        test.equals(response.attributes.manufacturer, dt.make);
                        test.equals(response.attributes.readingtypes, dt.readingtypes);

                        // Get it
                        deviceTypeDao.getById(dt.id, function(err, value) {
                            if (err) {
                                test.ok(false, err);
                                return test.done();
                            }

                            test.equals(value.attributes._id, dt.id);
                            test.equals(value.attributes.model, dt.model);
                            test.equals(value.attributes.description, dt.desc);
                            test.equals(value.attributes.manufacturer, dt.make);
                            test.deepEqual(value.attributes.readingtypes, dt.readingtypes);

                            // Remove it
                            deviceTypeDao.removeById(dt.id, function(err, value) {
                                if (err) {
                                    test.ok(false, err);
                                    return test.done();
                                }

                                test.equals(value, 1);

                                deviceTypeDao.getById(dt.id, function(err, value) {
                                    if (err) {
                                        test.ok(false, err);
                                        return test.done();
                                    }
                                    test.equals(value, null);

                                    // remove reading type
                                    valueTypeDao.removeById(rt.id, function(err, value) {
                                        if (err) {
                                            test.ok(false, err);
                                            return test.done();
                                        }
                                        test.equals(value, 1);
                                        test.done();
                                    });
                                })
                            })
                        })
                    })
            });
    }
};
