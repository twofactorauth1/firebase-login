'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('blogTeaserComponent', ['WebsiteService', '$filter', function (WebsiteService, $filter) {
  return {
    scope: {
      component: '=',
      ssbEditor: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      scope.isEditing = true;
    },
    controller: function ($scope, WebsiteService, $compile) {
      $scope.loading = true;
      $scope.currentPostPage = 1;
      WebsiteService.getPosts(function (posts) {
        $scope.originalTeaserposts = angular.copy(posts);
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

      $scope.sortBlogFn = function (component) {
        return function (blogpost) {
          if (component.postorder) {
            if (component.postorder == 1 || component.postorder == 2) {
              return Date.parse($filter('date')(blogpost.modified.date, "MM/dd/yyyy HH:mm:ss"));
            }
            if (component.postorder == 3 || component.postorder == 4) {
              return Date.parse($filter('date')(blogpost.created.date, "MM/dd/yyyy HH:mm:ss"));
            }
            if (component.postorder == 5 || component.postorder == 6) {
              return Date.parse($filter('date')(blogpost.publish_date || blogpost.created.date, "MM/dd/yyyy"));
            }
          } else {
            return Date.parse($filter('date')(blogpost.publish_date || blogpost.created.date, "MM/dd/yyyy"));
          }
        };
      };
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
      $scope.customSortOrder = function (component) {
        if (component.postorder == 1 || component.postorder == 3 || component.postorder == 5) {
          return false;
        }
        if (component.postorder == 2 || component.postorder == 4 || component.postorder == 6) {
          return true;
        }
        return true;
      };

      function filterPosts(data, fn) {
        data = $filter('limitTo')(data, $scope.component.numberOfTotalPosts || data.length);
        var _filteredPosts = [];
        _.each(data, function (post) {
          if (filterTags(post)) {
            _filteredPosts.push(post);
          }
        });
        $scope.posts = _filteredPosts;
        return fn();
      }

      function filterTags(post) {
        var _tags = $scope.component.postTags;
        _tags = convertInLowerCase(_tags);
        if (_tags && _tags.length > 0) {
          if (post.post_tags) {
            post.post_tags = convertInLowerCase(post.post_tags);
            if (_.intersection(_tags, post.post_tags).length > 0) {
              return true;
            }
          }
        } else {
          return true;
        }
      }

      $scope.pageChanged = function (pageNo) {
        $scope.currentPostPage = pageNo;
        if ($scope.posts) {
          var begin = (($scope.currentPostPage - 1) * $scope.component.numberOfPostsPerPage);
          var numDisplay = $scope.component.numberOfPostsPerPage;
          //check if set to 0 and change to all posts
          if (numDisplay === 0) {
            numDisplay = $scope.posts.length;
          }
          var end = begin + numDisplay;
          $scope.filteredPosts = $scope.posts.slice(begin, end);
        }
      };

      /*
       * @watch:productTags
       * - watch for product tags to change in component settings and filter products
       */

      $scope.$watch('component.postTags', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          //$scope.component.productTags = newValue;
          filterPosts($scope.originalTeaserposts, function () {
            $scope.pageChanged(1);
          });
        }
      });


      $scope.$watch('component.postCategories', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          //$scope.component.productTags = newValue;
          filterPosts($scope.originalTeaserposts, function () {
            $scope.pageChanged(1);
          });
        }
      });

      $scope.$watch('component.numberOfTotalPosts', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          filterPosts($scope.originalTeaserposts, function () {
            $scope.pageChanged(1);
          });
        }
      });
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
