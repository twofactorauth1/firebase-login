app.directive('blogComponent', ['$filter', '$timeout', 'WebsiteService', function ($filter, $timeout, WebsiteService) {
  return {
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      scope.isEditing = true;
    },
    controller: function ($scope, WebsiteService, $compile, $filter, $timeout) {
      $scope.blog = {};
      $scope.showCloud = false;
      WebsiteService.getPosts(function (posts) {
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


        //if tagname is present, filter the cached posts with the tagname
        // if ($route.current.params.tagname != null) {
        //   var filterPosts = [];
        //   that.currentTag = decodeURIComponent($route.current.params.tagname);
        //   for (var i = 0; i < data.length; i++) {
        //     if (data[i].post_tags) {
        //       var tags = data[i].post_tags;
        //       for (var i2 = 0; i2 < tags.length; i2++) {
        //         if (tags[i2] === $route.current.params.tagname) {
        //           filterPosts.push(data[i]);
        //         }
        //       };
        //     }
        //   };
        //   that.blogposts = filterPosts;
        //   return;
        // }

        //if authorname is present, filter the cached posts with the authorname
        // if ($route.current.params.authorname != null) {
        //   var filterPosts = [];
        //   that.currentAuthor = $route.current.params.authorname;
        //   for (var i = 0; i < data.length; i++) {
        //     if (typeof data[i].post_author !== "undefined") {
        //       if (data[i].post_author === $route.current.params.authorname) {
        //         filterPosts.push(data[i]);
        //       }
        //     }
        //   };
        //   that.blogposts = filterPosts;
        //   return;
        // }

        //if catname is present, filter the cached posts with the catname
        // if ($route.current.params.catname != null) {
        //   var filterPosts = [];
        //   that.currentCat = $route.current.params.catname;
        //   for (var i = 0; i < data.length; i++) {
        //     if (data[i].post_category) {
        //       if (data[i].post_category === $route.current.params.catname) {
        //         filterPosts.push(data[i]);
        //       }
        //     }
        //   };
        //   that.blogposts = filterPosts;
        //   return;
        // }

        // if ($route.current.params.postname != null) {
        //   var found = $filter('getByProperty')('post_url', $route.current.params.postname, data);
        //   if (found) {
        //     that.post = found;
        //     that.blogPageUrl = $location.$$absUrl;
        //     if ($scope.parentScope) {
        //       $scope.parentScope.loadPost && $scope.parentScope.loadPost(found);
        //       $scope.copyPostMode();
        //     }
        //   }
        //   return;
        // }
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
          height: 300          
        });
        $(document).ready(function() {
          $timeout(function () {
            angular.element('.jqcloud').css({'width': '100%'});
            angular.element('.jqcloud').jQCloud('update', $scope.tagCloud);
          },1000)
        })
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
  }
}]);
