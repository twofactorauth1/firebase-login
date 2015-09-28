app.directive('mastheadComponent', ['$window', function ($window) {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      console.log('mastheadComponent ');
      if(scope.component.bg && scope.component.bg.img && scope.component.bg.img.show && scope.component.bg.img.undernav)
        scope.addUndernavClasses = true;
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
        scope.$parent.addUnderNavSetting(scope.component._id, function (data) {
          scope.allowUndernav = data;
        });
        setTimeout(function () {
          var mastheadElement = angular.element(".component_wrap_"+scope.component._id+".undernav200");
          var mastheadUnderNavElement = angular.element(".masthead_"+scope.component._id+".mastHeadUndernav");
          if (scope.addUndernavClasses && scope.allowUndernav) {
            var navHeight = angular.element("#bs-example-navbar-collapse-1").height();
            var margin = 200 + navHeight;
            if (mastheadElement) {
              mastheadElement.css("margin-top", -margin);
              if (scope.allowFullScreen)
                mastheadElement.css("height", $window.innerHeight + navHeight);
            }

            if (mastheadUnderNavElement)
              mastheadUnderNavElement.css("height", margin);
            if (angular.element(".masthead-actions"))
              angular.element(".masthead-actions").css("margin-top", margin - 4);

          } else {
            if (mastheadElement)
              mastheadElement.css("margin-top", 0);
            if (angular.element(".masthead-actions"))
              angular.element(".masthead-actions").css("margin-top", 0);
          }

        }, 300);
      };
      angular.element(document).ready(function () {
        setTimeout(function () {
          scope.setUnderbnavMargin();
        }, 500)
      })
    }
  }
}]);
