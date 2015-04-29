/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./../../dao/base.dao.js');
require('../model/useractivity');


var dao = {

    options: {
        name:"useractivity.dao",
        defaultModel: $$.m.UserActivity
    }
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.UserActivityDao = dao;

module.exports = dao;
