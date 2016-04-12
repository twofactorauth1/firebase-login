app.directive('imageGalleryComponent', function () {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {
        scope.touchMove = true;
        scope.draggable = true;
        scope.autoplay = true;
    }
  }
});
