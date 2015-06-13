'use strict';
/*global app, moment, angular, window*/
(function (angular) {
  app.controller('WebsiteSettingsCtrl', ["$scope", "$modal", "WebsiteService", "AccountService", function ($scope, $modal, WebsiteService, AccountService) {
    $scope.keywords = [];
    WebsiteService.getWebsite(function (website) {
      $scope.website = website;
      $scope.keywords = website.seo.keywords;
      console.log('$scope.website ', $scope.website);
    });

    AccountService.getAccount(function (account) {
      $scope.account = account;
    });

    $scope.saveWebsiteSettings = function () {
      AccountService.updateAccount($scope.account, function () {
        WebsiteService.updateWebsite($scope.website, function () {
          console.log('updated');
        });
      });
    };

    $scope.insertFavicon = function (asset) {
      $scope.website.settings.favicon = asset.url;
    };

    $scope.removeFavicon = function (asset) {
      $scope.website.settings.favicon = '';
    };

  }]);
}(angular));
