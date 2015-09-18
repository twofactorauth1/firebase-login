/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./../../dao/base.dao.js');
var template = require('../model/topic.js');

var dao = {

    options: {
        name: "topic.dao",
        defaultModel: $$.m.cms.Topic
    }

};


dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.TopicDao = dao;

module.exports = dao;
