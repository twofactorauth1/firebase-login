app.directive('testimonialsComponent', function () {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {
      scope.touchMove = true;
      scope.draggable = true;
      
      if(!scope.component.slider)
      {
        scope.component.slider = {
          speed: 300, autoPlay: true, autoPlayInterval: 5000
        };
      }
      scope.autoplay = scope.component.slider.autoPlay;

    	$(document).ready(function () {
          scope.dataLoaded = true;
      });
    }
  }
});
