/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var securityManager = {


    hasPermission: function(req, accountId, permission) {
        var user = req.user;
        if (user == null) return false;

        var accountPermissions = user.getPermissionsForAccount(accountId);

        if (accountPermissions == null || accountPermissions.length == 0) return false;

        return accountPermissions.indexOf(permission) > -1;
    },


    hasOnePermission: function(req, accountId, permissions) {
        var user = req.user;
        if (user == null) return false;

        var accountPermissions = user.getPermissionsForAccount(accountId);

        if (accountPermissions == null || accountPermissions.length == 0) return false;

        return _.intersection(accountPermissions, permissions).length > 0;
    },


    hasAllPermissions: function(req, accountId, permissions) {
        var user = req.user;
        if (user == null) return false;

        var accountPermissions = user.getPermissionsForAccount(accountId);

        if (accountPermissions == null || accountPermissions.length == 0) return false;

        return _.intersection(accountPermissions, permissions).length == permissions.length;
    },


    //-----------------------------------------------------
    //  ACCOUNT PERMISSION
    //-----------------------------------------------------
    canManageAccount: function(req, accountId) {
        var user = req.user;
        if (user == null) return false;

        return this.hasOnePermission(req, accountId, ["admin","super"]);
    },


    canReadAccount: function(req, accountId) {
        var user = req.user;
        if (user == null) return false;

        var userAccount = user.getUserAccount(accountId);
        if (userAccount == null) return false;

        return true;
    }
};

$$.s = $$.s || {};
//$$.s.securityManager = $$.sm = securityManager;

//module.exports = securityManager;
