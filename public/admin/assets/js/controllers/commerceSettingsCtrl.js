'use strict';
/*global app, moment, angular, window*/
(function (angular) {
  app.controller('CommerceSettingsCtrl', ["$scope", "toaster", "UserService", "AccountService", function ($scope, toaster, UserService, AccountService) {

    /*
     * @calculateTaxOptions
     * -
     */

    $scope.calculateTaxOptions = [{
      name: 'Customer Shipping Address',
      value: 'customer_shipping'
    }, {
      name: 'Customer Billing Address',
      value: 'customer_billing'
    }, {
      name: 'Business Location',
      value: 'business_location'
    }];

    /*
     * @getUserPreferences
     * -
     */

    AccountService.getAccount(function (account) {
      console.log('account ', account);
      $scope.account = account;
      if (!account.commerceSettings) {
        account.commerceSettings = {
          taxes: true,
          taxbased: ''
        };
      }
      $scope.settings = account.commerceSettings;
    });

    /*
     * @updateSettings
     * -
     */

    $scope.updateSettings = function () {
      var _account = $scope.account;
      _account.commerceSettings = $scope.settings;
      console.log('$scope.settings ', $scope.settings);
      AccountService.updateAccount(_account, function (updatedAccount) {
        toaster.pop('success', 'Settings Successfully Updated');
        console.log('updatedAccount ', updatedAccount);
      });
    };

  }]);
}(angular));
