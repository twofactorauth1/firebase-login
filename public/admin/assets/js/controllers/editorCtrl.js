'use strict';
/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('EditorCtrl', ["$scope", "$rootScope", "$interval", "$timeout", "toaster", "$modal", "$filter", "$location", "WebsiteService", "SweetAlert", "hoursConstant", "GeocodeService", "ProductService", "AccountService", "postConstant", function ($scope, $rootScope, $interval, $timeout, toaster, $modal, $filter, $location, WebsiteService, SweetAlert, hoursConstant, GeocodeService, ProductService, AccountService, postConstant) {

    $scope.isEditing = true;
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

    // angular.element(window.document).on('keydown', function (e) {     
    //     if (e.which === 8 || e.which === 46) {
    //       if (!angular.element(this).hasClass("cke_editable_inline")) 
    //          e.preventDefault();
    //     }
    // });

    //Disable all links in edit
    angular.element("body").on("click", ".component a", function (e) {
      if (!angular.element(this).hasClass("clickable-link")) {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    $scope.retrievePage = function (_handle) {
      WebsiteService.getSinglePage(_handle, function (data) {
        $scope.page = data;
        $scope.components = $scope.page.components;
      });
    };

    window.calculateWindowHeight = function () {
      var scrollTop = angular.element(window.document).scrollTop();
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

    window.clickandInsertImageButton = function (editor) {
      $scope.clickImageButton(editor, false);
    };

    window.clickImageButton = function (btn) {
      var urlInput = $(btn).closest('td').prev('td').find('input');
      $scope.clickImageButton(urlInput, true);
    };

    $scope.clickImageButton = function (editor, edit) {
      $scope.insertMediaImage = true;
      $scope.inlineInput = editor;
      $scope.isEditMode = edit;
      angular.element("#media-manager-modal").modal('show');
      $scope.showInsert = true;
    };

    $scope.addCKEditorImage = function (url, inlineInput, edit) {
      if (inlineInput) {
        if (edit)
          inlineInput.val(url);
        else
          inlineInput.insertHtml('<img data-cke-saved-src="' + url + '" src="' + url + '"/>');
      }
    };
    
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
