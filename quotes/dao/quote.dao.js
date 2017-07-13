/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../dao/base.dao.js');
require('../model/quote');

var dao = {

    options: {
        name:"quote.dao",
        defaultModel: $$.m.Quote
    }
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.QuoteDao = dao;

module.exports = dao;
