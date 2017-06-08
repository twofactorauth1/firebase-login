/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../dao/base.dao.js');
require('../model/promotion');

var dao = {

    options: {
        name:"promotion.dao",
        defaultModel: $$.m.Promotion
    }
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.PromotionDao = dao;

module.exports = dao;
