app.directive('singlePostComponent', ['$location', 'accountService', 'postService', function ($location, AccountService, PostService) {
  return {
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      var _handle = $location.$$path.replace('/page', '').replace('/blog/', '');
      scope.blog = {};
      AccountService(function (err, data) {
        if (err) {
          console.log('Controller:MainCtrl -> Method:accountService Error: ' + err);
        }
        PostService.getSinglePost(_handle, data.website.websiteId, function (post) {
          console.log('post data ', post);
          scope.blog.post = post;
        });
      });
    }
  }
}]);
