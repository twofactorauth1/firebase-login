/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../dao/base.dao.js');
require('../model/socialconfig');

var dao = {

    options: {
        name:"socialconfig.dao",
        defaultModel: $$.m.SocialConfig
    }


};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.SocialConfigDao = dao;

module.exports = dao;