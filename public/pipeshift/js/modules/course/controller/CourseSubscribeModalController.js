angular.module('app.modules.course').controller('CourseSubscribeModalController', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
    $scope.modal = {}
    $scope.close = function () {
        $modalInstance.dismiss();
    }
    $scope.submit = function () {
        $scope.modal.isSubmited = true;
        if ($scope.modal.emailForm.$valid) {
            $modalInstance.close($scope.modal.email);
        }
    }
}])
;