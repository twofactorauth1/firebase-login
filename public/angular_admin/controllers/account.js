define(['app', 'userService', 'paymentService', 'skeuocardDirective', 'ngProgress', 'mediaDirective', 'stateNavDirective', 'toasterService', 'accountService'], function(app) {
  app.register.controller('AccountCtrl', ['$scope', 'UserService', 'PaymentService', 'ngProgress', 'ToasterService', 'AccountService', function($scope, UserService, PaymentService, ngProgress, ToasterService, AccountService) {
    ngProgress.start();
    $scope.showToaster = false;

    $scope.invoicePageLimit = 5;

    $scope.selectPlanView = 'card';

    $scope.tabList = [
      {v:'last_tab_visited',n:'Last Tab Visited'},
      {v:'website',n:'Website'},
      {v:'customer',n:'Customer'},
      {v:'marketing',n:'Marketing'},
      {v:'commerce',n:'Commerce'},
      {v:'dashboard',n:'Dashboard'},
      {v:'account',n:'Account'}
    ];

    $scope.$watch('activeTab', function (newValue, oldValue) {
      console.log('watch activeTab >> ', newValue);
      if($scope.userPreferences){
          $scope.userPreferences.account_default_tab = newValue;
          $scope.savePreferencesFn();
        }
    });

    $scope.updateStripeIdFn = function(billing) {
      $scope.user.stripeId = billing.billing.stripeCustomerId;
      $scope.selectPlanView = 'plan';
    };

    $scope.invoicePageChangeFn = function(invoiceCurrentPage, invoiceTotalPages) {
      var begin = ((invoiceCurrentPage - 1) * $scope.invoicePageLimit);
      var end = begin + $scope.invoicePageLimit;
      $scope.pagedInvoices = $scope.invoices.data.slice(begin, end);
    };

    $scope.switchPlanFn = function(planId) {
        if($scope.user.stripeId) {
            PaymentService.postSubscribeToIndigenous($scope.user.stripeId, planId, null, function(subscription){
                $scope.cancelOldSubscriptionsFn();
                $scope.subscription = subscription;
                PaymentService.getUpcomingInvoice($scope.user.stripeId, function(upcomingInvoice){
                    $scope.upcomingInvoice = upcomingInvoice;
                });
                PaymentService.getInvoicesForAccount(function(invoices){
                    $scope.invoices = invoices;
                    $scope.pagedInvoices = $scope.invoices.data.slice(0, $scope.invoicePageLimit);
                });
                ToasterService.setPending('success', 'Subscribed to new plan.');

            });
        } else {
            ToasterService.setPending('error', 'No Stripe customer ID.');
        }
        /*
      PaymentService.postCreateStripeSubscription($scope.user.stripeId, planId, function(subscription) {
        $scope.cancelOldSubscriptionsFn();
        $scope.subscription = subscription;
        PaymentService.getUpcomingInvoice($scope.user.stripeId, function(upcomingInvoice) {
          $scope.upcomingInvoice = upcomingInvoice;
        });
        PaymentService.getAllInvoices(function(invoices) {
          $scope.invoices = invoices;
          $scope.pagedInvoices = $scope.invoices.data.slice(0, $scope.invoicePageLimit);
        });
        ToasterService.setPending('success', 'Subscribed to new plan.');
      });
      */
        $scope.selectPlanView = 'card';
    };

    $scope.cancelOldSubscriptionsFn = function() {
      $scope.subscriptions.data.forEach(function(value, index) {
        PaymentService.deleteStripeSubscription(value.customer, value.id, function(subscription) {});
      });
    };

    $scope.$watch('user.stripeId', function(newValue, oldValue) {
      if (newValue) {
        PaymentService.getListStripeSubscriptions(newValue, function(subscriptions) {
          $scope.subscriptions = subscriptions;
          $scope.subscription = subscriptions.data[0];
        });

        PaymentService.getUpcomingInvoice(newValue, function(upcomingInvoice) {
          $scope.upcomingInvoice = upcomingInvoice;
        });
      }
    });

    UserService.getAccount(function(account) {
      $scope.account = account;
    });

    /*
    PaymentService.getAllInvoices(function(invoices) {
      $scope.invoices = invoices;
      $scope.pagedInvoices = $scope.invoices.data.slice(0, $scope.invoicePageLimit);
      ngProgress.complete();
      $scope.showToaster = true;
      ToasterService.processPending();
    });
    */

    PaymentService.getInvoicesForAccount(function(invoices){
        $scope.invoices = invoices;
        $scope.pagedInvoices = $scope.invoices.data.slice(0, $scope.invoicePageLimit);
        ngProgress.complete();
        $scope.showToaster = true;
        ToasterService.processPending();
    });

    $scope.setActiveTab = function (tab){
      $scope.showToaster = true;
      $scope.activeTab = tab;
    };
    UserService.getUserPreferences(function(preferences) {
        $scope.userPreferences = preferences;
         var activeTab = $scope.userPreferences.account_default_tab;
        if(activeTab)
          $scope.activeTab = activeTab;
        else
          $scope.activeTab = AccountService.getActiveTab();
    });

    $scope.savePreferencesFn = function() {
      UserService.updateUserPreferences($scope.userPreferences, $scope.showToaster, function(){})
    };

    $scope.updateDefaultTab = function (user){
        NavigationService.updateNavigation2(user);
    };

  }]);

});
