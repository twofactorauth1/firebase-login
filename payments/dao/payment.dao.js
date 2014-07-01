/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('../../dao/base.dao');
requirejs('constants/constants');
require('../model/payment');

var dao = {

    options: {
        name:"payment.dao",
        defaultModel: $$.m.Payment
    },

    getPaymentByChargeId: function(chargeId, fn) {
        var query = {chargeId: chargeId};
        this.findOne(query, fn);
    }


};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.PaymentDao = dao;

module.exports = dao;
