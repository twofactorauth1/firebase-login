app.directive('blogComponent', ['postsService', '$filter', '$timeout', function (postsService, $filter, $timeout) {
  return {
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html',
    controller: function ($scope, postsService) {
      console.log('blogComponent >>>');
      $scope.blog = {};
      $scope.showCloud = false;
      /*
       * @postsService
       * -
       */

      postsService(function (err, posts) {
      	console.log('post data ', posts);
      	$scope.blog.blogposts = posts;

        $scope.blog.postTags = [];
        $scope.blog.categories = [];

        _.each(posts, function (post) {
          //get post tags for sidebar
          if (post.post_tags) {
            _.each(post.post_tags, function (tag) {
              if ($scope.blog.postTags.indexOf(tag) <= -1) {
                $scope.blog.postTags.push(tag);
              }
            });
          }

          //get post cateogry for sidebar
          if (post.post_category) {
            if ($scope.blog.categories.indexOf(post.post_category) <= -1) {
              $scope.blog.categories.push(post.post_category);
            }
          }

        });

        $scope.activateTagCloud($scope.blog.postTags);
      });

      $scope.activateTagCloud = function (tags) {
        var _tagCloud = [];
        _.each(tags, function (tag) {
          var default_size = 2;
          var count = _.countBy(_.flatten(tags), function (num) {
            return num == tag
          })["true"];
          if (count) {
            default_size += count;
          }
          _tagCloud.push({
            text: tag,
            weight: default_size, //Math.floor((Math.random() * newValue.length) + 1),
            link: '/tag/' + tag
          });
        });
        $scope.rendered = false;
        $scope.tagCloud = _tagCloud;
        $(".jqcloud").jQCloud($scope.tagCloud, {
          autoResize: true,
          width: 230,
          height: 300,
          afterCloudRender: function () {
            $timeout(function() {
              if(!$scope.rendered)
              {
                $scope.rendered = true;
                angular.element('.jqcloud').css({'width': '100%'});
                angular.element('.jqcloud').jQCloud('update', $scope.tagCloud);
              }
            }, 1000);
          }
        });
      };

      /********** BLOG PAGE PAGINATION RELATED **********/
      $scope.curPage = 0;
      $scope.pageSize = 10;
      $scope.numberOfPages = function () {
        if ($scope.blog.blogposts)
          return Math.ceil($scope.blog.blogposts.length / $scope.pageSize);
        else
          return 0;
      };

      $scope.sortBlogFn = function (component) {
        return function (blogpost) {
          if (component.postorder) {
            if (component.postorder == 1 || component.postorder == 2) {
              return Date.parse($filter('date')(blogpost.modified.date, "MM/dd/yyyy HH:mm:ss"));
            } else if (component.postorder == 3 || component.postorder == 4) {
              return Date.parse($filter('date')(blogpost.created.date, "MM/dd/yyyy HH:mm:ss"));
            } else if (component.postorder == 5 || component.postorder == 6) {
              return Date.parse($filter('date')(blogpost.publish_date || blogpost.created.date, "MM/dd/yyyy"));
            }
          } else
            return Date.parse($filter('date')(blogpost.publish_date || blogpost.created.date, "MM/dd/yyyy"));
        };
      };

      $scope.customSortOrder = function (component) {
        if (component.postorder == 1 || component.postorder == 3 || component.postorder == 5) {
          return false;
        } else if (component.postorder == 2 || component.postorder == 4 || component.postorder == 6) {
          return true;
        } else {
          return true;
        }
      };
    }
  };
}]);
