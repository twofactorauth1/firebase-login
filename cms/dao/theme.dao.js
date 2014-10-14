/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./../../dao/base.dao.js');
var theme = require('../model/theme.js');

var dao = {

    options: {
        name: "theme.dao",
        defaultModel: $$.m.cms.Theme
    }

};


dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.ThemeDao = dao;

module.exports = dao;
