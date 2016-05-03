/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./../../dao/base.dao.js');
require('../model/componentdata');


var dao = {

    options: {
        name:"componentdata.dao",
        defaultModel: $$.m.ComponentData
    }
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.ComponentDataDao = dao;

module.exports = dao;
