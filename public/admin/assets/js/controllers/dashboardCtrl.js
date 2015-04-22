'use strict';
/**
 * controllers used for the dashboard
 */
app.controller('DashboardCtrl', ["$scope", "OrderService", "CustomerService", "ChartAnalyticsService", "UserService", "ChartCommerceService", function($scope, OrderService, CustomerService, ChartAnalyticsService, UserService, ChartCommerceService) {

    $scope.myPagingFunction = function() {
        console.log('paging');
    };

    /*
     * @isSameDateAs
     * - determine if two dates are identical and return boolean
     */

    $scope.isSameDateAs = function(oDate, pDate) {
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

    $scope.getDaysThisMonth = function() {
        var newDate = new Date();
        var numOfDays = newDate.getDate();
        var days = [];

        for (var i = 0; i <= numOfDays; i++) {
            days[i] = new Date(newDate.getFullYear(), newDate.getMonth(), i + 1);
        }

        return days;
    };

    CustomerService.getCustomers(function(customers) {
        CustomerService.getAllCustomerActivities(function(activities) {
            $scope.activities = activities.results;
            _.each($scope.activities, function(activity) {
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

    OrderService.getOrders(function(orders) {
        $scope.orders = orders;
        $scope.ordersThisMonth = [];
        var tempData = [];
        _.each($scope.getDaysThisMonth(), function(day, index) {
            var thisDaysOrders = 0;
            _.each(orders, function(order) {
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

    $scope.getCompletedOrders = function() {
        var completedOrders = [];
        _.each($scope.ordersThisMonth, function(order) {
            if (order.status == 'completed') {
                completedOrders.push(order);
            }
        });

        return completedOrders.length;
    };

    /*
     * @lastCustomerDate
     * - get the last customer date that was created
     */

    $scope.lastCustomerDate = function() {
        return $scope.customersThisMonth[$scope.customersThisMonth.length - 1].created.date
    };

    /*
     * @getCustomers
     * - get customer for the customer widget
     */

    CustomerService.getCustomers(function(customers) {
        $scope.customers = customers;
        $scope.customersThisMonth = [];
        var tempData = [];
        _.each($scope.getDaysThisMonth(), function(day, index) {
            var thisDaysCustomers = 0;
            _.each(customers, function(customer) {
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

    $scope.getCustomerLeads = function() {
        var customerLeads = [];
        _.each($scope.customersThisMonth, function(customer) {
            if (customer.tags && customer.tags.length > 0) {
                if (customer.tags.indexOf('ld')) {
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

    $scope.lastOrderDate = function() {
        return $scope.ordersThisMonth[$scope.ordersThisMonth.length - 1].created.date
    };

    /*
     * @getAccount
     * - get user account and then run visitors report
     */

    UserService.getAccount(function(account) {
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
    $scope.runVisitorsReport = function() {
        ChartAnalyticsService.visitorsReport($scope.date, $scope.analyticsAccount, 'indigenous.io', function(data) {
            var returningVisitors = data[0].result;
            var newVisitors = data[1].result;

            $scope.visitorsThisMonth = 0;
            $scope.totalNewVisitors = 0;
            $scope.totalReturningVisitors = 0;
            $scope.lastVisitorDate = data[2].result[0].keen.created_at;
            var tempData = [];
            _.each($scope.getDaysThisMonth(), function(day, index) {
                var thisDaysVisitors = 0;
                _.each(returningVisitors, function(visitor, index) {
                    if ($scope.isSameDateAs(new Date(visitor.timeframe.start), new Date(day))) {
                        $scope.visitorsThisMonth += (visitor.value + newVisitors[index].value);
                        thisDaysVisitors += (visitor.value + newVisitors[index].value);
                        $scope.totalNewVisitors += newVisitors[index].value;
                        $scope.totalReturningVisitors += visitor.value;
                    }
                });

                tempData.push(thisDaysVisitors);
            });

            $scope.$apply(function() {
                $scope.analyticsVisitors = tempData;
            });
        });
    };

    /*
     * @runNetRevenueReport
     * - get net revenue data from Keen for dashboard widget
     */

    $scope.runNetRevenueReport = function() {
        ChartCommerceService.runNetRevenuReport(function(revenueData) {
            var revenue = revenueData[0].result;
            $scope.charges = revenueData[1].result;
            if (revenueData[2].result.length > 0) {
                $scope.lastChargeDate = revenueData[2].result[0].keen.created_at;
            }
            $scope.revenueThisMonth = 0;
            var tempData = [];
            _.each($scope.getDaysThisMonth(), function(day, index) {
                var thisDaysRevenue = 0;
                _.each(revenue, function(rev) {
                    if ($scope.isSameDateAs(new Date(rev.timeframe.start), new Date(day))) {
                        $scope.revenueThisMonth += rev.value;
                        thisDaysRevenue += rev.value;
                    }
                });

                tempData.push(thisDaysRevenue);
            });

            $scope.$apply(function() {
                $scope.analyticsRevenue = tempData;
            });
        });
    };

}]);
