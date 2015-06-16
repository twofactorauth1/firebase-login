'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('WebsiteSettingsCtrl', ["$scope", "WebsiteService", "AccountService", "UserService", "toaster", function ($scope, WebsiteService, AccountService, UserService, toaster) {
    $scope.keywords = [];
    WebsiteService.getWebsite(function (website) {
      $scope.website = website;
      $scope.keywords = website.seo.keywords;
    });

    AccountService.getAccount(function (account) {
      $scope.account = account;
    });

    $scope.saveLoading = false;

    $scope.saveWebsiteSettings = function () {
      $scope.saveLoading = true;
      AccountService.updateAccount($scope.account, function () {
        WebsiteService.updateWebsite($scope.website, function () {
          $scope.saveLoading = false;
          toaster.pop('success', " Website Settings saved.");
        });
      });
    };

    $scope.insertFavicon = function (asset) {
      $scope.website.settings.favicon = asset.url;
    };

    $scope.removeFavicon = function () {
      $scope.website.settings.favicon = '';
    };

    $scope.domainError = false;

    $scope.checkDomainExists = function (account) {
      UserService.checkDuplicateSubdomain(account.subdomain, account._id, function (data) {
        console.log('data ', data);
          if (data != 'true') {
            $scope.domainError = true;
          } else {
            $scope.domainError = false;
          }
        });
    };

  }]);
}(angular));
