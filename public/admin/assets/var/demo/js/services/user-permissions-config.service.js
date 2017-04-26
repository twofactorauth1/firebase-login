/*global app*/
/*jslint unparam: true*/
'use strict';
(function (angular) {
  app.service('UserPermissionsConfig', [function () {


    this.orgConfigAndPermissions = {
      permissions: null,
      config: null
    }

    this.getOrgConfigAndPermissions = function (user, account) {
      var userAccount = _.find(user.accounts, function(acc){
          return acc.accountId == account._id
      })
     
      var orgConfigAry = user.orgConfig || [];
      var orgConfig = _.find(orgConfigAry, function(config){
          return config.orgId == account.orgId
      })

      this.orgConfigAndPermissions.permissions = userAccount.permissions;
      this.orgConfigAndPermissions.config = orgConfig;
      return this.orgConfigAndPermissions;
    };

  }]);
}(angular));
