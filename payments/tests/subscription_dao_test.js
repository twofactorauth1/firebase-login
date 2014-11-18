/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
process.env.NODE_ENV = "testing";
var app = require('../../app');
var contactDao = require('../../dao/contact.dao.js');
var testHelpers = require('../../testhelpers/testhelpers.js');
var subscriptionDao = require('../dao/subscription.dao.js');
var async = require('async');

var stripeDao = require('../dao/stripe.dao.js');
var _log = $$.g.getLogger("subscription.dao.test");
var testContext = {};
testContext.plans = [];


exports.subscription_dao_test = {
    setUp: function (cb) {
        var self = this;

        //remove all existing subscription records
        subscriptionDao.findMany({}, $$.m.Subscription, function(err, list){
            if(err) {
                _log.error('Exception removing events.  Tests may not be accurate.');
            } else {
                async.each(list,
                    function(sub, callback){
                        subscriptionDao.remove(sub, function(err, value){
                            callback();
                        });
                    }, function(err){
                        _log.debug('<< setUp');
                        cb();
                    });
            }
        });

    },

    tearDown: function (cb) {
        var self = this;
        cb();
    },

    testGetSubscriptionsByAccount: function(test){
        var self = this;
        _log.info('testGetSubscriptionsByAccount...');
        test.expect(2);
        //create subscription.
        var sub = new $$.m.Subscription({
            accountId: 1,
            contactId: 'test_1'
        });

        var sub2 = new $$.m.Subscription({
            accountId: 2,
            contactId: 'test_2'
        });
        var p1 = $.Deferred(), p2 = $.Deferred();
        subscriptionDao.saveOrUpdate(sub,  function(err, subscription){
            if(err) {
                p1.reject();
                _log.error('Error saving subscription: ' + err);
                test.ok(false, err);
                test.done();
            }
            _log.info('resolving p1.');
            p1.resolve();
            subscriptionDao.saveOrUpdate(sub2, function(err, subscription){
                if(err) {
                    p2.reject();
                    _log.error('Error saving subscription: ' + err);
                    test.ok(false, err);
                    test.done();
                }
                _log.info('resolving p2.');
                p2.resolve();
            });
        });


        _log.info('waiting for resolutions...');

        $.when(p1,p2).done(function(){
            test.expect(2);
            subscriptionDao.getSubscriptionsByAccount(1, function(err, subscriptions){
                if(err) {
                    test.ok(false, err);
                    test.done();
                }
                console.dir(subscriptions);
                test.equals(1, subscriptions.length);
                test.equals('test_1', subscriptions[0].get('contactId'));
                test.done();
            });

        });

    },

    testGetSubscriptionsByContact: function(test) {
        var self = this;
        _log.info('testGetSubscriptionsByContact...');
        test.expect(2);
        //create subscription.
        var sub = new $$.m.Subscription({
            accountId: 1,
            contactId: 'test_1'
        });

        var sub2 = new $$.m.Subscription({
            accountId: 2,
            contactId: 'test_2'
        });
        var p1 = $.Deferred(), p2 = $.Deferred();
        subscriptionDao.saveOrUpdate(sub,  function(err, subscription){
            if(err) {
                p1.reject();
                _log.error('Error saving subscription: ' + err);
                test.ok(false, err);
                test.done();
            }
            _log.info('resolving p1.');
            p1.resolve();
            subscriptionDao.saveOrUpdate(sub2, function(err, subscription){
                if(err) {
                    p2.reject();
                    _log.error('Error saving subscription: ' + err);
                    test.ok(false, err);
                    test.done();
                }
                _log.info('resolving p2.');
                p2.resolve();
            });
        });


        _log.info('waiting for resolutions...');

        $.when(p1,p2).done(function() {
            test.expect(2);
            subscriptionDao.getSubscriptionsByContact('test_2', function(err, subscriptions){
                if(err) {
                    test.ok(false, err);
                    test.done();
                }
                console.dir(subscriptions);
                test.equals(1, subscriptions.length);
                test.equals(2, subscriptions[0].get('accountId'));
                test.done();
            });
        });
    },

    testGetSubscriptionsByAccountAndPlan: function(test) {
        var self = this;
        _log.info('testGetSubscriptionsByAccountAndPlan...');
        test.expect(3);
        //create subscription.
        var sub = new $$.m.Subscription({
            accountId: 1,
            contactId: 'test_1',
            stripePlanId: 'plan_1'
        });

        var sub2 = new $$.m.Subscription({
            accountId: 2,
            contactId: 'test_2',
            stripePlanId: 'plan_1'
        });

        var sub3 = new $$.m.Subscription({
            accountId: 2,
            contactId: 'test_3',
            stripePlanId: 'plan_1'
        });
        var p1 = $.Deferred(), p2 = $.Deferred(), p3= $.Deferred();
        subscriptionDao.saveOrUpdate(sub,  function(err, subscription){
            if(err) {
                p1.reject();
                _log.error('Error saving subscription: ' + err);
                test.ok(false, err);
                test.done();
            }
            _log.info('resolving p1.');
            p1.resolve();
            subscriptionDao.saveOrUpdate(sub2, function(err, subscription){
                if(err) {
                    p2.reject();
                    _log.error('Error saving subscription: ' + err);
                    test.ok(false, err);
                    test.done();
                }
                _log.info('resolving p2.');
                p2.resolve();
                subscriptionDao.saveOrUpdate(sub3, function(err, subscription){
                    if(err) {
                        p3.reject();
                        _log.error('Error saving subscription: ' + err);
                        test.ok(false, err);
                        test.done();
                    }
                    _log.info('resolving p3.');
                    p3.resolve();
                });
            });
        });


        _log.info('waiting for resolutions...');
        $.when(p1,p2,p3).done(function() {
            subscriptionDao.getSubscriptionsByAccountAndPlan(2, 'plan_1', function(err, subs){
                if(err) {
                    test.ok(false, err);
                    test.done();
                }
                test.equals(2, subs.length);
                test.equals(2, subs[0].get('accountId'));
                subscriptionDao.getSubscriptionsByAccountAndPlan(2, 'plan_bogus', function(err, subs){
                    if(err) {
                        test.ok(false, err);
                        test.done();
                    }
                    test.equals(0, subs.length);
                    test.done();
                });

            });
        });
    },

    testGetSubscriptionByAccountAndId: function(test) {
        var self = this;
        _log.info('testGetSubscriptionByAccountAndId...');
        test.expect(1);
        //create subscription.
        var sub = new $$.m.Subscription({
            accountId: 1,
            contactId: 'test_1',
            stripePlanId: 'plan_1',
            stripeSubscriptionId: 'sub_1'
        });

        var sub2 = new $$.m.Subscription({
            accountId: 2,
            contactId: 'test_2',
            stripePlanId: 'plan_1',
            stripeSubscriptionId: 'sub_2'
        });

        var sub3 = new $$.m.Subscription({
            accountId: 2,
            contactId: 'test_3',
            stripePlanId: 'plan_1',
            stripeSubscriptionId: 'sub_3'
        });
        var p1 = $.Deferred(), p2 = $.Deferred(), p3= $.Deferred();
        subscriptionDao.saveOrUpdate(sub,  function(err, subscription){
            if(err) {
                p1.reject();
                _log.error('Error saving subscription: ' + err);
                test.ok(false, err);
                test.done();
            }
            _log.info('resolving p1.');
            p1.resolve();
            subscriptionDao.saveOrUpdate(sub2, function(err, subscription){
                if(err) {
                    p2.reject();
                    _log.error('Error saving subscription: ' + err);
                    test.ok(false, err);
                    test.done();
                }
                _log.info('resolving p2.');
                p2.resolve();
                subscriptionDao.saveOrUpdate(sub3, function(err, subscription){
                    if(err) {
                        p3.reject();
                        _log.error('Error saving subscription: ' + err);
                        test.ok(false, err);
                        test.done();
                    }
                    _log.info('resolving p3.');
                    p3.resolve();
                });
            });
        });


        _log.info('waiting for resolutions...');
        $.when(p1,p2,p3).done(function() {
            subscriptionDao.getSubscriptionByAccountAndId(2, 'sub_3', function(err, subscription){
                if(err) {
                    test.ok(false, err);
                    test.done();
                }
                test.equals('test_3', subscription.get('contactId'));
                test.done();
            });
        });
    }
}
