/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./../../dao/base.dao.js');
var template = require('../model/template.js');

var dao = {

    options: {
        name: "ssb.template.dao",
        defaultModel: $$.m.ssb.Template
    }

};


dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.SSBTemplateDao = dao;

module.exports = dao;
