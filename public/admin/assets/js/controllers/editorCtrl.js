'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('EditorCtrl', ["$scope", "$rootScope", "$interval", "$timeout", "toaster", "$modal", "$filter", "$location", "WebsiteService", "SweetAlert", "hoursConstant", "GeocodeService", "ProductService", "AccountService", "postConstant", function ($scope, $rootScope, $interval, $timeout, toaster, $modal, $filter, $location, WebsiteService, SweetAlert, hoursConstant, GeocodeService, ProductService, AccountService, postConstant) {

    // $scope.openModal = function (template, index) {
    //   if (template === 'add-component-modal') {
    //     $scope.changeIndex(index);
    //   }
    //   $scope.modalInstance = $modal.open({
    //     templateUrl: template,
    //     scope: $scope
    //   });
    // };

    // $scope.changeIndex = function (index) {
    //     $scope.clickedIndex = index;
    //   };

    // $scope.closeModal = function () {
    //   $scope.modalInstance.close();
    // };

    $scope.savePage = function () {
      $scope.saveLoading = true;
      WebsiteService.updatePage($scope.page, function (data) {
        $scope.saveLoading = false;
        toaster.pop('success', "Page Saved", "The " + $scope.page.handle + " page was saved successfully.");
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
        }, 1);
      }
    });

  }]);
}(angular));
