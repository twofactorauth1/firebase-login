/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../dao/base.dao.js');
require('../model/purchase_order');

var dao = {

    options: {
        name:"purchase_order.dao",
        defaultModel: $$.m.PurchageOrder
    }
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.PurchageOrderDao = dao;

module.exports = dao;
