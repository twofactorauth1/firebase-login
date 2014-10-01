define(['app', 'userService', 'paymentService', 'skeuocardDirective','mediaDirective'], function(app) {
    app.register.controller('AccountCtrl', ['$scope', 'UserService', 'PaymentService', function ($scope, UserService, PaymentService) {
    	UserService.getUser(function (user) {
    		$scope.user = user;
    		$scope.activeTab = 'account';
    	});

        UserService.getAccount(function (account) {
            $scope.account = account;
        });
    }]);
});
