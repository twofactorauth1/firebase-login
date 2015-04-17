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

        //get website
        WebsiteService.getWebsite(function(website) {
            $scope.website = website;
        })

        $scope.getters = {
            created: function (value) {
                return value.created.date;
            },
            modified: function (value) {
                return value.modified.date;
            }
        };

       
        $scope.$watch('post.post_title', function(newValue, oldValue) {
            if (newValue) {
                $scope.post.post_url = $filter('slugify')(newValue);
            }
        });

        $scope.$watch('post.post_url', function(newValue, oldValue) {
            if (newValue) {
                $scope.post.post_url = $filter('slugify')(newValue);
            }
        });

        $scope.createPostValidated = false;
          $scope.validateCreatePost = function(post) {
            if (!post.post_title || post.post_title == '') {
              $scope.postTitleError = true
            } else {
              $scope.postTitleError = false
            }
            if (!post.post_author || post.post_author == '') {
              $scope.postAuthorError = true
            } else {
              $scope.postAuthorError = false
            }
            if (!post.post_url || post.post_url == '') {
              $scope.postUrlError = true
            } else {
              $scope.postUrlError = false
            }
            if (post && post.post_title && post.post_title != '' && post.post_author && post.post_author != '' && post.post_url && post.post_url != '') {
              $scope.createPostValidated = true;
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

        $scope.createPost = function(postData) {
            $scope.validateCreatePost(postData);
            console.log('$scope.createPostValidated ', $scope.createPostValidated);
            if (!$scope.createPostValidated) {
              return false;
            }

            postData.websiteId = $scope.website._id;
            WebsiteService.createPost($scope.blogId || -1, postData, function(data) {
              toaster.pop('success', "Post Created", "The " + data.post_title + " post was created successfully.");
              
              $scope.cancel();
              $scope.posts.unshift(data);
            })
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
            window.location = '/admin/#/website/posts/?posthandle=' + post.post_url;
        };

    }]);
})(angular);
