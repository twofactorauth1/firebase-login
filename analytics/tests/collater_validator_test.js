//session_id:'593CAB2A-489F-44F2-82B8-F26B3ADDE4B3'


//process.env.NODE_ENV = "testing";
var app = require('../../app');
var collater = require('../analytics_collater');
var analyticsDao = require('../dao/analytics.dao.js');
var async = require('async');

var _log = $$.g.getLogger("collater_validator_test");
var testContext = {};
var initialized = false;
var moment = require('moment');
moment().format();
require('../model/page_event');
require('../model/session_event');
require('../model/ping_event');


exports.collater_test = {
    testCollateSession: function(test) {
        analyticsDao.findOne({session_id:'593CAB2A-489F-44F2-82B8-F26B3ADDE4B3'}, $$.m.SessionEvent, function(err, sessionEvent){
            _log.debug('got sessionEvent: ', sessionEvent);
            _log.debug('err?', err);
            collater._processSessionEventWithCallback(sessionEvent, function(err, value){
                test.ok(true);
                test.done();
            });
        });

    }
}