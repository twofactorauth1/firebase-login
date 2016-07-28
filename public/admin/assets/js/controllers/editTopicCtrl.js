'use strict';
/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('EditTopicCtrl', ["$scope", "$state", "$document", "$rootScope", "$interval", "$timeout", "toaster", "$modal", "$filter", "$location", "WebsiteService", "SweetAlert", "hoursConstant", "GeocodeService", "ProductService", "AccountService", "postConstant", "formValidations", "$window", "SimpleSiteBuilderService", function ($scope, $state, $document, $rootScope, $interval, $timeout, toaster, $modal, $filter, $location, WebsiteService, SweetAlert, hoursConstant, GeocodeService, ProductService, AccountService, postConstant, formValidations, $window, SimpleSiteBuilderService) {

    /*
     * @circleOptions
     * -
     */    

    $scope.formValidations = formValidations;

    $scope.defaultSpacings = {
      'pt': 0,
      'pb': 0,
      'pl': 0,
      'pr': 0,
      'mt': 0,
      'mb': 0,
      'mr': 'auto',
      'ml': 'auto',
      'mw': '100%',
      'usePage': false
    };

    $scope.duplicate = false;

    $scope.circleOptions = {
      isOpen: false,
      toggleOnClick: false,
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

    $scope.changesConfirmed = false;

    $scope.cancelChanges = false;

    $scope.setDirty = function(is_dirty){
      $scope.isDirty.dirty = is_dirty;

        if(is_dirty)
          $scope.changesConfirmed = false;
    }


    $scope.editorLoaded = false;
    $scope.activeEditor = null;

   
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
      $scope.setDirty(true);
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
        angular.element($window).trigger('resize');
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

    $scope.redirectAfterSave = function(redirect_url, reload){
    if(redirect_url){
        SweetAlert.swal("Saved!", "Your edits were saved to the page.", "success");
            $timeout(function () {
              if($scope.duplicate)
                $location.path(redirect_url);
              else
                $window.location = redirect_url;
            }, 500);
        if (reload) {
          $window.location.reload();
        }
      }
    }

    $scope.redirectWithoutSave = function(redirect_url, show_alert, reload){
    $scope.changesConfirmed = true;
    $scope.originalPage = null;
    $scope.originalPost = null;
    $scope.cancelChanges = true;
    if(redirect_url){
      if(show_alert)
        SweetAlert.swal("Cancelled", "Your edits were NOT saved.", "error");
          $window.location = redirect_url;
      if (reload) {
        $window.location.reload();
      }
      }
    }

    /*
     * @savePage
     * -
     */

    $scope.isEditing = true;
    //$scope.isDirty = false;
    $scope.isDirty = {};
    
    $scope.savePage = function (redirect_url, reload) {
      $scope.saveLoading = true;
      $scope.setDirty(false);
      $scope.changesConfirmed = true;
      console.log('saving topic');
      $scope.topic.handle = $filter('slugify')($scope.topic.title);
      WebsiteService.updateTopic($scope.topic, function (data, error) {
        $scope.saveLoading = false;
        if (error) {
          if(error.message)
            toaster.pop('error', error.message);
          else
              toaster.pop('error', "Error while updating topic");
          return;
        }
        toaster.pop('success', "Topic Saved", "The " + $scope.topic.title + " topic was saved successfully.");
        $scope.redirectAfterSave(redirect_url, reload);
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
     * @retrieveTopic
     * -
     */

    $scope.retrieveTopic = function (_id) {
      $scope.topicActive = true;
      WebsiteService.getTopics(function (topics) {
        $scope.topic = _.find(topics, function (top) {
          return top._id === _id;
        });

        $scope.components = $scope.topic.components;
        $timeout(function () {
          $scope.editorLoaded = true;
        }, 500);
      });
    };

    

    if ($location.search().topic_id) {
      $scope.isTopic = true;
      $scope.retrieveTopic($location.search().topic_id);
    }

    /*
     * @clickandInsertImageButton
     * -
     */

    $window.clickandInsertImageButton = function (editor, image) {
      console.log('clickandInsertImageButton >>> ');
      $scope.editor = editor;
      $scope.editImage = image;
      $scope.clickImageButton(editor, false);
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

    $scope.clickImageButton = function (editor, image) {   
      $scope.insertMediaImage = true;
      $scope.showInsert = true;
      
      
      $scope.openModal('media-modal', 'MediaModalCtrl', null, 'lg');
    };
   

    /*
     * @addFroalaEditorImage
     * -
     */
    $scope.addFroalaEditorImage = function (url, inlineInput, edit) {
    WebsiteService.isImage(url).then(function(result) {
      var _image = result;
      $timeout(function() {
          $scope.editor.image.insert(url, !1, null, $scope.editImage);
      }, 0);
    });

    };

    /*
     * @insertMedia
     * - insertmedia into various components
     * - TODO: change to switch case and stop using if else
     */
    $scope.thumbnailSlider = {};
    $scope.testimonialSlider = {};
    $scope.contactMap = {};
    $scope.blogControl = {};
    $scope.postControl = {};
    $scope.websiteLinks = {};

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
        $scope.addFroalaEditorImage(asset.url, $scope.inlineInput, $scope.isEditMode);
        return;
      } else if ($scope.logoImage && $scope.componentEditing) {
        $scope.logoImage = false;
        $scope.componentEditing.logourl = asset.url;
      } else if ($scope.imgThumbnail && $scope.componentEditing) {
        $scope.imgThumbnail = false;
        $scope.componentEditing.thumbnailCollection.push({
          url: asset.url
        });
      } else {
        if ($scope.componentEditing.bg.img) {
          $scope.componentEditing.bg.img.url = asset.url;
          $timeout(function () {
            angular.window.trigger('resize');
          }, 0);
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
        keyboard: false,
       // backdrop: 'static',
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
        keyboard: false,
        backdrop: 'static',
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
            return null;
        };
        _modal.resolve.isDirty = function () {
          return $scope.isDirty;
        };
        _modal.resolve.isSinglePost = function () {
          return false;
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
          return null;
        };

        _modal.resolve.accountShowHide = function () {
          return $scope.$parent.account.showhide;
        };
        _modal.resolve.isEmail = function () {
          return $scope.isEmail;
        };
        _modal.resolve.testimonialSlider = function () {
          return $scope.testimonialSlider;
        };
        _modal.resolve.websiteLinks = function () {
          return $scope.websiteLinks;
        };

        _modal.resolve.isSingleSelect = function () {
          return true;
        };
      }

      if (angular.isDefined(index) && index !== null && index >= 0) {
        $scope.setEditingComponent(index);
        _modal.resolve.clickedIndex = function () {
          return index;
        };

          _modal.resolve.pageHandle = function () {
             return $scope.page ? $scope.page.handle : null;
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
      $scope.openSimpleModal("topic-settings-modal");
    };

    /*
     * @deleteTopic
     * -
     */

    $scope.topicCategories = ['Account', 'Billing', 'Contacts', 'Campaigns', 'Dashboard', 'Emails', 'Getting Started', 'Integrations', 'Orders', 'Posts', 'Products', 'Profile', 'Site Analytics', 'Social Feed', 'Website'];


    $scope.deleteTopic = function () {
      angular.element('.modal.in').hide();
      SweetAlert.swal({
        title: "Are you sure?",
        text: "Do you want to delete this topic",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete topic!",
        cancelButtonText: "No, do not delete topic!",
        closeOnConfirm: false,
        closeOnCancel: true
      }, function (isConfirm) {
        if (isConfirm) {
          SweetAlert.swal("Saved!", "Topic is deleted.", "success");
          var title = $scope.topic.title;
          WebsiteService.deleteTopic($scope.topic, function (data) {
            toaster.pop('success', "Topic Deleted", "The " + title + " topic was deleted successfully.");
            $scope.closeModal();
            $timeout(function () {
              $location.url('/support/manage-topics');
            }, 500);
          });
        } else {
          angular.element('.modal.in').show();
        }

      });
    };

    /*
     * @openDuplicateModal
     * -
     */

    $scope.openDuplicateModal = function () {
      
    };

    
    

    $scope.$watch('isDirty.confirmed', function (newValue, oldValue) {
      console.log(newValue);
    });

    

    

    var checkIfPageDirty = function(url, fn){
      if ($scope.originalPage && $scope.originalPage.components && $scope.components && $scope.originalPage.components.length !== $scope.components.length) {
         $scope.setDirty(true);      }
      
      var redirectUrl = url;
      redirectUrl = "/admin/#/support/manage-topics";
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
            closeOnCancel: true
          }, function (isConfirm) {
            if (isConfirm) {
              //SweetAlert.swal("Saved!", "Your edits were saved to the page.", "success");
              $scope.redirect = true;
              $scope.savePage(redirectUrl, reload);
              $scope.setDirty(false);
            } else {
              $scope.redirectWithoutSave(redirectUrl, true, reload);
            }
          });
        } else {
          $scope.redirectWithoutSave(redirectUrl, false, reload);
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

    $scope.viewTopic = function(topicId) {
      console.log('topicId ', topicId);
      $location.path('/support/help-topics').search({
        topic: topicId
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
              angular.element($window).trigger('resize');
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

    var offFn = $rootScope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
      checkIfPageDirty(newUrl, function (redirectUrl) {
          var condition = $scope.isDirty.dirty && !$scope.changesConfirmed && !$scope.cancelChanges;
          if (condition && !$scope.isCampaign && !$scope.isProduct) {
            event.preventDefault();
            SweetAlert.swal({
              title: "Are you sure?",
              text: "You have unsaved data that will be lost",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "Yes, save changes!",
              cancelButtonText: "No, do not save changes!",
              closeOnConfirm: false,
              closeOnCancel: true
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
          }
      })
    });
  }]);
}(angular));
