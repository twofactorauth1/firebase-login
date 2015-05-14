'use strict';
/**
 * controller for products
 */
(function(angular) {
    app.controller('PostsCtrl', ["$scope", "toaster", "$modal", "$filter", "WebsiteService", "$log", function($scope, toaster, $modal, $filter, WebsiteService, $log) {
        $scope.tableView = 'list';
        WebsiteService.getPosts(function(posts) {
            var postsArr = [];
            for (var key in posts) {
                if (posts.hasOwnProperty(key)) {
                    var iPost = posts[key];

                    iPost.hasPhoto = false;
                    if(iPost.featured_image) {
                        iPost.hasPhoto = true;
                    }

                    postsArr.push(iPost);
                }
            }
            $scope.posts = postsArr;
            $scope.orderByFn();
            //$log.debug($scope.posts);
        });

        //get website
        WebsiteService.getWebsite(function(website) {
            $scope.website = website;
        })

        $scope.orderByFn = function()
        {
            $scope.posts = $filter('orderBy')($scope.posts, 'modified.date', true);
        }
        
        $scope.getters = {
            created: function (value) {
                return value.created.date;
            },
            modified: function (value) {
                return value.modified.date;
            }
        };


        $scope.triggerInput = function(element) {
            angular.element(element).trigger('input');
        };

        $scope.filterPosts = {};

        $scope.clearFilter = function(event, input, filter) {
            $scope.filterPosts[filter] = {};
            $scope.triggerInput(input);
        };

        $scope.postsFeaturedImageOptions = [{
            name: 'Photo',
            value: true
        }, {
            name: 'No Photo',
            value: false
        }];

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
          $scope.validateCreatePost = function(post, restrict) {
            console.log('post ', post);
            if (!post || !post.post_title || post.post_title == '') {
              $scope.postTitleError = true
            } else {
              if(!restrict)  
                post.post_url = $filter('slugify')(post.post_title);
              $scope.postTitleError = false
            }
            if (!post || !post.post_author || post.post_author == '') {
              $scope.postAuthorError = true
            } else {
              $scope.postAuthorError = false
            }
            if (!post || !post.post_url || post.post_url == '') {
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
                size: size,
                scope: $scope
            });
        };

        $scope.cancel = function() {
            $scope.modalInstance.close();
        };

        $scope.createPost = function(postData) {
            $scope.validateCreatePost(postData, true);
            console.log('$scope.createPostValidated ', $scope.createPostValidated);
            if (!$scope.createPostValidated) {
              return false;
            }

            postData.websiteId = $scope.website._id;
            WebsiteService.createPost($scope.blogId || -1, postData, function(data) {
              toaster.pop('success', "Post Created", "The " + data.post_title + " post was created successfully.");
              
              $scope.cancel();
              $scope.posts.unshift(data);
              $scope.displayedPosts.unshift(data);
            })
        };

        $scope.viewSingle = function(post) {
            window.location = '/admin/#/website/posts/?posthandle=' + post.post_url;
        };

    }]);
})(angular);
