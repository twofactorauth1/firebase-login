'use strict';
/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('EditorCtrl', ["$scope", "$document", "$rootScope", "$interval", "$timeout", "toaster", "$modal", "$filter", "$location", "WebsiteService", "SweetAlert", "hoursConstant", "GeocodeService", "ProductService", "AccountService", "postConstant", "formValidations", function ($scope, $document, $rootScope, $interval, $timeout, toaster, $modal, $filter, $location, WebsiteService, SweetAlert, hoursConstant, GeocodeService, ProductService, AccountService, postConstant, formValidations) {

    /*
     * @circleOptions
     * -
     */

    $scope.$watch('$parent.emailToSend', function (newValue, oldValue) {
      console.log('newValue', newValue);
      $scope.ckeditorLoaded = false;
      $scope.retrieveEmail(null, newValue);
    });

    $scope.formValidations = formValidations;

    $scope.circleOptions = {
      isOpen: false,
      toggleOnClick: true,
      background: '#FDB94E',
      size: "big",
      button: {
        content: "",
        cssClass: "fa fa-edit fa-2x",
        background: "#efa022",
        color: "#fff",
        size: "big"
      },
      items: [{
        type: 'design',
        content: '<span class="fa fa-paint-brush"></span> Design',
        cssClass: "",
        onclick: function (options, item, val, i) {
          $scope.openModal('component-settings-modal', 'ComponentSettingsModalCtrl', parseInt(i, 10));
        }
      }, {
        type: 'clone',
        content: '<span class="fa fa-clone"></span> Clone',
        cssClass: "",
        onclick: function (options, item, val, i) {
          $scope.duplicateComponent(parseInt(i, 10));
        }
      }, {
        type: 'up',
        content: '<span class="fa fa-chevron-up"></span> Up',
        cssClass: "",
        onclick: function (options, item, val, i) {
          $scope.singleReorder('up', val, parseInt(i, 10));
        }
      }, {
        type: 'down',
        content: '<span class="fa fa-chevron-down"></span> Down',
        cssClass: "",
        onclick: function (options, item, val, i) {
          $scope.singleReorder('down', val, parseInt(i, 10));
        }
      }, {
        type: 'add',
        content: '<span class="fa fa-plus"></span> Add',
        cssClass: "",
        onclick: function (options, item, val, i) {
          $scope.openModal('add-component-modal', 'AddComponentModalCtrl', parseInt(i, 10))
        }
      }, {
        type: 'delete',
        content: '<span class="fa fa-times"></span> Delete',        
        cssClass: "",
        onclick: function (options, item, val, i) {
          $scope.deleteComponent(parseInt(i, 10));
        }
      }, {
        empty: true
      }, {
        empty: true
      }, {
        empty: true
      }, {
        empty: true
      }, {
        empty: true
      }, {
        empty: true
      }]
    };

    $scope.setDirty = function(is_dirty){
      $scope.isDirty.dirty = is_dirty;      
    }


    /*
     * @ckeditor:instanceReady
     * -
     */

    $scope.ckeditorLoaded = false;
    $scope.activeEditor = null;
    $scope.activateCKeditor = function () {
      CKEDITOR.on("instanceReady", function (ev) {

        if ($scope.isEmail) {
          //unable to access plugin from ckeditor api
          angular.element('.cke_button__doksoft_font_awesome').hide();
        }
        else
          angular.element('.cke_button__doksoft_font_awesome').show();
        ev.editor.on('key', function () {
          $scope.setDirty(true);
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
          }, 500);
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

    $scope.validateContactAddress = function (fn) {
      $scope.contactComponentType = _.findWhere($scope.components, {
        type: 'contact-us'
      });
      if ($scope.contactComponentType) {
        GeocodeService.validateAddress($scope.contactComponentType.location, function (data) {
          if (!data) {
            toaster.pop('warning', 'Address could not be found for contact component. Please enter valid address');
            $scope.saveLoading = false;
            fn(false);
          } else
            fn(true);
        });
      } else
        fn(true);
    }

    /*
     * @refreshLinkList
     * -
     */

    $scope.refreshLinkList = function (value, old_handle) {
      var new_handle = $scope.page.handle;
      _.each(value.links, function (element, index) {
        if (element.linkTo && element.linkTo.type == "section" && element.linkTo.page == old_handle)
          element.linkTo.page = new_handle;
        else if (element.linkTo && element.linkTo.type == "page" && element.linkTo.data == old_handle)
          element.linkTo.data = new_handle;
      });
    }

    $scope.redirectAfterSave = function(redirect_url){    
    if(redirect_url){
        SweetAlert.swal("Saved!", "Your edits were saved to the page.", "success");
        window.location = redirect_url;
      }
    }

    $scope.redirectWithoutSave = function(redirect_url, show_alert){
    $scope.changesConfirmed = true;
    if(redirect_url){       
          if(show_alert)
              SweetAlert.swal("Cancelled", "Your edits were NOT saved.", "error");
          window.location = redirect_url;
      }
    }

    /*
     * @savePage
     * -
     */

    $scope.isEditing = true;
    //$scope.isDirty = false;
    $scope.isDirty = {};
    $scope.blogImage = {};
    $scope.blogImage.featured_image = false;
    $scope.savePage = function (redirect_url) {
      $scope.saveLoading = true;
      $scope.setDirty(false);
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
                $location.search('posthandle', post_data.post_url);
              }
              $scope.saveLoading = false;
              $scope.blog.post = data;
              angular.copy($scope.blog.post, $scope.originalPost);
              toaster.pop('success', "Post Saved", "The " + $filter('htmlToPlaintext')($scope.blog.post.post_title) + " post was saved successfully.");              
              $scope.redirectAfterSave(redirect_url);
            });
          }
        })

      } else if ($scope.templateActive) {
        WebsiteService.updateTemplate($scope.page._id, $scope.page, function () {
          console.log('success');
          $scope.saveLoading = false;
          toaster.pop('success', "Template Saved", "The " + $scope.page.handle + " template was saved successfully.");
          $scope.redirectAfterSave(redirect_url);
        });
      } else {
        $scope.checkForDuplicatePage(function () {
          console.log('$scope.duplicateUrl ', $scope.duplicateUrl);
          if ($scope.isEmail) {
            $scope.editPageValidated = true;
          }
          if (!$scope.editPageValidated) {
            $scope.saveLoading = false;
            toaster.pop('error', "Page Title or URL can not be blank.");
            return false;
          }
          if (!$scope.duplicateUrl)
            $scope.validateContactAddress(function (data) {
              if (data && !$scope.isEmail) {
                WebsiteService.updatePage($scope.page, $scope.originalPage.handle, function (data) {
                  console.log($scope.page.handle, $scope.originalPage.handle);
                  $scope.saveLoading = false;
                  toaster.pop('success', "Page Saved", "The " + $scope.page.handle + " page was saved successfully.");
                  $scope.redirectAfterSave(redirect_url);
                  //$scope.page = data;
                  var originalPageHandle = angular.copy($scope.originalPage.handle);
                  //angular.copy($scope.page, $scope.originalPage);
                  
                  //Update linked list
                  $scope.website.linkLists.forEach(function (value, index) {
                    if (value.handle === "head-menu") {
                      if ($scope.page.handle !== originalPageHandle) {
                        $location.search('pagehandle', $scope.page.handle);
                        $scope.refreshLinkList(value, originalPageHandle);
                      }
                      WebsiteService.updateLinkList($scope.website.linkLists[index], $scope.website._id, 'head-menu', function (data) {                                               
                        console.log('Updated linked list');

                      });
                      if ($scope.page.handle === 'blog' && $scope.blogControl.saveBlogData)
                        $scope.blogControl.saveBlogData();
                    }
                  });

                });
              }

              if ($scope.isEmail) {
                WebsiteService.updateEmail($scope.page, function(data) {
                  $scope.saveLoading = false;
                  toaster.pop('success', "Email Saved", "The " + $scope.page.title + " email was saved successfully.");
                });
              }
            })
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
      if (_handle === 'blog' || _handle === 'single-post')
        $scope.post_blog_page = true;
      WebsiteService.getSinglePage(_handle, function (data) {
        $scope.page  = angular.copy(data);
        $scope.components = $scope.page.components;
        
        $scope.originalPage = angular.copy(data);
        $scope.activePage = true;
        $scope.activateCKeditor();
        $rootScope.breadcrumbTitle = $scope.page.title;
        if($scope.page.templateId)
          WebsiteService.getTemplates(function (templates) {
            $scope.pageTemplate = _.findWhere(templates, {
              _id: $scope.page.templateId
            });
          })
      });
    };

    /*
     * @retrieveEmail
     * -
     */

    $scope.retrieveEmail = function (_emailId, _email) {
      console.log('retrieveEmail ', _emailId);
      if (_emailId) {
        WebsiteService.getSingleEmail(_emailId, function (data) {
          console.log('data ', data);
          $scope.page = data;
          $scope.components = $scope.page.components;
          
          $scope.originalPage = angular.copy(data);
          $scope.activePage = true;
          $scope.activateCKeditor();
          $rootScope.breadcrumbTitle = $scope.page.title;
        });
      }

      if (_email) {
        $scope.isEmail = true;
        $scope.page = _email;
        $scope.components = _email.components;        
        $scope.originalPage = angular.copy(_email);
        $scope.activePage = true;
        $scope.activateCKeditor();
        $rootScope.breadcrumbTitle = $scope.page.title;
      }
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
     * @statusUpdated
     * the order status has been updated
     */

    $scope.statusUpdated = function (newStatus) {
      if ($scope.blog.post.post_status == newStatus)
        return;
      var toasterMsg = 'Status has been updated to ';
      if (newStatus === postConstant.post_status.PUBLISHED) {
        WebsiteService.publishPost($scope.page._id, $scope.blog.post._id, function (data) {
          toaster.pop('success', "Status updated successfully");
          $scope.blog.post.post_status = newStatus;
        });
      } else {
        toaster.pop('success', "Status updated successfully");
        $scope.blog.post.post_status = newStatus;
      }


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
        $scope.originalPage = angular.copy($scope.page);
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
      $scope.isPage = true;
      $scope.retrievePage($location.search().pagehandle);
    }

    /*
     * @location:email
     * -
     */


    if ($location.search().email) {
      $scope.isEmail = true;
      $scope.retrieveEmail($location.search().email);
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
    $scope.blogControl = {};

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
      } else if ($scope.blogImage.featured_image) {
        $scope.blogImage.featured_image = false;
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
    $scope.openSimpleModal = function (modal, _size) {
      var _modal = {
        templateUrl: modal,
        scope: $scope,
        size: _size || 'md',
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

        _modal.resolve.blogImage = function () {
          return $scope.blogImage;
        };

        _modal.resolve.accountShowHide = function () {
          return $scope.$parent.account.showhide;
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

      if ($scope.isPage) {
        $scope.openSimpleModal("page-settings-modal");
      }

      if ($scope.templateActive) {
        $scope.openModal("template-settings-modal", 'TemplateSettingsModalCtrl');
      }

      if ($scope.isEmail) {
        $scope.openSimpleModal("email-settings-modal");
      }
    };

    /*
     * @openDuplicateModal
     * -
     */

    $scope.openDuplicateModal = function () {
      if ($scope.single_post) {
        $scope.openSimpleModal("post-duplicate-modal");
      }
      if ($scope.isPage) {
        $scope.openSimpleModal("page-duplicate-modal");
      }
      if ($scope.isEmail) {
        $scope.openSimpleModal("email-duplicate-modal");
      }
    };

    /*
     * @checkForDuplicatePage
     * - Check for duplicate page
     */

    $scope.checkForDuplicatePage = function (fn) {
      $scope.validateEditPage($scope.page);
      if ($scope.editPageValidated)
        WebsiteService.checkDuplicatePage($scope.page.handle, $scope.page._id, function (data) {
          if (data) {
            $scope.duplicateUrl = true;
            toaster.pop('error', "Page URL " + $scope.page.handle, "Already exists");
          } else {
            $scope.duplicateUrl = false;
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

    $scope.slugifyPostHandle = function (title, post) {
      if (title && post)
        post.post_url = $filter('slugify')(title);
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

    $scope.$watch('isDirty.confirmed', function (newValue, oldValue) {      
      console.log(newValue);
    });

    $scope.createDuplicatePage = function (newPage) {

      if ($scope.isPage) {
        newPage.type = "page";
      }

      $scope.validateNewPage(newPage);
      if (!$scope.newPageValidated) {
        toaster.pop('error', "Page Title or URL can not be blank.");
        return false;
      }
      WebsiteService.checkDuplicatePage(newPage.handle, newPage._id, function (data) {
        if (data) {
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

    $scope.newEmail = {};

    $scope.createDuplicateEmail = function () {
      // $scope.validateNewPage(newPage);
      // if (!$scope.newPageValidated) {
      //   toaster.pop('error', "Page Title or URL can not be blank.");
      //   return false;
      // }
      $scope.newEmail.components = $scope.page.components;
      WebsiteService.createEmail($scope.newEmail, function (data, error) {
        if (data && !error) {
          $scope.duplicate = true;
          $scope.checkForSaveBeforeLeave('/admin/#/editor?email=' + data._id, true);
        } else if (!data && error && error.message) {
          toaster.pop('error', error.message);
        }
      });
    };


    $scope.updateEmailSettings = function () {
      WebsiteService.updateEmail($scope.page, function (data, error) {
        if (data && !error) {
          toaster.pop('success', "Settings saved successfully");
          $scope.closeModal();
          $timeout(function () {
            $scope.checkForSaveBeforeLeave();
          }, 100);
          
        } else if (!data && error && error.message) {
          toaster.pop('error', error.message);
        }
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

    var checkIfPageDirty = function(url, fn){
      if ($scope.originalPage && $scope.originalPage.components && $scope.components && $scope.originalPage.components.length !== $scope.components.length) {
         $scope.setDirty(true);
      }
      if ($scope.isSinglePost) {
          var post_data = angular.copy($scope.blog.post);
          if($scope.originalPost.post_tags && $scope.originalPost.post_tags.length && !angular.isObject($scope.originalPost.post_tags[0]))
            post_data.post_tags.forEach(function (v, i) {
              if (v.text) {
                post_data.post_tags[i] = v.text;
              }
            });
        if (post_data && !angular.equals($scope.originalPost, post_data)) {
          $scope.setDirty(true);
        }
      }
      var redirectUrl = url;
      
      if (!redirectUrl) {
        redirectUrl = $location.search().posthandle ? "/admin/#/website/posts" : $scope.isEmail ? "/admin/#/emails" : "/admin/#/website/pages";
      }
      fn(redirectUrl);
    }

    var checkBeforeRedirect = function(url, reload)
    {   
      checkIfPageDirty(url, function (redirectUrl) {  
        var condition = $scope.isDirty.dirty;
        if (condition) {
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
              //SweetAlert.swal("Saved!", "Your edits were saved to the page.", "success");
              $scope.redirect = true;
              $scope.savePage(redirectUrl);
              $scope.setDirty(false);
              if (reload) {
                window.location.reload();
              }
            } else {
              $scope.redirectWithoutSave(redirectUrl, true);
              if (reload) {
                window.location.reload();
              }
            }
          });
        } else {
          $scope.redirectWithoutSave(redirectUrl, false);
          if (reload) {
            window.location.reload();
          }
        }
    }) 
     
    };
    /*
     * @checkForSaveBeforeLeave
     * -
     */

    $scope.checkForSaveBeforeLeave = function (url, reload) {
      $scope.changesConfirmed = true;
      checkBeforeRedirect(url, reload);      
    };

    /*
     * @deletePage
     * -
     */

    $scope.deletePage = function () {
      angular.element('.modal.in').hide();
      var _deleteText = "Do you want to delete this page";
      if($scope.page.handle === 'index')
      {
        var _deleteText = "This is home page of the website. Do you want to delete this page";
      }
      SweetAlert.swal({
        title: "Are you sure?",
        text: _deleteText,
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete page!",
        cancelButtonText: "No, do not delete page!",
        closeOnConfirm: false,
        closeOnCancel: true
      }, function (isConfirm) {
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
          angular.element('.modal.in').show();
        }

      });
    };

    /*
     * @deleteEmail
     * -
     */

    $scope.deleteEmail = function () {
      angular.element('.modal.in').hide();
      SweetAlert.swal({
        title: "Are you sure?",
        text: "Do you want to delete this email",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete email!",
        cancelButtonText: "No, do not delete email!",
        closeOnConfirm: false,
        closeOnCancel: true
      }, function (isConfirm) {
        if (isConfirm) {
          SweetAlert.swal("Saved!", "Email is deleted.", "success");
          var title = $scope.page.title;
          WebsiteService.deleteEmail($scope.page, function (data) {
            toaster.pop('success', "Email Deleted", "The " + title + " email was deleted successfully.");
            $scope.closeModal();
            $timeout(function () {
              window.location = '/admin/#/emails';
            }, 500);
          });
        } else {
          angular.element('.modal.in').show();
        }

      });
    };

    /*
     * @deletePost
     * -
     */

    $scope.deletePost = function () {
      angular.element('.modal.in').hide();
      SweetAlert.swal({
          title: "Are you sure?",
          text: "Do you want to delete this page",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete post!",
          cancelButtonText: "No, do not delete post!",
          closeOnConfirm: false,
          closeOnCancel: true
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
            angular.element('.modal.in').show();
          }
        });
    };

    // CKEDITOR.disableAutoInline = true;

    /*
     * @deleteComponent
     * -
     */

    $scope.deleteComponent = function (index) {      
        SweetAlert.swal({
          title: "Are you sure?",
          text: "Do you want to delete this component?",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "No, do not delete it!",
          closeOnConfirm: true,
          closeOnCancel: true
        },
        function (isConfirm) {
          if (isConfirm) {
            var _type = $scope.components[index].type;
            $scope.components.splice(index, 1);
            toaster.pop('success', "Component Deleted", "The " + _type + " component was deleted successfully.");
            $timeout(function () {
              $scope.scrollToComponent(index);
              $(window).trigger('resize');
            }, 1000);
          };
        });
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

    /*
     * @locationChangeStart
     * - Before user leaves editor, ask if they want to save changes
     */
    $scope.changesConfirmed = false;
    var offFn = $rootScope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
        checkIfPageDirty(newUrl, function (redirectUrl) {  
          var condition = $scope.isDirty.dirty && !$scope.changesConfirmed;
          if (condition) {
            event.preventDefault();
            SweetAlert.swal({
              title: "Are you sure?",
              text: "You have unsaved data that will be lost Sanjeev",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "Yes, save changes!",
              cancelButtonText: "No, do not save changes!",
              closeOnConfirm: false,
              closeOnCancel: false
            }, function (isConfirm) {
              if (isConfirm) {
                $scope.redirect = true;
                $scope.savePage(redirectUrl);
                $scope.setDirty(false);
              } else {
                $scope.redirectWithoutSave(newUrl, true);  
              }
              offFn();
            });
          } else {
            $scope.redirectWithoutSave(newUrl, false);
        }
      }) 
    });

  }]);
}(angular));
