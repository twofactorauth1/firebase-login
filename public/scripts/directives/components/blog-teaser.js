app.directive('blogTeaserComponent', ['postsService', '$filter', function (postsService, $filter) {
  return {
    scope: {
      component: '='
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
