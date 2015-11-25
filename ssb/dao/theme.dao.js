/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./../../dao/base.dao.js');
var theme = require('../model/theme.js');

var dao = {

    options: {
        name: "ssb.theme.dao",
        defaultModel: $$.m.ssb.Theme
    }

};


dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.SSBThemeDao = dao;

module.exports = dao;
