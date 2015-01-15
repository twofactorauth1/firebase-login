define(['angularAMD', 'app'], function(angularAMD, app) {
    app.register.controller('TimelineEmailItemModalController', ['$scope', '$modalInstance', 'email', 'template',
        function($scope, $modalInstance, email, template) {
            $scope.email = email;
            $scope.template = template;
            $scope.close = function() {
                $modalInstance.dismiss();
            };
            $scope.submit = function() {
                $modalInstance.close($scope.email);
            };
        }
    ]);
});
