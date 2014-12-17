/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('../../dao/base.dao');
requirejs('constants/constants');
require('../model/subscription');

var dao = {

    options: {
        name:"subscription.dao",
        defaultModel: $$.m.Subscription
    },

    getSubscriptionsByAccount: function(accountId, fn) {
        var self = this;
        self.log.debug(">> getSubscriptionsByAccount");
        var query = {'accountId': accountId};
        this.findMany(query, $$.m.Subscription, fn);
    },

    getSubscriptionsByContact: function(contactId, fn) {
        var self = this;
        self.log.debug(">> getSubscriptionsByContact");
        var query = {contactId: contactId};
        this.findMany(query, fn);
    },

    getSubscriptionsByUser: function(userId, fn) {
        var self = this;
        self.log.debug('>> getSubscriptionsByUser');
        var query = {userId: userId};
        this.findMany(query, fn);
    },

    getSubscriptionsByAccountAndPlan: function(accountId, planId, fn) {
        var self = this;
        self.log.debug(">> getSubscriptionsByAccountAndPlan");
        var query = {accountId: accountId, stripePlanId: planId};
        this.findMany(query, fn);
    },

    getSubscriptionByAccountAndId: function(accountId, stripeSubscriptionId, fn) {
        var self = this;
        self.log.debug(">> getSubscriptionByAccountAndId");
        var query = {accountId: accountId, stripeSubscriptionId: stripeSubscriptionId};
        this.findOne(query, fn);
    },

    getSubscriptionBySubId: function(stripeSubscriptionId, fn) {
        var self = this;
        self.log.debug('>> getSubscriptionBySubId');
        var query = {stripeSubscriptionId: stripeSubscriptionId};
        this.findOne(query, fn);
    }

};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.SubscriptionDao = dao;

module.exports = dao;
