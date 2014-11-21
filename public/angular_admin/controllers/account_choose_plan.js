define(['app', 'userService', 'underscore', 'commonutils', 'adminValidationDirective', 'ngProgress', 'skeuocard', 'paymentService', 'toasterService'], function(app) {
  app.register.controller('AccountChoosePlanCtrl', ['$scope', '$stateParams', 'UserService', 'ngProgress', 'PaymentService', '$state', 'ToasterService', function($scope, $stateParams, UserService, ngProgress, PaymentService, $state, ToasterService) {
    ngProgress.start();

    //back button click function
    $scope.$back = function() {
      window.history.back();
    };

    $scope.switchPlanFn = function (planId) {
        if($scope.user.stripeId) {
            PaymentService.postSubscribeToIndigenous($scope.user.stripeId, planId, null, function(subscription){
                $scope.cancelOldSubscriptionsFn();
                ToasterService.setPending('success', 'Subscribed to new plan.');
                $state.go('account');
            });
        } else {
            ToasterService.setPending('error', 'No Stripe customer ID.');
        }
        /*
      PaymentService.postCreateStripeSubscription($scope.user.stripeId, planId, function(subscription) {
        $scope.cancelOldSubscriptionsFn();
        ToasterService.setPending('success', 'Subscribed to new plan.');
        $state.go('account');
      });
      */
    };

    $scope.buyPlanFn = function() {
      var cardInput = {
        number: $('#cc_number').val(),
        cvc: $('#cc_cvc').val(),
        exp_month: $('#cc_exp_month').val(),
        exp_year: $('#cc_exp_year').val()
      };

      PaymentService.getStripeCardToken(cardInput, function(token) {
        if ($scope.user.stripeId) {
          PaymentService.getCustomerCards($scope.user.stripeId, function(cards) {
            cards.data.forEach(function(value, index) {
              PaymentService.deleteCustomerCard(value.customer, value.id, function(card) {});
            });
            PaymentService.putCustomerCard($scope.user.stripeId, token, function(card) {});
          });
          UserService.postAccountBilling($scope.user.stripeId, token, function(billing) {});
          PaymentService.postCreateStripeSubscription($scope.user.stripeId, $scope.selectedPlan, function(subscription) {
            $scope.cancelOldSubscriptionsFn();
            ToasterService.setPending('success', 'Subscribed to new plan.');
            $state.go('account');
          });
        } else {
          PaymentService.postStripeCustomer(token, function(stripeUser) {
            $scope.user.stripeId = stripeUser.id;
            PaymentService.putCustomerCard(stripeUser.id, token, function (card) {});
            UserService.postAccountBilling(stripeUser.id, token, function(billing) {});
            PaymentService.postCreateStripeSubscription(stripeUser.id, $scope.selectedPlan, function(subscription) {
              $scope.cancelOldSubscriptionsFn();
              ToasterService.setPending('success', 'Subscribed to new plan.');
              $state.go('account');
            });
          });
        }
      });
    };

    $scope.cards = {};
    $scope.subscriptions = {};

    $scope.cancelOldSubscriptionsFn = function () {
      $scope.subscriptions.data.forEach(function (value, index) {
        PaymentService.deleteStripeSubscription(value.customer, value.id, function (subscription) {});
      });
    };

    $scope.$watch('user.stripeId', function (newValue, oldValue) {
      if (newValue) {
        PaymentService.getCustomerCards(newValue, function (cards) {
          $scope.cards = cards;
        });
        PaymentService.getListStripeSubscriptions(newValue, function (subscriptions) {
          $scope.subscriptions = subscriptions;
        });
      }
    });

    //user API call for object population
    UserService.getUser(function(user) {
      $scope.user = user;
    });

    //account API call for object population
    UserService.getAccount(function(account) {
      $scope.account = account;
      ngProgress.complete();
      ToasterService.processPending();
    });

    var card = new Skeuocard($("#skeuocard"));
  }]);
});
