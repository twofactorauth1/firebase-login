/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../dao/base.dao.js');
require('../model/dashboard');

var dao = {

    options: {
        name:"dashboard.dao",
        defaultModel: $$.m.Dashboard
    }


};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.DashboardDao = dao;

module.exports = dao;