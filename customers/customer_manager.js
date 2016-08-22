/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var dao = require('./dao/customer.dao');
var accountDao = require('../dao/account.dao');
var userManager = require('../dao/user.manager');

var log = $$.g.getLogger('customer_manager');
var appConfig = require('../configs/app.config');
var async = require('async');

module.exports = {

    log:log,

    getMainCustomers: function(accountId, userId, sortBy, sortDir, skip, limit, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getMainCustomers');
        var query = {
            _id: {$nin: ['__counter__', 6]}
        };

        var fields = null;
        accountDao.findWithFieldsLimitOrderAndTotal(query, skip, limit, sortBy, fields, $$.m.Account, sortDir, function(err, accounts){
            if(err) {
                self.log.error(accountId, userId, 'Error finding accounts:', err);
                return fn(err);
            } else {
                _.each(accounts.results, function(account){

                    var billing = account.get('billing') || {};
                    var trialDays = billing.trialLength || appConfig.trialLength;//using 15 instead of 14 to give 14 FULL days
                    var endDate = moment(billing.signupDate).add(trialDays, 'days');

                    var trialDaysRemaining = endDate.diff(moment(), 'days');
                    if(trialDaysRemaining < 0) {
                        trialDaysRemaining = 0;
                    }
                    account.set('trialDaysRemaining', trialDaysRemaining);
                });
                self.log.debug(accountId, userId, '<< getMainCustomers');
                return fn(null, accounts);
            }

        });
    },

    getCustomers: function(accountId, userId, sortBy, sortDir, skip, limit, fn) {

    },

    getMainCustomer: function(accountId, userId, customerId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getMainCustomer');

        async.waterfall([
            function(cb) {
                accountDao.getAccountByID(customerId, function(err, account){
                    cb(err, account);
                });
            },
            function(account, cb) {
                userManager.getUserAccounts(customerId, function(err, users){
                    if(err) {
                        cb(err);
                    } else {
                        var userAry = [];
                        _.each(users, function(user){
                            userAry.push(user.toJSON('public', {accountId:customerId}));
                        });
                        account.set('users', userAry);
                        cb(null, account);
                    }

                });
            }
        ], function(err, customer){
            if(err) {
                self.log.error(accountId, userId, 'Error getting customer:', err);
                return fn(err);
            } else {
                self.log.debug(accountId, userId, '<< getMainCustomer');
                return fn(null, customer);
            }

        });

    }


};
