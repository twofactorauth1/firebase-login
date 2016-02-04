app.directive('singlePostComponent', ['$window', '$location', 'accountService', 'postService', function ($window, $location, AccountService, PostService) {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      scope.component.spacing = scope.$parent.defaultSpacings;
      var _handle = $location.$$path.replace('/page', '').replace('/blog/', '');
      scope.blog = {};
      // If single-post page
      if(scope.$parent.blog_post && $location.$$path.indexOf("/blog/") === -1)
      {
        scope.blog.post = scope.$parent.blog_post;
      }
      else
        AccountService(function (err, data) {
          if (err) {
            console.log('Controller:MainCtrl -> Method:accountService Error: ' + err);
          }
          PostService.getSinglePost(_handle, data.website.websiteId, function (post) {
            console.log('post data ', post);
            scope.blog.post = post;
            $window.document.title = $window.document.title + ": " + post.post_title;
          });
        });

      scope.$back = function () {
        window.history.back();
      };
      scope.getEncodedUrl = function(url){
        return encodeURI(url);
      }
      scope.getPlainTitle=function(title){
        var returnValue = title;
        if(title){
          var element = angular.element(".plain-post-title");
          if(element && element.length){
            returnValue = element.text().trim();
          }
        }
        return returnValue;
      }
    }
  }
}]);
