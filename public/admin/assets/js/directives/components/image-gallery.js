'use strict';

/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/
app.directive('imageGalleryComponent', ['$timeout', function ($timeout) {
  return {
    scope: {
      component: '=',
      media: '&',
      ssbEditor: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {
      scope.isEditing = true;
      /*
       * @addImageFromMedia
       * -
       */

      scope.addImageFromMedia = function (componentId, index, update) {
        scope.media({
          componentId: componentId,
          index: index,
          update: update
        });
      };

      /*
       * @deleteImageFromGallery
       * -
       */

      scope.deleteImageFromGallery = function (componentId, index) {
        scope.component.images.splice(index, 1);
      };

      scope.touchMove = false;
      scope.draggable = false;
      scope.autoplay = false;
    }
  };
}]);
