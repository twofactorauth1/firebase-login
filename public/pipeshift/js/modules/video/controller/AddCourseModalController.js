angular.module('app.modules.video').controller('AddCourseModalController', ['$scope', '$http', '$location', '$timeout', '$modalInstance', 'templates', 'Course', function ($scope, $http, $location, $timeout, $modalInstance, templates, Course) {
    $scope.isSubdomainChecked = true;
    $scope.isSubdomainFree = true;
    $scope.protocol = $location.protocol() + "://"
    var host = $location.host();
    $scope.hostHasWWW = host.indexOf("www.") == 0;
    if ($scope.hostHasWWW) {
        host = host.substring(4, host.length);
    }
    $scope.domain = host + ":" + $location.port();
    $scope.isAdd = true;
    $scope.title = "Add course";
    $scope.linkTooltip = "";
    $scope.templates = templates;
    //todo: change body and subtitle later
    $scope.course = {title: "", subtitle: "Get started on the right foot", template: {name: "minimalist"}, description: "", videos: [], body: "Thanks a million for joining Minimalist. You are very good looking and charming, with a great sense of humour to boot. We just can't wait to show you around and tell you about how awesome we are.", price: 0.00}
    $scope.close = function () {
        $modalInstance.dismiss();
    }
    $scope.submit = function () {
        $modalInstance.close($scope.course);
    }
    var subdomainChangeTimeout = -1;
    $scope.onSubdomainChange = function () {
        $scope.isSubdomainChecked = false;
        $scope.isSubdomainFree = false;
        if (subdomainChangeTimeout > 0) {
            $timeout.cancel(subdomainChangeTimeout);
        }
        subdomainChangeTimeout = $timeout(function () {
            Course.isSubdomainFree({subdomain: $scope.course.subdomain}, function (response) {
                $scope.isSubdomainChecked = true;
                $scope.isSubdomainFree = response.result;
                if ($scope.isSubdomainFree) {
                    $scope.courseForm.subdomain.$setValidity("isNotFree", true);
                } else {
                    $scope.courseForm.subdomain.$setValidity("isNotFree", false);
                }
            });
        }, 250)
    }
}]);