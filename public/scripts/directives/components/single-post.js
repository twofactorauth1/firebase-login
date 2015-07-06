app.directive('singlePostComponent', ['accountService', 'postService', function (AccountService, PostService) {
  return {
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      scope.blog = {};
      AccountService(function (err, data) {
        if (err) {
          console.log('Controller:MainCtrl -> Method:accountService Error: ' + err);
        }
        PostService.getSinglePost('sports-center', data.website.websiteId, function (post) {
          console.log('post data ', post);
          scope.blog.post = post;
        });
      });
    }
  }
}]);
