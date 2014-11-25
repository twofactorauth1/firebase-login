/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../dao/base.dao.js');
require('../model/analytic_event');

var dao = {



    options: {
        name:"analytics.dao",
        defaultModel: $$.m.AnalyticsEvent
    }


};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.AnalyticsDao = dao;

module.exports = dao;
