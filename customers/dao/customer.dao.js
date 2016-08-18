/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./../../dao/base.dao.js');
require('../model/customer');


var dao = {

    options: {
        name:"customer.dao",
        defaultModel: $$.m.Customer
    }
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.CustomerDao = dao;

module.exports = dao;
