/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../dao/base.dao.js');
require('../model/subscription.privilege');

var dao = {

    options: {
        name:"subscription.privilege.dao",
        defaultModel: $$.m.SubscriptionPrivilege
    },

    getByPlanId: function(accountId, planId, fn) {

    }


};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.SubscriptionPrivilege = dao;

module.exports = dao;