'use strict';
/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('EditorCtrl', ["$scope", "$document", "$rootScope", "$interval", "$timeout", "toaster", "$modal", "$filter", "$location", "WebsiteService", "SweetAlert", "hoursConstant", "GeocodeService", "ProductService", "AccountService", "postConstant", function ($scope, $document, $rootScope, $interval, $timeout, toaster, $modal, $filter, $location, WebsiteService, SweetAlert, hoursConstant, GeocodeService, ProductService, AccountService, postConstant) {

    /*
     * @savePage
     * -
     */

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

    /*
     * @cancelPage
     * -
     */

    $scope.cancelPage = function () {
      $scope.checkForSaveBeforeLeave();
    };

    /*
     * @getAccount
     * -
     */

    AccountService.getAccount(function (account) {
      $scope.account = account;
    });

    /*
     * @getUrl
     * -
     */

    $scope.getUrl = function (handle, is_post) {
      var _url;
      if (is_post) {
        handle = "blog/" + handle;
      }
      if (handle !== 'index') {
        _url = 'http://' + window.location.host + '/' + handle;
      } else {
        _url = 'http://' + window.location.host + '/';
      }
      if ($scope.account.domain) {
        _url = $scope.account.domain + '/' + handle;
      }
      window.open(_url, '_blank');
    };

    /*
     * @duplicateComponent
     * -
     */

    $scope.duplicateComponent = function (index) {
      var matchingComponent = $scope.components[index];
      var newComponent = angular.copy(matchingComponent);
      var temp = Math.uuid();
      newComponent._id = temp;
      newComponent.anchor = temp;
      $scope.components.splice(index + 1, 0, newComponent);
      $timeout(function() {
        var element = document.getElementById(newComponent._id);
        $document.scrollToElementAnimated(element, 175, 1000);
      }, 500);
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

    /*
     * @clickable-link
     * -
     */

    //Disable all links in edit
    angular.element("body").on("click", ".component a", function (e) {
      if (!angular.element(this).hasClass("clickable-link")) {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    /*
     * @retrievePage
     * -
     */

    $scope.retrievePage = function (_handle) {
      WebsiteService.getSinglePage(_handle, function (data) {
        $scope.page = data;
        $scope.components = $scope.page.components;
        $scope.activateCKeditor();
      });
    };

    /*
     * @retrievePost
     * -
     */
    $scope.blog = {};
    $scope.retrievePost = function (_handle) {
      WebsiteService.getSinglePage('single-post', function (data) {
        $scope.page = data;
        $scope.components = $scope.page.components;
        $scope.activateCKeditor();
        WebsiteService.getSinglePost(_handle, function (data) {
          $scope.blog.post = data;
          $scope.single_post = true;
        });
      });
    };

    /*
     * @calculateWindowHeight
     * -
     */

    window.calculateWindowHeight = function () {
      var scrollTop = angular.element(window.document).scrollTop();
      return scrollTop;
    };

    /*
     * @location:pagehandle
     * -
     */


    if ($location.search().pagehandle) {
      $scope.retrievePage($location.search().pagehandle);
    }

    /*
     * @location:posthandle
     * -
     */

    if ($location.search().posthandle) {
      $scope.retrievePost($location.search().posthandle);
    }

    /*
     * @ckeditor:instanceReady
     * -
     */

    $scope.ckeditorLoaded = false;

    $scope.activateCKeditor = function () {
      CKEDITOR.on("instanceReady", function () {
        if (!$scope.ckeditorLoaded) {
          $timeout(function () {
            $scope.ckeditorLoaded = true;
            $(window).trigger('resize');
          }, 100);
        }
      });
    };

    /*
     * @clickandInsertImageButton
     * -
     */

    window.clickandInsertImageButton = function (editor) {
      $scope.clickImageButton(editor, false);
    };

    /*
     * @window.clickImageButton
     * -
     */

    window.clickImageButton = function (btn) {
      var urlInput = $(btn).closest('td').prev('td').find('input');
      $scope.clickImageButton(urlInput, true);
    };

    /*
     * @addBackground Image
     * -
     */

    $scope.addBackground = function (componentId) {
      $scope.componentEditing = _.findWhere($scope.components, {
        _id: componentId
      });
    };

    /*
     * @addImageFromMedia
     * -
     */

    $scope.addImageFromMedia = function (componentId, index, update) {
      $scope.imageChange = true;
      $scope.updateImage = update;
      $scope.componentImageIndex = index;
      $scope.componentEditing = _.findWhere($scope.components, {
        _id: componentId
      });
      angular.element("#media-manager-modal").modal('show');
      $scope.showInsert = true;
    };

    /*
     * @clickImageButton
     * -
     */

    $scope.clickImageButton = function (editor, edit) {
      $scope.insertMediaImage = true;
      $scope.inlineInput = editor;
      $scope.isEditMode = edit;
      angular.element("#media-manager-modal").modal('show');
      $scope.showInsert = true;
    };

    /*
     * @addCKEditorImage
     * -
     */

    $scope.addCKEditorImage = function (url, inlineInput, edit) {
      if (inlineInput) {
        if (edit) {
          inlineInput.val(url);
        } else {
          inlineInput.insertHtml('<img data-cke-saved-src="' + url + '" src="' + url + '"/>');
        }
      }
    };

    /*
     * @insertMedia
     * - insertmedia into various components
     * - TODO: change to switch case and stop using if else
     */

    $scope.insertMedia = function (asset) {
      if ($scope.imageChange) {
        $scope.imageChange = false;
        var type = $scope.componentEditing.type;
        //if image/text component
        if (type === 'image-text') {
          $scope.componentEditing.imgurl = asset.url;
        } else if (type === 'feature-list') {
          var targetIndex = angular.element($scope.componentArrTarget).closest('.single-feature').data('index');
          $scope.componentEditing.features[targetIndex].imgurl = asset.url;
        } else if (type === 'simple-form') {
          $scope.componentEditing.imgurl = asset.url;
        } else if (type === 'image-gallery') {
          if ($scope.updateImage) {
            $scope.componentEditing.images[$scope.componentImageIndex].url = asset.url;
          } else {
            $scope.componentEditing.images.splice($scope.componentImageIndex + 1, 0, {
              url: asset.url
            });
            $scope.updateImage = false;
          }
        } else if (type === 'thumbnail-slider') {
          $scope.componentEditing.thumbnailCollection[$scope.componentImageIndex].url = asset.url;
        } else if (type === 'meet-team') {
          $scope.componentEditing.teamMembers[$scope.componentImageIndex].profilepic = asset.url;
        } else {
          console.log('unknown component or image location');
        }
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
         $scope.addCKEditorImage(asset.url, $scope.inlineInput, $scope.isEditMode);
        return;
      } else if ($scope.logoImage && $scope.componentEditing) {
        $scope.logoImage = false;
        $scope.componentEditing.logourl = asset.url;
      } else if ($scope.changeblobImage) {
        $scope.changeblobImage = false;
        $scope.blog_post.featured_image = asset.url;
        return;
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


    /*
     * @closeModal
     * -
     */

    // $scope.closeModal = function () {
    //   console.log('closeModal >>> ');
    //   $timeout(function () {
    //       $scope.modalInstance.close();
    //       angular.element('.modal-backdrop').remove();
    //   });
    //   if ($scope.componentEditing && $scope.componentEditing.type === 'contact-us' && $scope.contactHoursInvalid) {
    //     $scope.componentEditing.hours = $scope.originalComponent.hours;
    //     $scope.updateContactUsAddress();
    //   }
    //   $scope.contactHoursInvalid = false;
    // };

    /*
     * @openModal
     * -
     */

    $scope.openModal = function (modal, controller, index) {
      var _modal = {
        templateUrl: modal,
        resolve: {
          components: function () {
            return $scope.components
          }
        }
      };

      if (controller) {
        _modal.controller = controller;
      }

      if (index >= 0) {
        _modal.resolve.clickedIndex = function () {
          return index
        }
      }

      $scope.modalInstance = $modal.open(_modal);
      $scope.modalInstance.result.then(null, function () {
        angular.element('.sp-container').addClass('sp-hidden');
      });
    };

    /*
     * @openSettingsModal
     * -
     */

    $scope.openSettingsModal = function () {
      if ($scope.single_post) {
        $scope.openModal("post-settings-modal");
      } else {
        $scope.openModal("page-settings-modal");
      }
    };

    /*
     * @openDuplicateModal
     * -
     */

    $scope.openDuplicateModal = function () {
      if ($scope.single_post) {
        $scope.openModal("post-duplicate-modal");
      } else {
        $scope.openModal("page-duplicate-modal");
      }
    };

    /*
     * @getWebsite
     * -
     */

    WebsiteService.getWebsite(function (website) {
      $scope.website = website;
    });

    /*
     * @getPages
     * -
     */

    WebsiteService.getPages(function (pages) {
      var parsed = angular.fromJson(pages);
      var arr = [];
      _.each(parsed, function (page) {
        arr.push(page);
      });
      $scope.allPages = arr;
      $scope.filterdedPages = $filter('orderBy')($scope.allPages, "title", false);
    });

    /*
     * @checkForDuplicatePage
     * - Check for duplicate page
     */

    $scope.checkForDuplicatePage = function () {
      WebsiteService.getSinglePage($scope.page.handle, function (data) {
        if (data && data._id) {
          if (data._id !== $scope.page._id) {
            $scope.duplicateUrl = true;
            toaster.pop('error', "Page URL " + $scope.page.handle, "Already exists");
          } else {
            $scope.duplicateUrl = false;
          }
        }
      });
    };

    /*
     * @slugifyHandle
     * - 
     */

    $scope.slugifyHandle = function (title) {
      if (title) {
        $scope.newPage.handle = $filter('slugify')(title);
      }
    };

    $scope.newPage = {};

    /*
     * @watch:page.handle
     * - 
     */

    $scope.$watch('page.handle', function (newValue, oldValue) {
      if (newValue) {
        $scope.page.handle = $filter('slugify')(newValue);
      }
    });

    $scope.createDuplicatePage = function (newPage) {
      $scope.validateNewPage(newPage);
      if (!$scope.newPageValidated) {
        toaster.pop('error', "Page Title or URL can not be blank.");
        return false;
      }
      WebsiteService.getSinglePage(newPage.handle, function (data) {
        if (data && data._id) {
          toaster.pop('error', "Page URL " + newPage.handle, "Already exists");
          return false;
        }
        newPage.components = $scope.page.components;
        WebsiteService.createDuplicatePage(newPage, function (data) {
          $scope.duplicate = true;
          $scope.checkForSaveBeforeLeave('/admin/#/website/pages/?pagehandle=' + newPage.handle, true);
        });
      });
    };

    /*
     * @validateNewPage
     * -
     */

    $scope.newPageValidated = false;

    $scope.validateNewPage = function (page) {
      if (!page.handle || page.handle === '') {
        angular.element('#new-page-url').parents('div.form-group').addClass('has-error');
      } else {
        angular.element('#new-page-url').parents('div.form-group').removeClass('has-error');
      }
      if (!page.title || page.title === '') {
        angular.element('#new-page-title').parents('div.form-group').addClass('has-error');
      } else {
        angular.element('#new-page-title').parents('div.form-group').removeClass('has-error');
      }
      if (page && page.title && page.title !== '' && page.handle && page.handle !== '') {
        $scope.newPageValidated = true;
      } else {
        $scope.newPageValidated = false;
      }
    };

    /*
     * @checkForSaveBeforeLeave
     * -
     */

    $scope.checkForSaveBeforeLeave = function (url, reload) {
      $scope.changesConfirmed = true;
      // var isDirty = false;
      // var iFrame = document.getElementById("iframe-website");
      // if ($scope.childScope.checkOrSetPageDirty) {
      //   var isDirty = $scope.childScope.checkOrSetPageDirty() || $scope.isDirty;
      // }
      // $scope.childScope.checkOrSetPageDirty(true);
      var redirectUrl = url;
      if (!redirectUrl) {
        redirectUrl = $location.search().posthandle ? "/admin/#/website/posts" : "/admin/#/website/pages";
      }
      if ($scope.isDirty) {
        SweetAlert.swal({
          title: "Are you sure?",
          text: "You have unsaved data that will be lost",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, save changes!",
          cancelButtonText: "No, do not save changes!",
          closeOnConfirm: false,
          closeOnCancel: false
        }, function (isConfirm) {
          if (isConfirm) {
            SweetAlert.swal("Saved!", "Your edits were saved to the page.", "success");
            $scope.redirect = true;
            $scope.savePage();
            window.location = redirectUrl;
            if (reload) {
              window.location.reload();
            }

          } else {
            SweetAlert.swal("Cancelled", "Your edits were NOT saved.", "error");
            window.location = redirectUrl;
            if (reload) {
              window.location.reload();
            }
          }
        });
      } else {
        window.location = redirectUrl;
        if (reload) {
          window.location.reload();
        }
      }
    };

    /*
     * @deletePage
     * -
     */

    $scope.deletePage = function () {
      SweetAlert.swal({
        title: "Are you sure?",
        text: "Do you want to delete this page",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete page!",
        cancelButtonText: "No, do not delete page!",
        closeOnConfirm: false,
        closeOnCancel: false
      }, function (isConfirm) {
        if (isConfirm) {
          SweetAlert.swal("Saved!", "Page is deleted.", "success");
          var pageId = $scope.page._id;
          var websiteId = $scope.page.websiteId;
          var title = $scope.page.title;

          WebsiteService.deletePage(pageId, websiteId, title, function (data) {
            toaster.pop('success', "Page Deleted", "The " + title + " page was deleted successfully.");
            $scope.closeModal();
            $timeout(function () {
              window.location = '/admin/#/website/pages';
            }, 500);
          });
        } else {
          SweetAlert.swal("Cancelled", "Page not deleted.", "error");
        }
      });
    };

  }]);
}(angular));
