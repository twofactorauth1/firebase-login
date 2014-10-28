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
        scope.card = new Skeuocard($("#skeuocard"));

        scope.addCardFn = function() {
          var cardInput = {
            number: $('#cc_number').val(),
            cvc: $('#cc_cvc').val(),
            exp_month: $('#cc_exp_month').val(),
            exp_year: $('#cc_exp_year').val()
          };

          PaymentService.getStripeCardToken(cardInput, function(token) {
            if (scope.user.stripeId) {
              UserService.postAccountBilling(scope.user.stripeId, token, function(billing) {
                scope.updateFn(billing);
              });
              PaymentService.putCustomerCard(scope.user.stripeId, token, function (card) {});
            } else {
              PaymentService.postStripeCustomer(token, function(stripeUser) {
                scope.user.stripeId = stripeUser.id;
                UserService.postAccountBilling(stripeUser.id, token, function(billing) {
                  scope.updateFn(billing);
                });
                PaymentService.putCustomerCard(stripeUser.id, token, function (card) {});
              });
            }
          });
        };
      }
    };
  }]);
});
