define(['app', 'userService', 'paymentService', 'skeuocardDirective', 'ngProgress', 'mediaDirective', 'stateNavDirective', 'toasterService'], function(app) {
  app.register.controller('AccountCtrl', ['$scope', 'UserService', 'PaymentService', 'ngProgress', 'ToasterService', function($scope, UserService, PaymentService, ngProgress, ToasterService) {
    ngProgress.start();

    $scope.activeSkeuocard = false;

    $scope.invoicePageLimit = 5;

    $scope.updateStripeIdFn = function(billing) {
      $scope.user.stripeId = billing.billing.stripeCustomerId;
      $scope.activeSkeuocard = false;
    };

    $scope.activeSkeuocardFn = function(status) {
      $scope.activeSkeuocard = status;
    };

    $scope.invoicePageChangeFn = function (invoiceCurrentPage, invoiceTotalPages) {
       var begin = ((invoiceCurrentPage - 1) * $scope.invoicePageLimit);
       var end = begin + $scope.invoicePageLimit;
       $scope.pagedInvoices = $scope.invoices.data.slice(begin, end);
    };

    $scope.$watch('user.stripeId', function(newValue, oldValue) {
      if (newValue) {
        PaymentService.getListStripeSubscriptions(newValue, function(subscriptions) {
          $scope.subscription = subscriptions.data[0];
        });

        PaymentService.getUpcomingInvoice(newValue, function(upcomingInvoice) {
          $scope.upcomingInvoice = upcomingInvoice;
        });
      }
    });

    UserService.getUser(function(user) {
      $scope.user = user;
      $scope.activeTab = $scope.user.app_preferences.account.default_tab;
    });

    UserService.getAccount(function(account) {
      $scope.account = account;
    });

    PaymentService.getAllInvoices(function(invoices) {
      $scope.invoices = invoices;
      $scope.pagedInvoices = $scope.invoices.data.slice(0, $scope.invoicePageLimit);
      ngProgress.complete();
      ToasterService.processPending();
    });
    $scope.updateUser = function (user){
      UserService.putUser(user, function(){});
    };
  }]);
});
