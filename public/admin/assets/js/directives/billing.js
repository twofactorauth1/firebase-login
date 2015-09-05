app.directive("billingInvoice", [function () {
  return {
    restrict: 'E',
    templateUrl: '/admin/assets/views/partials/billingInvoice.html',
    scope: {
      upcomingInvoice: '=',
    },
  }
}]);

app.directive("billingSubscription", ['PaymentService', function (PaymentService) {
  return {
    restrict: 'E',
    templateUrl: '/admin/assets/views/partials/billingSubscription.html',
    scope: {
      subscription: '=',
      //stripeId: '=',
      //subId: '=',
      // TODO: pass controller functions to change the plan if needed
    },
    //link: function(scope, element, attrs) {
    //  // initialize
    //  PaymentService.getStripeSubscription(scope.stripeId, scope.subId, function(subscription) {
    //    scope.subscription = subscription;
    //  });
    //}
  }
}]);

app.directive("billingInvoiceTable", [function () {
  return {
    restrict: 'E',
    templateUrl: '/admin/assets/views/partials/billingInvoiceTable.html',
    scope: {
      pagedInvoices: '=',
    },
  }
}]);

app.directive("billingTrial", ['PaymentService', function (PaymentService) {
  return {
    restrict: 'E',
    templateUrl: '/admin/assets/views/partials/billingTrial.html',
    scope: {
      account: '=',
      subscription: '=',
      //user: '=',
      //actionUpdateStripeId: '&',
      actionSavePlan: '&',
    },
    link: function(scope, el, attrs) {
      console.warn('BillingTrial, account:\n', scope.account);
      console.warn('BillingTrial, subscription:\n', scope.subscription);

      scope.validateCreditCard = function(aCard) {
        console.log('validating credit card:\n', aCard);

        var valid = true;

        var trimNumber = aCard.number.replace(/\s/g, "");
        if(trimNumber.length < 16) {
          console.log('invalid card, not enough numbers:\n', trimNumber);
          valid = false;
        }

        return valid;
      };

      // pay for Trial billing
      scope.submitPayment = function() {
        if( scope.validateCreditCard(scope.credit.card) ) {
          // turn the card into a stripe token
          PaymentService.getStripeCardToken(scope.credit.card.number, function(stripeToken) {
            // TODO: how do I know if this succeeded?

            scope.actionSavePlan('someId');
          });
        }
        else {
          console.log('the credit card did not pass validation');
        }
      };

      // for the credit card directive
      scope.credit = {
        card: {},
        values: {},
        options: {
          debug: false,
          formatting: true
        },
        messages: {},
        //onChange: function() { console.log('changed card'); },
        //onClear: function() { console.log('cleared card'); },
      };

      scope.$watch('subscription', function() {
        console.warn('BillingTrial, subscription changed:\n', scope.subscription);
      });

      //scope.$watch('account', function() {
      //  console.warn('account is changing:\n', scope.account);
      //  //scope.account =
      //})
    },
  }
}]);

// uses angular-card, https://github.com/gavruk/angular-card
// TODO: convert this to a general-use directive, not tied to billing.
app.directive('billingCreditCard', [function() {
  return {
    restrict: 'E',
    templateUrl: '/admin/assets/views/partials/billingCC.html',

    // the required inputs:
    scope: {
      cardInfo: '=',
      cardValues: '=',
      cardOptions: '=',
      cardMessages: '=',
      //changeCard: '&',
      //clear: '&',
    },

    link: function(scope, el, attrs) {
    },
  };
}]);
