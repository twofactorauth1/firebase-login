/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../dao/base.dao.js');
require('../model/certificate');

var dao = {

    options: {
        name:"certificate.dao",
        defaultModel: $$.m.Certificate
    },


    getCertificate: function(ref, fn) {

    },

    updateCertificate: function(cert, fn) {

    }
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.CampaignDao = dao;

module.exports = dao;
