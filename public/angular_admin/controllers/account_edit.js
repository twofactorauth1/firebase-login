define(['app', 'apiService', 'underscore', 'commonutils'], function(app) {
    app.controller('AccountEditCtrl', ['$scope', 'ApiService', function ($scope, ApiService) {
        //back button click function
        $scope.$back = function() {window.history.back();};

        //user API call for object population
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
                    $scope.userPhone = {_id: $$.u.idutils.generateUniqueAlphaNumericShort(), type: 'm', number: '', default: true};
            } else {
                $scope.userPhone = {_id: $$.u.idutils.generateUniqueAlphaNumericShort(), type: 'm', number: '', default: true};
            }
    	});

        //account API call for object population
        ApiService.getAccount(function (account) {
            $scope.account = account;
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
            }
            ApiService.putUser($scope.user, function (user) {
                $scope.user = user;
            });
        });

        //update user object on change
        $scope.$watch('user', function (newValue, oldValue) {
            if (newValue) {
                ApiService.putUser($scope.user, function (user) {
                    $scope.user = user;
                });
            }
        }, true);

        //update account object on change
        $scope.$watch('account', function (newValue, oldValue) {
            if (newValue) {
                if ($scope.account.business.size)
                    $scope.account.business.size = parseInt($scope.account.business.size);
                if ($scope.account.business.type)
                    $scope.account.business.type = parseInt($scope.account.business.type);
                ApiService.putAccount($scope.account, function (account) {
                    $scope.account = account;
                });
            }
        }, true);
    }]);
});
