app.directive('testimonialsComponent', ['$timeout', function ($timeout) {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {      
    	$(document).ready(function () {
          $timeout(function () {
            scope.$apply(function () {              
              if(!scope.component.slider)
              {
                scope.component.slider = {
                  speed: 300, autoPlay: true, autoPlayInterval: 5000
                };
              }
              scope.touchMove = true;
              scope.draggable = true;
              scope.autoplay = scope.component.slider.autoPlay;
              scope.dataLoaded = true;
            });
          },0);
      });
    }
  }
}]);
  