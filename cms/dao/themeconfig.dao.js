/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./../../dao/base.dao.js');
var themeConfig = require('../model/themeconfig.js');

var dao = {

    options: {
        name: "themeconfig.dao",
        defaultModel: $$.m.cms.ThemeConfig
    }

};


dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.ThemeConfigDao = dao;

module.exports = dao;
