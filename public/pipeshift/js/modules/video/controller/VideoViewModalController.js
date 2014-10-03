define(['angularAMD', 'app'], function (angularAMD, app) {
    app.register.controller('VideoViewModalController', ['$scope', '$modalInstance', '$sce', 'youtube', 'video', function ($scope, $modalInstance, $sce, youtube, video) {
        var idSplit;
        var videoId;
        $scope.showVideo = function (video) {
            idSplit = video.id.$t.split(":");
            videoId = idSplit[idSplit.length - 1];
            //
            $scope.tab = {showRelated: false};
            $scope.video = video;
            $scope.video.videoId = videoId;
            $scope.video.embedurl = "http://www.youtube.com/embed/" + $scope.video.videoId + "?autoplay=0&theme=light&color=white&iv_load_policy=3";

        }
        $scope.showVideo(video);

        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        }

        $scope.fetchRelated = function () {
            if (!$scope.videos) {
                youtube.setCallback('relatedCallback');
                youtube.getVideos('related', videoId);
            }
            $scope.tab.showRelated = true;
        }

        $scope.getLink = function (video, index) {
            if ($scope.section == 'view') {
                return '/video/view/' + youtube.urlToID(video.media$group.yt$videoid.$t);
            } else if ($scope.section == 'playlist') {
                return '/video/playlist/' + $routeParams.id + '/' + index
            }
        }

        $scope.formatDuration = function (seconds) {
            return youtube.formatDuration(seconds);
        }
        $scope.close = function () {
            $modalInstance.close();
        }

        window.relatedCallback = function (data) {
            $scope.videos = data.feed.entry;
        }
    }]);
});