process.env.NODE_ENV = "testing";
var app = require('../../../../app');

var twonetSubscriptionDao = require('../dao/twonetsubscription.dao.js');

exports.twonetsubscription_dao_test = {

    create2netsubscription: function(test) {
        test.expect(2);

        var contactId = "50f97bb9-a38d-46eb-8e5a-d1716aed1da4";

        twonetSubscriptionDao.createSubscription(contactId,function(err, twonetUser) {
            if (err) {
                test.ok(false, err);
                return test.done();
            }

            twonetSubscriptionDao.getById(twonetUser.attributes._id, function(err, result) {
                if (err) {
                    test.ok(false, err);
                    return test.done();
                }
                console.log(result);
                test.equals(result.attributes._id, contactId);

                // remove the user
                twonetSubscriptionDao.removeById(result.attributes._id, function (err, resp) {
                    test.ok(!err);
                    test.done();
                });
            })
        })
    }
};
