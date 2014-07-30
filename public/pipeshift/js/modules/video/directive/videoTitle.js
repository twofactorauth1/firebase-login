//use only for items which were dropped to playlist
angular.module('app.directives').directive('videoTitle', function () {
    return {
        scope: {
            video: "=",
            width: "@"
        },
        restrict: 'E',
        template: '<div style="width:{{width}}" class="single-line-text" tooltip="{{video.videoTitle}}" tooltip-placement="bottom">{{video.videoTitle}}</div>'
    }
});
