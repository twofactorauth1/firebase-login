/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./../../dao/base.dao.js');
var component = require('../model/component.js');

var dao = {

    options: {
        name: "ssb.component.dao",
        defaultModel: $$.m.ssb.Component
    }

};


dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.SSBComponentDao = dao;

module.exports = dao;
