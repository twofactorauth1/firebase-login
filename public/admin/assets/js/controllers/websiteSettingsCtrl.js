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
      $scope.blogSettings = null;
      if(account && account.showhide && account.showhide)
        $scope.blogSettings = angular.copy(account.showhide.blog);
    });

    // WebsiteService.getPages(function (pages) {
    //   console.log('pages ', pages);
    //   $scope.blogPage = _.find(pages, function(page){
    //     return page.handle === 'blog';
    //   });
    //   $scope.singlePost = _.find(pages, function(page){
    //     return page.handle === 'single-post';
    //   });
    // });

    $scope.saveLoading = false;

    $scope.saveWebsiteSettings = function () {
      $scope.saveLoading = true;
      AccountService.updateAccount($scope.account, function () {
        WebsiteService.updateWebsite($scope.website, function () {
          $scope.saveLoading = false;
          toaster.pop('success', " Website Settings saved.");
          if($scope.account && $scope.account.showhide)
          {
            if($scope.blogSettings !== $scope.account.showhide.blog)
              window.location.reload();
          }            
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

    $scope.editTemplate = function(type) {
      if (type === 'blog') {
        window.location = '/admin/#/website/pages/?pagehandle=blog';
      }

      if (type === 'post') {
        window.location = '/admin/#/website/pages/?pagehandle=single-post';
      }
    };

  }]);
}(angular));
