angular.module('app.modules.video').controller('EditCourseModalController', ['$scope', '$modal', '$http', '$location', '$timeout', '$modalInstance', 'course', 'templates', 'Course', function ($scope, $modal, $http, $location, $timeout, $modalInstance, course, templates, Course) {
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
    $scope.title = "Course info"
    $scope.course = {_id: course._id, title: course.title, description: course.description, template: course.template, videos: course.videos, subtitle: course.subtitle, body: course.body, userId: course.userId, subdomain: course.subdomain, price: course.price};
    $scope.templates = templates;
    $scope.close = function () {
        $modalInstance.dismiss();
    }
    $scope.submit = function () {
        $modalInstance.close({course: $scope.course, isRemove: false});
    }
    $scope.removeCourse = function () {
        var modalInstance = $modal.open({
            templateUrl: '/views/modal/removeModal.html',
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
                Course.isSubdomainFree({subdomain: $scope.course.subdomain}).success(function (response) {
                    $scope.isSubdomainChecked = true;
                    if (response.success) {
                        $scope.isSubdomainFree = response.result;
                    }
                    if ($scope.isSubdomainFree) {
                        $scope.courseForm.subdomain.$setValidity("isNotFree", true);
                    } else {
                        $scope.courseForm.subdomain.$setValidity("isNotFree", false);
                    }
                });
            }
        }, 250)
    }
}])
;