define(['app', 'apiService'], function(app) {
    app.controller('AccountEditCtrl', ['$scope', 'ApiService', function ($scope, ApiService) {
        ApiService.getUser(function (user) {
    		$scope.user = user;
    		$scope.fullName = [user.first, user.middle, user.last].join(' ');
            $scope.$back = function() {  window.history.back(); };
    	});

    	$scope.$watch('fullName', function (newValue, oldValue) {
    		if (newValue) {
    			var nameSplit = newValue.split(' ');
    			if (nameSplit.length >= 3) {
    				$scope.user.first = nameSplit[0];
    				$scope.user.middle = nameSplit[1];
    				$scope.user.last = nameSplit[2];
    			} else if (nameSplit.length == 2) {
    				$scope.user.first = nameSplit[0];
    				$scope.user.middle = '';
    				$scope.user.last = nameSplit[1];
    			} else if (nameSplit.length == 1) {
    				$scope.user.first = nameSplit[0];
    				$scope.user.middle = '';
    				$scope.user.last = '';
    			} else {
    				$scope.user.first = '';
    				$scope.user.middle = '';
    				$scope.user.last = '';
    			}
    			ApiService.putUser($scope.user, function (user) {
    				$scope.user = user;
    			});
    		}
    	});

    	$scope.$watch('user.email', function (newValue, oldValue) {
    		if (newValue) {
    			ApiService.putUser($scope.user, function (user) {
    				$scope.user = user;
    			});
    		}
    	});
    }]);
});