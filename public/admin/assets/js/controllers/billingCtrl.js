'use strict';
/*global app, moment, angular*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('BillingCtrl', ["$scope", "$rootScope", "toaster", "$modal", "$location", "ProductService", "PaymentService", "UserService", "$q", "ToasterService", "ipCookie", function ($scope, $rootScope, toaster, $modal, $location, ProductService, PaymentService, UserService, $q, ToasterService, ipCookie) {

    $scope.number = 1;

    $scope.plus = function () {
      $scope.number++;
    };

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

    $scope._moment = function (_date, options) {
      if (_date.toString().length === 10) {
        _date = _date * 1000;
      }
      var formattedDate = moment(_date);

      if (options) {
        if (options.subtractNum && options.subtractType) {
          formattedDate = formattedDate.subtract(options.subtractNum, options.subtractType);
        }
      }
      return formattedDate.format("MMMM Do, YYYY");
    };

    $scope.changeInvoice = function (invoice, index) {
      $scope.selectedInvoice = invoice;
      $scope.selectedItemIndex = index;
    };

    /*
     * @updateStripeIdFn
     * -
     */

    $scope.updateStripeIdFn = function (billing) {
      console.log('updateStripeIdFn >>>');
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
    $scope.planlist = {
      list: []
    };
    $scope.selectedPlan = {
      plan: {
        id: null
      }
    };

    //get plans
    ProductService.getIndigenousProducts(function (products) {
      products.forEach(function (product){
        var productAttrs = product.product_attributes;
        var hasStripePlans = productAttrs.hasOwnProperty('stripePlans');
        var promises = [];

        if (hasStripePlans) {
          productAttrs.stripePlans.forEach(function (value) {
            if (value.active) {
              $scope.planStatus[product._id] = {};
              $scope.planStatus[product._id][value.id] = value;
            }
            PaymentService.getIndigenousPlan(value.id, function(plan){
              console.log(plan);
              product.stripePlanFullData = plan;
              $scope.planlist.list.push(plan);
            });
            // promises.push(PaymentService.getIndigenousPlanPromise(value.id));
            console.log(value.id);
          });
          // $q.all(promises)
          //   .then(function (data) {
          //     data.forEach(function (value) {
          //       $scope.subscriptionPlans.push(value.data);
          //     });
          //   })
          //   .catch(function (err) {
          //     console.error(err);
          //   });
        }

      });
    });


    $scope.subscriptionSelected = false;

    /*
     * @switchSubscriptionPlanFn
     * -  
     */

    $scope.switchSubscriptionPlanFn = function (planId) {
      $scope.selectedPlan = {
        plan: {
          id: null
        }
      };
      $scope.subscriptionSelected = planId !== null ? true : false;
      $scope.selectedPlan.plan.id = planId;
      // $scope.savePlanFn($scope.subscription.plan.id);
    };

    $scope.$watch('selectedPlan', function(){
      console.warn('$scope.selectedPlan changed: ');
      console.warn($scope.selectedPlan);
    });

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
     * - set new active plan for user
     * - TODO: setup fee?
     */

    $scope.savePlanFn = function (planId) {
      console.log('savePlanFn >>');

      if ($scope.currentUser.stripeId) {
        PaymentService.postSubscribeToIndigenous($scope.currentUser.stripeId, planId, null, $scope.planStatus[planId], function (subscription) {
          $scope.cancelOldSubscriptionsFn();
          $scope.selectedPlan = subscription;
          PaymentService.getUpcomingInvoice($scope.currentUser.stripeId, function (upcomingInvoice) {
            $scope.upcomingInvoice = upcomingInvoice;
          });
          PaymentService.getInvoicesForAccount(function (invoices) {
            $scope.invoices = invoices;
            $scope.pagedInvoices = $scope.invoices.data.slice(0, $scope.invoicePageLimit);
          });
          ToasterService.setPending('success', 'Subscribed to new plan.');
          $scope.getAccountData();
        });
      } else {
        ToasterService.setPending('error', 'No Stripe customer ID.');
      }

      $scope.selectPlanView = 'card';
    };

    /*
     * @cancelOldSubscriptionsFn
     * - cancel all other subscriptions for this user
     */

    $scope.cancelOldSubscriptionsFn = function () {
      $scope.subscriptionsCompleteList.data.forEach(function (value) {
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
          $scope.subscriptionsCompleteList = subscriptions;
          // $scope.selectedPlan = subscriptions.data[0];
        });

        //PaymentService.getUpcomingInvoice(newValue, function (upcomingInvoice) {
        //  $scope.upcomingInvoice = upcomingInvoice;
        //});

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

          //TODO: need this?
          // if ($scope.firstTime) {
          //   $scope.savePlanFn($scope.selectedPlan.plan.id);
          //   $scope.firstTime = false;
          // }
        }
      }
    });

    //set the onboarding min requirements to true because there are none
    $scope.minRequirements = true;

    /*
     * @getAccount
     * -
     */

    $scope.getAccountData = function (){
      UserService.getAccount(function (account) {
        if (account.locked_sub === undefined || account.locked_sub === true) {
          ToasterService.show('warning', "No Subscription");
        }
        ToasterService.processPending();
        ToasterService.processHtmlPending();
        $scope.account = account;
        
        $scope.selectedPlan.paymentProcessing = false;

        console.warn('BillingCtrl, received account:\n', account);
        
        if (account.billing.subscriptionId) {
          PaymentService.getStripeSubscription(
            account.billing.stripeCustomerId,
            account.billing.subscriptionId,
            function(subscription) {
              // $scope.subscription = subscription; 
              $scope.selectedPlan = subscription;
              console.warn('BillingCtrl, received subscription:\n', subscription);
          });
        }

        // $scope.currentAccount.membership = account.billing.subscriptionId;
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
    };

    $scope.getAccountData();

  }]);
}(angular));
