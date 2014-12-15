define(['app', 'userService'], function(app) {
    app.register.controller('IndiCtrl', ['$scope', 'UserService', function($scope, UserService) {
    	$scope.startTask = function(section, task) {
    		console.log('starting task >>> ', task);
    		if (section && task) {
    			window.location = '/admin#/'+section+'?onboarding='+task
    		};
    	};

        $scope.initialWelcome = true;

        $scope.topics = [
            {
                "title" : "Can I use my own domain name?",
                "text" : "Yes! If you already have a domain registered you can point your domain to the Indigenous Servers."
            },
            {
                "title" : "Do I need a designer to change my website?",
                "text" : "Not at all. Choose from one of our many professionally designed templates and use the graphical user interface to modify and edit the details of the site."
            }
        ];

    	$scope.$watch('activeTab', function(newValue, oldValue) {
            if ($scope.userPreferences) {
                $scope.userPreferences.indi_default_tab = newValue;
                $scope.savePreferencesFn();
            }
        });

        UserService.getUserPreferences(function(preferences) {
            $scope.userPreferences = preferences;
            $scope.activeTab = preferences.indi_default_tab || 'getting-started';
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
