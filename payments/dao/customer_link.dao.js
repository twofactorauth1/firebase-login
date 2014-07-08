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

    getLinkByIds: function(accountId, contactId, customerId, fn) {
        var self = this;
        self.log.debug('>> getLinkByIds');
        var query = {
            'accountId': accountId,
            'customerId': customerId,
            'contactId': contactId
        };
        this.findOne(query, $$.m.CustomerLink, fn);
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
    }


};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.CustomerLinkDao = dao;

module.exports = dao;
