/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../dao/base.dao.js');
require('../model/insight');
var dao = {

    options: {
        name:"insights.dao",
        defaultModel: $$.m.Insight
    }


};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.InsightsDao = dao;

module.exports = dao;