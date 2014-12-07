define(['app', 'userService'], function(app) {
    app.register.controller('IndiCtrl', ['$scope', 'UserService', function($scope, UserService) {
    	$scope.startTask = function(task) {
    		console.log('starting task >>> ', task);
    		if (task === 'select-theme') {
    			window.location = '/admin#/website'
    		};
    	};

        $scope.initialWelcome = true;

    	$scope.$watch('activeTab', function(newValue, oldValue) {
            if ($scope.userPreferences) {
                $scope.userPreferences.indi_default_tab = newValue;
                $scope.savePreferencesFn();
            }
        });

        UserService.getUserPreferences(function(preferences) {
            $scope.userPreferences = preferences;
            console.log('preferences >>> ', preferences);
            $scope.activeTab = preferences.indi_default_tab || 'getting-started';
            console.log('$scope.activeTab >>> ', $scope.activeTab);
            $scope.initialWelcome = preferences.welcome_alert.initial;
        });

        $scope.savePreferencesFn = function() {
            UserService.updateUserPreferences($scope.userPreferences, false, function() {})
        };

        $scope.clearWelcome = function() {
        	$scope.initialWelcome = true;
        	if ($scope.userPreferences) {
                $scope.userPreferences.welcome_alert.initial = true;
                $scope.savePreferencesFn();
            }
        };
  }]);
});
