app.directive('singlePostComponent', ['$location', 'accountService', 'postService', function ($location, AccountService, PostService) {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
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
          });
        });

      scope.$back = function () {
        window.history.back();
      };
    }
  }
}]);
