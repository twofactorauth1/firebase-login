'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('navigationComponent', ['WebsiteService', 'AccountService', '$timeout', function (WebsiteService, AccountService, $timeout) {
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
      if(!scope.ssbEditor){
        if(!angular.isDefined(scope.component.shownavbox))
          scope.component.shownavbox = true;
        scope.control.refreshWebsiteLinks = function (lnklist) {
          scope.website.linkLists = lnklist;
        };
      }
      scope.$watch('component.logo', function (newValue, oldValue) {        
          $timeout(function () {
            $(window).trigger('resize');
          }, 0);
      })
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
