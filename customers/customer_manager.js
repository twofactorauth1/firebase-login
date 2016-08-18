/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var dao = require('./dao/customer.dao');
var accountDao = require('../dao/account.dao');

var log = $$.g.getLogger('customer_manager');
var appConfig = require('../configs/app.config');

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

    getComponentData: function(accountId, userId, type, key, fn){
        var self = this;
        self.log.debug(accountId, userId, '>> getComponentData');
        var query = {
            accountId:accountId,
            type:type,
            key:key
        };

        dao.findOne(query, $$.m.ComponentData, function(err, value){
            if(err) {
                self.log.error(accountId, userId, 'Error finding component data:', err);
                return fn(err);
            } else {
                self.log.debug(accountId, userId, '<< getComponentData');
                return fn(null, value);
            }
        });
    },

    saveComponentData: function(accountId, userId, type, key, componentData, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> saveComponentData');
        var query = {
            accountId:accountId,
            type:type,
            key:key
        };
        dao.findOne(query, $$.m.ComponentData, function(err, value){
            if(err) {
                self.log.error(accountId, userId, 'Error finding component data:', err);
                return fn(err);
            } else if(value){
                componentData.id(value.id());
                componentData.set('created', value.get('created'));
                componentData.set('modified', {date:new Date(), by:userId});
                dao.saveOrUpdate(componentData, function(err, savedData){
                    if(err) {
                        self.log.error(accountId, userId, 'Error saving data:', err);
                        return fn(err);
                    } else {
                        self.log.debug(accountId, userId, '<< saveComponentData');
                        return fn(null, savedData);
                    }
                });
            } else {
                componentData.set('created', {date:new Date(), by:userId});
                componentData.set('modified', {date:new Date(), by:userId});
                dao.saveOrUpdate(componentData, function(err, savedData){
                    if(err) {
                        self.log.error(accountId, userId, 'Error saving data:', err);
                        return fn(err);
                    } else {
                        self.log.debug(accountId, userId, '<< saveComponentData');
                        return fn(null, savedData);
                    }
                });
            }
        });
    },

    deleteComponentData: function(accountId, userId, type, key, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> deleteComponentData');
        var query = {
            accountId:accountId,
            type:type,
            key:key
        };
        dao.remove(query, $$.m.ComponentData, function(err, value){
            if(err) {
                self.log.error(accountId, userId, 'Error removing data:', err);
                return fn(err);
            } else {
                self.log.debug(accountId, userId, '<< deleteComponentData');
                return fn(null, value);
            }
        });
    }


};
