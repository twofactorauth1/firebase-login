define(['angularAMD', 'app'], function (angularAMD, app) {
    app.register.controller('TimelineItemModalController', ['$scope', '$modalInstance', 'video', 'template', function ($scope, $modalInstance, video, template) {
        var scheduledTime = new Date();
        scheduledTime.setHours(video.scheduledHour);
        scheduledTime.setMinutes(video.scheduledMinute);
        video.scheduledDay = video.scheduledDay == null ? 0 : video.scheduledDay;
        $scope.video = video;
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
});