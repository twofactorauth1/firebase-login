'use strict';
/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('EditorCtrl', ["$scope", "$rootScope", "$interval", "$timeout", "toaster", "$modal", "$filter", "$location", "WebsiteService", "SweetAlert", "hoursConstant", "GeocodeService", "ProductService", "AccountService", "postConstant", function ($scope, $rootScope, $interval, $timeout, toaster, $modal, $filter, $location, WebsiteService, SweetAlert, hoursConstant, GeocodeService, ProductService, AccountService, postConstant) {

    $scope.savePage = function () {
      $scope.saveLoading = true;
      WebsiteService.updatePage($scope.page, function (data) {
        $scope.saveLoading = false;
        toaster.pop('success', "Page Saved", "The " + $scope.page.handle + " page was saved successfully.");
        //Update linked list                        
            $scope.website.linkLists.forEach(function (value, index) {
              if (value.handle === "head-menu") {
                WebsiteService.updateLinkList($scope.website.linkLists[index], $scope.website._id, 'head-menu', function (data) {
                  console.log('Updated linked list');
                });
              }
            });
      });
    };

    $scope.retrievePage = function (_handle) {
      WebsiteService.getSinglePage(_handle, function (data) {
        $scope.page = data;
        $scope.components = $scope.page.components;
      });
    };

    window.calculateWindowHeight = function () {
      var scrollTop = $(document).scrollTop();
      return scrollTop;
    };


    if ($location.search().pagehandle) {
      $scope.retrievePage($location.search().pagehandle);
    }

    $scope.ckeditorLoaded = false;
    CKEDITOR.on("instanceReady", function () {
      if (!$scope.ckeditorLoaded) {
        $timeout(function () {
          $scope.$apply(function () {
            $scope.ckeditorLoaded = true;
          });
        }, 100);
      }
    });

    WebsiteService.getWebsite(function (website) {
      $scope.website = website;
    });
    WebsiteService.getPages(function (pages) {        
        var parsed = angular.fromJson(pages);
        var arr = [];
        for (var x in parsed) {
          arr.push(parsed[x]);
        }
        $scope.allPages = arr;
        $scope.filterdedPages = $filter('orderBy')($scope.allPages, "title", false);       
      });

  }]);
}(angular));
