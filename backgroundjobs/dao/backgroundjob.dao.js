/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./../../dao/base.dao.js');
require('../model/backgroundjob');


var dao = {

    options: {
        name:"backgroundjob.dao",
        defaultModel: $$.m.BackgroundJob
    }
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.BackgroundJobDao = dao;

module.exports = dao;
