define(['app', 'userService', 'paymentService', 'skeuocardDirective', 'ngProgress','mediaDirective'], function(app) {
    app.register.controller('AccountCtrl', ['$scope', 'UserService', 'PaymentService', 'ngProgress', function ($scope, UserService, PaymentService, ngProgress) {
        ngProgress.start();
    	UserService.getUser(function (user) {
    		$scope.user = user;
    		$scope.activeTab = 'account';
    	});

        UserService.getAccount(function (account) {
            $scope.account = account;
            ngProgress.complete();
        });
    }]);
});
