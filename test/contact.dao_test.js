/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
process.env.NODE_ENV = "testing";
var app = require('../app');
var testHelpers = require('../testhelpers/testhelpers.js');
var contactDao = require('../dao/contact.dao.js');

var _log = $$.g.getLogger("contact.dao.test");
var testContext = {};


exports.payment_dao_test = {
    setUp: function (cb) {
        var self = this;
        cb();
    },

    tearDown: function (cb) {
        var self = this;
        cb();
    },

    testFindDuplicates: function(test) {
        var self = this;

        contactDao.findDuplicates(0, function(err, value){
            _log.debug('results:');
            console.dir(value);
            test.ok(true);
            test.done();
        });

    }


}
