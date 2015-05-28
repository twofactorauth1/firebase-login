'use strict';
/*global app, moment, angular*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('BillingCtrl', ["$scope", "$rootScope", "toaster", "$modal", "$location", "ProductService", "PaymentService", "UserService", "$q", "ToasterService", "ipCookie", function ($scope, $rootScope, toaster, $modal, $location, ProductService, PaymentService, UserService, $q, ToasterService, ipCookie) {

    /*
     * @closeModal
     * close the modal instance
     */

    $scope.closeModal = function () {
      $scope.modalInstance.close();
    };

    /*
     * @openModal
     * open any modal by passing modal id
     */

    $scope.openModal = function (modal) {
      $scope.modalInstance = $modal.open({
        templateUrl: modal,
        scope: $scope
      });
    };

    $scope.changeInvoice = function (invoice) {
      $scope.selectedInvoice = invoice;
    };

    /*
     * @updateStripeIdFn
     * -
     */

    $scope.updateStripeIdFn = function (billing) {
      $scope.currentUser.stripeId = billing.billing.stripeCustomerId;
      $scope.selectPlanView = 'plan';
    };

    /*
     * @invoicePageChangeFn
     * -
     */

    $scope.invoicePageChangeFn = function (invoiceCurrentPage) {
      var begin = ((invoiceCurrentPage - 1) * $scope.invoicePageLimit);
      var end = begin + $scope.invoicePageLimit;
      $scope.pagedInvoices = $scope.invoices.data.slice(begin, end);
    };

    /*
     * @getIndigenousProducts
     * -
     */

    $scope.currentAccount = {};
    $scope.planStatus = {};

    //get plans
    var productId = "3d6df0de-02b8-4156-b5ca-f242ab18a3a7";
    ProductService.getIndigenousProducts(function (products) {
      var product = _.findWhere(products, {
        _id: productId
      });

      $scope.paymentFormProduct = product;
      var promises = [];
      $scope.subscriptionPlans = [];
      if ($scope.paymentFormProduct.product_attributes.hasOwnProperty('stripePlans')) {
        $scope.paymentFormProduct.product_attributes.stripePlans.forEach(function (value) {
          if (value.active) {
            $scope.planStatus[value.id] = value;
          }
          promises.push(PaymentService.getIndigenousPlanPromise(value.id));
        });
        $q.all(promises)
          .then(function (data) {
            data.forEach(function (value) {
              $scope.subscriptionPlans.push(value.data);
            });
          })
          .catch(function (err) {
            console.error(err);
          });
      }
    });

    $scope.subscriptionSelected = false;

    /*
     * @switchSubscriptionPlanFn
     * -
     */

    $scope.switchSubscriptionPlanFn = function (planId) {
      $scope.subscription = {
        plan: {
          id: null
        }
      };
      $scope.subscriptionSelected = true;
      $scope.subscription.plan.id = planId;
      $scope.savePlanFn($scope.subscription.plan.id);
    };

    /*
     * @chooseFirstTime
     * -
     */

    $scope.chooseFirstTime = function () {
      $('#changeCardModal').modal('show');
      $scope.firstTime = true;
      //set trigger on success of add card service
    };

    /*
     * @savePlanFn
     * -
     */

    $scope.savePlanFn = function (planId) {
      if ($scope.currentUser.stripeId) {
        PaymentService.postSubscribeToIndigenous($scope.currentUser.stripeId, planId, null, $scope.planStatus[planId], function (subscription) {
          $scope.cancelOldSubscriptionsFn();
          $scope.subscription = subscription;
          PaymentService.getUpcomingInvoice($scope.currentUser.stripeId, function (upcomingInvoice) {
            $scope.upcomingInvoice = upcomingInvoice;
          });
          PaymentService.getInvoicesForAccount(function (invoices) {
            $scope.invoices = invoices;
            $scope.pagedInvoices = $scope.invoices.data.slice(0, $scope.invoicePageLimit);
          });
          ToasterService.setPending('success', 'Subscribed to new plan.');

        });
      } else {
        ToasterService.setPending('error', 'No Stripe customer ID.');
      }

      $scope.selectPlanView = 'card';
    };

    /*
     * @cancelOldSubscriptionsFn
     * -
     */

    $scope.cancelOldSubscriptionsFn = function () {
      $scope.subscriptions.data.forEach(function (value) {
        PaymentService.deleteStripeSubscription(value.customer, value.id, function (subscription) {
          console.log('subscription ', subscription);
        });
      });
    };

    $scope.hasCard = false;

    /*
     * @watch:currentUser.stripeId
     * -
     */

    $scope.$watch('currentUser.stripeId', function (newValue) {
      console.log('currentUser.stripeId >>> ', newValue);
      if (newValue) {
        PaymentService.getListStripeSubscriptions(newValue, function (subscriptions) {
          $scope.subscriptions = subscriptions;
          $scope.subscription = subscriptions.data[0];
        });

        PaymentService.getUpcomingInvoice(newValue, function (upcomingInvoice) {
          $scope.upcomingInvoice = upcomingInvoice;
        });

        var account_cookie = ipCookie("socialAccount");
        if (account_cookie !== undefined) {
          toaster.pop('success', account_cookie, '<div class="mb15"></div><a href="/admin#/customer?onboarding=create-contact" class="btn btn-primary">Next Step: Import/Create Contacts</a>', 0, 'trustedHtml');
          ipCookie.remove("socialAccount", {
            path: "/"
          });
        }
        if ($location.$$search.onboarding) {
          $scope.showOnboarding = true;
        }
        if ($scope.currentUser.stripeId) {
          PaymentService.getInvoicesForAccount(function (invoices) {
            $scope.invoices = invoices;
            $scope.pagedInvoices = $scope.invoices.data.slice(0, $scope.invoicePageLimit);
            $scope.showToaster = true;
            ToasterService.processPending();
            ToasterService.processHtmlPending();
          });
          PaymentService.getCustomerCards($scope.currentUser.stripeId, function (cards) {
            if (cards.data.length) {
              $scope.hasCard = true;
            }
          });

          if ($scope.firstTime) {
            $scope.savePlanFn($scope.subscription.plan.id);
            $scope.firstTime = false;
          }
        }
      }
    });

    $scope.checkOnboardMinRequirements = function() {
      console.log('checking onboarding requirements');
        $scope.minRequirements = true;
    };

    /*
     * @getAccount
     * -
     */

    UserService.getAccount(function (account) {
      if (account.locked_sub === undefined || account.locked_sub === true) {
        ToasterService.show('warning', "No Subscription");
      }
      ToasterService.processPending();
      ToasterService.processHtmlPending();
      $scope.account = account;
      $scope.currentAccount.membership = account.billing.subscriptionId;
      /*
       * If the account is locked, do not allow state changes away from account.
       * Commenting this out until we know for sure that we should allow logins from locked accounts.
       */
      if (account.locked_sub === true) {
        ToasterService.show('error', 'No Indigenous Subscription found.  Please update your billing information.');
        $rootScope.$on('$stateChangeStart',
          function (event) {
            event.preventDefault();
            ToasterService.show('error', 'No Indigenous Subscription found.  Please update your billing information.');
            // transitionTo() promise will be rejected with
            // a 'transition prevented' error
          });
      }
    });

  }]);
}(angular));
