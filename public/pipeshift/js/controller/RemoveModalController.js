define(['angularAMD', 'app'], function (angularAMD, app) {
    app.register.controller('RemoveModalController', ['$scope', '$modalInstance', 'message', function ($scope, $modalInstance, message) {
        $scope.message = message;
        $scope.close = function () {
            $modalInstance.dismiss();
        }
        $scope.yes = function () {
            $modalInstance.close();
        }
    }]);
});