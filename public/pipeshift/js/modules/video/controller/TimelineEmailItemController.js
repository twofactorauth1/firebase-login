define(['angularAMD', 'app'], function(angularAMD, app) {
  app.register.controller('TimelineEmailItemModalController', ['$scope', '$modalInstance', 'email', 'template',
    function($scope, $modalInstance, email, template) {
      var scheduledTime = new Date();
      scheduledTime.setHours(email.scheduledHour);
      scheduledTime.setMinutes(email.scheduledMinute);
      email.scheduledDay = email.scheduledDay === null ? 0 : email.scheduledDay;
      $scope.hstep = 1;
      $scope.mstep = 10;
      $scope.email = email;
      $scope.template = template;
      $scope.close = function() {
        $modalInstance.dismiss();
      };
      $scope.submit = function() {
        if ($scope.email.scheduledTime !== undefined) {
          $scope.email.scheduledHour = $scope.email.scheduledTime.getHours();
          $scope.email.scheduledMinute = $scope.email.scheduledTime.getMinutes();
        }
        $modalInstance.close($scope.email);
      };
    }
  ]);
});
