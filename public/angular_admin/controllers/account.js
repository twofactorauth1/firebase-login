define(['app', 'userService', 'skeuocardDirective'], function(app) {
    app.controller('AccountCtrl', ['$scope', 'UserService', function ($scope, UserService) {
    	UserService.getUser(function (user) {
    		$scope.user = user;
    		$scope.activeTab = 'account';
    	});

        UserService.getAccount(function (account) {
            $scope.account = account;
        });
    }]);
});
