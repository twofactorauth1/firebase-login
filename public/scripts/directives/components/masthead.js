app.directive('mastheadComponent', ['$window', function ($window) {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      console.log('mastheadComponent ');
      if(scope.component.bg && scope.component.bg.img && scope.component.bg.img.url && scope.component.bg.img.show && scope.component.bg.img.undernav)
        scope.addUndernavClasses = true;
      angular.element('body').on("click", ".navbar-toggle", function (e) {
        scope.setUnderbnavMargin();
      });

      angular.element($window).bind('resize', function () {
        scope.setUnderbnavMargin();
      });
      scope.setUnderbnavMargin = function () {
        scope.$parent.addUnderNavSetting(scope.component._id, function (data) {
          scope.allowUndernav = data;
        });
        setTimeout(function () {
          var mastheadElement = angular.element(".component_wrap_"+scope.component._id+".undernav200");
          var mastheadUnderNavElement = angular.element(".masthead_"+scope.component._id+".mastHeadUndernav");
          if (scope.addUndernavClasses && scope.allowUndernav) {
            var navHeight = angular.element(".undernav").height();
            var margin = navHeight;
            if (mastheadElement) {
              mastheadElement.css("margin-top", -margin);
              if (scope.allowFullScreen)
                mastheadElement.css("height", $window.innerHeight + navHeight);
            }

            if (mastheadUnderNavElement)
              mastheadUnderNavElement.css("height", margin);
            if (angular.element(".masthead-actions"))
              angular.element(".masthead-actions").css("margin-top", margin - 4);

            $(window).trigger('scroll');
          } else {
            if (mastheadElement)
              mastheadElement.css("margin-top", 0);
            if (angular.element(".masthead-actions"))
              angular.element(".masthead-actions").css("margin-top", 0);
          }
          
        }, 300);
      };
    }
  }
}]);
