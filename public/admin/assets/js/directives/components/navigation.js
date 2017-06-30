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
        });

    },
    controller: function ($scope, WebsiteService, AccountService, $compile) {
      $scope.navbarId = _.random(0, 1000);
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
      $scope.toggleNavClass=function(ele){
          var li=$(ele.target).parents("li")
          if(li){
              if(!li.hasClass("nav-active")){
                  li.addClass("nav-active")
              }else{
                  li.removeClass("nav-active")
              }
          }
      }
      $scope.currentpage = $scope.$parent.page;/*
$scope.component.linkLists[0].links[1].links=[{
                                            "label":"Home",
                                            "type":"link",
                                            "linkTo":{
                                                    "data":"index",
                                                    "type":"page",
                                                    "page":null
                                                }
                                        },{
                                            "label":"Home 2",
                                            "type":"link",
                                            "linkTo":{
                                                    "data":"index",
                                                    "type":"page",
                                                    "page":null
                                                }
                                        },
                                             {
                                            "label":"Home 3",
                                            "type":"link",
                                            "linkTo":{
                                                    "data":"index",
                                                    "type":"page",
                                                    "page":null
                                                }
                                        }]*/
      $scope.$parent.$watch('vm.state.page', function(page) {
        if(page)
          $scope.currentpage = page;
      }, true);
    }
  };
}]);
