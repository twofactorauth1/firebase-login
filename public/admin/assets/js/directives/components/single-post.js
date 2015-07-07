app.directive('singlePostComponent',['$location', "WebsiteService", function ($location, WebsiteService) {
  return {
    scope: {
      component: '=',
      version: '=',
      control: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      scope.isEditing = true;
      scope.blog = {};

      scope.control.setSinglePost = function(post_data) {
        scope.blog.post = post_data;
      }
      /*
       * @dateOptions
       * -
       */

      scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
      };

      /*
       * @open
       * -
       */

      scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();

        scope.opened = !scope.opened;
      };

      /*
       * @endOpen
       * -
       */

      scope.endOpen = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        scope.startOpened = false;
        scope.endOpened = !scope.endOpened;
      };

      /*
       * @startOpen
       * -
       */

      scope.startOpen = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        scope.endOpened = false;
        scope.startOpened = !scope.startOpened;
      };
      
    }
  }
}]);
