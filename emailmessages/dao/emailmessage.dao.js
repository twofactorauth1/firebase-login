/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../dao/base.dao.js');
require('../model/emailmessage');

var dao = {

    options: {
        name:"emailmessage.dao",
        defaultModel: $$.m.Emailmessage
    }


};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.EmailmessageDao = dao;

module.exports = dao;