define(['angularAMD', 'app'], function (angularAMD, app) {
    app.register.controller('AddCourseModalController', ['$scope', '$http', '$location', '$timeout', '$modalInstance', 'templates', 'Course', 'searchType', function ($scope, $http, $location, $timeout, $modalInstance, templates, Course, searchType) {
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
        $scope.title = "Add Campaign";
        $scope.linkTooltip = "";
        $scope.templates = templates;
        $scope.searchType = searchType;
        var courseTemplate = {1: 'minimalist', 4: 'email'};
        //todo: change body and subtitle later
        $scope.course = {type: $scope.searchType, title: "", subtitle: "Get started on the right foot", template: {name: courseTemplate[$scope.searchType]}, description: "", videos: [], body: "Thanks a million for joining Minimalist. You are very good looking and charming, with a great sense of humour to boot. We just can't wait to show you around and tell you about how awesome we are.", price: 0.00}
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
})
