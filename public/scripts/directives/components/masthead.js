app.directive('mastheadComponent', ['$window', function ($window) {
  return {
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      scope.allowUndernav = true;
      angular.element('body').on("click", ".navbar-toggle", function (e) {
        scope.setUnderbnavMargin();
      });

      angular.element($window).bind('resize', function () {
        scope.setUnderbnavMargin();
        for (var i = 0; i <= 3; i++) {
          if ($("div.feature-height-" + i).length) {
            var maxFeatureHeight = Math.max.apply(null, $("div.feature-height-" + i).map(function () {
              return $(this).height();
            }).get());
            $("div.feature-height-" + i + " .feature-single").css("min-height", maxFeatureHeight - 20);
          }
        }
      });
      scope.setUnderbnavMargin = function () {
        setTimeout(function () {
          if (scope.addUndernavClasses) {
            var navHeight = angular.element("#bs-example-navbar-collapse-1").height();
            var margin = 200 + navHeight;
            if (angular.element(".mt200")) {
              angular.element(".mt200").css("margin-top", -margin);
              if (!scope.parentScope && scope.allowFullScreen)
                angular.element(".mt200").css("height", $window.innerHeight + navHeight);
            }

            if (angular.element(".mastHeadUndernav"))
              angular.element(".mastHeadUndernav").css("height", margin);
            if (angular.element(".masthead-actions"))
              angular.element(".masthead-actions").css("margin-top", margin - 4);

          } else {
            if (angular.element(".mt200"))
              angular.element(".mt200").css("margin-top", 0);
            if (angular.element(".masthead-actions"))
              angular.element(".masthead-actions").css("margin-top", 0);
          }

        }, 300);
      };
    }
  }
}]);
