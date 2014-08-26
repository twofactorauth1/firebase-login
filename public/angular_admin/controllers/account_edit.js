define(['app', 'apiService'], function(app) {
    app.controller('AccountEditCtrl', ['$scope', 'ApiService', function ($scope, ApiService) {
        //back button click function
        $scope.$back = function() {window.history.back();};

        ApiService.getUser(function (user) {
    		$scope.user = user;
    		$scope.fullName = [user.first, user.middle, user.last].join(' ');

            if (user.details.phones && user.details.phones.length) {
                $scope.userPhone = null;
                user.details.phones.forEach(function (value) {
                    if (value.default) {
                        $scope.userPhone = value;
                    }
                });
                if ($scope.userPhone === null)
                    $scope.userPhone = {_id: '', type: 'm', number: '', default: true};
            } else {
                $scope.userPhone = {_id: '', type: 'm', number: '', default: true};
            }
    	});

        //user fullname PUT call
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

        //user email ID PUT call
    	$scope.$watch('user.email', function (newValue, oldValue) {
    		if (newValue) {
    			ApiService.putUser($scope.user, function (user) {
    				$scope.user = user;
    			});
    		}
    	});

        //user phone number PUT call
        $scope.$watch('userPhone.number', function (newValue, oldValue) {
            if (newValue) {
                if ($scope.user.details.phones && $scope.user.details.phones.length) {
                    var noDefault = true;
                    $scope.user.details.phones.forEach(function (value, index) {
                        if (value.default) {
                            $scope.user.details.phones[index] = $scope.userPhone;
                            noDefault = false;
                        }
                    });
                    if (noDefault) {
                        $scope.user.details.phones.push($scope.userPhone);
                    }
                } else {
                    $scope.user.details.phones = [$scope.userPhone];
                }
                ApiService.putUser($scope.user, function (user) {
                    $scope.user = user;
                });
            }
        });
    }]);
});
