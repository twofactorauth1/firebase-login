process.env.NODE_ENV = "testing";
var app = require('../../../../app');

var twonetUserDao = require('../dao/twonetuser.dao.js');

exports.twonetuser_dao_test = {

    create2netuser: function(test) {
        test.expect(2);

        var twonetUserId = "50f97bb9-a38d-46eb-8e5a-d1716aed1da4";

        twonetUserDao.createUser(twonetUserId,function(err, twonetUser) {
            if (err) {
                test.ok(false, err);
                return test.done();
            }

            twonetUserDao.getById(twonetUser.attributes._id, function(err, result) {
                if (err) {
                    test.ok(false, err);
                    return test.done();
                }
                console.log(result);
                test.equals(result.attributes._id, twonetUserId);

                // remove the user
                twonetUserDao.removeById(result.attributes._id, function (err, resp) {
                    test.ok(!err);
                    test.done();
                });
            })
        })
    }
};
