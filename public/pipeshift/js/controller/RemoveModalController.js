angular.module('app').controller('RemoveModalController', ['$scope', '$modalInstance', 'message', function ($scope, $modalInstance, message) {
    $scope.message = message;
    $scope.close = function () {
        $modalInstance.dismiss();
    }
    $scope.yes = function () {
        $modalInstance.close();
    }
}]);