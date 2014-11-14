define(['angularAMD', 'app'], function (angularAMD, app) {
    app.register.controller('EditCourseModalController', ['$scope', '$modal', '$http', '$location', '$timeout', '$modalInstance', 'course', 'templates', 'Course', 'Subscriber', function ($scope, $modal, $http, $location, $timeout, $modalInstance, course, templates, Course, Subscriber) {
        $scope.modal = {};
        $scope.isSubdomainChecked = true;
        $scope.isSubdomainFree = true;
        $scope.protocol = $location.protocol() + "://"
        var host = $location.host();
        $scope.hostHasWWW = host.indexOf("www.") == 0;
        if ($scope.hostHasWWW) {
            host = host.substring(4, host.length);
        }
        $scope.domain = host + ":" + $location.port();
        $scope.isAdd = false;
        $scope.title = "Campaign Edit";
        $scope.course = $.extend({}, course);
        $scope.templates = templates;
        $scope.subscribers = [];
        $scope.hideVideo = true;
        function refreshSubscribers() {
            Subscriber.query({id: course._id}, function (response) {
                $scope.subscribers = response;
            });
        }

        refreshSubscribers();
        $scope.close = function () {
            $modalInstance.dismiss();
        }
        $scope.submit = function () {
            $modalInstance.close({course: $scope.course, isRemove: false});
        }
        $scope.removeCourse = function () {
            var modalInstance = $modal.open({
                templateUrl: '/pipeshift/views/modal/removeModal.html',
                controller: 'RemoveModalController',
                resolve: {
                    message: function () {
                        return "Are you sure you want to remove this course?";
                    }
                }
            });
            modalInstance.result.then(function () {
                $modalInstance.close({course: $scope.course, isRemove: true});
            }, function () {
            });
        }
        var subdomainChangeTimeout = -1;
        $scope.onSubdomainChange = function () {
            $scope.isSubdomainChecked = false;
            $scope.isSubdomainFree = false;
            if (subdomainChangeTimeout > 0) {
                $timeout.cancel(subdomainChangeTimeout);
            }
            subdomainChangeTimeout = $timeout(function () {
                if ($scope.course.subdomain == course.subdomain) {
                    $scope.isSubdomainChecked = true;
                    $scope.isSubdomainFree = true;
                } else {
                    Course.isSubdomainFree({subdomain: $scope.course.subdomain}, function (response) {
                        $scope.isSubdomainChecked = true;
                        $scope.isSubdomainFree = response.result;
                        if ($scope.isSubdomainFree) {
                            $scope.courseForm.subdomain.$setValidity("isNotFree", true);
                        } else {
                            $scope.courseForm.subdomain.$setValidity("isNotFree", false);
                        }
                    });
                }
            }, 250)
        }
        $scope.showSubscribersCsvUploadModal = function () {
            console.log('showSubscribersCsvUploadModal >>> ');
            var modalInstance = $modal.open({
                templateUrl: '/pipeshift/views/video/modal/subsCsvUpload.html',
                controller: 'SubscribersCsvUploadController',
                resolve: {
                    course: function () {
                        return $scope.course;
                    }
                }
            });
            modalInstance.result.then(function () {
                refreshSubscribers();
            }, function () {
            });
        }

    }])
    ;
});