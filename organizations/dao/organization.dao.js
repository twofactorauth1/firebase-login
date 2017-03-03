/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../dao/base.dao.js');
require('../model/organization');

var dao = {

    getByOrgDomain: function(domain, fn) {
        var query = {orgDomain:domain};
        this.findOne(query, $$.m.Organization, fn);
    },

    options: {
        name:"organization.dao",
        defaultModel: $$.m.Organization
    }


};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.OrganizationDao = dao;

module.exports = dao;