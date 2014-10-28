/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
process.env.NODE_ENV = "testing";
var app = require('../../app');
var testHelpers = require('../../testhelpers/testhelpers.js');
var linkDao = require('../dao/customer_link.dao.js');

var _log = $$.g.getLogger("customer.link.dao.test");
var testContext = {};
testContext.plans = [];
var linkIDsToDelete = [];
var async = require('async');

exports.payment_dao_test = {
    setUp: function (cb) {
        var self = this;
        var promiseAry = [];
        promiseAry[0] = $.Deferred();
        _log.debug('>> setUp');
        //remove all existing subscription records
        linkDao.findMany(null, $$.m.CustomerLink, function(err, links){
            promiseAry[0].resolve();
            //if all we have is the counter, we are done.
            if(links.length === 1 && links[0].get('_id') === '__counter__') {
                //;
            } else {
                for(var i=0; i<links.length; i++) {
                    var id = links[i].get('_id');

                    if(id !== '__counter__') {
                        promiseAry[id] = $.Deferred();
                        linkDao.removeById(id, $$.m.CustomerLink, function(err, obj){
                            if(err) {_log.error('Error: ' + err);}
                            promiseAry[id].resolve();
                        });
                    }

                }
            }


        });
        $.when(promiseAry).done(function(){
            _log.debug('<< setUp');
            cb();
        });
    },

    tearDown: function (cb) {
        var self = this;
        if(linkIDsToDelete.length > 0) {
            async.eachSeries(linkIDsToDelete, function(link, cb){
                linkDao.removeById(link, $$.m.CustomerLink, function(err, obj){
                    cb();
                });
            }, function(err){
                cb();
            });
        } else {
            cb();
        }

    },

    testSafeCreate: function(test) {
        var link = new $$.m.CustomerLink({
            'accountId': 0,
            'contactId': 'contactId',
            'customerId': 'customerId'
        });
        var p1 = $.Deferred();

        linkDao.saveOrUpdate(link,  function(err, savedLink){
            if(err) {
                p1.reject();
                test.ok(false, 'Error saving link: ' + err);
                test.done();
            }
            _log.info('saved link with id of ' + savedLink.get('_id'));
            console.dir(savedLink);
            linkIDsToDelete.push(savedLink.id());
            p1.resolve();
        });
        var link2 = new $$.m.CustomerLink({
            'accountId': 0,
            'contactId': 'contactId',
            'customerId': 'customerId'
        });
        $.when(p1).done(function(){
            //try to save it again
            linkDao.safeCreate(0, 'contactId', 'customerId', function(err, savedLink){
                _log.info('saved link2');
               if(err) {
                    test.done();
               } else {
                   //we should have received an error.
                   test.ok(false, 'Did not receive expected error.');
                   test.done();
               }
            });
        });
    },

    testGetLinkByIds: function(test) {
        test.expect(1);
        _log.info('>> testGetLinkByIds');
        var link = new $$.m.CustomerLink({
            'accountId': 0,
            'contactId': 'contactId',
            'customerId': 'customerId'
        });
        var p1 = $.Deferred();
        var savedId = null;

        linkDao.saveOrUpdate(link,  function(err, savedLink){
            _log.info('saved.');
            if(err) {
                p1.reject();
                test.ok(false, 'Error saving link: ' + err);
                test.done();
            }
            savedId = savedLink.get('_id');
            linkIDsToDelete.push(savedId);
            _log.info('saved link with id of ' + savedLink.get('_id'));
            p1.resolve();
        });

        $.when(p1).done(function() {
            linkDao.getLinkByIds(0, 'contactId', 'customerId', null, function(err, savedLink){
                if(err) {
                    test.ok(false, 'Error retrieving link: ' + err);
                    test.done();
                }
                if(!savedLink) {
                    test.ok(false, 'Link was not retrieved.');
                    test.done();
                } else {
                    test.equals(savedId, savedLink.get('_id'));
                    test.done();
                }
                _log.info('<< testGetLinkByIds');
            });
        });
    },

    testGetLinksByAccountId: function(test) {
        test.expect(2);

        var link = new $$.m.CustomerLink({
            'accountId': 0,
            'contactId': 'contactId',
            'customerId': 'customerId'
        });
        var p1 = $.Deferred(), p2 = $.Deferred(), p3 = $.Deferred();

        var link1 = new $$.m.CustomerLink({
            'accountId': 0,
            'contactId': 'contactId1',
            'customerId': 'customerId1'
        });

        var link2 = new $$.m.CustomerLink({
            'accountId': 1,
            'contactId': 'contactId',
            'customerId': 'customerId'
        });

        linkDao.saveOrUpdate(link,  function(err, savedLink){
            if(err) {
                p1.reject();
                test.ok(false, 'Error saving link: ' + err);
                test.done();
            }
            _log.info('saved link with id of ' + savedLink.get('_id'));
            linkIDsToDelete.push(savedLink.id());
            p1.resolve();
        });
        linkDao.saveOrUpdate(link1,  function(err, savedLink){
            if(err) {
                p2.reject();
                test.ok(false, 'Error saving link: ' + err);
                test.done();
            }
            _log.info('saved link with id of ' + savedLink.get('_id'));
            linkIDsToDelete.push(savedLink.id());
            p2.resolve();
        });
        linkDao.saveOrUpdate(link2,  function(err, savedLink){
            if(err) {
                p3.reject();
                test.ok(false, 'Error saving link: ' + err);
                test.done();
            }
            _log.info('saved link with id of ' + savedLink.get('_id'));
            linkIDsToDelete.push(savedLink.id());
            p3.resolve();
        });

        $.when(p1,p2,p3).done(function(){
            linkDao.getLinksByAccountId(0, function(err, links){
                if(err) {
                    test.ok(false, 'Error getting links: ' + err);
                    test.done();
                }
                test.equals(2, links.length);
                test.equals(0, links[0].get('accountId'));
                test.done();
            });
        });
    },

    testGetLinksByContactId: function(test) {
        test.expect(2);

        var link = new $$.m.CustomerLink({
            'accountId': 0,
            'contactId': 'contactId',
            'customerId': 'customerId'
        });
        var p1 = $.Deferred(), p2 = $.Deferred(), p3 = $.Deferred();

        var link1 = new $$.m.CustomerLink({
            'accountId': 0,
            'contactId': 'contactId1',
            'customerId': 'customerId1'
        });

        var link2 = new $$.m.CustomerLink({
            'accountId': 1,
            'contactId': 'contactId',
            'customerId': 'customerId'
        });

        linkDao.saveOrUpdate(link,  function(err, savedLink){
            if(err) {
                p1.reject();
                test.ok(false, 'Error saving link: ' + err);
                test.done();
            }
            _log.info('saved link with id of ' + savedLink.get('_id'));
            linkIDsToDelete.push(savedLink.id());
            p1.resolve();
        });
        linkDao.saveOrUpdate(link1,  function(err, savedLink){
            if(err) {
                p2.reject();
                test.ok(false, 'Error saving link: ' + err);
                test.done();
            }
            _log.info('saved link with id of ' + savedLink.get('_id'));
            linkIDsToDelete.push(savedLink.id());
            p2.resolve();
        });
        linkDao.saveOrUpdate(link2,  function(err, savedLink){
            if(err) {
                p3.reject();
                test.ok(false, 'Error saving link: ' + err);
                test.done();
            }
            _log.info('saved link with id of ' + savedLink.get('_id'));
            linkIDsToDelete.push(savedLink.id());
            p3.resolve();
        });

        $.when(p1,p2,p3).done(function(){
            linkDao.getLinksByContactId('contactId', function(err, links){
                if(err) {
                    test.ok(false, 'Error getting links: ' + err);
                    test.done();
                }
                test.equals(2, links.length);
                test.equals('contactId', links[0].get('contactId'));
                test.done();
            });
        });
    },

    testGetLinksByCustomerId: function(test) {
        test.expect(2);

        var link = new $$.m.CustomerLink({
            'accountId': 0,
            'contactId': 'contactId',
            'customerId': 'customerId'
        });
        var p1 = $.Deferred(), p2 = $.Deferred(), p3 = $.Deferred();

        var link1 = new $$.m.CustomerLink({
            'accountId': 0,
            'contactId': 'contactId1',
            'customerId': 'customerId1'
        });

        var link2 = new $$.m.CustomerLink({
            'accountId': 1,
            'contactId': 'contactId',
            'customerId': 'customerId1'
        });

        linkDao.saveOrUpdate(link,  function(err, savedLink){
            if(err) {
                p1.reject();
                test.ok(false, 'Error saving link: ' + err);
                test.done();
            }
            _log.info('saved link with id of ' + savedLink.get('_id'));
            linkIDsToDelete.push(savedLink.id());
            p1.resolve();
        });
        linkDao.saveOrUpdate(link1,  function(err, savedLink){
            if(err) {
                p2.reject();
                test.ok(false, 'Error saving link: ' + err);
                test.done();
            }
            _log.info('saved link with id of ' + savedLink.get('_id'));
            linkIDsToDelete.push(savedLink.id());
            p2.resolve();
        });
        linkDao.saveOrUpdate(link2,  function(err, savedLink){
            if(err) {
                p3.reject();
                test.ok(false, 'Error saving link: ' + err);
                test.done();
            }
            _log.info('saved link with id of ' + savedLink.get('_id'));
            linkIDsToDelete.push(savedLink.id());
            p3.resolve();
        });

        $.when(p1,p2,p3).done(function(){
            linkDao.getLinksByCustomerId('customerId1', function(err, links){
                if(err) {
                    test.ok(false, 'Error getting links: ' + err);
                    test.done();
                }
                test.equals(2, links.length);
                test.equals('customerId1', links[0].get('customerId'));
                test.done();
            });
        });
    },

    testGetLinkByAccountAndCustomer :function(test) {
        //TODO:
        test.done();
    },

    testRemoveLinkByAccountAndCustomer: function(test) {
        //TODO:
        test.done();
    },

    testRemoveLinksByCustomer: function(test) {
        test.expect(2);
        _log.info('\n\n**** Running Test testRemoveLinksByCustomer ****\n');
        var link = new $$.m.CustomerLink({
            'accountId': 0,
            'contactId': 'contactId',
            'customerId': 'customerId'
        });
        var p1 = $.Deferred(), p2 = $.Deferred(), p3 = $.Deferred();

        var link1 = new $$.m.CustomerLink({
            'accountId': 0,
            'contactId': 'contactId1',
            'customerId': 'customerId1'
        });

        var link2 = new $$.m.CustomerLink({
            'accountId': 1,
            'contactId': 'contactId',
            'customerId': 'customerId1'
        });

        linkDao.saveOrUpdate(link,  function(err, savedLink){
            if(err) {
                p1.reject();
                test.ok(false, 'Error saving link: ' + err);
                test.done();
            }
            _log.info('saved link with id of ' + savedLink.get('_id'));
            linkIDsToDelete.push(savedLink.id());
            p1.resolve();
        });
        linkDao.saveOrUpdate(link1,  function(err, savedLink){
            if(err) {
                p2.reject();
                test.ok(false, 'Error saving link: ' + err);
                test.done();
            }
            _log.info('saved link with id of ' + savedLink.get('_id'));
            p2.resolve();
        });
        linkDao.saveOrUpdate(link2,  function(err, savedLink){
            if(err) {
                p3.reject();
                test.ok(false, 'Error saving link: ' + err);
                test.done();
            }
            _log.info('saved link with id of ' + savedLink.get('_id'));
            p3.resolve();
        });

        $.when(p1,p2,p3).done(function(){
            linkDao.removeLinksByCustomer('customerId1', function(err, value){
                if(err) {
                    test.ok(false, 'Error removing links: ' + err);
                    test.done();
                }
                linkDao.findMany(null, $$.m.CustomerLink, function(err, links){
                    if(err) {
                        test.ok(false, 'Error removing links: ' + err);
                        test.done();
                    }
                    test.equals(2, links.length);
                    test.equals('customerId', links[1].get('customerId'));
                    test.done();
                });
            });
        });
    }

}
