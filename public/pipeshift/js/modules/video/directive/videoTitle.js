//use only for items which were dropped to course
angular.module('var.directives').directive('videoTitle', function () {
    return {
        scope: {
            video: "=",
            width: "@"
        },
        restrict: 'E',
        template: '<div style="width:{{width}}" class="single-line-text" tooltip="{{video.videoTitle}}" tooltip-placement="bottom">{{video.videoTitle}}</div>'
    }
});
