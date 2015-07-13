'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('SettingsCtrl', ["$scope", "$state", "WebsiteService", "AccountService", "UserService", "toaster", "$timeout", function ($scope, $state, WebsiteService, AccountService, UserService, toaster, $timeout) {
    $scope.keywords = [];

    /*
     * @settingsTitles
     * list of settings titles to map to
     */

    var viewTitles = {
      "website": "Website Settings",
      "commerce": "Commerce Settings",
      "customers": "Customers Settings",
      "all": "Settings"
    };

    /*
     * @viewSettings
     * show section and navigate to tab
     */

    $scope.settingsView = 'all';
    $scope.viewTitle = viewTitles['all'];

    $scope.viewSettings = function (section, tab) {
      $scope.settingsView = section;
      $scope.viewTitle = viewTitles[section];
      $timeout(function () {
        angular.element('.sitesettings [heading="' + tab + '"] a').triggerHandler('click');
      }, 0);
    };

    /*
     * @getWebsite
     * get website obj for SEO tab and keywords
     */

    WebsiteService.getWebsite(function (website) {
      $scope.website = website;
      $scope.keywords = website.seo.keywords;
    });

    /*
     * @AccountService
     * get account obj
     */

    AccountService.getAccount(function (account) {
      $scope.account = account;
      if (!account.commerceSettings) {
        account.commerceSettings = {
          taxes: true,
          taxbased: ''
        };
      }
    });

    /*
     * @saveSettings
     * save update account and website obj
     */

    $scope.saveLoading = false;

    $scope.saveSettings = function () {
      $scope.saveLoading = true;
      AccountService.updateAccount($scope.account, function (data, error) {
        if(error)
        {
          $scope.saveLoading = false;
          toaster.pop('error', error.message);
        }
        else  
          WebsiteService.updateWebsite($scope.website, function () {
            $scope.saveLoading = false;
            toaster.pop('success', " Website Settings saved.");
          });
      });
    };

    /*
     * @insertFavicon
     * insert the favicon
     */

    $scope.insertFavicon = function (asset) {
      $scope.website.settings.favicon = asset.url;
    };

    /*
     * @removeFavicon
     * remove the favicon
     */

    $scope.removeFavicon = function () {
      $scope.website.settings.favicon = '';
    };

    /*
     * @checkDomainExists
     * check to see if the domain already exist on change
     */

    $scope.domainError = false;

    $scope.checkDomainExists = function (account) {
      UserService.checkDuplicateSubdomain(account.subdomain, account._id, function (data) {
        console.log('data ', data);
        if (data !== 'true') {
          $scope.domainError = true;
        } else {
          $scope.domainError = false;
        }
      });
    };

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
     * @navigateTo
     * - navigate to view and close aside
     */

    $scope.navigateTo = function (section, $event) {
      $state.go(section);
      $scope.cancel($event);
    };


    /*
     * @updateSettings
     * -
     */

    // $scope.updateSettings = function () {
    //   var _account = $scope.account;
    //   _account.commerceSettings = $scope.settings;
    //   console.log('$scope.settings ', $scope.settings);
    //   AccountService.updateAccount(_account, function (updatedAccount) {
    //     toaster.clear();
    //     toaster.pop('success', 'Settings Successfully Updated');
    //     console.log('updatedAccount ', updatedAccount);
    //   });
    // };


  }]);
}(angular));
