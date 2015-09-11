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
    // scope: {
    //   plan: '=',
    //   numplans: '=',
    //   switchSubscriptionPlan: "=",
    //   selectedPlan: "="
    // },
    link: function(scope, element, attrs) {

      scope.$watch('plan', function() {
        var plan = scope.plan;
        if (plan && plan.amount) {
          var priceString = plan.amount.toString();
          var priceStringLength = priceString.length;
          scope.priceDollars = priceString.slice(0, priceStringLength - 2);
          scope.priceCents = priceString.slice(priceStringLength - 2, priceStringLength);
          scope.billingSubscriptionUnavailable = false;
        } else {
          scope.billingSubscriptionUnavailable = true;
        }
      }, true);

      scope.$watch('selectedPlan', function() {
        if (scope.selectedPlan.plan.amount) {
          scope.plan = scope.selectedPlan.plan;
        }
      });

      scope.focusInput = function() {
        element[0]
      };

      if (attrs.showselectbtn) {
        scope.showSelectBtn = attrs.showselectbtn;
      }
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

app.directive("billingTrial", ['PaymentService', 'ToasterService', function (PaymentService, ToasterService) {
  return {
    restrict: 'E',
    templateUrl: '/admin/assets/views/partials/billingTrial.html',
    // scope: {
    //   account:"@",
    //   selectedPlan:"=",
    //   planlist:"=",
    //   actionSavePlan:"&savePlanFn",
    //   switchSubscriptionPlan: "&switchSubscriptionPlanFn"
    // },
    link: function(scope, el, attrs) {

      // pay for Trial billing
      scope.submitPayment = function() {
          if (scope.subscriptionSelected) {
            var cardObj = scope.credit.card;
            cardObj.exp_month = cardObj.expiry.split('/')[0].trim();
            cardObj.exp_year = cardObj.expiry.split('/')[1].trim();
            
            scope.selectedPlan.paymentProcessing = true;

            PaymentService.getStripeCardToken(cardObj, function(stripeToken) {
              if (stripeToken) {
                scope.savePlanFn(scope.selectedPlan.plan.id);
              } else {
                ToasterService.show('error', 'Oops. The purchase was unsuccessful.');
              }
            }, true);
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
    }
  }
}]);

// uses angular-card, https://github.com/gavruk/angular-card
// TODO: convert this to a general-use directive, not tied to billing.
app.directive('billingCreditCard', ['$timeout', function($timeout) {
  return {
    restrict: 'E',
    templateUrl: '/admin/assets/views/partials/billingCC.html',

    // the required inputs:
    scope: {
      cardInfo: '=',
      cardValues: '=',
      cardOptions: '=',
      cardMessages: '=',
      plan: '='
      //clear: '&',
    },

    link: function(scope, el, attrs) {
      scope.$watch('plan', function(value) {
        if (value && value.id != null) {
          // $(el[0]).find('input:last').focus();
          $timeout(function() {
            $(el[0]).find('input:first').focus();  
          }, 0);
        }
      });
    },
  };
}]);
