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
        self.getPrivilegesByUserId(userId, function(err, value){
            if(err) {
                log.error('Exception while getting privileges: ' + err);
                cb(err, null);
            } else {
                var priv = null;
                if(value === null) {
                    priv = new $$.m.Privilege({
                        'userId': userId,
                        'userName': userName,
                        'roles': rolesAry,
                        'accountIds': [accountId],
                        'privs': defaultPrivileges
                    });
                } else {
                    //add accountId
                    var accountIdAry = priv.get('accountIds');
                    if(accountIdAry.indexOf(accountId) != -1) {
                        accountIdAry.push(accountId);
                    } else {
                        //already have privilege record for user and account
                        log.debug('<< initializeUserPrivileges');
                        cb(null, priv);
                    }
                }
                dao.saveOrUpdate(priv, function(err, updatedPrivilege){
                    if(err) {
                        log.error('Exception while saving privilege: ' + err);
                        cb(err, null);
                    } else {
                        log.debug('<< initializeUserPrivileges');
                        cb(null, updatedPrivilege);
                    }
                });
            }
        });
    },

    getPrivilegesByUserId: function(userId, cb) {
        var self = this;
        log.debug('>> getPrivilegesByUserId');
        dao.findOne({'userId': userId}, $$.m.Privilege, function(err, priv){
            if(err) {
                log.error('Exception while finding privilege by userId[' + userId + ']: ' + err );
                cb(err, null);
            } else {
                log.debug('<< getPrivilegesByUserId');
                cb(null, priv);
            }
        });
    },

    hasPermission: function(userId, accountId, priv) {
        var self = this;


    }


};

$$.s = $$.s || {};
$$.s.securityManager = $$.sm = securityManager;

module.exports = securityManager;
