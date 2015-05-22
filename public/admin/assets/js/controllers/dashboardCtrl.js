'use strict';
/*global app, moment*/
app.controller('DashboardCtrl', ["$scope", "OrderService", "CustomerService", "ChartAnalyticsService", "UserService", "ChartCommerceService", "$modal", "$filter", "contactConstant", function ($scope, OrderService, CustomerService, ChartAnalyticsService, UserService, ChartCommerceService, $modal, $filter, contactConstant) {

  /*
   * @getActivityName
   * - get activity actual name 
   */
  $scope.getActivityName = function(activity)
  {
    var activity_hash = _.findWhere(contactConstant.customer_activity_types.dp, {
        data: activity
    });
    if(activity_hash)
      return activity_hash.label;
    else
      activity;
  }

  /*
   * @isSameDateAs
   * - determine if two dates are identical and return boolean
   */

  $scope.isSameDateAs = function (oDate, pDate) {
    return (
      oDate.getFullYear() === pDate.getFullYear() &&
      oDate.getMonth() === pDate.getMonth() &&
      oDate.getDate() === pDate.getDate()
    );
  };

  /*
   * @getDaysThisMonth
   * - get an array of days this month for loop purposes
   */

  $scope.getDaysThisMonth = function () {
    var newDate = new Date();
    var numOfDays = newDate.getDate();
    var days = [];
    var i = 0;
    for (i; i <= numOfDays; i++) {
      days[i] = new Date(newDate.getFullYear(), newDate.getMonth(), i + 1);
    }

    return days;
  };

  CustomerService.getCustomers(function (customers) {
    CustomerService.getAllCustomerActivities(function (activities) {
      $scope.activities = activities.results;
      _.each($scope.activities, function (activity) {
        var matchingCustomer = _.findWhere(customers, {
          _id: activity.contactId
        });
        activity.customer = matchingCustomer;
      });
    });
  });

  /*
   * @getOrders
   * - get orders for orders widget
   */

  OrderService.getOrders(function (orders) {
    $scope.orders = orders;
    $scope.ordersThisMonth = [];
    var tempData = [];
    _.each($scope.getDaysThisMonth(), function (day) {
      var thisDaysOrders = 0;
      _.each(orders, function (order) {
        if (order.created.date) {
          if ($scope.isSameDateAs(new Date(order.created.date), new Date(day))) {
            $scope.ordersThisMonth.push(order);
            thisDaysOrders = thisDaysOrders + 1;
          }
        }
      });

      tempData.push(thisDaysOrders);
    });
    $scope.analyticsOrders = tempData;
  });

  /*
   * @getCompletedOrders
   * - get the number of compled orders this month
   */

  $scope.getCompletedOrders = function () {
    var completedOrders = [];
    _.each($scope.ordersThisMonth, function (order) {
      if (order.status === 'completed') {
        completedOrders.push(order);
      }
    });

    return completedOrders.length;
  };

  /*
   * @lastCustomerDate
   * - get the last customer date that was created
   */

  $scope.lastCustomerDate = function () {
    if ($scope.customersThisMonth && $scope.customersThisMonth[$scope.customersThisMonth.length - 1] && $scope.customersThisMonth[$scope.customersThisMonth.length - 1].created) {
      return $scope.customersThisMonth[$scope.customersThisMonth.length - 1].created.date;
    }

  };

  /*
   * @getCustomers
   * - get customer for the customer widget
   */

  CustomerService.getCustomers(function (customers) {
    $scope.customers = customers;
    $scope.customersThisMonth = [];
    var tempData = [];
    _.each($scope.getDaysThisMonth(), function (day) {
      var thisDaysCustomers = 0;
      _.each(customers, function (customer) {
        if (customer.created.date) {
          if ($scope.isSameDateAs(new Date(customer.created.date), new Date(day))) {
            $scope.customersThisMonth.push(customer);
            thisDaysCustomers = thisDaysCustomers + 1;
          }
        }
      });

      tempData.push(thisDaysCustomers);
    });
    $scope.analyticsCustomers = tempData;
  });

  /*
   * @getCustomerLeads
   * - get the number of customers that have a lead tag
   */

  $scope.getCustomerLeads = function () {
    var customerLeads = [];
    _.each($scope.customersThisMonth, function (customer) {
      if (customer.tags && customer.tags.length > 0) {
        if (customer.tags.indexOf('ld') > -1) {
          customerLeads.push(customer);
        }
      }
    });

    return customerLeads.length;
  };

  /*
   * @lastOrderDate
   * - get the date of the last order created
   */

  $scope.lastOrderDate = function () {
    if ($scope.ordersThisMonth && $scope.ordersThisMonth[$scope.ordersThisMonth.length - 1] && $scope.ordersThisMonth[$scope.ordersThisMonth.length - 1].created) {
      return $scope.ordersThisMonth[$scope.ordersThisMonth.length - 1].created.date;
    }
  };

  /*
   * @getAccount
   * - get user account and then run visitors report
   */

  UserService.getAccount(function (account) {
    $scope.analyticsAccount = account;
    $scope.runVisitorsReport();
    $scope.runNetRevenueReport();
  });

  /*
   * @date
   * - start and end date for this month
   */

  $scope.date = {
    startDate: moment().subtract(29, 'days').utc().format("YYYY-MM-DDTHH:mm:ss") + "Z",
    endDate: moment().utc().format("YYYY-MM-DDTHH:mm:ss") + "Z"
  };

  /*
   * @runVisitorsReport
   * - vistor reports recieves Keen data for visitors widget
   */
  $scope.analyticsVisitors = [];
  $scope.runVisitorsReport = function () {
    ChartAnalyticsService.visitorsReport($scope.date, $scope.analyticsAccount, function (data) {
      var returningVisitors = data[0].result;
      var newVisitors = data[1].result;

      $scope.visitorsThisMonth = 0;
      $scope.totalNewVisitors = 0;
      $scope.totalReturningVisitors = 0;
      $scope.lastVisitorDate = null;
      if (data[2].result[0]) {
        $scope.lastVisitorDate = data[2].result[0].keen.created_at;
      }
      var tempData = [];
      _.each($scope.getDaysThisMonth(), function (day) {
        var thisDaysVisitors = 0;
        _.each(returningVisitors, function (visitor, index) {
          if ($scope.isSameDateAs(new Date(visitor.timeframe.start), new Date(day))) {
            $scope.visitorsThisMonth += (visitor.value + newVisitors[index].value);
            thisDaysVisitors += (visitor.value + newVisitors[index].value);
            $scope.totalNewVisitors += newVisitors[index].value;
            $scope.totalReturningVisitors += visitor.value;
          }
        });

        tempData.push(thisDaysVisitors);
      });

      $scope.$apply(function () {
        $scope.analyticsVisitors = tempData;
      });
    });
  };

  /*
   * @runNetRevenueReport
   * - get net revenue data from Keen for dashboard widget
   */

  $scope.runNetRevenueReport = function () {
    ChartCommerceService.runNetRevenuReport(function (revenueData) {
      var revenue = revenueData[0].result;
      $scope.charges = revenueData[1].result;
      if (revenueData[2].result.length > 0) {
        $scope.lastChargeDate = revenueData[2].result[0].keen.created_at;
      }
      $scope.revenueThisMonth = 0;
      var tempData = [];
      _.each($scope.getDaysThisMonth(), function (day) {
        var thisDaysRevenue = 0;
        _.each(revenue, function (rev) {
          if ($scope.isSameDateAs(new Date(rev.timeframe.start), new Date(day))) {
            $scope.revenueThisMonth += rev.value;
            thisDaysRevenue += rev.value;
          }
        });

        tempData.push(thisDaysRevenue);
      });

      $scope.$apply(function () {
        $scope.analyticsRevenue = tempData;
      });
    });
  };

  /*
   * @openModal
   * -
   */

  $scope.openModal = function (modal) {
    $scope.modalInstance = $modal.open({
      templateUrl: modal,
      scope: $scope
    });
  };

  /*
   * @closeModal
   * -
   */

  $scope.closeModal = function () {
    $scope.modalInstance.close();
  };

  $scope.newActivity = {
    start: new Date(),
    end: new Date()
  };

  $scope.activityTypes = [];

  contactConstant.customer_activity_types.dp.forEach(function(value, index) {
    $scope.activityTypes.push(value.label);
  });

  $scope.updateActivityTypeFn = function(selection) {
      var activity_hash = _.findWhere(contactConstant.customer_activity_types.dp, {
          label: selection
      });
      if(activity_hash)
          $scope.newActivity.activityType = activity_hash.data;
  };

  //$scope.all_activities = angular.copy($scope.activities);
  $scope.addActivityFn = function () {
    angular.element("#activity_type .error").html("");
      angular.element("#activity_type .error").removeClass('has-error');
      var activity_type = angular.element("#activity_type input").val();
      var activity_hash = _.findWhere(contactConstant.customer_activity_types.dp, {
          label: activity_type
      });
      if(!activity_hash)
      {
           angular.element("#activity_type .error").html("Valid Activity Type Required");
           angular.element("#activity_type .error").addClass('has-error');
           return;
      }
    CustomerService.postCustomerActivity($scope.newActivity, function (activity) {
      $scope.activities.push(activity);
      $scope.activities = _.sortBy($scope.activities, function (o) {
        return o.start;
      }).reverse();
      $scope.newActivity = {
        start: new Date(),
        end: new Date()
      };
      if (!angular.isDefined($scope.activity_type)) {
        $scope.activity_type = '';
      }
      $scope.activities = $filter('filter')($scope.activities, {
        activityType: $scope.activity_type
      });
      $scope.total = $scope.activities.length;

      $scope.closeModal('addActivityModal');
    });
  };
}]);
