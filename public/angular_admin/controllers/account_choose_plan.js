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
                if ($scope.user.stripeId) {
                  UserService.postAccountBilling($scope.user.stripeId, token, function (billing) {});
                  PaymentService.postCreateStripeSubscription($scope.user.stripeId, $scope.selectedPlan, function (subscription) {
                      $state.go('account');
                  });
                } else {
                  PaymentService.postStripeCustomer(token, function (stripeUser) {
                      $scope.user.stripeId = stripeUser.id;
                      UserService.postAccountBilling(stripeUser.id, token, function (billing) {});
                      PaymentService.postCreateStripeSubscription(stripeUser.id, $scope.selectedPlan, function (subscription) {
                          $state.go('account');
                      });
                  });
                }
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

        var card = new Skeuocard($("#skeuocard"));
    }]);
});
