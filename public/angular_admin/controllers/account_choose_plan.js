define(['app', 'userService', 'underscore', 'commonutils','adminValidationDirective', 'ngProgress', 'skeuocard', 'paymentService'], function(app) {
    app.register.controller('AccountChoosePlanCtrl', ['$scope', '$stateParams', 'UserService', 'ngProgress', 'PaymentService', '$state', function ($scope, $stateParams, UserService, ngProgress, PaymentService, $state) {
        ngProgress.start();

        //back button click function
        $scope.$back = function() {window.history.back();};

        $scope.buyPlanFn = function () {
            var cardInput = {
                number: $('#cc_number').val(),
                cvc: $('#cc_cvc').val(),
                exp_month: $('#cc_exp_month').val(),
                exp_year: $('#cc_exp_year').val()
            };

            PaymentService.getStripeCardToken(cardInput, function (token) {
                PaymentService.postStripeCustomer(token, function (stripeUser) {
                    UserService.postAccountBilling(stripeUser.id, token, function (billing) {
                        console.info('Bill: ' + billing._id + ' updated with token: ' + token + ' and stripe customer ID: ' + stripeUser.id);
                    });
                    PaymentService.postCreateStripeSubscription(stripeUser.id, $scope.selectedPlan, function (subscription) {
                        $state.go('account');
                    });
                });
            });
        };

        //user API call for object population
        UserService.getUser(function (user) {
            $scope.user = user;
        });

        //account API call for object population
        UserService.getAccount(function (account) {
            $scope.account = account;
            ngProgress.complete();
        });

        UserService.getAccountBilling(function (billing) {
            $scope.billing = billing;
        });

        var card = new Skeuocard($("#skeuocard"));
    }]);
});
