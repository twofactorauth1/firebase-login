angular.module('var.directives').directive('coursePreview', function () {
    function getTimezoneOffset() {
        return (new Date()).getTimezoneOffset();
    }

    return {
        scope: {
            editMode: "=",
            course: "=",
            minHeight: "=",
            isLoggedInAndSubscribed: "=",
            standalone: "="
        },
        controller: function ($scope, $http, $location, $modal) {
            var course = $scope.course;
            $scope.modal = {};
            var carouselData = [];
            var courseVideos = $scope.course.videos;
            if (courseVideos.length > 0) {
                $scope.selectedVideo = courseVideos[0];
                for (var i = 0; i < Math.ceil(courseVideos.length / 3); i++) {
                    var pageData = [];
                    for (var j = 0; j < 3; j++) {
                        var video = courseVideos[i * 3 + j];
                        if (video != null) {
                            pageData.push(video);
                        }
                    }
                    carouselData.push(pageData);
                }
            }
            $scope.carouselData = carouselData;
            $scope.subscribe = function () {
                if (course.subdomain == null || course.subdomain.trim() == "") {
                    alert("Please define course subdomain first.");
                } else {
                    $scope.modal.submited = true;
                    if ($scope.modal.emailForm.$valid) {
                        if (course.videos.length == 0) {
                            alert("Error: empty course");
                        } else {
                            subscribeToCourse($scope.modal.email, course);
                        }
                    }
                }
            };
            function subscribeToCourse(email, course) {
                $http.post('/api/1.0/campaignmanager/pipeshift/courses/' + course._id + '/subscribe/', {email: email, course: course, timezoneOffset: getTimezoneOffset()}).success(function (data) {
                    alert("Course has been scheduled for " + email);
                }).error(function (data) {
                    alert("Some error happened.");
                });
            }

            $scope.selectVideo = function (video) {
                $http.get("/api/1.0/campaignmanager/pipeshift/courses/" + course._id + "/subscribers/video/" + video._id).success(function (response) {
                    if (response.success) {
                        $scope.selectedVideo = response.result;
                        var $videoPlayerContainer = $("#videoPlayerContainer");
                        $videoPlayerContainer.empty();
                        $videoPlayerContainer.html("<div video-player video='selectedVideo' courseDetails='course'></div>");
                        $compile($videoPlayerContainer)($scope);
                    }
                })
            }
            $scope.videoId = $location.search().videoId;
            if ($scope.videoId != null) {
                $scope.selectVideo({_id: $scope.videoId});
            }
            if ($scope.standalone && !$scope.isLoggedInAndSubscribed && course.showExitIntentModal) {
                ouibounce($('#exit_intent_modal')[0], {aggressive: true});
            }
            $scope.share = function (shareUrl) {
                window.open(shareUrl + $location.absUrl(), '_blank', 'scrollbars=0, resizable=1, menubar=0, left=100, top=100, width=550, height=440, toolbar=0, status=0');
            }
            $scope.showCourseSubscribeModal = function () {
                var modalInstance = $modal.open({
                    templateUrl: '/pipeshift/views/modal/subscribeModal.html',
                    controller: 'CourseSubscribeModalController',
                });
                modalInstance.result.then(function (email) {
                    subscribeToCourse(email, course);
                }, function () {
                });
            }
        },
        replace: true,
        restrict: 'E',
        templateUrl: '/pipeshift/views/directives/coursePreview.html'
    }
});
