/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./../../dao/base.dao.js');
var template = require('../model/template.js');

var dao = {

    options: {
        name: "template.dao",
        defaultModel: $$.m.cms.Template
    }

};


dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.TemplateDao = dao;

module.exports = dao;
