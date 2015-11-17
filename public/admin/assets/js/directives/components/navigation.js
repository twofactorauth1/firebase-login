'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('navigationComponent', ['WebsiteService', 'AccountService', function (WebsiteService, AccountService) {
  return {
    scope: {
      component: '=',
      version: '=',
      ssbEditor: '=',
      website: '=?',
      control: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      scope.isEditing = true;
      if(!angular.isDefined(scope.component.shownavbox))
        scope.component.shownavbox = true;
      if(!scope.ssbEditor){
        scope.control.refreshWebsiteLinks = function (lnklist) {
          scope.website.linkLists = lnklist;
        };
      }
    },
    controller: function ($scope, WebsiteService, AccountService, $compile) {
      $scope.isSinglePost = $scope.$parent.isSinglePost;
      if (!$scope.website) {
        if ($scope.$parent.website) {
          $scope.website = $scope.$parent.website;
        } else {
          WebsiteService.getWebsite(function (website) {
            $scope.website = website;
          });

          AccountService.getAccount(function (account) {
            $scope.account = account;
          });
        }
      }
      $scope.currentpage = $scope.$parent.page;
    }
  };
}]);
