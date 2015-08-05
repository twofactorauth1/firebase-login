'use strict';
/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('EditorCtrl', ["$scope", "$document", "$rootScope", "$interval", "$timeout", "toaster", "$modal", "$filter", "$location", "WebsiteService", "SweetAlert", "hoursConstant", "GeocodeService", "ProductService", "AccountService", "postConstant", function ($scope, $document, $rootScope, $interval, $timeout, toaster, $modal, $filter, $location, WebsiteService, SweetAlert, hoursConstant, GeocodeService, ProductService, AccountService, postConstant) {

    /*
     * @ckeditor:instanceReady
     * -
     */

    $scope.ckeditorLoaded = false;
    $scope.activeEditor = null;
    $scope.activateCKeditor = function () {
      CKEDITOR.on("instanceReady", function (ev) {
        ev.editor.on('key', function () {
          $scope.isDirty.dirty = true;
        });
        if (!$scope.activeEditor)
          $scope.activeEditor = ev.editor;
        ev.editor.on('focus', function () {
          $scope.activeEditor = ev.editor;
        });
        ev.editor.on('blur', function () {
          $scope.activeEditor = null;
        });
        if (!$scope.ckeditorLoaded) {
          $timeout(function () {
            $scope.ckeditorLoaded = true;
            //$scope.setUnderbnavMargin();
            $(window).trigger('resize');
          }, 100);
        }
      });
      $timeout(function () {
        if (!$scope.ckeditorLoaded)
            $scope.ckeditorLoaded = true;
      }, 12000);
    };

    $scope.preDragging = false;
    $scope.preDrag = function (value) {
      if (value === 'enter') {
        $scope.preDragging = true;
      }
      if (value === 'leave') {
        $scope.preDragging = false;
      }
    };

    $scope.singleReorder = function (value, component, index) {
      console.log('singleReorder >>> ', value);
      if (value === 'down') {
        $scope.components.splice(index, 1);
        $scope.components.splice(index + 1, 0, component);
        $scope.scrollToComponent(index + 1);
      }

      if (value === 'up') {
        $scope.components.splice(index, 1);
        $scope.components.splice(index - 1, 0, component);
        $scope.scrollToComponent(index - 1);
      }
      $timeout(function () {
        $(window).trigger('resize');
      }, 0)
    };

    $scope.scrollToComponent = function (destIndex) {
      $timeout(function () {
        var anchor = $scope.components[destIndex] && ($scope.components[destIndex].anchor || $scope.components[destIndex]._id);
        var element = document.getElementById(anchor);
        if (element) {
          $document.scrollToElementAnimated(element, 175, 1000);
        }
      }, 500);
    };

    /*
     * @savePage
     * -
     */

    $scope.isEditing = true;
    //$scope.isDirty = false;
    $scope.isDirty = {};
    $scope.savePage = function () {
      $scope.saveLoading = true;
      $scope.isDirty.dirty = false;

      if ($scope.isSinglePost) {
        $scope.validateEditPost($scope.blog.post);
        if (!$scope.editPostValidated) {
          $scope.saveLoading = false;
          toaster.pop('error', "Post Title or URL can not be blank.");
          return false;
        }
        var post_data = angular.copy($scope.blog.post);
        post_data.post_tags.forEach(function (v, i) {
          if (v.text) {
            post_data.post_tags[i] = v.text;
          }
        });
        WebsiteService.getSinglePost(post_data.post_url, function (data) {
          if (data && data._id && data._id !== post_data._id) {
            $scope.saveLoading = false;
            toaster.pop('error', "Post URL " + post_data.post_url, "Already exists");
          } else {
            WebsiteService.updatePost($scope.page._id, post_data._id, post_data, function (data) {
              if (post_data.post_url !== $scope.originalPost.post_url) {
                angular.copy(post_data, $scope.originalPost);
                $location.search('posthandle', post_data.post_url);
              }
              $scope.saveLoading = false;
              toaster.pop('success', "Post Saved", "The " + $filter('htmlToPlaintext')($scope.blog.post.post_title) + " post was saved successfully.");
            });
          }
        })

      } else if ($scope.templateActive) {
        WebsiteService.updateTemplate($scope.page._id, $scope.page, function () {
          console.log('success');
          $scope.saveLoading = false;
          toaster.pop('success', "Template Saved", "The " + $scope.page.handle + " template was saved successfully.");
        });
      } else {
        //$scope.validateEditPage($scope.page);

        $scope.checkForDuplicatePage(function () {
          if (!$scope.editPageValidated) {
            $scope.saveLoading = false;
            toaster.pop('error', "Page Title or URL can not be blank.");
            return false;
          }
          if (!$scope.duplicateUrl)
            WebsiteService.updatePage($scope.page, function (data) {
              console.log($scope.page.handle, $scope.originalPage.handle);
              if ($scope.page.handle !== $scope.originalPage.handle) {
                $location.search('pagehandle', $scope.page.handle);
              }
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
          else
            $scope.saveLoading = false;
        });
      }
    };

    /*
     * @cancelPage
     * -
     */

    $scope.cancelPage = function () {
      $scope.checkForSaveBeforeLeave();
    };

    /*
     * @getWebsite
     * -
     */

    $scope.getWebsite = function (fn) {
      WebsiteService.getWebsite(function (website) {
        $scope.website = website;
        if (fn) {
          fn($scope.website);
        }
      });
    };

    $scope.getWebsite();

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
        $scope.originalComponents = angular.copy($scope.components);
        $scope.originalPage = angular.copy(data);
        $scope.activePage = true;
        $scope.activateCKeditor();
        $rootScope.breadcrumbTitle = $scope.page.title;
      });
    };

    /*
     * @retrievePost
     * -
     */
    $scope.blog = {};
    $scope.retrievePost = function (_handle) {
      $scope.isSinglePost = true;
      $scope.newPost = {};
      $scope.handle = _handle;
      $scope.post_statuses = postConstant.post_status.dp;
      WebsiteService.getSinglePage('single-post', function (data) {
        $scope.page = data;
        WebsiteService.getSinglePost($scope.handle, function (data) {
          $scope.blog.post = data;
          $scope.single_post = true;
          $scope.components = $scope.page.components;
          $scope.originalPost = angular.copy(data);
          $rootScope.breadcrumbTitle = $filter('htmlToPlaintext')($scope.blog.post.post_title);
          $scope.activateCKeditor();
        });

      });
    };

    /*
     * @retrieveTemplate
     * -
     */

    $scope.retrieveTemplate = function (_handle) {
      $scope.templateActive = true;
      WebsiteService.getTemplates(function (templates) {
        $scope.page = _.find(templates, function (tmpl) {
          return tmpl.handle === _handle;
        });

        $scope.components = $scope.page.config.components;
        $scope.originalComponents = angular.copy($scope.components);
        $scope.originalPage = angular.copy($scope.template);
        $scope.activateCKeditor();
        $rootScope.breadcrumbTitle = $scope.page.title || $scope.page.handle;
      });
    };

    $scope.getSinglePostData = function () {
      console.log('getSinglePostData');
    };

    /*
     * @removeTemplateImage
     * -
     */

    $scope.removeTemplateImage = function () {
      console.log('remove template image');
      $scope.page.previewUrl = null;
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
     * @location:email
     * -
     */


    if ($location.search().email) {
      $scope.emailPage = true;
      $scope.retrievePage($location.search().email);
    }

    /*
     * @location:posthandle
     * -
     */

    if ($location.search().posthandle) {
      $scope.retrievePost($location.search().posthandle);
    }

    /*
     * @location:posthandle
     * -
     */

    if ($location.search().templatehandle) {
      $scope.retrieveTemplate($location.search().templatehandle);
    }

    /*
     * @clickandInsertImageButton
     * -
     */

    window.clickandInsertImageButton = function (editor) {
      console.log('clickandInsertImageButton >>> ');
      $scope.clickImageButton(editor, false);
    };

    /*
     * @window.clickImageButton
     * -
     */

    window.clickImageButton = function (btn) {
      console.log('clickImageButton >>> ');
      var urlInput = $(btn).closest('td').prev('td').find('input');
      $scope.clickImageButton(urlInput, true);
    };

    /*
     * @addBackground Image
     * -
     */

    $scope.setEditingComponent = function (index) {
      if ($scope.components) {
        $scope.componentEditing = $scope.components[index];
      }
    };

    /*
     * @addImageFromMedia
     * -
     */

    $scope.addImageFromMedia = function (componentId, index, update) {
      $scope.imageChange = true;
      $scope.showInsert = true;
      $scope.updateImage = update;
      $scope.componentImageIndex = index;
      $scope.componentEditing = _.findWhere($scope.components, {
        _id: componentId
      });
      console.log('componentEditing ', $scope.componentEditing);
      $scope.openModal('media-modal', 'MediaModalCtrl', null, 'lg');
    };
    /*
     * @changeBlogImage
     * -
     */
    $scope.changeBlogImage = function (blog, index) {
      $scope.changeblobImage = true;
      $scope.showInsert = true;
      $scope.blog_post = blog;
      $scope.openModal('media-modal', 'MediaModalCtrl', null, 'lg');
    };


    $scope.addImageToThumbnail = function (componentId, index, update, parentIndex, numberPerPage) {
      $scope.imageChange = true;
      $scope.showInsert = true;
      $scope.updateImage = update;
      $scope.componentImageIndex = index;
      if (parentIndex && numberPerPage) {
        $scope.componentImageIndex = (parseInt(parentIndex, 10) * parseInt(numberPerPage, 10)) + parseInt(index, 10);
      }
      $scope.componentEditing = _.findWhere($scope.components, {
        _id: componentId
      });
      $scope.openModal('media-modal', 'MediaModalCtrl', null, 'lg');
    };

    /*
     * @clickImageButton
     * -
     */

    $scope.clickImageButton = function (editor, edit) {
      $scope.insertMediaImage = true;
      $scope.showInsert = true;
      $scope.inlineInput = editor;
      $scope.isEditMode = edit;
      $scope.openModal('media-modal', 'MediaModalCtrl', null, 'lg');
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
    $scope.thumbnailSlider = {};
    $scope.contactMap = {};
    $scope.underNav = {};

    $scope.insertMedia = function (asset) {
      console.log('$scope.componentEditing ', $scope.componentEditing);
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
          if ($scope.updateImage) {
            $scope.componentEditing.thumbnailCollection[$scope.componentImageIndex].url = asset.url;
          } else {
            $scope.componentEditing.thumbnailCollection.splice($scope.componentImageIndex + 1, 0, {
              url: asset.url
            });
            $scope.updateImage = false;
          }
          $scope.thumbnailSlider.refreshSlider();
        } else if (type === 'meet-team') {
          $scope.componentEditing.teamMembers[$scope.componentImageIndex].profilepic = asset.url;
        } else {
          console.log('unknown component or image location');
        }
      } else if ($scope.changeblobImage) {
        $scope.changeblobImage = false;
        $scope.blog_post.featured_image = asset.url;
        return;
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
      } else if ($scope.blogImage) {
        $scope.blogImage = false;
        $scope.blog.post.featured_image = asset.url;
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

    $scope.closeModal = function () {
      console.log('closeModal >>> ');
      $timeout(function () {
        $scope.modalInstance.close();
        angular.element('.modal-backdrop').remove();
      });
    };

    /*
     * @openSimpleModal
     * -
     */
    $scope.openSimpleModal = function (modal) {
      var _modal = {
        templateUrl: modal,
        scope: $scope
      };
      $scope.modalInstance = $modal.open(_modal);
      $scope.modalInstance.result.then(null, function () {
        angular.element('.sp-container').addClass('sp-hidden');
      });
    };

    /*
     * @openModal
     * -
     */

    $scope.openModal = function (modal, controller, index, size) {
      console.log('openModal >>> ', modal, controller, index);
      var _modal = {
        templateUrl: modal,
        size: 'md',
        resolve: {
          components: function () {
            if (!$scope.components)
              $scope.components = [];
            return $scope.components;
          }
        }
      };

      if (controller) {
        _modal.controller = controller;

        _modal.resolve.contactMap = function () {
          return $scope.contactMap;
        };
        _modal.resolve.website = function () {
          return $scope.website;
        };
        _modal.resolve.blog = function () {
          return $scope.blog.post;
        };
        _modal.resolve.isDirty = function () {
          return $scope.isDirty;
        };
        _modal.resolve.isSinglePost = function () {
          return $scope.isSinglePost;
        };

        _modal.resolve.showInsert = function () {
          return $scope.showInsert;
        };

        _modal.resolve.insertMedia = function () {
          return $scope.insertMedia;
        };

        _modal.resolve.openParentModal = function () {
          return $scope.openModal;
        };

        _modal.resolve.underNav = function () {
          return $scope.underNav;
        };
      }

      if (angular.isDefined(index) && index !== null && index >= 0) {
        $scope.setEditingComponent(index);
        _modal.resolve.clickedIndex = function () {
          return index;
        };
      }

      if (size) {
        _modal.size = 'lg';
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
        $scope.openSimpleModal("post-settings-modal");
      }

      if ($scope.activePage) {
        $scope.openSimpleModal("page-settings-modal");
      }

      if ($scope.templateActive) {
        $scope.openModal("template-settings-modal", 'TemplateSettingsModalCtrl');
      }
    };

    /*
     * @openDuplicateModal
     * -
     */

    $scope.openDuplicateModal = function () {
      if ($scope.single_post) {
        $scope.openSimpleModal("post-duplicate-modal");
      } else {
        $scope.duplicate_type = "Page";
        if ($scope.emailPage)
          $scope.duplicate_type = "Email";
        $scope.openSimpleModal("page-duplicate-modal");
      }
    };

    /*
     * @checkForDuplicatePage
     * - Check for duplicate page
     */

    $scope.checkForDuplicatePage = function (fn) {
      $scope.validateEditPage($scope.page);
      if ($scope.editPageValidated)
        WebsiteService.getSinglePage($scope.page.handle, function (data) {
          if (data && data._id) {
            if (data._id !== $scope.page._id) {
              $scope.duplicateUrl = true;
              toaster.pop('error', "Page URL " + $scope.page.handle, "Already exists");
            } else {
              $scope.duplicateUrl = false;
            }
          }
          if (fn)
            fn();
        });
      else
      if (fn)
        fn();
    };

    /*
     * @validateEditPage
     * -
     */

    $scope.editPageValidated = false;

    $scope.validateEditPage = function (page) {

      if (page.handle == '') {
        $scope.handleError = true;
        angular.element('#edit-page-url').parents('div.form-group').addClass('has-error');
      } else {
        $scope.handleError = false;
        angular.element('#edit-page-url').parents('div.form-group').removeClass('has-error');
      }
      if (page.title == '') {
        $scope.titleError = true;
        angular.element('#edit-page-title').parents('div.form-group').addClass('has-error');
      } else {
        $scope.titleError = false;
        angular.element('#edit-page-title').parents('div.form-group').removeClass('has-error');
      }
      if (page && page.title && page.title != '' && page.handle && page.handle != '') {
        $scope.editPageValidated = true;
      } else
        $scope.editPageValidated = false;
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

    $scope.slugifyPostHandle = function (title) {
      if (title) {
        $scope.newPost.post_url = $filter('slugify')(title);
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
      if ($scope.emailPage)
        newPage.type = "email";

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
          if ($scope.emailPage)
            $scope.checkForSaveBeforeLeave('/admin/#/editor?email=' + newPage.handle, true);
          else
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

    $scope.createDuplicatePost = function (newPost) {
      $scope.validateNewPost(newPost);
      if (!$scope.newPostValidated) {
        toaster.pop('error', "Post Title or URL can not be blank.");
        return false;
      }
      WebsiteService.getSinglePost(newPost.post_url, function (data) {
        if (data && data._id) {
          toaster.pop('error', "Post URL " + newPost.post_url, "Already exists");
          return false;
        }

        var post_data = angular.copy($scope.blog.post);
        post_data._id = null;
        post_data.post_url = newPost.post_url;
        post_data.post_title = newPost.post_title;
        post_data.post_tags.forEach(function (v, i) {
          if (v.text) {
            post_data.post_tags[i] = v.text;
          }
        });
        WebsiteService.createPost($scope.page._id, post_data, function (data) {
          $scope.duplicate = true;
          $scope.checkForSaveBeforeLeave('/admin/#/website/posts/?posthandle=' + newPost.post_url, true);
        });
      });
    };

    /*
     * @validateNewPost
     * -
     */

    $scope.newPostValidated = false;

    $scope.validateNewPost = function (post) {
      if (!post.post_url || post.post_url === '') {
        $scope.handleError = true;
        angular.element('#new-post-url').parents('div.form-group').addClass('has-error');
      } else {
        $scope.handleError = false;
        angular.element('#new-post-url').parents('div.form-group').removeClass('has-error');
      }
      if (!post.post_title || post.post_title === '') {
        $scope.titleError = true;
        angular.element('#new-post-title').parents('div.form-group').addClass('has-error');
      } else {
        $scope.titleError = false;
        angular.element('#new-post-title').parents('div.form-group').removeClass('has-error');
      }
      if (post && post.post_title && post.post_title !== '' && post.post_url && post.post_url !== '') {
        $scope.newPostValidated = true;
      } else {
        $scope.newPostValidated = false;
      }
    };

    /*
     * @validateEditPost
     * -
     */

    $scope.editPostValidated = false;

    $scope.validateEditPost = function (post, update) {
      if (post.post_url === '') {
        $scope.handleError = true;
        angular.element('#edit-post-url').parents('div.form-group').addClass('has-error');
      } else {
        $scope.handleError = false;
        angular.element('#edit-post-url').parents('div.form-group').removeClass('has-error');
      }
      if (post.post_title === '') {
        $scope.titleError = true;
        angular.element('#edit-post-title').parents('div.form-group').addClass('has-error');
      } else {
        $scope.titleError = false;
        angular.element('#edit-post-title').parents('div.form-group').removeClass('has-error');
      }
      if (post && post.post_title && post.post_title !== '' && post.post_url && post.post_url !== '') {
        $scope.editPostValidated = true;
      } else {
        $scope.editPostValidated = false;
      }
    };

    /*
     * @checkForSaveBeforeLeave
     * -
     */

    $scope.checkForSaveBeforeLeave = function (url, reload) {
      $scope.changesConfirmed = true;
      if ($scope.originalComponents && $scope.components && $scope.originalComponents.length !== $scope.components.length) {
        $scope.isDirty.dirty = true;
      }
      if ($scope.isSinglePost) {
        if ($scope.blog.post && !angular.equals($scope.originalPost, $scope.blog.post)) {
          $scope.isDirty.dirty = true;
        }
      }
      var redirectUrl = url;
      if (!redirectUrl) {
        redirectUrl = $location.search().posthandle ? "/admin/#/website/posts" : "/admin/#/website/pages";
      }
      if ($scope.isDirty.dirty) {
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
      angular.element('.modal.in').hide();
      SweetAlert.swal({
        title: "Are you sure?",
        text: "Do you want to delete this page",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete page!",
        cancelButtonText: "No, do not delete page!",
        closeOnConfirm: true,
        closeOnCancel: true
      }, function (isConfirm) {
        angular.element('.modal.in').show();
        if (isConfirm) {
          SweetAlert.swal("Saved!", "Page is deleted.", "success");
          var websiteId = $scope.page.websiteId;
          var title = $scope.page.title;

          WebsiteService.deletePage($scope.page, websiteId, title, function (data) {
            toaster.pop('success', "Page Deleted", "The " + title + " page was deleted successfully.");
            $scope.closeModal();
            $timeout(function () {
              window.location = '/admin/#/website/pages';
            }, 500);
          });
        } else {
          $timeout(function () {
              SweetAlert.swal("Cancelled", "Page not deleted.", "error");
            }, 500);
        }
      });
    };

    /*
     * @deletePost
     * -
     */

    $scope.deletePost = function () {
      SweetAlert.swal({
          title: "Are you sure?",
          text: "Do you want to delete this page",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete post!",
          cancelButtonText: "No, do not delete post!",
          closeOnConfirm: false,
          closeOnCancel: false
        },
        function (isConfirm) {
          if (isConfirm) {
            var title = $scope.blog.post.post_title;
            SweetAlert.swal("Saved!", "Post is deleted.", "success");
            WebsiteService.deletePost($scope.page._id, $scope.blog.post._id, function (data) {
              toaster.pop('success', "Post Deleted", "The " + title + " post was deleted successfully.");
              $scope.closeModal();
              $timeout(function () {
                window.location = '/admin/#/website/posts';
              }, 500);
            });

          } else {
            SweetAlert.swal("Cancelled", "Post not deleted.", "error");
          }
        });
    };

    // CKEDITOR.disableAutoInline = true;

    /*
     * @deleteComponent
     * -
     */

    $scope.deleteComponent = function (index) {
      $scope.components.splice(index, 1);
      $timeout(function () {
        $scope.scrollToComponent(index)
      }, 1000)
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
      $timeout(function () {
        var element = document.getElementById(newComponent._id);
        $document.scrollToElementAnimated(element, 175, 1000);
      }, 500);
      toaster.pop('success', "Component Added", "The " + newComponent.type + " component was added successfully.");
    };

    $scope.addUnderNavSetting = function (fn) {
      $scope.allowUndernav = false;
      $scope.components.forEach(function (value, index) {
        if (value && value.type === 'masthead') {
          if (index != 0 && $scope.components[index - 1].type == "navigation") {
            $scope.allowUndernav = true;
          } else
            $scope.allowUndernav = false;
        }
      })
      fn($scope.allowUndernav);
    }

    /*
     * @sortableOptions
     * -
     */

    // $scope.sortableCompoents = $scope.components;

    // $scope.wait = '';
    // $scope.first = true;

    $scope.barConfig = {
      animation: 0,
      handle: '.reorder',
      draggable: '.fragment',
      ghostClass: "sortable-ghost",
      scroll: true,
      scrollSensitivity: 200,
      scrollSpeed: 20, // px
      onSort: function (evt) {
        $scope.scrollToComponent(evt.newIndex);
      },
      onStart: function (evt) {
        $scope.dragging = true;
      },
      onEnd: function (evt) {
        $scope.dragging = false;
      }
    };

    // $scope.sortableOptions = {
    //   parentElement: "#componentloader",
    //   containerPositioning: 'relative',
    //   dragStart: function (e, ui) {
    //     $scope.dragging = true;
    //     $scope.first = false;
    //     clearTimeout($scope.wait);
    //   },
    //   dragMove: function (e, ui) {
    //     console.log('sorting update');
    //   },
    //   dragEnd: function (e, ui) {
    //     $scope.first = true;
    //     $scope.dragging = false;
    //     $scope.wait = setTimeout(function () {
    //       // e.dest.sortableScope.element.removeClass("active");
    //       $timeout(function () {
    //         var anchor = $scope.components[e.dest.index].anchor || $scope.components[e.dest.index]._id;
    //         var element = document.getElementById(anchor);
    //         if (element) {
    //           $document.scrollToElementAnimated(element, 175, 1000);
    //         }
    //       }, 500);
    //     }, 500);
    //   }
    // };

  }]);
}(angular));
