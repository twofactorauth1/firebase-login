'use strict';
/**
 * controller for products
 */
(function(angular) {
    app.controller('PostsCtrl', ["$scope", "toaster", "$modal", "$filter", "WebsiteService", function($scope, toaster, $modal, $filter, WebsiteService) {

        WebsiteService.getPosts(function(posts) {
            var postsArr = [];
            for (var key in posts) {
                if (posts.hasOwnProperty(key)) {
                    postsArr.push(posts[key]);
                }
            }
            $scope.posts = postsArr;
        });

        WebsiteService.getTemplates(function(templates) {
            $scope.templates = templates;
        });

        $scope.getters = {
            created: function (value) {
                return value.created.date;
            },
            modified: function (value) {
                return value.modified.date;
            }
        };

        $scope.setTemplateDetails = function(templateDetails) {
            $scope.templateDetails = true;
            $scope.selectedTemplate = templateDetails;
        };

        $scope.$watch('createpost.title', function(newValue, oldValue) {
            if (newValue) {
                $scope.createpost.handle = $filter('slugify')(newValue);
            }
        });

        $scope.$watch('createpost.handle', function(newValue, oldValue) {
            if (newValue) {
                $scope.createpost.handle = $filter('slugify')(newValue);
            }
        });

        $scope.validateCreatePost = function(post) {
            $scope.createPostValidated = false;
            if (post) {
                if (post.handle == '') {
                    $scope.handleError = true;
                } else {
                    $scope.handleError = false;
                }
                if (post.title == '') {
                    $scope.titleError = true;
                } else {
                    $scope.titleError = false;
                }
                if (post && post.title && post.title != '' && post.handle && post.handle != '') {
                    $scope.createPostValidated = true;
                }
            }
        };

        $scope.openPostModal = function(size) {
            $scope.modalInstance = $modal.open({
                templateUrl: 'new-post-modal',
                controller: 'PostsCtrl',
                size: size,
                scope: $scope
            });
        };

        $scope.cancel = function() {
            $scope.modalInstance.close();
        };

        $scope.createPostFromTemplate = function(post, $event) {
            $scope.validateCreatePost(post);
            console.log('$scope.createPostValidated ', $scope.createPostValidated);

            if (!$scope.createPostValidated) {
              $scope.titleError = true;
              $scope.handleError = true;
              return false;
            } else {
              $scope.titleError = false;
              $scope.handleError = false;
            }

            var postData = {
              title: post.title,
              handle: post.handle,
              mainmenu: post.mainmenu
            };

            var hasHandle = false;
            for (var i = 0; i < $scope.posts.length; i++) {
              if ($scope.posts[i].handle === post.handle) {
                hasHandle = true;
              }
            };

            if (!hasHandle) {
              WebsiteService.createPostFromTemplate($scope.selectedTemplate._id, postData, function(newpost) {
                toaster.pop('success', 'Post Created', 'The ' + newpost.title + ' post was created successfully.');
                $scope.cancel();
                $scope.posts.unshift(newpost);
                $scope.displayedPosts.unshift(newpost);
                post.title = "";
                post.handle = "";
                $scope.showChangeURL = false;
                $scope.templateDetails = false;
              });
            } else {
              toaster.pop('error', "Post URL " + post.handle, "Already exists");
              $event.preventDefault();
              $event.stopPropagation();
            }
        };

        $scope.viewSingle = function(post) {
            window.location = '/admin/#/app/website/posts/?posthandle=' + post.post_url;
        };

    }]);
})(angular);
