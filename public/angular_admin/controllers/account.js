define(['app', 'userService', 'paymentService', 'skeuocardDirective', 'ngProgress','mediaDirective'], function(app) {
    app.register.controller('AccountCtrl', ['$scope', 'UserService', 'PaymentService', 'ngProgress', function ($scope, UserService, PaymentService, ngProgress) {
        var billing = {};
        var subscriptions = {};

        ngProgress.start();

        $scope.updateBilling = function (billing) {
            $scope.billing = billing;
        };

        $scope.subscribeMonthlyFn = function () {
            if ($scope.billing.stripeCustomerId) {
                UserService.postUserSubscriptions($scope.billing.stripeCustomerId, 'monthly_access', function (data) {
                    console.info(data);
                });
            }
        };

        $scope.subscribeAnnuallyFn = function () {
            if ($scope.billing.stripeCustomerId) {
                UserService.postUserSubscriptions($scope.billing.stripeCustomerId, 'yearly_access', function (data) {
                    console.info(data);
                });
            }
        };

        $scope.$watch('billing', function (newValue, oldValue) {
            if (newValue && newValue.stripeCustomerId) {
                UserService.getUserSubscriptions(newValue.stripeCustomerId, function (subscriptions) {
                    $scope.subscriptions = subscriptions;
                });
            }
        });

    	UserService.getUser(function (user) {
    		$scope.user = user;
    		$scope.activeTab = 'account';
    	});

        UserService.getAccount(function (account) {
            $scope.account = account;
            ngProgress.complete();
        });

        UserService.getAccountBilling(function (billing) {
            $scope.billing = billing;
        });

    }]);
});
