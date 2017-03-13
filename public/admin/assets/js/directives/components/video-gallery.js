'use strict';

/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('videoGalleryComponent', ['$timeout', function ($timeout) {
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

        scope.addNewVideo = function (componentId, index) {
           if (!index) {
                index = 0;
            }
            var video = {
                "title" : "<span style=\"font-size: 30px;\">Service Title Here</span>",
                "description" : "<p>This is a paragraph. Lorem ipsum dolor sit am et, consectetur elit. Donec sagittis inte rdum neque, con vallis rutrum lorem varius ut.</p>",
                "video" : "<span class=\"fr-video fr-fvc fr-dvb fr-draggable\" contenteditable=\"false\"><iframe src=\"https://www.youtube.com/embed/1BCG4G_FUhs\" style=\"width:100%;\"></iframe>"
            };
            scope.component.collections.splice(index + 1, 0, video);
        };

        /*
        * @deleteImageFromGallery
        * -
        */

        scope.deleteVideoFromGallery = function (index) {
            var videos = angular.copy(scope.component.collections);
            videos.splice(index, 1);
            scope.component.collections = videos;
        };  
    }
  };
}]);
