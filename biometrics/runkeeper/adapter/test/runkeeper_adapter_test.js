process.env.NODE_ENV = "testing";
var app = require('../../../../app');

var rkClient = require('../../client/runkeeper_client');

var mikeAccessToken = "0672fa0c951144e59685f5175a149358";

exports.runkeeper_adapter_test = {

    testFitnessActivityFeed: function (test) {

        var sinceSeconds = 1400126400;
        var untilSeconds = 1400212740;

        rkClient.getFitnessActivityFeed(mikeAccessToken, sinceSeconds, untilSeconds, function(err, value) {
            test.expect(2);
            if (err) {
                test.ok(false, err.message);
            } else {
                console.log(JSON.stringify(value, undefined, 2));
                test.equals(value.items.length, 2);
                test.equals(value.size, 2);
            }
            test.done();
        })
    }

//    testFitnessActivity: function (test) {
//
//        rkClient.getFitnessActivity(mikeAccessToken, "348749601", function(err, value) {
//            if (err) {
//                test.ok(false, err.message);
//            } else {
//                console.log(JSON.stringify(value, undefined, 2));
//            }
//            test.done();
//        })
//    }
};
