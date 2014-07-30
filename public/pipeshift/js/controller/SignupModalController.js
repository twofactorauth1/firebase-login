angular.module('app').controller('SignupModalController', ['$scope', '$rootScope', '$modal', '$http', '$modalInstance', 'security', 'host', function ($scope, $rootScope, $modal, $http, $modalInstance, security, host) {
    $scope.user = {};
    $scope.modal = {submited: false};
    $scope.close = function () {
        $modalInstance.dismiss();
    }
    $scope.submit = function () {
        var passwordsEqual = $scope.user.password == $scope.user.confirmPassword;
        $scope.modal.loginForm.confirmPassword.$setValidity("notEqual", passwordsEqual);
        if ($scope.modal.loginForm.$valid && passwordsEqual) {

            $http.post(host + '/signup', {email: $scope.user.email, password: $scope.user.password, confirmPassword: $scope.user.confirmPassword}).success(function (data) {
                $scope.submited = false;
                if (data.success) {
                    security.requestCurrentUser();
                    $modalInstance.close(true);
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