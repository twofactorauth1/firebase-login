/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../dao/base.dao.js');
require('../model/broadcast_message');
var dao = {

    options: {
        name:"broadcast_messages.dao",
        defaultModel: $$.m.BroadcastMessage
    }


};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.BroadcastMessageDao = dao;

module.exports = dao;