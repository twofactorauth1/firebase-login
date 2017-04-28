/*global app*/
/*jslint unparam: true*/
'use strict';
(function (angular) {
  app.service('UserPermissionsConfig', [function () {

    this.vendorRestrictedStates = ["app.account.users"];

    this.orgConfigAndPermissions = {
      isVendor: false,
      cardCodes: [],
      isVendorWithOneCardCode: false,
      dashboardState: "app.dohy",
      userPermissions: {
        ledgerState: "app.customers",
        dashbordLedgerUrl: '#/customers',
        vendorRestrictedStates : []
      }
    };

    this.getOrgConfigAndPermissions = function (account, user) {
      var userAccount = _.find(user.accounts, function(acc){
          return acc.accountId == account._id
      });
     
      var orgConfigAry = user.orgConfig || [];
      var orgConfig = _.find(orgConfigAry, function(config){
          return config.orgId == account.orgId
      });

      if(userAccount && userAccount.permissions && userAccount.permissions.length){
        this.orgConfigAndPermissions.isVendor = _.contains(userAccount.permissions, 'vendor');
      }
      if(this.orgConfigAndPermissions.isVendor){
        this.orgConfigAndPermissions.userPermissions.vendorRestrictedStates = this.vendorRestrictedStates;
        if(orgConfig && orgConfig.cardCodes && orgConfig.cardCodes.length){
          this.orgConfigAndPermissions.cardCodes = orgConfig.cardCodes;
          if(this.orgConfigAndPermissions.cardCodes.length ==1){
            this.orgConfigAndPermissions.userPermissions.ledgerState = "app.ledgerDetails({customerId: '"+ this.orgConfigAndPermissions.cardCodes[0] + "'})";
            this.orgConfigAndPermissions.userPermissions.dashbordLedgerUrl = "#/ledger/" + this.orgConfigAndPermissions.cardCodes[0];
          }
          else if(this.orgConfigAndPermissions.cardCodes.length == 0){
            this.orgConfigAndPermissions.userPermissions.dashbordLedgerUrl = "#";
          }
        }
      }
      
      return this.orgConfigAndPermissions;
    };

  }]);
}(angular));
