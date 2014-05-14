process.env.NODE_ENV = "testing";
var app = require('../../../../app');

var rkSubscriptionDao = require('../dao/runkeepersubscription.dao');
var rkAdapter = require('../runkeeper_adapter');
var deviceManager = require('../../../platform/bio_device_manager');
var readingTypes = require('../../../platform/bio_value_types');
var rkClient = require('../../client/runkeeper_client');

var mikeAccessToken = "c2f12817da584e3dbc3e733a2a1e5228";

exports.runkeeper_adapter_test = {

//    testFitnessActivityFeed: function (test) {
//
//        rkClient.getFitnessActivityFeed(mikeAccessToken, function(err, value) {
//            if (err) {
//                test.ok(false, err.message);
//            } else {
//                console.log(JSON.stringify(value, undefined, 2));
//                console.log("Total activities retrieved: " + value.items.length);
//                console.log("Total available activities: " + value.size);
//            }
//            test.done();
//        })
//    },

    testFitnessActivity: function (test) {

        rkClient.getFitnessActivity(mikeAccessToken, "348749601", function(err, value) {
            if (err) {
                test.ok(false, err.message);
            } else {
                console.log(JSON.stringify(value, undefined, 2));
            }
            test.done();
        })
    }
};
