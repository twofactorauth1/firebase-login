/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var dao = require('./dao/organization.dao');
var accountDao = require('../dao/account.dao');

var manager = {

    log : $$.g.getLogger("org_manager"),

    getOrgByAccountId: function(accountId, userId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getOrgByAccountId');
        accountDao.getAccountByID(accountId, function(err, account){
            if(err || !account) {
                self.log.error('Error getting account:', err);
                fn(err);
            } else {
                var orgId = account.get('orgId') || 0;
                dao.getById(orgId, $$.m.Organization, function(err, organization){
                    if(err) {
                        self.log.error(accountId, userId, 'Error getting org:', err);
                        fn(err);
                    } else {
                        self.log.debug(accountId, userId, '<< getOrgByAccountId');
                        fn(null, organization);
                    }
                });
            }
        });
    },

    getAdminAccountByOrgId: function(accountId, userId, orgId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getAdminAccountByOrgId');
        dao.getById(orgId || 0, $$.m.Organization, function(err, organization){
            if(err) {
                self.log.error(accountId, userId, 'Error getting org:', err);
                fn(err);
            } else {
                accountDao.getAccountByID(organization.get('adminAccount'), function(err, adminAccount){
                    if(err) {
                        self.log.error(accountId, userId, 'Error getting admin account:', err);
                        fn(err);
                    } else {
                        self.log.debug(accountId, userId, '<< getAdminAccountByOrgId');
                        fn(null, adminAccount);
                    }
                });

            }
        });
    },

    getOrgById: function(accountId, userId, orgId, fn) {
        dao.getById(orgId, $$.m.Organization, fn);
    }


};


$$.managers = $$.managers || {};
$$.managers.OrgManager = manager;

module.exports = manager;