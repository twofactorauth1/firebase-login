angular.module('app.modules.video').controller('TimelineItemModalController', ['$scope', '$modalInstance', 'video', 'template', function ($scope, $modalInstance, video, template) {
    var scheduledTime = new Date();
    scheduledTime.setHours(video.scheduledHour);
    scheduledTime.setMinutes(video.scheduledMinute);
    $scope.video = {_id: video._id, videoId: video.videoId, subject: video.subject, videoUrl: video.videoUrl, videoTitle: video.videoTitle, videoSubtitle: video.videoSubtitle, videoBody: video.videoBody, videoPreviewUrl: video.videoPreviewUrl, videoBidPreviewUrl: video.videoBidPreviewUrl, scheduledTime: scheduledTime, scheduledDay: video.scheduledDay == null ? 0 : video.scheduledDay, isPremium: video.isPremium};
    $scope.video.embedurl = "http://www.youtube.com/embed/" + $scope.video.videoId + "?autoplay=0&theme=light&color=white&iv_load_policy=3";
    $scope.template = template;
    //
    $scope.hstep = 1;
    $scope.mstep = 10;
    //
    $scope.close = function () {
        $modalInstance.dismiss();
    }
    $scope.submit = function () {
        $scope.video.scheduledHour = $scope.video.scheduledTime.getHours();
        $scope.video.scheduledMinute = $scope.video.scheduledTime.getMinutes();
        $modalInstance.close($scope.video);
    }
}]);