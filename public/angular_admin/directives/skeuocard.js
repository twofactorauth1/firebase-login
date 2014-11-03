define(['angularAMD', 'skeuocard', 'paymentService', 'userService'], function(angularAMD) {
  angularAMD.directive('indigewebSkeuocard', ['PaymentService', 'UserService', function(PaymentService, UserService) {
    return {
      require: [],
      restrict: 'C',
      transclude: false,
      scope: {
        user: '=user',
        updateFn: '=update'
      },
      templateUrl: '/angular_admin/views/partials/_skeocard.html',
      link: function(scope, element, attrs, controllers) {

        UserService.getUser(function(user) {
          scope.user = user;
        });

        scope.$watch('user', function(newValue, oldValue) {
          if (newValue) {
            PaymentService.getCustomerCards(newValue.stripeId, function(cards) {
              scope.cards = cards;
              if (scope.cards.data.length) {
                scope.card = new Skeuocard($("#skeuocard"), {
                  initialValues: {
                    number: "000000000000" + scope.cards.data[0].last4,
                    expMonth: scope.cards.data[0].exp_month,
                    expYear: scope.cards.data[0].exp_year,
                    type: scope.cards.data[0].type.toLowerCase()
                  }
                });
              } else {
                scope.card = new Skeuocard($("#skeuocard"));
              }
            });
          }
        });

        scope.addCardFn = function() {
          var cardInput = {
            number: $('#cc_number').val(),
            cvc: $('#cc_cvc').val(),
            exp_month: $('#cc_exp_month').val(),
            exp_year: $('#cc_exp_year').val()
          };
          PaymentService.getStripeCardToken(cardInput, function(token) {
            scope.card.flip();
            if (scope.user.stripeId) {
              UserService.postAccountBilling(scope.user.stripeId, token, function(billing) {
                scope.updateFn(billing);
              });
              scope.cards.data.forEach(function(value, index) {
                PaymentService.deleteCustomerCard(value.customer, value.id, function(card) {});
              });
              PaymentService.putCustomerCard(scope.user.stripeId, token, function(card) {});
            } else {
              PaymentService.postStripeCustomer(token, function(stripeUser) {
                scope.user.stripeId = stripeUser.id;
                UserService.postAccountBilling(stripeUser.id, token, function(billing) {
                  scope.updateFn(billing);
                });
                PaymentService.putCustomerCard(stripeUser.id, token, function(card) {});
              });
            }
          });
        };
      }
    };
  }]);
});
