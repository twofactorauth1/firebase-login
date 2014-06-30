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
        var query = {accountId: accountId};
        this.findMany(query, fn);
    },

    getSubscriptionsByContact: function(contactId, fn) {
        var query = {contactId: contactId};
        this.findMany(query, fn);
    },

    getSubscriptionsByAccountAndPlan: function(accountId, planId, fn) {
        var query = {accountId: accountId, stripePlanId: planId};
        this.findMany(query, fn);
    },

    getSubscriptionByAccountAndId: function(accountId, stripeSubscriptionId, fn) {
        var query = {accountId: accountId, stripeSubscriptionId: stripeSubscriptionId};
        this.findOne(query, fn);
    }

};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.ContactDao = dao;

module.exports = dao;
