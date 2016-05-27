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
        scope.$parent.$watch('vm.uiState.loaded', function (newValue, oldValue) {
            if (newValue) {
                scope.dataLoaded = true;
            }
        });
        /*
        * @addImageFromMedia
        * -
        */

        scope.addImageFromMedia = function (componentId, index, update) {
            scope.media({
                componentId: componentId,
                index: index,
                update: update,
                fields: {
                    title: '<span style="font-size: 30px;">Service Title Here</span>'
                }
            });
        };

        /*
        * @deleteImageFromGallery
        * -
        */

        scope.deleteImageFromGallery = function (index) {
            scope.$broadcast('$refreshSlickSlider', index);
            var images = angular.copy(scope.component.images);
            images.splice(index, 1);
            scope.component.images = images;
        };

        scope.touchMove = false;
        scope.draggable = false;
        scope.autoplay = false;
    }
  };
}]);
