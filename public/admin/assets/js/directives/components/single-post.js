app.directive('singlePostComponent', function () {
  return {
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      scope.isEditing = true;
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
});
