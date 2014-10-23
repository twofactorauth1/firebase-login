/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var log = $$.g.getLogger("sm");
var dao = require('./dao/privilege.dao.js');
var defaultPrivileges = [
    'VIEW_ACCOUNT',
    'VIEW_USER',
    'MODIFY_ACCOUNT',
    'MODIFY_USER',
    'VIEW_READINGS',
    'VIEW_CAMPAIGN',
    'MODIFY_CAMPAIGN',
    'VIEW_ANALYTICS',
    'MODIFY_ANALYTICS',
    'VIEW_WEBSITE',
    'MODIFY_WEBSITE',
    'VIEW_THEME',
    'MODIFY_THEME',
    'VIEW_CONTACT',
    'MODIFY_CONTACT',
    'VIEW_COURSE',
    'MODIFY_COURSE',
    'VIEW_EMAIL_SOURCE',
    'MODIFY_EMAIL_SOURCE',
    'VIEW_EMAIL_MESSAGE',
    'MODIFY_PRODUCT',
    'VIEW_PRODUCT',
    'VIEW_PAYMENTS',
    'MODIFY_PAYMENTS'
];

var securityManager = {

    initializeUserPrivileges: function(userId, userName, rolesAry, accountId, cb) {
        var self = this;
        log.debug('>> initializeUserPrivileges');
        self.getPrivilegesByUserAndAccount(userId, accountId, function(err, value){
            if(err) {
                log.error('Exception while getting privileges: ' + err);
                cb(err, null);
            } else if(value === null){
                var priv = new $$.m.Privilege({
                    'userId': userId,
                    'userName': userName,
                    'roles': rolesAry,
                    'accountId': accountId,
                    'privs': defaultPrivileges
                });
                dao.saveOrUpdate(priv, function(err, privilege){
                    if(err) {
                        log.error('Exception while saving privilege: ' + err);
                        cb(err, null);
                    } else {
                        log.debug('<< initializeUserPrivileges');
                        cb(null, privilege);
                    }
                });

            } else {
                log.warn('attempting to reinitialize a privilege for user [' + userId + '] and account [' + accountId + ']');
                cb(null, value);
            }
        });
    },

    getPrivilegesByUserId: function(userId, cb) {
        var self = this;
        log.debug('>> getPrivilegesByUserId');
        dao.findMany({'userId': userId}, $$.m.Privilege, function(err, privList){
            if(err) {
                log.error('Exception while finding privilege by userId[' + userId + ']: ' + err );
                cb(err, null);
            } else {
                log.debug('<< getPrivilegesByUserId');
                cb(null, privList);
            }
        });
    },

    getPrivilegesByUserAndAccount: function(userId, accountId, cb) {
        var self = this;
        log.debug('>> getPrivilegesByUserAndAccount');
        dao.findOne({'userId': userId, accountId: accountId}, $$.m.Privilege, function(err, privilege){
            if(err) {
                log.error('Exception while finding privilege by userId[' + userId + '] and account[' + accountId + ']: ' + err );
                cb(err, null);
            } else {
                log.debug('<< getPrivilegesByUserAndAccount');
                cb(null, privilege);
            }
        });
    },

    hasPermission: function(userId, accountId, priv, cb) {
        var self = this;
        log.debug('>> hasPermission');
        self.getPrivilegesByUserAndAccount(userId, accountId, function(err, privilege){
            if(err) {
                log.error('Exception while finding privilege by userId[' + userId + '] and account[' + accountId + ']: ' + err );
                cb(null, false);
            } else {
                if(privilege != null && _.contains(privilege.get('privs'), priv)) {
                    log.debug('<< hasPermission(true)');
                    cb(null, true);
                } else {
                    log.debug('<< hasPermission(false)');
                    cb(null, false);
                }
            }
        });


    }


};

$$.s = $$.s || {};
$$.s.securityManager = $$.sm = securityManager;

module.exports = securityManager;
