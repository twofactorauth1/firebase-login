/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../dao/base.dao.js');
require('../model/sitemigration');

var dao = {

    options: {
        name:"sitemigration.dao",
        defaultModel: $$.m.SiteMigration
    }


};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.SiteMigrationDao = dao;

module.exports = dao;