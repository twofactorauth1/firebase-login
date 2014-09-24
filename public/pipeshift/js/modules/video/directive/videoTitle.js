//use only for items which were dropped to course
angular.module('var.directives').directive('videoTitle', function () {
    return {
        scope: {
            video: "=",
            width: "@"
        },
        restrict: 'E',
        template: '<div style="width:{{width}};color: #326c94;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;width: 160px;" class="single-line-text" tooltip="{{video.videoTitle}}" tooltip-placement="bottom">{{video.videoTitle}}</div>'
    }
});
