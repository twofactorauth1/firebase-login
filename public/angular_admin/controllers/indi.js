define(['app', 'userService'], function(app) {
    app.register.controller('IndiCtrl', ['$scope', 'UserService', function($scope, UserService) {
    	$scope.startTask = function(task) {
    		console.log('starting task >>> ', task);
    		if (task === 'select-theme') {
    			window.location = '/admin#/website'
    		};
    	};

    	$scope.$watch('activeTab', function(newValue, oldValue) {
            if ($scope.userPreferences) {
                $scope.userPreferences.indi_default_tab = newValue;
                $scope.savePreferencesFn();
            }
        });

        UserService.getUserPreferences(function(preferences) {
            $scope.userPreferences = preferences;
            $scope.activeTab = preferences.indi_default_tab || 'getting-started';
            console.log('$scope.activeTab >>> ', $scope.activeTab);
        });

        $scope.savePreferencesFn = function() {
            UserService.updateUserPreferences($scope.userPreferences, $scope.showToaster, function() {})
        };
  }]);
});
