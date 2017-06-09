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
        this.orgConfigAndPermissions.isAdminUser = _.contains(userAccount.permissions, 'admin');
      }
      if(this.orgConfigAndPermissions.isVendor){
        this.orgConfigAndPermissions.userPermissions.vendorRestrictedStates = this.vendorRestrictedStates;
        if(orgConfig && orgConfig.cardCodes && orgConfig.cardCodes.length){
          this.orgConfigAndPermissions.cardCodes = orgConfig.cardCodes;
          if(this.orgConfigAndPermissions.cardCodes.length ==1){
            this.orgConfigAndPermissions.userPermissions.ledgerState = "app.ledgerDetails({customerId: '"+ this.orgConfigAndPermissions.cardCodes[0] + "'})";
            this.orgConfigAndPermissions.userPermissions.dashbordLedgerUrl = "#/ledger/" + this.orgConfigAndPermissions.cardCodes[0];
            this.orgConfigAndPermissions.isVendorWithOneCardCode = true;
          }
          else if(this.orgConfigAndPermissions.cardCodes.length == 0){
            this.orgConfigAndPermissions.userPermissions.dashbordLedgerUrl = "#";
          }
          if(this.orgConfigAndPermissions.cardCodes.length > 0){
            this.orgConfigAndPermissions.isVendorWithCardCodes = true;
          }
        }
      }
      if(orgConfig.modules) {
          var m = orgConfig.modules;
          if(m.inventory !== undefined) {
              this.orgConfigAndPermissions.inventory = m.inventory;
          } else {
              this.orgConfigAndPermissions.inventory = true;
          }

          if(m.purchaseorders !== undefined) {
              this.orgConfigAndPermissions.purchaseorders = m.purchaseorders;
          } else {
              this.orgConfigAndPermissions.purchaseorders = true;
          }
          if(m.ledger !== undefined) {
              this.orgConfigAndPermissions.ledger = m.ledger;
          } else {
              this.orgConfigAndPermissions.ledger = true;
          }
          if(m.quotes !== undefined) {
              this.orgConfigAndPermissions.quotes = m.quotes;
          } else {
              this.orgConfigAndPermissions.quotes = false;
          }
          if(m.rmas !== undefined) {
              this.orgConfigAndPermissions.rmas = m.rmas;
          } else {
              this.orgConfigAndPermissions.rmas = false;
          }
          if(m.promotions !== undefined) {
              this.orgConfigAndPermissions.promotions = m.promotions;
          } else {
              this.orgConfigAndPermissions.promotions = false;
          }
      } else {
          this.orgConfigAndPermissions.inventory = true;
          this.orgConfigAndPermissions.purchaseorders = true;
          this.orgConfigAndPermissions.ledger = true;
          this.orgConfigAndPermissions.quotes = false;
          this.orgConfigAndPermissions.rmas = false;
          this.orgConfigAndPermissions.promotions = false;
      }

      return this.orgConfigAndPermissions;
    };

  }]);
}(angular));
