'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('blogTeaserComponent', ['postsService', '$filter', function (postsService, $filter) {
  return {
    scope: {
      component: '=',
      ssbEditor: '='
    },
    templateUrl: '/components/component-wrap.html',
    
    controller: function ($scope, postsService) {
      $scope.loading = true;
      $scope.currentPostPage = 1;
      postsService(function (err, posts) {
        _.each(posts, function(blogpost){
          blogpost.date_published = new Date(blogpost.publish_date || blogpost.created.date).getTime();
          blogpost.date_created = new Date(blogpost.created.date).getTime();
          blogpost.date_modified = new Date(blogpost.modified.date).getTime();
        })
        $scope.teaserposts = angular.copy(posts);
        filterPosts(posts, function () {
          $scope.pageChanged(1);
          $scope.loading = false;
        });        
      });

      $scope.listArticleStyle = listArticleStyle;

      function listArticleStyle(item){
        var styleString = ' ';

        if(item && item.articleBorder && item.articleBorder.show && item.articleBorder.color){
            styleString += 'border-color: ' + item.articleBorder.color + ';';
            styleString += 'border-width: ' + item.articleBorder.width + 'px;';
            styleString += 'border-style: ' + item.articleBorder.style + ';';
            styleString += 'border-radius: ' + item.articleBorder.radius + '%;';
        }

        return styleString;
      }

     
      $scope.titleStyle = function (component) {
        var styleString = ' ';
        if(component && component.settings){
                if(component.settings.title){
                    if(component.settings.title.fontSize){
                        styleString += 'font-size: ' + component.settings.title.fontSize + 'px !important;';
                    }
                    if(component.settings.title.fontFamily){
                        styleString += 'font-family: ' + component.settings.title.fontFamily + 'px !important;';
                    }
                    if(component.settings.title.color){
                        styleString += 'color: ' + component.settings.title.color + "!important;";
                    }
                }
        }
        return styleString;
      };
      $scope.descriptionStyle = function (component) {
        var styleString = ' ';
        if(component && component.settings){
                if(component.settings.description){
                    if(component.settings.description.fontSize){
                        styleString += 'font-size: ' + component.settings.description.fontSize + 'px !important;';
                    }
                    if(component.settings.description.fontFamily){
                        styleString += 'font-family: ' + component.settings.description.fontFamily + 'px !important;';
                    }
                    if(component.settings.description.color){
                        styleString += 'color: ' + component.settings.description.color + "!important;";
                    }
                }
        }
        return styleString;
      };
      
      function filterPosts(data, fn) {
        var _filteredPosts = [];
        _.each(data, function (post) {
          if (filterTags(post)) {
            if(filterCategory(post)){
              _filteredPosts.push(post);
            }     
          }
        });
        _filteredPosts = sortTeaserPosts(_filteredPosts);
        var _numberOfPostsToshow = 0;
        if($scope.component.version == 2){
          _numberOfPostsToshow = $scope.component.numberOfTotalPosts || $scope.teaserposts.length;
        }
        else{
          _numberOfPostsToshow = $scope.component.numberOfTotalPosts || 3;          
        }
        _filteredPosts = $filter('limitTo')(_filteredPosts, _numberOfPostsToshow);
        $scope.posts = _filteredPosts;
        return fn();
      }

      function sortTeaserPosts(posts){
        var sortOrder = customSortOrder();
        var sortBy = sortBlogFn($scope.component);
        return $filter('orderBy')(posts, [sortBy, "date_created"], sortOrder);
      }

      function sortBlogFn(component) {
          if (component.postorder) {
              if (component.postorder == 1 || component.postorder == 2) {
                return "date_modified";
              }
              if (component.postorder == 3 || component.postorder == 4) {
                return "date_created";
              }
              if (component.postorder == 5 || component.postorder == 6) {
                return "date_published";
              }
          } else {
              return "date_published";
          }
      };

      function customSortOrder() {
        if ($scope.component.postorder == 1 || $scope.component.postorder == 3 || $scope.component.postorder == 5) {
          return false;
        }
        if ($scope.component.postorder == 2 || $scope.component.postorder == 4 || $scope.component.postorder == 6) {
          return true;
        }
        return true;
      };

      function filterTags(post) {
        var _tags = $scope.component.postTags;
        if (_tags && _tags.length > 0) {
          if (post.post_tags) {
            if (_.intersection(_tags, post.post_tags).length > 0) {
              return true;
            }
          }
        } else {
          return true;
        }
      }


      function filterCategory(post) {
        var _categories = $scope.component.postCategories;        
        if (_categories && _categories.length > 0) {
          if (post.post_categories) {
            if (_.intersection(_categories, _.pluck(post.post_categories, "text")).length > 0) {
              return true;
            }
          }
        } else {
          return true;
        }
      }

      $scope.pageChanged = function (pageNo) {
        $scope.currentPostPage = pageNo;
        if ($scope.posts && $scope.component.numberOfPostsPerPage) {
          var begin = (($scope.currentPostPage - 1) * $scope.component.numberOfPostsPerPage);
          var numDisplay = $scope.component.numberOfPostsPerPage;
          //check if set to 0 and change to all posts
          if (numDisplay === 0) {
            numDisplay = $scope.posts.length;
          }
          var end = begin + numDisplay;
          $scope.filteredPosts = $scope.posts.slice(begin, end);
        }
        else{
          $scope.filteredPosts = $scope.posts;
        }
      };

      /*
       * @convertInLowerCase
       * - convert array value in lowercase
       */

      function convertInLowerCase(dataItem) {
          var _item = [];
          _.each(dataItem, function(tagItem) {
              _item.push(tagItem.toLowerCase());
          });
          return _item;
      }
    }
  };
}]);
