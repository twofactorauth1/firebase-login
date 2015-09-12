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
        if (plan && plan.product_attributes.stripePlans.length) {
          var priceString = plan.product_attributes.stripePlans[0].amount.toString();
          var priceStringLength = priceString.length;
          scope.priceDollars = priceString.slice(0, priceStringLength - 2);
          scope.priceCents = priceString.slice(priceStringLength - 2, priceStringLength);
          scope.billingSubscriptionUnavailable = false;
        } else {
          scope.billingSubscriptionUnavailable = true;
        }
      }, true);

      if (scope.account.billing.plan !== 'NO_PLAN_ARGUMENT') {
        var selectedPlanWatcher = scope.$watch('selectedPlan', function() {
          if (scope.selectedPlan && scope.selectedPlan.product_attributes && scope.selectedPlan.product_attributes.stripePlans[0].id) {
            scope.plan = scope.selectedPlan;
            selectedPlanWatcher(); //unbind after set
          }
        });
      }

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

app.directive("billingTrial", ['PaymentService', 'ToasterService', 'UserService', '$window',
  function (PaymentService, ToasterService, UserService, $window) {
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

            PaymentService.getStripeCardToken(cardObj, function(token) {

              // update the billing data
              if (scope.currentUser && scope.currentUser.stripeId) {
                UserService.postAccountBilling(scope.currentUser.stripeId, token, function(accBillingUpdate) {
                  //console.log('account.billing before update:\n', scope.account.billing);
                  scope.updateStripeIdFn(accBillingUpdate);
                  scope.account = accBillingUpdate;

                  scope.savePlanFn(scope.selectedPlan.product_attributes.stripePlans[0].id);

                  // TODO: remove this window refresh HACK when we know what is the problem refreshing data on the billingCtrl.
                  $window.location.reload(true);
                });
                //scope.cards.data.forEach(function(value, index) {
                //  PaymentService.deleteCustomerCard(value.customer, value.id, false, function(card) {});
                //});
              } else {
                // TODO: this is what the skeuocard code was doing, not sure if it makes sense.
                console.warn('no valid user, trying with stripe token:\n', token);
                if (token) {
                  PaymentService.postStripeCustomer(token, function(stripeUser) {

                    // TODO: this makes no sense. we only got here if the user was bad
                    if (scope.currentUser)
                      scope.currentUser.stripeId = stripeUser.id;
                    UserService.postAccountBilling(stripeUser.id, token, function(billing) {
                      scope.updateStripeIdFn(billing);
                    });
                  });
                }
                else {
                  console.warn('no valid stripe token.');
                }
              }

              //if (token) {
              //  scope.savePlanFn(scope.selectedPlan.product_attributes.stripePlans[0].id);
              //} else {
              //  ToasterService.show('error', 'Oops. The purchase was unsuccessful.');
              //}
            });
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
        if (value && value._id != null) {
          // $(el[0]).find('input:last').focus();
          $timeout(function() {
            $(el[0]).find('input:first').focus();  
          }, 0);
        }
      });
    },
  };
}]);
