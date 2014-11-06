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
        var self = this;
        self.log.debug('>> getByPlanId');
        var query = {accountId: accountId, subscriptionId: planId};
        self.findOne(query, $$.m.SubscriptionPrivilege, function(err, subpriv){
            self.log.debug('<< getByPlanId');
            fn(err, subpriv);
        });
    }


};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.SubscriptionPrivilege = dao;

module.exports = dao;