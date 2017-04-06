/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./../../dao/base.dao.js');

var dao = {

    options: {
        name: "zi.dao"
    }

};


dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.ZIDao = dao;

module.exports = dao;
