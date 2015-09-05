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

app.directive("billingTrial", [function () {
  return {
    restrict: 'E',
    templateUrl: '/admin/assets/views/partials/billingTrial.html',
    scope: {
      account: '=',
      subscription: '=',
      //user: '=',
      //actionUpdateStripeId: '&',
      //actionSavePlan: '&',
    },
    link: function(scope, el, attrs) {
      console.warn('BillingTrial, account:\n', scope.account);
      console.warn('BillingTrial, subscription:\n', scope.subscription);

      // for the credit card directive
      scope.credit = {
        card: {},
        values: {},
        options: {},
        messages: {},
        onChange: function() { console.log('changed card'); },
        onClear: function() { console.log('cleared card'); },
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

// TODO: convert this to a general-use directive, not tied to billing.
app.directive('billingCreditCard', [function() {
  return {
    restrict: 'E',
    templateUrl: '/admin/assets/views/partials/billingCC.html',

    // the required inputs:
    scope: {
      card: '=',
      cardValues: '=',
      cardOptions: '=',
      cardMessages: '=',
      changeCard: '&',
      clear: '&',
    },

    link: function(scope, el, attrs) {
    },
  };
}]);
