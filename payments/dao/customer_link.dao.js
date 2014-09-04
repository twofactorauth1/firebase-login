/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('../../dao/base.dao');
requirejs('constants/constants');
require('../model/customer.link');

var dao = {

    options: {
        name:"customer.link.dao",
        defaultModel: $$.m.CustomerLink
    },

    getLinksByCustomerId: function(customerId, fn) {
        var self = this;
        self.log.debug('>> getLinksByCustomerId');
        var query = {customerId: customerId};
        this.findMany(query, $$.m.CustomerLink, fn);
    },

    getLinksByContactId: function(contactId, fn) {
        var self = this;
        self.log.debug('>> getLinksByContactId');
        var query = {contactId: contactId};
        this.findMany(query, $$.m.CustomerLink, fn);
    },

    getLinksByAccountId: function(accountId, fn) {
        var self = this;
        self.log.debug('>> getLinksByAccountId');
        var query = {accountId: accountId};
        this.findMany(query, $$.m.CustomerLink, fn);
    },

    getLinkByIds: function(accountId, contactId, customerId, userId, fn) {
        var self = this;
        self.log.debug('>> getLinkByIds');
        if(fn === null) {
            fn = userId;
            userId = null;
        }
        var query = {
            'accountId': accountId,
            'customerId': customerId

        };
        if(contactId) {
            query.contactId=contactId;
        }
        if(userId) {
            query.userId = userId;
        }
        this.findOne(query, $$.m.CustomerLink, fn);
    },

    getLinkByAccountAndCustomer: function(accountId, customerId, fn) {
        var self = this;
        self.log.debug('>> getLinkByAccountAndCustomer');
        var query = {
            'accountId': accountId,
            'customerId': customerId
        };
        this.findOne(query, $$.m.CustomerLink, fn);
    },

    removeLinkByAccountAndCustomer: function(accountId, customerId, fn) {
        var self = this;
        self.log.debug('>> removeLinkByAccountAndCustomer');
        var p1 = $.Deferred();
        var link = self.getLinkByAccountAndCustomer(accountId, customerId, function(err, link){
            if(err) {
                self.log.error('Error retrieving link: ' + err);
                fn(err, null);
            }
            p1.resolve();
            return link;
        });
        $.when(p1).done(function(){
            self.log.debug('<< removeLinkByAccountAndCustomer');
            self.remove(link, fn);
        });

    },

    removeLinksByCustomer: function(customerId, fn) {
        var self = this;
        self.log.debug('>> removeLinksByCustomer');
        var query = {'customerId': customerId};
        self.removeByQuery(query, $$.m.CustomerLink, fn);
    },

    safeCreate: function(accountId, contactId, customerId, fn) {
        var self = this;
        self.log.debug('>> safeCreate');
        var safetyFunction = function(err, value) {

            if(!err) {
                //we expect an error, because it should not exist.
                return fn('The customer link already exists.', null);
            }
            var link = new $$.m.CustomerLink({
                'accountId': accountId,
                'customerId': customerId,
                'contactId': contactId
            });
            return self.saveOrUpdate(link, fn);
        };
        return self.getLinkByIds(accountId, customerId, contactId, safetyFunction);
    },

    safeCreateWithUser: function(accountId, userId, customerId, fn) {
        var self = this;
        self.log.debug('>> safeCreate');
        var safetyFunction = function(err, value) {

            if(err || value !== null) {
                //we expect an error, because it should not exist.
                return fn('The customer link already exists.', null);
            }
            var link = new $$.m.CustomerLink({
                'accountId': accountId,
                'customerId': customerId,
                'userId': userId
            });
            return self.saveOrUpdate(link, fn);
        };
        return self.getLinkByIds(accountId, customerId, null, userId, safetyFunction);
    }


};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.CustomerLinkDao = dao;

module.exports = dao;
