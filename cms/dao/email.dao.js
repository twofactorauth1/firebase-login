/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./../../dao/base.dao.js');
var template = require('../model/email.js');

var dao = {

    options: {
        name: "email.dao",
        defaultModel: $$.m.cms.Email
    },

    getEmailById: function(emailId, fn) {
        return this.getById(emailId, $$.m.cms.Email, fn);
    }

};


dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.EmailDao = dao;

module.exports = dao;
