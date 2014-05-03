/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../../../dao/base.dao.js');
require('../model/twonetsubscription');

var dao = {

    options: {
        name:"twonetsubscription.dao",
        defaultModel: $$.m.TwonetSubscription
    },

    createSubscription: function(contactId, fn) {

        if ($$.u.stringutils.isNullOrEmpty(contactId)) {
            return fn(new Error("A contact id was not specified"), null);
        }

        var twonetSubscription = new $$.m.TwonetSubscription({
            _id: contactId
        });

        this.saveOrUpdate(twonetSubscription, function (err, value) {
            fn(err, value);
        })
    }
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.TwonetSubscriptionDao = dao;

module.exports = dao;
