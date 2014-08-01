angular.module('app.directives').directive('coursePreview', function () {
    function getTimezoneOffset() {
        return (new Date()).getTimezoneOffset();
    }

    return {
        scope: {
            editMode: "=",
            course: "=",
            minHeight: "="
        },
        controller: function ($scope, $http, host) {
            var course = $scope.course;
            $scope.modal = {};
            $scope.subscribe = function () {
                if (course.subdomain == null || course.subdomain.trim() == "") {
                    alert("Please define course subdomain first.");
                } else {
                    $scope.modal.submited = true;
                    if ($scope.modal.emailForm.$valid) {
                        if (course.videos.length == 0) {
                            alert("Error: empty course");
                        } else {
                            $http.post(host + '/api/1.0/campaignmanager/pipeshift/course/' + course._id + '/subscribe/', {email: $scope.modal.email, course: course, timezoneOffset: getTimezoneOffset()}).success(function (data) {
                                alert("Course has been scheduled for " + $scope.modal.email);
                            }).error(function (data) {
                                alert("Some error happened.");
                            });
                        }
                    }
                }
            };
        },
        replace: true,
        restrict: 'E',
        templateUrl: '/pipeshift/views/directives/coursePreview.html'
    }
});
