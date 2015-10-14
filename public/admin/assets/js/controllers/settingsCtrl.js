'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('SettingsCtrl', ["$scope", "$log", "$modal", "$state", "WebsiteService", "AccountService", "UserService", "toaster", "$timeout", '$location', function ($scope, $log, $modal, $state, WebsiteService, AccountService, UserService, toaster, $timeout, $location) {
    $scope.keywords = [];

    console.log($location.absUrl().replace('main', 'hey'));
    /*
     * @settingsTitles
     * list of settings titles to map to
     */

    var viewTitles = {
      "website": "Website Settings",
      "commerce": "Commerce Settings",
      "customers": "Customers Settings",
      "emails": "Email Settings",
      "all": "Settings"
    };

    /*
     * @clearAllNotifications
     * clear all notification checkboxes
     */

    $scope.clearAllNotifications = function () {
      $scope.account.email_preferences.new_contacts = false;
      $scope.account.email_preferences.new_orders = false;
      $scope.account.email_preferences.helpful_tips = false;
    };

    $scope.clearNoNotifications = function () {
      $scope.account.email_preferences.no_notifications = false;
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
      $scope.originalAccount = angular.copy(account);
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
      if(!$scope.account.subdomain && !$scope.account.domain)
      {
        $scope.saveLoading = false;
        toaster.pop('error', "Subdomain can't be blank");
        return;
      }
      AccountService.updateAccount($scope.account, function (data, error) {
        if (error) {
          $scope.saveLoading = false;
          toaster.pop('error', error.message);
        } else {
          if ($scope.account.subdomain !== $scope.originalAccount.subdomain) {
            var _newUrl = $location.absUrl().split($scope.originalAccount.subdomain);
            window.location.href = _newUrl[0] + $scope.account.subdomain + _newUrl[1];
          }
          var mainAccount = AccountService.getMainAccount();
          if (mainAccount) {
            mainAccount.showhide.blog = $scope.account.showhide.blog;
          }
          WebsiteService.updateWebsite($scope.website, function () {
            $scope.saveLoading = false;
            toaster.pop('success', " Website Settings saved.");
          });
        }

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
    $scope.modifysub = {};
    $scope.modifysub.show = false;

    $scope.checkDomainExists = function (account) {
      console.log('account.subdomain >>> ', account.subdomain);
      if (account.subdomain) {
        $scope.checkingSubdomain = true;
        if ($scope.originalAccount.subdomain != account.subdomain) {
          UserService.checkDuplicateSubdomain(account.subdomain, account._id, function (data) {
            $scope.hasCheckedSubdomain = true;
            $log.debug('checkDomainExists', data);
            $scope.checkingSubdomain = false;
            if (data.isDuplicate) {
              $scope.domainError = true;
            } else {
              $scope.domainError = false;
            }
          });
        } else {
          $scope.hasCheckedSubdomain = false;
          $scope.domainError = false;
          $scope.checkingSubdomain = false;
        }
      }
    };

    $scope.revertSubdomain = function () {
      $scope.hasCheckedSubdomain = '';
      $scope.modifysub.show = false;
      $scope.account.subdomain = $scope.originalAccount.subdomain;
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

    /*
     * @openMediaModal
     * -
     */

    $scope.openMediaModal = function () {
      $scope.showInsert = true;
      $scope.modalInstance = $modal.open({
        templateUrl: 'media-modal',
        controller: 'MediaModalCtrl',
        size: 'lg',
        keyboard: false,
        backdrop: 'static',
        resolve: {
          showInsert: function () {
            return $scope.showInsert;
          },
          insertMedia: function () {
            return $scope.insertFavicon;
          }
        }
      });
    };

    /*
     * @closeModal
     * -
     */

    $scope.closeModal = function () {
      $scope.modalInstance.close();
    };

    // Add/Remove Meta tags
    $scope.accountAddMetaFn = function () {
      $scope.website.metatags = $scope.website.metatags || [];
      $scope.website.metatags.push({
        name:'',
        value:''
      });
    };
    $scope.removeMeta = function (index) {
      $scope.website.metatags.splice(index, 1);
    };

    $scope.showAddMeta = function (index) {
      return index === 0;
    };


  }]);
}(angular));
