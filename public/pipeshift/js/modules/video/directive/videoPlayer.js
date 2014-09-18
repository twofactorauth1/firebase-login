angular.module('var.directives').directive('videoPlayer', function () {
    return {
        scope: {
            video: "="
        },
        controller: function ($scope, $sce) {
            $scope.video.embedurl = "http://www.youtube.com/embed/" + $scope.video.videoId + "?autoplay=0&theme=light&color=white&iv_load_policy=3";
            $scope.trustSrc = function (src) {
                return $sce.trustAsResourceUrl(src);
            }
        },
        replace: true,
        restrict: 'A',
        templateUrl: '/pipeshift/views/directives/videoPlayer.html'
    }
});
