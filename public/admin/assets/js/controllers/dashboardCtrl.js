'use strict';
/** 
 * controllers used for the dashboard
 */
app.controller('DashboardCtrl', ["$scope", "OrderService", "CustomerService", "ChartAnalyticsService", "UserService", function($scope, OrderService, CustomerService, ChartAnalyticsService, UserService) {

    /*
     * @isSameDateAs
     * -
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
     * -
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

    /*
     * @getOrders
     * -
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
     * -
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
     * -
     */

    $scope.lastCustomerDate = function() {
        return $scope.customersThisMonth[$scope.customersThisMonth.length - 1].created.date
    };

    /*
     * @getCustomers
     * -
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
     * -
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
     * -
     */

    $scope.lastOrderDate = function() {
        return $scope.ordersThisMonth[$scope.ordersThisMonth.length - 1].created.date
    };

    UserService.getAccount(function(account) {
        $scope.analyticsAccount = account;
        $scope.runVisitorsReport();
    });

    $scope.date = {
        startDate: moment().subtract(29, 'days').utc().format("YYYY-MM-DDTHH:mm:ss") + "Z",
        endDate: moment().utc().format("YYYY-MM-DDTHH:mm:ss") + "Z"
    };

    $scope.runVisitorsReport = function() {
        ChartAnalyticsService.visitorsReport($scope.date, $scope.analyticsAccount, 'indigenous.io', function(data) {
            console.log('visitors data ', data);
        });
    };

}]);
