process.env.NODE_ENV = "testing";
var app = require('../../../app');

var valueTypeDao = require('../dao/valuetype.dao.js');

exports.readingtype_dao_test = {
    createReadingType: function (test) {
        test.expect(8);

        var rt = { _id: "weight", unit: "lb", description: "force on the body due to gravity"};

        // Create it
        valueTypeDao.createValueType(rt._id, rt.unit, rt.description, function(err, response) {
            if (err) {
                test.ok("false", err);
                return test.done();
            }

            test.equals(response.attributes._id, rt._id);
            test.equals(response.attributes.unit, rt.unit);
            test.equals(response.attributes.description, rt.description);

            // Get it
            valueTypeDao.getById(rt._id, function(err, value) {
                if (err) {
                    test.ok(false, err);
                    return test.done();
                }

                test.equals(value.attributes._id, rt._id);
                test.equals(value.attributes.unit, rt.unit);
                test.equals(value.attributes.description, rt.description);

                // Remove it
                valueTypeDao.removeById(rt._id, function(err, value) {
                    if (err) {
                        test.ok(false, err);
                        return test.done();
                    }

                    test.equals(value, 1);

                    valueTypeDao.getById(rt._id, function(err, value) {
                        if (err) {
                            test.ok(false, err);
                            return test.done();
                        }
                        test.equals(value, null);
                        test.done();
                    })
                })
            })

        })
    }
};
