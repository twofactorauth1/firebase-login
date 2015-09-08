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
      stripeId: '=',
      subId: '=',
      // TODO: pass controller functions to change the plan if needed
    },
    link: function(scope, element, attrs) {
      // initialize
      PaymentService.getStripeSubscription(scope.stripeId, scope.subId, function(subscription) {
        scope.subscription = subscription;
      });
    }
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
