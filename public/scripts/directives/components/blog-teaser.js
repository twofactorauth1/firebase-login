app.directive('blogTeaserComponent', ['postsService', function (postsService) {
  return {
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html',
    controller: function ($scope, postsService) {


      /*
       * @postsService
       * -
       */

      postsService(function (err, data) {
      	console.log('post data ', data);
      	$scope.teaserposts = data;
      });
    }
  };
}]);
