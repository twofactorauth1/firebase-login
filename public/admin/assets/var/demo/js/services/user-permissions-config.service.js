/*global app*/
/*jslint unparam: true*/
'use strict';
(function (angular) {
  app.service('UserPermissionsConfig', [function () {


    this.orgConfigAndPermissions = {
      permissions: null,
      config: null,
      isVendor: false,
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
      if(userAccount.permissions && userAccount.permissions.length){
        this.orgConfigAndPermissions.isVendor = _.contains(userAccount.permissions, 'vendor')
      }
      return this.orgConfigAndPermissions;
    };

  }]);
}(angular));
