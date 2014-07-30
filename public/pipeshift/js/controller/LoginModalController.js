angular.module('app').controller('LoginModalController', ['$scope', '$rootScope', '$modal', '$http', '$location', '$modalInstance', 'security', 'host', function ($scope, $rootScope, $modal, $http, $location, $modalInstance, security, host) {
    $scope.user = {};
    $scope.modal = {submited: false};
    $scope.close = function () {
        $modalInstance.dismiss();
    }
    $scope.submit = function () {
        if ($scope.modal.loginForm.$valid) {
            $http.post(host + '/login', {username: $scope.user.email, password: $scope.user.password}).success(function (data) {
                $scope.submited = false;
                if (data.success) {
                    security.requestCurrentUser();
                    $modalInstance.close();
                    $rootScope.changeView("/video/listeditor");
                } else {
                    alert(data.error);
                }
            }).error(function (data) {
                alert("Some error happened.");
            });
        } else {
            $scope.modal.submited = true;
        }
    }
}]);