/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
process.env.NODE_ENV = "testing";
var app = require('../../app');
var testHelpers = require('../../testhelpers/testhelpers.js');
var handler = require('../stripe.event.handler.js');

var _log = $$.g.getLogger("stripe_event_handler_test");
var testContext = {};
testContext.plans = [];


exports.stripe_event_dao_test = {
    setUp: function (cb) {
        _log.debug('>> setUp');
        cb();
    },

    tearDown: function (cb) {
        var self = this;
        _log.debug('>> tearDown');
        cb();
    },

    testHandlePing: function(test) {
        var self = this;
        test.expect(1);
        _log.debug('>> testHandlePing');
        var event = {
            "created": 1326853478,
            "livemode": false,
            "id": "evt_00000000000001",
            "type": "ping",
            "object": "event",
            "request": null,
            "data": {

            }
        };
        handler.handleEvent(event, function(err, value){
            if(err) {
                test.ok(false, 'Error in handle event: ' + err);
                test.done();
            } else {
                test.ok(true);
                test.done();
            }
        });
    }
}

