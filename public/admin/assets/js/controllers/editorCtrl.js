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

    $scope.duplicateComponent = function (index) {
      console.log('index ', index);
      var matchingComponent = $scope.components[index];
      var newComponent = angular.copy(matchingComponent);
      var temp = Math.uuid();
      newComponent._id = temp;
      newComponent.anchor = temp;
      $scope.components.splice(index + 1, 0, newComponent);
      toaster.pop('success', "Component Added", "The " + newComponent.type + " component was added successfully.");
    };

    //disable delete redirect
    // var rx = /INPUT|SELECT|TEXTAREA/i;
    // angular.element('window.document').on('keydown', function (e) {
    //   if (e.which === 8 || e.which === 46) {
    //     if (!rx.test(e.target.tagName) || e.target.disabled || e.target.readOnly) {
    //       e.preventDefault();
    //     }
    //   }
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

    /*
     * @addImageToGallery
     * -
     */

    $scope.addImageToGallery = function (componentId, index) {
      console.log('addImageToGallery >>>', componentId, index);
      $scope.imgGallery = true;
      $scope.imgGalleryIndex = index;
      $scope.componentEditing = _.findWhere($scope.components, {
        _id: componentId
      });
      angular.element("#media-manager-modal").modal('show');
      $scope.showInsert = true;
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

    /*
     * @insertMedia
     * - insertmedia into various components
     */

    $scope.insertMedia = function (asset) {
      console.log('insertMedia ', asset);
      if ($scope.imageChange) {
        $scope.imageChange = false;
        var type = $scope.componentEditing.type;
        //if image/text component
        if (type == 'image-text') {
          $scope.componentEditing.imgurl = asset.url;
        } else if (type == 'feature-list') {
          var targetIndex = angular.element($scope.componentArrTarget).closest('.single-feature').data('index');
          $scope.componentEditing.features[targetIndex].imgurl = asset.url;
        } else if (type == 'simple-form') {
          $scope.componentEditing.imgurl = asset.url;
        } else if (type == 'image-gallery') {
          $scope.componentEditing.images[$scope.componentImageIndex].url = asset.url;
        } else if (type == 'thumbnail-slider') {
          $scope.componentEditing.thumbnailCollection[$scope.componentImageIndex].url = asset.url;
        } else if (type == 'meet-team') {
          $scope.componentEditing.teamMembers[$scope.componentImageIndex].profilepic = asset.url;
        } else {
          console.log('unknown component or image location');
        }
        $scope.bindEvents();
      } else if ($scope.postImage && !$scope.componentEditing) {
        $scope.postImage = false;
        $scope.postImageUrl = asset.url;
        toaster.pop('success', "Post Image added successfully");
        return;
      } else if ($scope.profilepic && !$scope.componentEditing) {
        $scope.profilepic = false;
        $scope.customerAccount.photo = asset.url;
        return;
      } else if ($scope.insertMediaImage) {
        $scope.insertMediaImage = false;
        // $scope.childScope.addCKEditorImage(asset.url, $scope.inlineInput, $scope.isEditMode);
        return;
      } else if ($scope.logoImage && $scope.componentEditing) {
        $scope.logoImage = false;
        $scope.componentEditing.logourl = asset.url;
      } else if ($scope.changeblobImage) {
        $scope.changeblobImage = false;
        $scope.blog_post.featured_image = asset.url;
        return;
      } else if ($scope.imgGallery && $scope.componentEditing) {
        $scope.imgGallery = false;
        $scope.componentEditing.images.splice($scope.imgGalleryIndex + 1, 0, {
          url: asset.url
        });
      } else if ($scope.imgThumbnail && $scope.componentEditing) {
        $scope.imgThumbnail = false;
        $scope.componentEditing.thumbnailCollection.push({
          url: asset.url
        });
      } else {
        if ($scope.componentEditing.bg.img) {
          $scope.componentEditing.bg.img.url = asset.url;
          return;
        }
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
