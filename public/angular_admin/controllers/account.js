define(['app', 'userService', 'paymentService', 'skeuocardDirective', 'ngProgress','mediaDirective', 'stateNavDirective'], function(app) {
    app.register.controller('AccountCtrl', ['$scope', 'UserService', 'PaymentService', 'ngProgress', function ($scope, UserService, PaymentService, ngProgress) {
        ngProgress.start();

        $scope.billing = {};

        $scope.activeSkeuocard = false;

        $scope.updateBillingFn = function (billing) {
            $scope.billing = billing;
            $scope.activeSkeuocard = false;
        };

        $scope.$watch('billing', function (newValue, oldValue) {
            if (newValue && newValue.customerId) {
                UserService.getUserSubscriptions(newValue.customerId, function (subscriptions) {
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
            PaymentService.getListStripeSubscriptions(billing.stripeCustomerId, function (subscriptions) {
                $scope.subscription = subscriptions.data[0];
            });
            PaymentService.getUpcomingInvoice(billing.stripeCustomerId, function (upcomingInvoice) {
                $scope.upcomingInvoice = upcomingInvoice;
                $scope.nextBillingDate = new Date(upcomingInvoice.next_payment_attempt*1000).toDateString();
                $scope.dueDate = new Date(upcomingInvoice.period_end*1000).toDateString();
            });

        });

    }]);
});
