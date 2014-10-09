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
var contactsToDelete = [];

exports.payment_dao_test = {
    setUp: function (cb) {
        var self = this;
        testContext.testAccountId = 1;

        //delete everything with testAccountId before we start.
        contactDao.removeByQuery({'accountId': testContext.testAccountId}, $$.m.Contact, function(err, value){
            if(err) {
                _log.warn('Error deleting contacts.  Tests may be incorrect.');
            } else {
                testHelpers.createTestContact(1, function(err, value){
                    contactsToDelete.push(value);
                    testHelpers.createTestContact(1, function(err, value){
                        contactsToDelete.push(value);
                        cb();
                    });
                });
            }
        });
    },

    tearDown: function (cb) {
        var self = this;
        cb();
    },

    testFindDuplicates: function(test) {
        var self = this;

        contactDao.findDuplicates(1, function(err, value){
            _log.debug('results:');
            console.dir(value);
            test.ok(true);
            test.done();
        });

    },

    testMergeDuplicates: function(test) {
        var self = this;



        contactDao.mergeDuplicates(null, 1, function(err, value){
            _log.debug('results: ');
            console.dir(value);
            test.ok(true);
            test.done();
        });
    },

    testMergeByEmail: function(test) {
        var self = this;
        test.expect(1);
        //create two contacts w/ different names but the same email.

        var c1 = new $$.m.Contact({
            accountId: testContext.testAccountId,
            first: 'TestEmail',
            last: 'Contact1',
            birthday: '01/01/1979',
            details: [
                {
                    emails: ['testemail@example.com']
                }
            ]
        });

        var c2 = new $$.m.Contact({
            accountId: testContext.testAccountId,
            first: 'EmailTest',
            last: 'Contact2',
            birthday: '01/01/1979',
            details: [
                {
                    emails: ['testemail@example.com']
                }
            ]
        });

        contactDao.saveOrUpdate(c1, function(err, contact){
            if(err) {
                test.ok(false);
                test.done();
            } else {
                _log.debug('saved 1.');
                contactsToDelete.push(contact);
                contactDao.saveOrUpdate(c2, function(err, contact){
                    if(err) {
                        test.ok(false);
                        test.done();
                    } else {
                        _log.debug('saved 2.');
                        contactsToDelete.push(contact);
                        contactDao.mergeDuplicates(null, testContext.testAccountId, function(err, value){
                            _log.debug('merged by email:');
                            console.dir(value);
                            if(err) {
                                test.ok(false);
                                test.done();
                            } else {
                                test.ok(true);
                                test.done();
                            }
                        });
                    }
                });
            }
        });


    },

    cleanupContacts: function(test) {
        var promiseAry = [];
        for(var i=0; i<contactsToDelete.length; i++) {
            var p1 = $.Deferred();
            promiseAry.push(p1);
            contactDao.remove(contactsToDelete[i], function(err, val){
                p1.resolve();
            });
        }
        $.when(promiseAry).done(function(){
            test.done();
        });

    }


}
