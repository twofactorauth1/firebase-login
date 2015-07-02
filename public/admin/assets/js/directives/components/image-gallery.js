app.directive('imageGalleryComponent', ['$timeout', function ($timeout) {
  return {
    scope: {
      component: '=',
      version: '=',
      media: '&'
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {
      scope.isEditing = true;
      /*
       * @addImageToGallery
       * -
       */

      scope.addImageToGallery = function (componentId, index) {
      	scope.media({componentId: componentId, index: index});
      };

      /*
       * @deleteImageFromGallery
       * -
       */

      scope.deleteImageFromGallery = function (componentId, index) {
        scope.component.images.splice(index, 1);
      };
    }
  }
}]);
