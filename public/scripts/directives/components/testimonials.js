app.directive('testimonialsComponent', function () {
  return {
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {
      scope.autoplay = true;
    	scope.dataLoaded = true;
    }
  }
});
