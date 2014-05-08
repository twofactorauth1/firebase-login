/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../../../dao/base.dao.js');
require('../model/runkeepersubscription');

var dao = {

    options: {
        name:"runkeepersubscription.dao",
        defaultModel: $$.m.RunkeeperSubscription
    },

    createSubscription: function(contactId, accessToken, fn) {

        if ($$.u.stringutils.isNullOrEmpty(contactId)) {
            return fn(new Error("A contact id was not specified"), null);
        }

        if ($$.u.stringutils.isNullOrEmpty(accessToken)) {
            return fn(new Error("An access token was not specified"), null);
        }

        var subscription = new $$.m.RunkeeperSubscription({
            _id: contactId,
            accessToken: accessToken
        });

        this.saveOrUpdate(subscription, fn);
    }
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.RunkeeperSubscriptionDao = dao;

module.exports = dao;
