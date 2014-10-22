define(['app', 'userService', 'paymentService', 'skeuocardDirective', 'ngProgress','mediaDirective', 'stateNavDirective'], function(app) {
    app.register.controller('AccountCtrl', ['$scope', 'UserService', 'PaymentService', 'ngProgress', function ($scope, UserService, PaymentService, ngProgress) {
        ngProgress.start();

        $scope.activeSkeuocard = false;

        $scope.updateStripeIdFn = function (billing) {
            $scope.user.stripeId = billing.stripeCustomerId;
            $scope.activeSkeuocard = false;
        };

        $scope.$watch('user.stripeId', function (newValue, oldValue) {
            if (newValue) {
                UserService.getUserSubscriptions(newValue, function (subscriptions) {
                    $scope.subscriptions = subscriptions;
                });

                PaymentService.getListStripeSubscriptions(newValue, function (subscriptions) {
                    $scope.subscription = subscriptions.data[0];
                });

                PaymentService.getUpcomingInvoice(newValue, function (upcomingInvoice) {
                    $scope.upcomingInvoice = upcomingInvoice;
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

        PaymentService.getAllInvoices(function (invoices) {
            $scope.invoices = invoices;
        });

    }]);
});
