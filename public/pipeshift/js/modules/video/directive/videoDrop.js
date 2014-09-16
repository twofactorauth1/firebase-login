(function () {
    angular.module('var.directives').directive('videoDrop', function () {
        return {restrict: 'A',
            scope: {
                from: '=',
                to: '=',
                videos: '=',
                addVideo: '=',
                removeVideo: '=',
                ngDisabled: '=',
                videoSort: '='
            },
            templateUrl: "/pipeshift/views/video/course.html",
            controller: function ($scope) {
                $scope.getScheduledTime = function (video) {
                    var scheduledTime = new Date();
                    scheduledTime.setHours(video.scheduledHour);
                    scheduledTime.setMinutes(video.scheduledMinute);
                    return scheduledTime;
                }
            },
            link: function (scope, elm, attr) {
                elm.bind("dragover", function (event) {
                    event.preventDefault();
                    if (scope.to == null) {
                        return false;
                    }
                });
                elm.bind("drop", function (event) {
                    if (!scope.ngDisabled) {
                        event.preventDefault();
                        if (scope.to != null) {
                           
                            var videoIndex = event.originalEvent.dataTransfer.getData("videoIndex");
                            if (videoIndex != null && videoIndex != "") {
                                var video = scope.from[videoIndex];
                                var toList = scope.to;
                                var isAlreadyInList = false;
                                for (var i = 0; i < toList.length; i++) {
                                    if (toList[i].videoId == getVideoId(video)) {
                                        isAlreadyInList = true;
                                    }
                                }
                                if (!isAlreadyInList) {
                                    var videoObject = initVideoObject(video, getLastVideoDay(toList))
                                    //
                                    scope.addVideo(videoObject);
                                }
                            } else {
                                return false;
                            }
                        }
                    }
                });
            }};
    });
    function getLastVideoDay(videos) {
        var lastVideoDay = -1;
        for (var i = 0; i < videos.length; i++) {
            lastVideoDay = Math.max(lastVideoDay, videos[i].scheduledDay);
        }
        return lastVideoDay;
    }

    function initVideoObject(video, lastVideoDay) {
        var videoObject = {videoId: getVideoId(video)};
        videoObject.subject = "";
        videoObject.videoUrl = "http://youtube.com/watch?v=" + videoObject.videoId;
        videoObject.videoTitle = video.title.$t;
        videoObject.videoSubtitle = "Subtitle";
        videoObject.videoBody = "body";
        videoObject.videoPreviewUrl = video.media$group.media$thumbnail[1].url;
        var maxThumbnail = video.media$group.media$thumbnail[0];
        for (var i = 0; i < video.media$group.media$thumbnail.length; i++) {
            var thumbnail = video.media$group.media$thumbnail[i];
            if (maxThumbnail.width < thumbnail.width) {
                maxThumbnail = thumbnail;
            }
            if (thumbnail.width == 640) {
                videoObject.videoBigPreviewUrl = thumbnail.url;
                break;
            }
        }
        if (videoObject.videoBigPreviewUrl == null) {
            videoObject.videoBigPreviewUrl = maxThumbnail.url;
        }

        //init time for video
        videoObject.scheduledHour = 8;
        videoObject.scheduledMinute = 0;
        videoObject.scheduledDay = lastVideoDay + 1;
        return videoObject;
    }

    function getVideoId(video) {
        var idSplit = video.id.$t.split(":");
        var videoId = idSplit[idSplit.length - 1];
        return videoId;
    }
})();
